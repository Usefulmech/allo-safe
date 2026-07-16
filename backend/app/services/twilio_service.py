import os
from twilio.rest import Client

# Initialize Twilio Client
# We use this when we need to actively trigger something (like an outbound call or SMS)

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

client = None
if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
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
            from_=TWILIO_PHONE_NUMBER,
            url=twiml_url
        )
        return call
    except Exception as e:
        print(f"Error making call: {e}")
        return None
