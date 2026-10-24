import os
import re
import json
import warnings
from html.parser import HTMLParser
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


class SafeHTMLSanitizer(HTMLParser):
    ALLOWED_TAGS = {
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'span', 'div', 'blockquote'
    }
    ALLOWED_ATTRS = {'class'}
    DROP_TAG_CONTENTS = {'script', 'style', 'iframe', 'noscript', 'object', 'embed'}

    def __init__(self):
        super().__init__()
        self.output = []
        self.ignore_depth = 0

    def handle_starttag(self, tag, attrs):
        tag_lower = tag.lower()
        if tag_lower in self.DROP_TAG_CONTENTS:
            self.ignore_depth += 1
            return
        if self.ignore_depth > 0:
            return
        if tag_lower in self.ALLOWED_TAGS:
            clean_attrs = []
            for attr_name, attr_val in attrs:
                name_lower = attr_name.lower()
                if name_lower in self.ALLOWED_ATTRS:
                    clean_val = str(attr_val).replace('"', '&quot;').replace('<', '&lt;').replace('>', '&gt;')
                    clean_attrs.append(f'{name_lower}="{clean_val}"')
            attr_str = f" {' '.join(clean_attrs)}" if clean_attrs else ""
            self.output.append(f"<{tag_lower}{attr_str}>")

    def handle_endtag(self, tag):
        tag_lower = tag.lower()
        if tag_lower in self.DROP_TAG_CONTENTS:
            if self.ignore_depth > 0:
                self.ignore_depth -= 1
            return
        if self.ignore_depth > 0:
            return
        if tag_lower in self.ALLOWED_TAGS:
            self.output.append(f"</{tag_lower}>")

    def handle_data(self, data):
        if self.ignore_depth > 0:
            return
        self.output.append(data)


def sanitize_job_html(raw_html: str) -> str:
    """Sanitizes rich-text HTML against XSS and injection attacks."""
    if not raw_html:
        return ""
    parser = SafeHTMLSanitizer()
    parser.feed(raw_html)
    return "".join(parser.output)


COMMON_BIAS_PATTERNS = [
    {
        "pattern": r"\b(ninja|rockstar|guru|wizard|superhero)\b",
        "reason": "Hyperbolic buzzwords obscure actual technical requirements and tend to alienate seasoned, diverse candidates.",
        "suggestion": "skilled specialist or experienced engineer"
    },
    {
        "pattern": r"\b(aggressive|cut-throat|killer instinct|dominate|hardcore)\b",
        "reason": "Overly aggressive vocabulary can project a hostile team environment and discourage collaborative professionals.",
        "suggestion": "proactive, goal-driven, or results-oriented"
    },
    {
        "pattern": r"\b(young and energetic|youthful|fresh blood|recent college grad only)\b",
        "reason": "Language suggesting age preference may violate non-discrimination principles and exclude experienced candidates.",
        "suggestion": "enthusiastic professional or high-energy team member"
    },
    {
        "pattern": r"\b(native english speaker)\b",
        "reason": "Unless legally mandated, demanding native speech can exclude fluent bilingual professionals.",
        "suggestion": "fluent in written and verbal English communication"
    },
    {
        "pattern": r"\b(work hard play hard|24/7 availability|round-the-clock)\b",
        "reason": "Phrases implying unmanaged overtime can discourage candidates seeking healthy work-life balance.",
        "suggestion": "flexible and committed to team success with supportive work-life balance"
    }
]


def scan_content_for_bias_rules(content: str) -> dict:
    """Fallback rule-based scanner for bias and exclusionary terms."""
    clean_text = re.sub(r'<[^>]+>', ' ', content or '')
    findings = []
    seen = set()

    for item in COMMON_BIAS_PATTERNS:
        match = re.search(item["pattern"], clean_text, re.IGNORECASE)
        if match:
            term = match.group(0)
            if term.lower() not in seen:
                seen.add(term.lower())
                findings.append({
                    "term": term,
                    "reason": item["reason"],
                    "suggestion": item["suggestion"]
                })

    score = max(50, 100 - (len(findings) * 12))
    risk_level = "low" if score >= 85 else "medium" if score >= 70 else "high"

    suggestions = [
        "Focus on demonstrable skills and outcomes rather than rigid pedigree requirements.",
        "Ensure requirements are realistic for the specified experience tier."
    ]
    if findings:
        suggestions.insert(0, "Replace detected buzzwords or aggressive terms with collaborative alternatives.")

    return {
        "score": score,
        "risk_level": risk_level,
        "findings": findings,
        "inclusive_suggestions": suggestions
    }


def generate_job_description_studio(
    title: str,
    experience_level: str,
    work_mode: str = "Remote",
    location: str = "",
    employment_type: str = "Full-time",
    industry: str = "Technology",
    additional_instructions: str = "",
    currency: str = "INR"
) -> dict:
    """
    Generates a structured, inclusive job description using Gemini AI.
    Returns a verified dictionary conforming to the target schema.
    """
    model = genai.GenerativeModel('gemini-2.5-flash')

    prompt = f"""
You are an expert talent acquisition director and organizational psychologist.
Generate a comprehensive, inclusive, and realistic job description based on the following specifications:

- Job Title: {title}
- Experience Level: {experience_level}
- Work Mode: {work_mode or 'Flexible'}
- Location: {location or 'Not specified'}
- Employment Type: {employment_type or 'Full-time'}
- Industry: {industry or 'Technology'}
- Special Recruiter Notes: {additional_instructions or 'None'}
- Target Currency: {currency}

Guidelines:
1. Ground the responsibilities and skills realistically in current market expectations for the '{experience_level}' tier.
2. Separate must-have competencies from preferred/bonus skills.
3. Keep the language welcoming, inclusive, and professional. Avoid buzzwords like 'rockstar', 'ninja', 'work hard play hard', 'aggressive'.
4. Compensation must be an indicative, realistic estimate based on the industry, experience tier, and target currency ({currency}). If INR, typical yearly CTC (e.g. 800000 to 1400000); if USD, annual base salary (e.g. 100000 to 140000). Declare confidence level ('moderate' or 'low') and explain assumptions clearly.
5. In 'job_description_html', construct clean, structured HTML using only standard tags (<h2>, <h3>, <p>, <ul>, <li>, <strong>) ready for a rich-text editor.
6. Conduct an initial bias & inclusivity audit on the generated text, returning an Inclusivity Score (0-100, where 100 is fully inclusive).

You must respond ONLY with a valid JSON object matching this EXACT schema (no markdown, no backticks, no other text):
{{
  "role_summary": "2-3 sentence overview of the mission and impact of this role",
  "responsibilities": ["Specific responsibility 1", "Specific responsibility 2", "Specific responsibility 3", "Specific responsibility 4"],
  "required_skills": ["Must-have skill 1", "Must-have skill 2", "Must-have skill 3", "Must-have skill 4"],
  "preferred_skills": ["Nice-to-have skill 1", "Nice-to-have skill 2"],
  "experience_requirements": "Clear, realistic experience expectation",
  "education_requirements": "Appropriate qualification guidance",
  "compensation": {{
    "currency": "{currency}",
    "minimum": 800000,
    "maximum": 1400000,
    "period": "yearly",
    "confidence": "moderate",
    "basis": "Indicative AI benchmark based on {title} ({experience_level}) in {currency}. Actual compensation varies based on company scale and candidate expertise."
  }},
  "job_description_html": "<h2>Role Overview</h2><p>...</p><h3>Key Responsibilities</h3><ul><li>...</li></ul><h3>Required Qualifications</h3><ul><li>...</li></ul><h3>Preferred Qualifications</h3><ul><li>...</li></ul><h3>Work Arrangement & Compensation</h3><p>...</p>",
  "bias_analysis": {{
    "score": 95,
    "risk_level": "low",
    "findings": [],
    "inclusive_suggestions": ["Clearly state willingness to evaluate equivalent practical experience."]
  }}
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

        # Sanitize HTML
        raw_html = data.get("job_description_html", "")
        data["job_description_html"] = sanitize_job_html(raw_html)

        # Sanitize / Clamp numeric fields
        bias = data.get("bias_analysis", {})
        if isinstance(bias, dict):
            bias["score"] = max(0, min(100, int(bias.get("score", 95))))
            data["bias_analysis"] = bias

        comp = data.get("compensation", {})
        if isinstance(comp, dict):
            comp["currency"] = str(comp.get("currency", currency)).upper()
            comp["period"] = str(comp.get("period", "yearly")).lower()
            data["compensation"] = comp

        return data

    except Exception as e:
        print(f"Gemini Job Description Studio Error: {e}")
        # Robust structured fallback template
        fallback_html = f"""<h2>Role Overview</h2>
<p>We are looking for a qualified <strong>{title}</strong> ({experience_level}) to join our growing team. In this role, you will collaborate with cross-functional partners to build, test, and deliver high-impact solutions.</p>
<h3>Key Responsibilities</h3>
<ul>
  <li>Architect, develop, and maintain resilient features aligned with project specifications.</li>
  <li>Collaborate closely with product, engineering, and design stakeholders.</li>
  <li>Participate in code reviews, automated testing, and technical documentation.</li>
  <li>Proactively troubleshoot production issues and optimize application performance.</li>
</ul>
<h3>Required Qualifications</h3>
<ul>
  <li>Proven hands-on experience as a {title} or related engineering role ({experience_level}).</li>
  <li>Proficiency with relevant modern frameworks, tools, and best development practices.</li>
  <li>Strong problem-solving capability and clear written/verbal communication skills.</li>
</ul>
<h3>Preferred Qualifications</h3>
<ul>
  <li>Familiarity with cloud infrastructure, containerization, and automated CI/CD pipelines.</li>
  <li>Contributions to open-source software or agile team environments.</li>
</ul>
<h3>Work Arrangement & Benefits</h3>
<p>This role offers a {work_mode.lower()} arrangement with competitive compensation, professional development support, and a collaborative team culture.</p>"""

        fallback_bias = scan_content_for_bias_rules(fallback_html)

        return {
            "role_summary": f"Seeking a {experience_level} {title} to contribute to key initiatives and engineering excellence.",
            "responsibilities": [
                f"Develop and deploy robust features as a {title}.",
                "Collaborate cross-functionally with product and engineering teams.",
                "Maintain code quality, automated test coverage, and clear documentation."
            ],
            "required_skills": [title, "Problem Solving", "Team Collaboration"],
            "preferred_skills": ["Cloud Infrastructure", "CI/CD"],
            "experience_requirements": f"Demonstrated background appropriate for {experience_level}.",
            "education_requirements": "Degree in Computer Science, related field, or equivalent practical experience.",
            "compensation": {
                "currency": currency,
                "minimum": 600000 if currency == "INR" else 80000,
                "maximum": 1200000 if currency == "INR" else 130000,
                "period": "yearly",
                "confidence": "low",
                "basis": f"Indicative AI estimate for {title} based on {experience_level} tier. Please adjust according to your organization's specific budget."
            },
            "job_description_html": sanitize_job_html(fallback_html),
            "bias_analysis": fallback_bias
        }


def analyze_job_description_bias_service(content: str, title: str = "") -> dict:
    """
    Audits job description text for exclusionary, aggressive, or biased language using Gemini AI.
    Provides explainable findings with suggested replacements.
    """
    model = genai.GenerativeModel('gemini-2.5-flash')

    prompt = f"""
You are an expert DEI recruiter and language auditor.
Audit the following job description content for language that could unintentionally discourage qualified applicants:

Job Title: {title or 'Position'}
Content:
{content}

Examine for:
1. Exclusionary buzzwords (e.g. 'ninja', 'rockstar', 'guru', 'wizard').
2. Excessively aggressive or hyper-competitive terminology ('aggressive', 'dominate', 'ruthless', 'killer instinct').
3. Age-biased phrases ('young and dynamic', 'fresh graduates only', 'digital native').
4. Unnecessary requirements (e.g. strict native English speaker, unwarranted physical demands).

Provide an Inclusivity Score from 0 to 100 (where 100 = exceptionally inclusive and welcoming, 70-84 = moderate risk, <70 = high risk).
Categorize the risk_level as 'low', 'medium', or 'high'.

You must respond ONLY with a valid JSON object matching this schema:
{{
  "score": <integer 0-100>,
  "risk_level": "low" | "medium" | "high",
  "findings": [
    {{
      "term": "the exact phrase found in the text",
      "reason": "why this term may discourage applicants or create bias",
      "suggestion": "a clear, professional, inclusive alternative"
    }}
  ],
  "inclusive_suggestions": [
    "General guidance to increase diversity and applicant pool size"
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
        data = json.loads(response.text)
        data["score"] = max(0, min(100, int(data.get("score", 90))))
        if data["score"] >= 85:
            data["risk_level"] = "low"
        elif data["score"] >= 70:
            data["risk_level"] = "medium"
        else:
            data["risk_level"] = "high"

        if not isinstance(data.get("findings"), list):
            data["findings"] = []
        if not isinstance(data.get("inclusive_suggestions"), list):
            data["inclusive_suggestions"] = []

        return data

    except Exception as e:
        print(f"Gemini Bias Analysis Error, using fallback rule scanner: {e}")
        return scan_content_for_bias_rules(content)


