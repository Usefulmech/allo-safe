from fastapi import APIRouter, Request, Form
import os
import time
from typing import Optional
from app.services.session_manager import get_session, update_session, delete_session
from app.services import ai

router = APIRouter()

async def get_tts_url(request: Request, text: str, lang_code: str = "en-NG") -> str:
    filename = f"tts_{int(time.time())}_{id(text)}.mp3"
    output_path = os.path.join("temp_audio", filename)
    os.makedirs("temp_audio", exist_ok=True)
    await ai.generate_speech(text, lang_code, output_path)
    # request.base_url works well with ngrok mapping
    return f"{request.base_url}internal/audio/{filename}"

@router.post("/inbound")
async def voice_inbound(
    request: Request,
    sessionId: str = Form(...),
    isActive: int = Form(...),
    callerNumber: str = Form(...),
    direction: str = Form(None),
    dtmfDigits: Optional[str] = Form(None),
    recordingUrl: Optional[str] = Form(None)
):
    """
    Webhook for Africa's Talking inbound calls.
    Returns VoiceXML to answer the call and prompt the user.
    """
    if isActive == 0:
        delete_session(sessionId)
        return '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'
        
    session = get_session(sessionId)
    if not session:
        session = update_session(sessionId, {"caller_number": callerNumber, "state": "NEW_CALL"})

    state = session["state"]
    response_xml = '<?xml version="1.0" encoding="UTF-8"?><Response>'

    if state == "NEW_CALL":
        # Check if user already exists
        # In a real app, this would query Appwrite using callerNumber
        is_existing_user = False 
        
        # Mocking an existing user for testing purposes
        if callerNumber == "+2348000000000":
            is_existing_user = True
            
        if is_existing_user:
            update_session(sessionId, {"state": "TRANSACTION_PROMPT"})
            text = "Welcome back to AlloSafe. Please describe your transaction after the beep."
            url = await get_tts_url(request, text)
            response_xml += f'<Play url="{url}" />'
            response_xml += '<Record finishOnKey="#" maxLength="30" trim="Silence" playBeep="true" />'
        else:
            text = "Welcome to AlloSafe. For English, press 1. Fun Yoruba, te si 2. Don Hausa, ka 3. Maka Igbo, pia 4."
            url = await get_tts_url(request, text)
            response_xml += f'<GetDigits timeout="5" numDigits="1"><Play url="{url}" /></GetDigits>'
            update_session(sessionId, {"state": "ONBOARDING_LANGUAGE"})
    
    elif state == "ONBOARDING_LANGUAGE":
        lang_map = {"1": "en-NG", "2": "yo-NG", "3": "ha-NG", "4": "ig-NG"}
        lang = lang_map.get(dtmfDigits, "en-NG")
            
        update_session(sessionId, {"language": lang, "state": "ONBOARDING_NAME"})
        
        text = "Great. Please say your name after the beep."
        url = await get_tts_url(request, text, lang)
        response_xml += f'<Play url="{url}" />'
        response_xml += '<Record finishOnKey="#" maxLength="10" trim="Silence" playBeep="true" />'
        
    elif state == "ONBOARDING_NAME":
        if recordingUrl:
            update_session(sessionId, {"state": "ONBOARDING_BUSINESS"})
            lang = session["language"]
            text = "Thank you. Now, what type of business do you do?"
            url = await get_tts_url(request, text, lang)
            response_xml += f'<Play url="{url}" />'
            response_xml += '<Record finishOnKey="#" maxLength="10" trim="Silence" playBeep="true" />'
            
    elif state == "ONBOARDING_BUSINESS":
        if recordingUrl:
            update_session(sessionId, {"state": "TRANSACTION_PROMPT"})
            lang = session["language"]
            text = "Your account is created. To log a transaction, describe it after the beep."
            url = await get_tts_url(request, text, lang)
            response_xml += f'<Play url="{url}" />'
            response_xml += '<Record finishOnKey="#" maxLength="30" trim="Silence" playBeep="true" />'
            
    elif state == "TRANSACTION_PROMPT":
        if recordingUrl:
            lang = session["language"]
            update_session(sessionId, {"state": "TRANSACTION_CONFIRM"})
            text = "I heard a transaction. Press 1 to confirm, or 2 to cancel."
            url = await get_tts_url(request, text, lang)
            response_xml += f'<GetDigits timeout="5" numDigits="1"><Play url="{url}" /></GetDigits>'
            
    elif state == "TRANSACTION_CONFIRM":
        lang = session["language"]
        if dtmfDigits == "1":
            text = "Transaction saved. Goodbye!"
        else:
            text = "Transaction cancelled. Goodbye!"
        url = await get_tts_url(request, text, lang)
        response_xml += f'<Play url="{url}" />'
        
    response_xml += '</Response>'
    return response_xml
