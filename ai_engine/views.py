import os
import tempfile

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from .services import extract_text_from_file, analyze_resume_standalone
from .models import ResumeAnalysis


@api_view(['POST'])
@permission_classes([IsAuthenticated])
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
