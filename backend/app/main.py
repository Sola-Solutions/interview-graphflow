from fastapi import FastAPI

# Import flattened router
from app.routes import router as graph_router

app = FastAPI(
    title="Graph Flow API",
    description="Backend service for Graph Flow take-home assessment.",
    version="0.1.0",
)

# Routers
app.include_router(graph_router, prefix="/graph", tags=["graph"])


@app.get("/health", tags=["system"])
async def health_check() -> dict[str, str]:
    """Return service health status."""
    return {"status": "ok"}
