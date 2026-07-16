from fastapi import APIRouter, File, UploadFile, Form, HTTPException
import os
import shutil
from uuid import uuid4
from app.services.ai import process_audio_with_gemini
from app.services.appwrite import save_transaction

router = APIRouter()

TEMP_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "temp_audio")
os.makedirs(TEMP_DIR, exist_ok=True)

@router.post("/process-audio")
async def pwa_process_audio(
    user_id: str = Form(...),
    audio: UploadFile = File(...)
):
    """
    Endpoint for the PWA web dashboard's giant Mic button.
    Receives an audio blob from the browser, passes it to the AI pipeline,
    and returns the structured ledger entry.
    """
    # 1. Save audio file locally
    file_ext = audio.filename.split('.')[-1] if audio.filename else "webm"
    temp_path = os.path.join(TEMP_DIR, f"{uuid4()}.{file_ext}")
    
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)
        
    try:
        # 2. Process with AI
        extraction = await process_audio_with_gemini(temp_path)
        
        # 3. Save to Appwrite
        result = save_transaction(user_id=user_id, extraction=extraction, source="voice")
        
        if not result:
            raise HTTPException(status_code=500, detail="Failed to save transaction to database")
            
        return {"status": "success", "extraction": extraction, "document": result}
        
    except Exception as e:
        print(f"Error processing PWA audio: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
