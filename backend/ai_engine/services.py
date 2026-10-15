import os
import json
import warnings
import pdfplumber
# python-docx (optional) is imported lazily inside extract_text_from_docx to prevent startup failures
with warnings.catch_warnings():
    warnings.simplefilter("ignore", category=FutureWarning)
    import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    import warnings
    warnings.warn(
        "GEMINI_API_KEY environment variable is not set. AI features will fail.")
genai.configure(api_key=GEMINI_API_KEY)


def extract_text_from_pdf(pdf_path):
    """Extracts raw text from an uploaded PDF resume."""
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text if text.strip() else None
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return None


def extract_text_from_docx(docx_path):
    """Extracts raw text from an uploaded DOCX resume."""
    try:
        import docx as _docx  # lazy import – python-docx
        doc = _docx.Document(docx_path)
        text = "\n".join(
            para.text for para in doc.paragraphs if para.text.strip())
        return text if text.strip() else None
    except ImportError:
        print("python-docx not installed; cannot read DOCX files.")
        return None
    except Exception as e:
        print(f"Error reading DOCX: {e}")
        return None


def extract_text_from_file(file_path: str) -> str | None:
    """Auto-detects PDF / DOCX / TXT and extracts text."""
    lower = file_path.lower()
    if lower.endswith(".pdf"):
        return extract_text_from_pdf(file_path)
    if lower.endswith(".docx"):
        return extract_text_from_docx(file_path)
    if lower.endswith(".txt"):
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read() or None
        except Exception as e:
            print(f"Error reading TXT: {e}")
            return None
    return None


def analyze_resume_standalone(resume_text: str) -> dict:
    """
    Sends the resume to Gemini without a specific job description.
    Returns a structured analysis that the ResumeAnalyzer page displays.
    """
    model = genai.GenerativeModel('gemini-2.5-flash')

    prompt = f"""
You are a senior technical recruiter and career coach. Analyze the following resume comprehensively.

Resume Content:
{resume_text}

You must respond ONLY with a valid JSON object matching this EXACT schema (no markdown, no extra text):
{{
  "ai_score": <integer 0-100, overall resume quality>,
  "match_percentage": <integer 0-100, general industry match>,
  "job_role": "<the most fitting job title for this candidate, e.g. 'Senior Software Engineer'>",
  "experience_relevancy": <integer 0-100>,
  "owned_skills": ["<skill1>", "<skill2>", "<skill3>", "<skill4>", "<skill5>"],
  "missing_skills": ["<gap_skill1>", "<gap_skill2>", "<gap_skill3>"],
  "strengths": [
    "<one clear sentence describing the strongest aspect>",
    "<second strength>"
  ],
  "weaknesses": [
    "<one clear sentence describing the main weakness>",
    "<second weakness>"
  ],
  "ai_strategy": "<2-3 sentence actionable advice to improve this resume and boost the score>"
}}
"""

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json"
            )
        )
        result = json.loads(response.text)

        # Sanitize / clamp integer fields
        for key in ("ai_score", "match_percentage", "experience_relevancy"):
            result[key] = max(0, min(100, int(result.get(key, 0))))

        return result
    except Exception as e:
        print(f"AI Standalone Analysis Error: {e}")
        return {
            "ai_score": 0,
            "match_percentage": 0,
            "job_role": "Unknown",
            "experience_relevancy": 0,
            "owned_skills": [],
            "missing_skills": [],
            "strengths": ["Error: Could not complete AI analysis."],
            "weaknesses": [],
            "ai_strategy": "Please try uploading your resume again."
        }


def evaluate_candidate_resume(resume_text, job_description):
    """
    Sends the resume and JD to Gemini and forces a structured JSON response.
    Used by the application-flow Celery task.
    """
    model = genai.GenerativeModel('gemini-2.5-flash')

    prompt = f"""
    You are an expert technical IT recruiter. Compare the following resume with the job description.
    
    Job Description:
    {job_description}
    
    Resume Content:
    {resume_text}
    
    You must respond ONLY with a valid JSON object matching this exact schema:
    {{
      "score": <integer between 0 and 100>,
      "missing_skills": [<array of strings>],
      "strengths": [<array of strings>],
      "weaknesses": [<array of strings>]
    }}
    """

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json"
            )
        )
        result_data = json.loads(response.text)
        return result_data

    except Exception as e:
        print(f"AI Evaluation Error: {e}")
        return {
            "score": 0,
            "missing_skills": [],
            "strengths": ["Error processing AI request"],
            "weaknesses": []
        }


def generate_interview_questions(job_title, job_description, candidate_feedback):
    """
    Generates custom interview questions based on the candidate's AI evaluation.
    """
    model = genai.GenerativeModel('gemini-2.5-flash')

    prompt = f"""
    You are an expert technical interviewer. I need you to generate 4 highly specific interview questions 
    for a candidate applying for the role of "{job_title}".
    
    Here is the Job Description:
    {job_description}
    
    Here is the AI Evaluation of the candidate's resume:
    {candidate_feedback}
    
    Instructions for the questions:
    1. Ask 2 questions that validate their 'Strengths'.
    2. Ask 2 questions that probe their 'Missing Skills' or 'Weaknesses' to see if they can learn quickly or have parallel experience.
    
    You must respond ONLY with a valid JSON object matching this exact schema:
    {{
      "questions": [
         "Question 1...",
         "Question 2...",
         "Question 3...",
         "Question 4..."
      ]
    }}
    """

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json"
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Error generating questions: {e}")
        return {"questions": ["Could not generate questions at this time. Please try again later."]}


def generate_mock_interview_questions(role: str, experience_level: str = "Mid-Level", interview_type: str = "technical") -> dict:
    """
    Generates 4 tailored mock interview questions with hints and expected focus areas.
    """
    model = genai.GenerativeModel('gemini-2.5-flash')

    prompt = f"""
    You are an elite hiring manager conducting a mock interview for the role of "{role}" ({experience_level} level, {interview_type} focus).
    Generate 4 realistic, high-impact interview questions.
    
    You must respond ONLY with a valid JSON object matching this exact schema:
    {{
      "role": "{role}",
      "interview_type": "{interview_type}",
      "questions": [
        {{
          "id": 1,
          "question": "Clear and realistic question...",
          "category": "Architecture / Coding / Problem Solving / Behavioral",
          "hint": "Brief hint on what good candidates focus on...",
          "expected_keywords": ["keyword1", "keyword2", "keyword3"]
        }}
      ]
    }}
    """

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json"
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Error generating mock interview questions: {e}")
        return {
            "role": role,
            "interview_type": interview_type,
            "questions": [
                {
                    "id": 1,
                    "question": f"Can you explain your approach and core tools when building solutions for a {role} role?",
                    "category": "Core Knowledge",
                    "hint": "Explain practical experience, challenges faced, and trade-offs made.",
                    "expected_keywords": ["architecture", "best practices", "scalability"]
                },
                {
                    "id": 2,
                    "question": "Describe a difficult bug or complex challenge you solved in a previous project. What was your debugging methodology?",
                    "category": "Problem Solving",
                    "hint": "Use the STAR framework (Situation, Task, Action, Result).",
                    "expected_keywords": ["root cause", "testing", "resolution"]
                },
                {
                    "id": 3,
                    "question": "How do you ensure security, performance, and code quality in your daily workflow?",
                    "category": "Best Practices",
                    "hint": "Mention code reviews, automated CI/CD, and monitoring.",
                    "expected_keywords": ["CI/CD", "code review", "optimization"]
                },
                {
                    "id": 4,
                    "question": "Tell me about a time you had to align with stakeholders or team members who had conflicting technical priorities.",
                    "category": "Collaboration",
                    "hint": "Focus on communication, empathy, and data-driven decisions.",
                    "expected_keywords": ["communication", "consensus", "impact"]
                }
            ]
        }


def evaluate_mock_interview_answer(question: str, answer: str, role: str, interview_type: str = 'technical') -> dict:
    """
    Evaluates a candidate's answer to a mock interview question.
    """
    model = genai.GenerativeModel('gemini-2.5-flash')

    prompt = f"""
    You are an expert interviewer evaluating a candidate for the role of "{role}" in a {interview_type} interview.
    
    Question:
    {question}
    
    Candidate Answer:
    {answer}
    
    Evaluate the response thoroughly and objectively.
    You must respond ONLY with a valid JSON object matching this exact schema:
    {{
      "score": <integer 0-100>,
      "clarity_score": <integer 0-100>,
      "technical_depth_score": <integer 0-100>,
      "verdict": "<'Excellent' | 'Good' | 'Needs Improvement'>",
      "strengths": [
        "<one key positive point of the answer>",
        "<second positive point if applicable>"
      ],
      "improvements": [
        "<concrete recommendation to improve>",
        "<specific concept or keyword they should have mentioned>"
      ],
      "sample_ideal_answer": "<2-4 sentences providing a model answer a top candidate would give>"
    }}
    """

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json"
            )
        )
        data = json.loads(response.text)
        data["score"] = max(0, min(100, int(data.get("score", 70))))
        data["clarity_score"] = max(0, min(100, int(data.get("clarity_score", 70))))
        data["technical_depth_score"] = max(0, min(100, int(data.get("technical_depth_score", 70))))
        return data
    except Exception as e:
        print(f"Error evaluating mock interview answer: {e}")
        word_count = len(answer.split())
        est_score = min(85, max(45, word_count * 2))
        return {
            "score": est_score,
            "clarity_score": est_score,
            "technical_depth_score": est_score,
            "verdict": "Good" if est_score >= 65 else "Needs Improvement",
            "strengths": ["You provided a clear response and addressed the question."],
            "improvements": ["Try to provide more concrete examples and quantitative metrics to back your claims."],
            "sample_ideal_answer": "A top-tier answer addresses the core concept directly, gives a specific production scenario using the STAR framework, and mentions performance and trade-offs."
        }

