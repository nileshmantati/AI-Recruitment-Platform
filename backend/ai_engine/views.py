import os
import tempfile

from django.http import JsonResponse
from django.core.cache import cache

from rest_framework import status
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, BasePermission

from .services import (
    extract_text_from_file,
    analyze_resume_standalone,
    generate_mock_interview_questions,
    evaluate_mock_interview_answer,
    sanitize_job_html,
    generate_job_description_studio,
    analyze_job_description_bias_service,
)
from .models import ResumeAnalysis


class IsRecruiter(BasePermission):
    """Permission check ensuring caller has authenticated RECRUITER role."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and getattr(request.user, 'role', '') == 'RECRUITER')


def check_user_rate_limit(user_id: int, action: str, limit: int = 15, window_seconds: int = 60) -> bool:
    """Rate-limiting helper to prevent AI quota exhaustion with fixed time window."""
    key = f"rate_limit_{action}_{user_id}"
    if cache.add(key, 1, timeout=window_seconds):
        return True
    try:
        current = cache.incr(key)
    except Exception:
        current = (cache.get(key) or 0) + 1
        cache.set(key, current, timeout=window_seconds)
    return current <= limit


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def analyze_resume(request):
    """
    POST /api/ai/analyze-resume/
    Accepts a multipart file upload (field name: 'resume').
    Returns a JSON object with the AI analysis result.
    """
    resume_file = request.FILES.get('resume')
    if not resume_file:
        return JsonResponse({'error': 'No resume file provided. Use field name "resume".'}, status=400)

    # Validate file type
    allowed_extensions = ('.pdf', '.docx', '.txt')
    filename = resume_file.name.lower()
    if not any(filename.endswith(ext) for ext in allowed_extensions):
        return JsonResponse(
            {'error': 'Unsupported file type. Please upload a PDF, DOCX, or TXT file.'},
            status=400
        )

    # Validate file size (10 MB max)
    if resume_file.size > 10 * 1024 * 1024:
        return JsonResponse({'error': 'File too large. Maximum size is 10 MB.'}, status=400)

    # Save to a temp file to let pdfplumber / python-docx read it properly
    suffix = os.path.splitext(resume_file.name)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        for chunk in resume_file.chunks():
            tmp.write(chunk)
        tmp_path = tmp.name

    try:
        # 1. Extract text
        resume_text = extract_text_from_file(tmp_path)
        if not resume_text:
            return JsonResponse(
                {'error': 'Could not extract text from the file. Please ensure it is a readable document.'},
                status=422
            )

        # 2. Call Gemini AI
        ai_result = analyze_resume_standalone(resume_text)

        # 3. Persist result (optional – helps with history/audit)
        analysis = ResumeAnalysis.objects.create(
            filename=resume_file.name,
            ai_score=ai_result.get('ai_score', 0),
            match_percentage=ai_result.get('match_percentage', 0),
            job_role=ai_result.get('job_role', 'General Role'),
            experience_relevancy=ai_result.get('experience_relevancy', 0),
            owned_skills=ai_result.get('owned_skills', []),
            missing_skills=ai_result.get('missing_skills', []),
            strengths=ai_result.get('strengths', []),
            weaknesses=ai_result.get('weaknesses', []),
            ai_strategy=ai_result.get('ai_strategy', ''),
        )

        return JsonResponse({
            'id': analysis.id,
            **ai_result,
        }, status=200)

    finally:
        # Clean up temp file
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


@api_view(['POST'])
def generate_mock_questions(request):
    """
    POST /api/ai/mock-interview/generate-questions/
    Payload: { "role": str, "experience_level": str, "interview_type": str }
    """
    role = request.data.get('role', '').strip()
    if not role:
        return JsonResponse({'error': 'Role title is required.'}, status=400)

    experience_level = request.data.get('experience_level', 'Mid-Level')
    interview_type = request.data.get('interview_type', 'technical')

    result = generate_mock_interview_questions(role, experience_level, interview_type)
    return JsonResponse(result, status=200)


@api_view(['POST'])
def evaluate_mock_answer(request):
    """
    POST /api/ai/mock-interview/evaluate-answer/
    Payload: { "question": str, "answer": str, "role": str }
    """
    question = request.data.get('question', '').strip()
    answer = request.data.get('answer', '').strip()
    role = request.data.get('role', 'Candidate').strip()
    interview_type = request.data.get('interview_type', 'technical').strip()

    if not question:
        return JsonResponse({'error': 'Question is required.'}, status=400)
    if not answer:
        return JsonResponse({'error': 'Please provide an answer.'}, status=400)

    evaluation = evaluate_mock_interview_answer(question, answer, role, interview_type)
    return JsonResponse(evaluation, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsRecruiter])
def generate_job_description(request):
    """
    POST /api/ai/job-description/generate/
    Generates a structured, inclusive job description using Gemini AI.
    Protected: Only authenticated RECRUITER users.
    """
    title = str(
        request.data.get('title')
        or request.data.get('job_title')
        or ''
    ).strip()
    experience_level = str(
        request.data.get('experience_level')
        or ''
    ).strip()

    if not title:
        return JsonResponse({'error': 'Job title is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if len(title) < 2 or len(title) > 150:
        return JsonResponse({'error': 'Job title must be between 2 and 150 characters.'}, status=status.HTTP_400_BAD_REQUEST)
    if not experience_level:
        return JsonResponse({'error': 'Experience level is required.'}, status=status.HTTP_400_BAD_REQUEST)

    additional_instructions = str(
        request.data.get('additional_instructions')
        or request.data.get('notes')
        or ''
    ).strip()
    if len(additional_instructions) > 1000:
        return JsonResponse({'error': 'Additional instructions cannot exceed 1000 characters.'}, status=status.HTTP_400_BAD_REQUEST)

    # Rate limiting: 15 requests per minute per recruiter
    if not check_user_rate_limit(request.user.id, 'generate_jd', limit=15, window_seconds=60):
        return JsonResponse(
            {'error': 'Too many generation requests. Please wait a moment before trying again.'},
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )

    work_mode = str(request.data.get('work_mode') or request.data.get('location') or 'Remote').strip()
    location = str(request.data.get('location', '')).strip()
    employment_type = str(request.data.get('employment_type', 'Full-time')).strip()
    industry = str(request.data.get('industry', 'Technology')).strip()
    currency = str(request.data.get('currency', 'INR')).strip().upper()
    if currency not in ('INR', 'USD'):
        currency = 'INR'

    try:
        result = generate_job_description_studio(
            title=title,
            experience_level=experience_level,
            work_mode=work_mode,
            location=location,
            employment_type=employment_type,
            industry=industry,
            additional_instructions=additional_instructions,
            currency=currency
        )
        if 'job_title' not in result:
            result['job_title'] = title
        return JsonResponse(result, status=status.HTTP_200_OK)
    except Exception as exc:
        return JsonResponse(
            {'error': f'Failed to generate job description: {str(exc)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsRecruiter])
def analyze_job_description_bias(request):
    """
    POST /api/ai/job-description/analyze-bias/
    Analyzes job description content for bias, buzzwords, and exclusionary language.
    Protected: Only authenticated RECRUITER users.
    """
    content = str(
        request.data.get('content')
        or request.data.get('job_description')
        or request.data.get('description')
        or ''
    ).strip()
    title = str(
        request.data.get('title')
        or request.data.get('job_title')
        or ''
    ).strip()

    if not content or len(content) < 10:
        return JsonResponse(
            {'error': 'Please provide content to analyze (minimum 10 characters).'},
            status=status.HTTP_400_BAD_REQUEST
        )
    if len(content) > 30000:
        return JsonResponse(
            {'error': 'Content is too long (maximum 30,000 characters).'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Rate limiting: 20 requests per minute per recruiter
    if not check_user_rate_limit(request.user.id, 'bias_analysis', limit=20, window_seconds=60):
        return JsonResponse(
            {'error': 'Too many bias analysis requests. Please wait a moment.'},
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )

    try:
        sanitized = sanitize_job_html(content)
        result = analyze_job_description_bias_service(sanitized, title=title)
        return JsonResponse(result, status=status.HTTP_200_OK)
    except Exception as exc:
        return JsonResponse(
            {'error': f'Failed to analyze content: {str(exc)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


