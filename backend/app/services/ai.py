import json
import edge_tts
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from app.core.config import settings

# Initialize Gemini Client
client = genai.Client(api_key=settings.GEMINI_API_KEY)

# Define the structured output format we expect from Gemini
class LedgerExtraction(BaseModel):
    transaction_type: str = Field(description="Must be 'IN' (for sales/money received) or 'OUT' (for expenses/loans)")
    amount: float = Field(description="The numeric amount of the transaction")
    item_name: str = Field(description="The name of the item sold or expense incurred. Keep it brief.")
    quantity: int = Field(description="The quantity of the item. Default to 1 if not specified.")
    contact_name: str = Field(description="The name of the customer or vendor if mentioned. Empty string if not mentioned.")
    confidence: float = Field(description="A confidence score between 0.0 and 1.0 of how well you understood the request.")

async def process_audio_with_gemini(audio_file_path: str) -> dict:
    """
    Takes an audio file, uploads it to Gemini, and extracts structured ledger data.
    """
    print(f"[AI] Processing audio file with Gemini: {audio_file_path}")
    
    try:
        # 1. Upload the audio file to Gemini's File API
        # The file API handles multimodal inputs natively
        audio_file = client.files.upload(file=audio_file_path)
        
        # 2. Define our extraction prompt
        prompt = (
            "You are an AI assistant for a financial ledger app called AlloSafe. "
            "Listen to this audio recording carefully. The user might be speaking in Nigerian English, Pidgin, Yoruba, Hausa, or Igbo. "
            "Extract the transaction details into the requested JSON schema. "
            "If they say something like 'I sold 2 bags of rice for 50000 naira to Mama Chinedu', "
            "transaction_type is 'IN', amount is 50000, item_name is 'bags of rice', quantity is 2, contact_name is 'Mama Chinedu'."
        )
        
        # 3. Call Gemini 1.5 Flash
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[audio_file, prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=LedgerExtraction,
            ),
        )
        
        # 4. Cleanup the uploaded file (good practice)
        try:
            client.files.delete(name=audio_file.name)
        except Exception as e:
            print(f"[AI] Failed to delete temp Gemini file: {e}")

        # Parse and return the JSON
        result_json = json.loads(response.text)
        print(f"[AI] Extraction Result: {result_json}")
        return result_json
        
    except Exception as e:
        print(f"[AI] Gemini Extraction Error: {e}")
        return {
            "transaction_type": "UNKNOWN",
            "amount": 0,
            "item_name": "Error processing audio",
            "quantity": 0,
            "contact_name": "",
            "confidence": 0.0
        }

async def generate_speech(text: str, language_code: str, output_path: str):
    """
    Uses edge-tts to generate speech in local accents and saves it to a file.
    
    Language Codes mapping:
    - 'en-NG' (English/Pidgin): en-NG-AbeoNeural (Male) or en-NG-EzinneNeural (Female)
    - 'yo-NG' (Yoruba): yo-NG-OlorunfemiNeural
    - 'ha-NG' (Hausa): ha-NG-AbbaNeural
    - 'ig-NG' (Igbo): ig-NG-ChidiNeural
    """
    print(f"[AI] Generating TTS for: '{text}' in {language_code}")
    
    voice = "en-NG-EzinneNeural" # Default to Nigerian female
    
    if language_code == "yo-NG":
        voice = "yo-NG-OlorunfemiNeural"
    elif language_code == "ha-NG":
        voice = "ha-NG-AbbaNeural"
    elif language_code == "ig-NG":
        voice = "ig-NG-ChidiNeural"
    elif language_code == "en-NG-M": # Custom manual toggle for Male
        voice = "en-NG-AbeoNeural"
        
    try:
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(output_path)
        print(f"[AI] TTS Audio saved to {output_path}")
        return output_path
    except Exception as e:
        print(f"[AI] Edge-TTS Error: {e}")
        return None
