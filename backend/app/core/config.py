from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Appwrite config
    APPWRITE_ENDPOINT: str = "https://cloud.appwrite.io/v1"
    APPWRITE_PROJECT_ID: str = ""
    APPWRITE_API_KEY: str = ""

    # Africa's Talking config
    AFRICASTALKING_USERNAME: str = "sandbox"
    AFRICASTALKING_API_KEY: str = ""

    # Gemini config (for ASR & LLM)
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
