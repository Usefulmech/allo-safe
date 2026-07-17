import os
import time
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.services.storage import Storage

# Load environment variables
load_dotenv()

APPWRITE_ENDPOINT = os.getenv("APPWRITE_ENDPOINT")
APPWRITE_PROJECT_ID = os.getenv("APPWRITE_PROJECT_ID")
APPWRITE_API_KEY = os.getenv("APPWRITE_API_KEY")

if not all([APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY]):
    print("Error: Missing Appwrite credentials in .env file.")
    exit(1)

client = Client()
client.set_endpoint(APPWRITE_ENDPOINT)
client.set_project(APPWRITE_PROJECT_ID)
client.set_key(APPWRITE_API_KEY)

databases = Databases(client)
storage = Storage(client)

DB_ID = "allosafe_db"
DB_NAME = "AlloSafe Database"

def wait_for_attributes():
    # Helper to give Appwrite Cloud time to process attributes before adding more
    time.sleep(1)

print("Starting AlloSafe Database Setup...")

# 1. Create Database
try:
    databases.get(database_id=DB_ID)
    print(f"Database '{DB_NAME}' already exists.")
except Exception:
    print(f"Creating Database: {DB_NAME}...")
    databases.create(database_id=DB_ID, name=DB_NAME)
    print("Database created!")

# Helper to create collections safely
def create_collection_if_not_exists(col_id, col_name):
    try:
        databases.get_collection(database_id=DB_ID, collection_id=col_id)
        print(f"Collection '{col_name}' already exists.")
        return False
    except Exception:
        print(f"Creating Collection: {col_name}...")
        databases.create_collection(
            database_id=DB_ID, 
            collection_id=col_id, 
            name=col_name, 
            document_security=True
        )
        print(f"Collection '{col_name}' created!")
        return True

# --- Users Collection ---
if create_collection_if_not_exists("users", "Users"):
    print("Adding attributes to Users...")
    databases.create_string_attribute(DB_ID, "users", "phone_number", 20, True)
    databases.create_string_attribute(DB_ID, "users", "name", 100, False)
    databases.create_string_attribute(DB_ID, "users", "language", 10, False, default="en-NG")
    databases.create_boolean_attribute(DB_ID, "users", "active", False, default=True)
    wait_for_attributes()
    databases.create_index(DB_ID, "users", "phone_index", "unique", ["phone_number"])
    wait_for_attributes()

# --- Transactions Collection ---
if create_collection_if_not_exists("transactions", "Transactions"):
    print("Adding attributes to Transactions...")
    databases.create_string_attribute(DB_ID, "transactions", "user_id", 50, True)
    databases.create_float_attribute(DB_ID, "transactions", "amount", True)
    databases.create_string_attribute(DB_ID, "transactions", "type", 20, True)
    databases.create_string_attribute(DB_ID, "transactions", "description", 255, False)
    databases.create_string_attribute(DB_ID, "transactions", "source", 20, False)
    databases.create_datetime_attribute(DB_ID, "transactions", "timestamp", True)
    wait_for_attributes()

# --- Inventory Collection ---
if create_collection_if_not_exists("inventory", "Inventory"):
    print("Adding attributes to Inventory...")
    databases.create_string_attribute(DB_ID, "inventory", "user_id", 50, True)
    databases.create_string_attribute(DB_ID, "inventory", "name", 100, True)
    databases.create_integer_attribute(DB_ID, "inventory", "quantity", True)
    databases.create_float_attribute(DB_ID, "inventory", "price", False)
    wait_for_attributes()

# --- Contacts Collection ---
if create_collection_if_not_exists("contacts", "Contacts"):
    print("Adding attributes to Contacts...")
    databases.create_string_attribute(DB_ID, "contacts", "user_id", 50, True)
    databases.create_string_attribute(DB_ID, "contacts", "name", 100, True)
    databases.create_string_attribute(DB_ID, "contacts", "phone_number", 20, False)
    wait_for_attributes()

# --- Voice Sessions Collection ---
if create_collection_if_not_exists("voice_sessions", "Voice Sessions"):
    print("Adding attributes to Voice Sessions...")
    databases.create_string_attribute(DB_ID, "voice_sessions", "session_id", 100, True)
    databases.create_string_attribute(DB_ID, "voice_sessions", "phone_number", 20, True)
    databases.create_string_attribute(DB_ID, "voice_sessions", "state", 50, True)
    databases.create_string_attribute(DB_ID, "voice_sessions", "temp_data", 10000, False) # JSON string
    wait_for_attributes()

# --- Summaries Collection ---
if create_collection_if_not_exists("summaries", "Summaries"):
    print("Adding attributes to Summaries...")
    databases.create_string_attribute(DB_ID, "summaries", "user_id", 50, True)
    databases.create_string_attribute(DB_ID, "summaries", "month_year", 20, True)
    databases.create_float_attribute(DB_ID, "summaries", "total_in", True)
    databases.create_float_attribute(DB_ID, "summaries", "total_out", True)
    databases.create_integer_attribute(DB_ID, "summaries", "credit_score", False)
    wait_for_attributes()

# 2. Create Storage Bucket for Voice Recordings
try:
    storage.get_bucket(bucket_id="voice_recordings")
    print("Storage Bucket 'voice_recordings' already exists.")
except Exception:
    print("Creating Storage Bucket 'voice_recordings'...")
    storage.create_bucket(
        bucket_id="voice_recordings", 
        name="Voice Recordings", 
        permissions=[], 
        file_security=True, 
        maximum_file_size=10000000 # 10MB
    )
    print("Storage Bucket created!")

print("All set! Database architecture is fully configured in Appwrite Cloud.")
