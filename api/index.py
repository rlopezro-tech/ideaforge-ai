import json
import os
import time
from typing import Iterable

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi_clerk_auth import ClerkConfig, ClerkHTTPBearer, HTTPAuthorizationCredentials
from openai import OpenAI, OpenAIError
from pydantic import BaseModel, Field

load_dotenv(".env.local")
load_dotenv(".env")

app = FastAPI(title="MediNotes Pro API")
clerk_guard: ClerkHTTPBearer | None = None


class Visit(BaseModel):
    patient_name: str = Field(min_length=1, max_length=120)
    date_of_visit: str = Field(min_length=1, max_length=40)
    notes: str = Field(min_length=1, max_length=6000)


SYSTEM_PROMPT = """
You are provided with notes written by a doctor from a patient's visit.
Your job is to summarize the visit for the doctor and provide an email.
Reply with exactly three sections with the headings:
### Summary of visit for the doctor's records
### Next steps for the doctor
### Draft of email to patient in patient-friendly language

Do not invent diagnoses, test results, or treatments that are not present in the notes.
Keep the patient email clear, concise, and non-alarming.
"""


async def require_clerk_auth(request: Request) -> HTTPAuthorizationCredentials:
    global clerk_guard

    jwks_url = os.getenv("CLERK_JWKS_URL")
    if not jwks_url:
        raise HTTPException(status_code=500, detail="CLERK_JWKS_URL is not configured")

    if clerk_guard is None:
        clerk_config = ClerkConfig(jwks_url=jwks_url)
        clerk_guard = ClerkHTTPBearer(clerk_config)

    return await clerk_guard(request)


def sse_message(text: str, event: str | None = None) -> str:
    prefix = f"event: {event}\n" if event else ""
    return f"{prefix}data: {json.dumps(text)}\n\n"


def user_prompt_for(visit: Visit) -> str:
    return f"""Create the summary, next steps, and draft email for:
Patient Name: {visit.patient_name}
Date of Visit: {visit.date_of_visit}
Notes:
{visit.notes}"""


def fallback_consultation(visit: Visit) -> Iterable[str]:
    content = f"""### Summary of visit for the doctor's records

{visit.patient_name} was seen on {visit.date_of_visit}. Consultation notes indicate:

{visit.notes}

### Next steps for the doctor

- Review the consultation note for clinical completeness.
- Confirm any diagnosis, medication, or follow-up plan before sharing with the patient.
- Add any missing exam findings, orders, or return precautions to the medical record.

### Draft of email to patient in patient-friendly language

Dear {visit.patient_name},

Thank you for coming in for your visit on {visit.date_of_visit}. Based on today's discussion, please follow the care plan reviewed during your appointment. Contact the clinic if your symptoms worsen, if you have new concerns, or if you need clarification about the next steps.

Best,
Your care team
"""

    for token in content.split(" "):
        yield sse_message(token + " ")
        time.sleep(0.02)
    yield sse_message("done", event="done")


def openai_consultation(visit: Visit) -> Iterable[str]:
    client = OpenAI()
    stream = client.chat.completions.create(
        model="gpt-5-nano",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt_for(visit)},
        ],
        stream=True,
    )

    for chunk in stream:
        text = chunk.choices[0].delta.content
        if text:
            yield sse_message(text)
    yield sse_message("done", event="done")


def resilient_consultation(visit: Visit) -> Iterable[str]:
    if not os.getenv("OPENAI_API_KEY"):
        yield from fallback_consultation(visit)
        return

    try:
        yield from openai_consultation(visit)
    except OpenAIError:
        yield from fallback_consultation(visit)


@app.post("/api")
@app.post("/api/consultation")
def consultation_summary(
    visit: Visit,
    creds: HTTPAuthorizationCredentials = Depends(require_clerk_auth),
):
    _user_id = creds.decoded["sub"]
    return StreamingResponse(
        resilient_consultation(visit),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
