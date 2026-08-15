"""Production entry point: FastAPI API plus the exported Next.js frontend."""

from pathlib import Path

from fastapi import HTTPException
from fastapi.responses import FileResponse

from api.index import app


# Docker copies the frontend to ``static``. Using ``out`` as a fallback makes
# the same entry point convenient to verify after a local Next.js build.
static_path = Path("static")
if not static_path.exists():
    static_path = Path("out")


@app.get("/health")
def health_check():
    return {"status": "healthy"}


# Register this after the API routes so /api/* continues to reach FastAPI.
if static_path.exists():

    @app.get("/")
    async def serve_root():
        return FileResponse(static_path / "index.html")

    @app.get("/{requested_path:path}", include_in_schema=False)
    async def serve_static_file(requested_path: str):
        # Next static export represents a page such as /product as product.html.
        requested = Path(requested_path)
        if requested.is_absolute() or ".." in requested.parts:
            raise HTTPException(status_code=404)

        file_path = static_path / requested
        page_path = static_path / f"{requested_path}.html"
        if file_path.is_file():
            return FileResponse(file_path)
        if page_path.is_file():
            return FileResponse(page_path)
        raise HTTPException(status_code=404)
