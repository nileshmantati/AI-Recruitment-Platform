import os
import json
import pdfplumber
import google.generativeai as genai
from django.conf import settings
from dotenv import load_dotenv

load_dotenv()
# Configure Gemini API
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    import warnings
    warnings.warn("GEMINI_API_KEY environment variable is not set. AI features will fail.")
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

def evaluate_candidate_resume(resume_text, job_description):
    """
    Sends the resume and JD to Gemini and forces a structured JSON response.
    """
    # Using gemini-1.5-flash as it is fast and excellent for text processing
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
        # Requesting structured JSON output directly from the model
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json"
            )
        )
        
        # Parse the JSON string returned by Gemini into a Python dictionary
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