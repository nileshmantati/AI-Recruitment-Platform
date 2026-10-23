import re
from datetime import datetime, timedelta, timezone
from django.utils import timezone as django_timezone


def escape_ical_text(text: str) -> str:
    """
    Escapes special characters according to RFC 5545 (Section 3.3.11):
    Backslashes, semicolons, commas, and newlines must be escaped.
    """
    if not text:
        return ""
    text = str(text)
    # Escape backslash first to prevent double-escaping
    text = text.replace('\\', '\\\\')
    text = text.replace(';', '\\;')
    text = text.replace(',', '\\,')
    text = text.replace('\r\n', '\\n').replace('\n', '\\n').replace('\r', '\\n')
    return text


def fold_ical_line(line: str, max_bytes: int = 75) -> str:
    """
    Folds long content lines according to RFC 5545 (Section 3.1):
    Lines should not be longer than 75 octets.
    Folds are inserted as CRLF followed by a single linear white space (space).
    """
    if len(line.encode('utf-8')) <= max_bytes:
        return line

    encoded = line.encode('utf-8')
    chunks = []
    start = 0

    # First chunk can be up to max_bytes
    current_limit = max_bytes
    while start < len(encoded):
        end = start + current_limit
        if end >= len(encoded):
            chunks.append(encoded[start:].decode('utf-8', errors='ignore'))
            break

        # Avoid splitting multi-byte UTF-8 character sequences
        while end > start and (encoded[end] & 0xC0) == 0x80:
            end -= 1

        chunks.append(encoded[start:end].decode('utf-8', errors='ignore'))
        start = end
        # Subsequent continuation lines include 1 space at beginning, so max limit is 74
        current_limit = max_bytes - 1

    return '\r\n '.join(chunks)


def parse_interview_datetime(dt_str: str) -> datetime:
    """
    Parses various ISO datetime formats into a timezone-aware UTC datetime.
    Supports:
      - 2026-10-25T14:30
      - 2026-10-25T14:30:00
      - 2026-10-25T14:30:00Z
      - 2026-10-25 14:30
    """
    if not dt_str:
        raise ValueError("Interview datetime string is required.")

    # Remove any trailing Z or offset for initial parsing
    cleaned = dt_str.strip()
    dt = None

    for fmt in (
        '%Y-%m-%dT%H:%M:%S%z',
        '%Y-%m-%dT%H:%M%z',
        '%Y-%m-%dT%H:%M:%S',
        '%Y-%m-%dT%H:%M',
        '%Y-%m-%d %H:%M:%S',
        '%Y-%m-%d %H:%M',
    ):
        try:
            dt = datetime.strptime(cleaned, fmt)
            break
        except ValueError:
            continue

    if dt is None:
        # Fallback to fromisoformat
        dt = datetime.fromisoformat(cleaned.replace('Z', '+00:00'))

    # If naive, assume Django active timezone or UTC
    if dt.tzinfo is None:
        try:
            current_tz = django_timezone.get_current_timezone()
            dt = django_timezone.make_aware(dt, current_tz)
        except Exception:
            dt = dt.replace(tzinfo=timezone.utc)

    # Convert to UTC for calendar consistency
    return dt.astimezone(timezone.utc)


def generate_ics_calendar(
    application_id: int,
    job_title: str,
    candidate_name: str,
    candidate_email: str,
    recruiter_name: str,
    recruiter_email: str,
    interview_datetime: str,
    duration_minutes: int = 45,
    meeting_link: str = "",
    company_name: str = "AI Recruitment Platform",
    sequence: int = 0,
) -> str:
    """
    Generates a standard RFC 5545 compliant iCalendar string (.ics).
    Compatible with Google Calendar, Microsoft Outlook, and Apple Calendar.
    """
    start_dt = parse_interview_datetime(interview_datetime)
    try:
        dur = int(duration_minutes)
        if dur <= 0:
            dur = 45
    except (TypeError, ValueError):
        dur = 45

    end_dt = start_dt + timedelta(minutes=dur)
    now_dt = django_timezone.now().astimezone(timezone.utc)

    dtstamp = now_dt.strftime('%Y%m%dT%H%M%SZ')
    dtstart = start_dt.strftime('%Y%m%dT%H%M%SZ')
    dtend = end_dt.strftime('%Y%m%dT%H%M%SZ')

    uid = f"interview-{application_id}@airecruitmentplatform.com"
    summary = f"Interview: {job_title} at {company_name}"

    desc_lines = [
        f"Interview for the {job_title} position.",
        f"Candidate: {candidate_name} ({candidate_email})",
        f"Interviewer: {recruiter_name} ({recruiter_email})",
        f"Company: {company_name}",
        f"Duration: {dur} minutes",
    ]
    if meeting_link:
        desc_lines.append(f"Meeting Link: {meeting_link}")
    desc_lines.append("Please join 5 minutes before the scheduled start time.")

    description = escape_ical_text('\n'.join(desc_lines))
    location = escape_ical_text(meeting_link or "Online Video Call")
    escaped_summary = escape_ical_text(summary)

    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//AI Recruitment Platform//Interview Scheduler//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:REQUEST",
        "BEGIN:VEVENT",
        f"UID:{uid}",
        f"DTSTAMP:{dtstamp}",
        f"DTSTART:{dtstart}",
        f"DTEND:{dtend}",
        f"SEQUENCE:{int(sequence)}",
        "STATUS:CONFIRMED",
        f"SUMMARY:{escaped_summary}",
        f"DESCRIPTION:{description}",
        f"LOCATION:{location}",
    ]

    if meeting_link:
        lines.append(f"URL:{meeting_link.strip()}")

    # Add organizer and attendee if emails are present
    if recruiter_email:
        lines.append(f"ORGANIZER;CN={escape_ical_text(recruiter_name or company_name)}:mailto:{recruiter_email.strip()}")
    if candidate_email:
        lines.append(f"ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN={escape_ical_text(candidate_name)}:mailto:{candidate_email.strip()}")

    lines.extend([
        "TRANSP:OPAQUE",
        "END:VEVENT",
        "END:VCALENDAR",
    ])

    folded_lines = [fold_ical_line(line) for line in lines]
    return '\r\n'.join(folded_lines) + '\r\n'
