from fastapi import APIRouter, Request, Form, BackgroundTasks
from fastapi.responses import HTMLResponse
import os
import time
from typing import Optional
from twilio.twiml.voice_response import VoiceResponse, Gather
from app.services.session_manager import get_session, update_session, delete_session
from app.services import ai
from app.services.appwrite import get_user_by_phone, save_transaction
import httpx
from uuid import uuid4

router = APIRouter()

async def get_tts_url(request: Request, text: str, lang_code: str = "en-NG") -> str:
    filename = f"tts_{int(time.time())}_{id(text)}.mp3"
    output_path = os.path.join("temp_audio", filename)
    os.makedirs("temp_audio", exist_ok=True)
    await ai.generate_speech(text, lang_code, output_path)
    return f"{request.base_url}internal/audio/{filename}"

async def download_twilio_audio(recording_url: str) -> str:
    """Download audio from Twilio and return the local temp path."""
    filename = f"{uuid4()}.wav"
    output_path = os.path.join("temp_audio", filename)
    os.makedirs("temp_audio", exist_ok=True)
    
    async with httpx.AsyncClient() as client:
        # Twilio RecordingUrls are public for a short time or need HTTP Basic Auth
        # Assuming public URL for demo, or using standard auth if configured
        response = await client.get(recording_url)
        if response.status_code == 200:
            with open(output_path, "wb") as f:
                f.write(response.content)
            return output_path
    return ""

@router.post("/inbound", response_class=HTMLResponse)
async def voice_inbound(
    request: Request,
    CallSid: str = Form(...),
    CallStatus: str = Form(...),
    From: str = Form(...),
    Digits: Optional[str] = Form(None),
    RecordingUrl: Optional[str] = Form(None)
):
    """
    Webhook for Twilio inbound calls.
    Returns TwiML to answer the call and prompt the user.
    """
    if CallStatus in ["completed", "failed", "busy", "no-answer", "canceled"]:
        delete_session(CallSid)
        return str(VoiceResponse())
        
    session = get_session(CallSid)
    if not session:
        session = update_session(CallSid, {"caller_number": From, "state": "NEW_CALL"})

    state = session["state"]
    vr = VoiceResponse()

    if state == "NEW_CALL":
        # Check if user exists in Appwrite
        user = get_user_by_phone(From)
        
        if user:
            update_session(CallSid, {"state": "TRANSACTION_PROMPT", "user_id": user["$id"], "language": user.get("language", "en-NG")})
            text = f"Welcome back to AlloSafe. Please describe your transaction after the beep."
            url = await get_tts_url(request, text, user.get("language", "en-NG"))
            vr.play(url)
            vr.record(finish_on_key="#", max_length=30, trim="trim-silence", play_beep=True)
        else:
            text = "Welcome to AlloSafe. For English, press 1. Fun Yoruba, te si 2. Don Hausa, ka 3. Maka Igbo, pia 4."
            url = await get_tts_url(request, text)
            gather = Gather(num_digits=1, timeout=5)
            gather.play(url)
            vr.append(gather)
            update_session(CallSid, {"state": "ONBOARDING_LANGUAGE"})
    
    elif state == "ONBOARDING_LANGUAGE":
        lang_map = {"1": "en-NG", "2": "yo-NG", "3": "ha-NG", "4": "ig-NG"}
        lang = lang_map.get(Digits, "en-NG")
            
        update_session(CallSid, {"language": lang, "state": "ONBOARDING_NAME"})
        
        text = "Great. Please say your name after the beep."
        url = await get_tts_url(request, text, lang)
        vr.play(url)
        vr.record(finish_on_key="#", max_length=10, trim="trim-silence", play_beep=True)
        
    elif state == "ONBOARDING_NAME":
        if RecordingUrl:
            update_session(CallSid, {"state": "ONBOARDING_BUSINESS"})
            lang = session["language"]
            text = "Thank you. Now, what type of business do you do?"
            url = await get_tts_url(request, text, lang)
            vr.play(url)
            vr.record(finish_on_key="#", max_length=10, trim="trim-silence", play_beep=True)
            
    elif state == "ONBOARDING_BUSINESS":
        if RecordingUrl:
            update_session(CallSid, {"state": "TRANSACTION_PROMPT", "user_id": "new_user_temp_id"}) # Normally we'd save the new user
            lang = session["language"]
            text = "Your account is created. To log a transaction, describe it after the beep."
            url = await get_tts_url(request, text, lang)
            vr.play(url)
            vr.record(finish_on_key="#", max_length=30, trim="trim-silence", play_beep=True)
            
    elif state == "TRANSACTION_PROMPT":
        if RecordingUrl:
            # Process the audio with Gemini
            lang = session["language"]
            user_id = session.get("user_id")
            
            # Since this is synchronous and we don't want Twilio to time out, 
            # ideally we'd queue this, but for the demo we'll await it inline.
            audio_path = await download_twilio_audio(RecordingUrl)
            
            if audio_path:
                try:
                    extraction = await ai.process_audio_with_gemini(audio_path)
                    if user_id:
                        save_transaction(user_id=user_id, extraction=extraction, source="voice_call")
                    text = "Transaction saved successfully."
                except Exception as e:
                    print(f"Extraction error: {e}")
                    text = "I'm sorry, I couldn't understand that transaction."
                finally:
                    if os.path.exists(audio_path):
                        os.remove(audio_path)
            else:
                text = "I'm sorry, there was an error retrieving the recording."
                
            url = await get_tts_url(request, text, lang)
            vr.play(url)
            vr.say("Goodbye!")
            
    return str(vr)
