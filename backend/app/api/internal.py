from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
import time
from app.services import ai

router = APIRouter()

class TTSRequest(BaseModel):
    text: str
    language_code: str = "en-NG"

@router.post("/tts")
async def generate_tts(req: TTSRequest):
    # Generates TTS and returns the URL to access it
    filename = f"tts_{int(time.time())}.mp3"
    output_path = os.path.join("temp_audio", filename)
    
    # Ensure directory exists
    os.makedirs("temp_audio", exist_ok=True)
    
    success = await ai.generate_speech(req.text, req.language_code, output_path)
    if not success:
        raise HTTPException(status_code=500, detail="TTS Generation failed")
        
    return {"url": f"/internal/audio/{filename}"}

@router.get("/audio/{filename}")
async def get_audio(filename: str):
    file_path = os.path.join("temp_audio", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio not found")
    return FileResponse(file_path, media_type="audio/mpeg")

@router.post("/transcribe")
async def transcribe_audio():
    # To be implemented when integrating incoming audio files
    pass

@router.post("/extract")
async def extract_entities():
    # To be implemented using Gemini when parsing user transaction
    pass

