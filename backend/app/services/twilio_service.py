from twilio.rest import Client
from app.core.config import settings

# Initialize Twilio Client
# We use this when we need to actively trigger something (like an outbound call or SMS)

client = None
if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        print("[Twilio] SDK Initialized Successfully")
    except Exception as e:
        print(f"[Twilio] Initialization Error: {e}")
else:
    print("[Twilio] Missing Twilio credentials in environment.")

def make_outbound_call(to_number: str, twiml_url: str):
    if not client:
        print("Twilio client not initialized.")
        return None
    try:
        call = client.calls.create(
            to=to_number,
            from_=settings.TWILIO_PHONE_NUMBER,
            url=twiml_url
        )
        return call
    except Exception as e:
        print(f"Error making call: {e}")
        return None
