from appwrite.client import Client
from app.core.config import settings

# Initialize Appwrite client
client = Client()
client.set_endpoint(settings.APPWRITE_ENDPOINT)
client.set_project(settings.APPWRITE_PROJECT_ID)
client.set_key(settings.APPWRITE_API_KEY)

# We will add database and user management wrapper functions here.
