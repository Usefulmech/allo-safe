from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Appwrite config
    APPWRITE_ENDPOINT: str = "https://cloud.appwrite.io/v1"
    APPWRITE_PROJECT_ID: str = ""
    APPWRITE_API_KEY: str = ""

    # Gemini config (for ASR & LLM)
    GEMINI_API_KEY: str = ""

    # Twilio voice config
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""
    # Public HTTPS address Twilio uses to call this service, without a trailing slash.
    RENDER_EXTERNAL_URL: str = ""
    # Disable only for local webhook tests; leave enabled on Render.
    TWILIO_VALIDATE_WEBHOOKS: bool = True

    class Config:
        env_file = ".env"

settings = Settings()
