import json
import os
import time
from typing import Iterable

from fastapi import FastAPI, Query
from fastapi.responses import StreamingResponse
from openai import OpenAI, OpenAIError

app = FastAPI(title="IdeaForge AI API")


def sse_message(text: str, event: str | None = None) -> str:
    prefix = f"event: {event}\n" if event else ""
    return f"{prefix}data: {json.dumps(text)}\n\n"


def fallback_idea(audience: str, industry: str, constraint: str, language: str) -> Iterable[str]:
    if language == "english":
        content = f"""# IdeaForge Opportunity

## Core concept
An AI operations assistant for {audience} working in {industry}. It turns messy daily requests into prioritized workflows, ready-to-send messages, and measurable follow-up tasks.

## First customer wedge
- Start with one repetitive workflow with clear ROI.
- Import customer requests from email, WhatsApp exports, or CSV files.
- Produce a daily action queue for the operator.

## Validation plan
- Interview 10 operators in the target niche.
- Build a concierge prototype before automating.
- Charge for the first pilot if it saves more than 3 hours per week.

## Constraint
Design the MVP to be {constraint}.
"""
    else:
        content = f"""# IdeaForge Opportunity

## Concepto central
Un asistente de operaciones con IA para {audience} dentro de {industry}. Convierte solicitudes desordenadas del dia a dia en flujos priorizados, mensajes listos para enviar y tareas medibles de seguimiento.

## Primer nicho
- Empezar con un flujo repetitivo y retorno claro.
- Importar solicitudes desde correo, exportaciones de WhatsApp o archivos CSV.
- Generar una cola diaria de acciones para el operador.

## Plan de validacion
- Entrevistar a 10 operadores del nicho.
- Construir un prototipo concierge antes de automatizar.
- Cobrar el primer piloto si ahorra mas de 3 horas por semana.

## Restriccion
Disenar el MVP para que sea {constraint}.
"""

    for token in content.split(" "):
        yield sse_message(token + " ")
        time.sleep(0.025)
    yield sse_message("done", event="done")


def openai_idea(audience: str, industry: str, constraint: str, language: str) -> Iterable[str]:
    client = OpenAI()
    prompt = f"""
Generate one original SaaS business idea using Markdown.

Audience: {audience}
Industry: {industry}
Constraint: {constraint}
Language: {language}

Return:
- Name
- Problem
- Product concept
- First niche
- MVP scope
- Validation plan
- Monetization
- One risk
"""
    stream = client.chat.completions.create(
        model="gpt-5-nano",
        messages=[{"role": "user", "content": prompt}],
        stream=True,
    )

    for chunk in stream:
        text = chunk.choices[0].delta.content
        if text:
            yield sse_message(text)
    yield sse_message("done", event="done")


def resilient_idea(audience: str, industry: str, constraint: str, language: str) -> Iterable[str]:
    if not os.getenv("OPENAI_API_KEY"):
        yield from fallback_idea(audience, industry, constraint, language)
        return

    try:
        yield from openai_idea(audience, industry, constraint, language)
    except OpenAIError:
        yield from fallback_idea(audience, industry, constraint, language)


@app.get("/api")
@app.get("/api/idea")
def idea(
    audience: str = Query("fundadores no tecnicos", max_length=120),
    industry: str = Query("automatizacion para negocios locales", max_length=140),
    constraint: str = Query("validable en 14 dias", max_length=120),
    language: str = Query("espanol", pattern="^(espanol|english)$"),
):
    return StreamingResponse(
        resilient_idea(audience, industry, constraint, language),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
