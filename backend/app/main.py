from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI app
app = FastAPI(
    title="AlloSafe Voice Backend",
    description="Backend API for AlloSafe Voice-First Ledger",
    version="1.0.0"
)

# Setup CORS for PWA access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AlloSafe Backend is running!"}

# Mount our routers
from app.api import voice, internal, pwa
app.include_router(voice.router, prefix="/webhooks/voice", tags=["voice"])
app.include_router(internal.router, prefix="/internal", tags=["internal"])
app.include_router(pwa.router, prefix="/api/pwa", tags=["pwa"])
