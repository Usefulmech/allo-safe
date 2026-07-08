import africastalking
from app.core.config import settings

# Initialize Africa's Talking SDK
# We use this when we need to actively trigger something (like an outbound call or SMS)
# Note: For inbound webhook responses, the SDK isn't strictly required since we just return XML.

try:
    africastalking.initialize(
        settings.AFRICASTALKING_USERNAME,
        settings.AFRICASTALKING_API_KEY
    )
    voice = africastalking.Voice
    sms = africastalking.SMS
    print("[Africa's Talking] SDK Initialized Successfully")
except Exception as e:
    print(f"[Africa's Talking] Initialization Error: {e}")

# Example helper for outbound calls if needed in the future
def make_outbound_call(to_number: str, from_number: str):
    try:
        response = voice.call({
            "callFrom": from_number,
            "callTo": [to_number]
        })
        return response
    except Exception as e:
        print(f"Error making call: {e}")
        return None
