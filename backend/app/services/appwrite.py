from appwrite.client import Client
from app.core.config import settings
from appwrite.services.databases import Databases
from appwrite.query import Query
from appwrite.id import ID
from datetime import datetime

# Initialize Appwrite client
client = Client()
client.set_endpoint(settings.APPWRITE_ENDPOINT)
client.set_project(settings.APPWRITE_PROJECT_ID)
client.set_key(settings.APPWRITE_API_KEY)

databases = Databases(client)

DB_ID = "allosafe_db"
COL_TRANSACTIONS = "transactions"
COL_USERS = "users"

def get_user_by_phone(phone_number: str):
    """
    Looks up a user by their phone number.
    Returns the user document if found, else None.
    """
    try:
        # Standardize the phone number format for lookup if needed
        # e.g., +234...
        result = databases.list_documents(
            database_id=DB_ID,
            collection_id=COL_USERS,
            queries=[Query.equal("phone_number", phone_number)]
        )
        if result.get("documents") and len(result["documents"]) > 0:
            return result["documents"][0]
        return None
    except Exception as e:
        print(f"[Appwrite] Failed to lookup user by phone: {e}")
        return None

def save_transaction(user_id: str, extraction: dict, source: str = "voice"):
    """
    Saves an extracted transaction to the Appwrite transactions collection.
    """
    # Map AI extracted fields to our schema
    tx_type = "sale" if extraction.get("transaction_type") == "IN" else "expense"
    amount = float(extraction.get("amount", 0))
    description = f"{extraction.get('quantity', 1)} {extraction.get('item_name', '')}"
    if extraction.get('contact_name'):
        description += f" to {extraction.get('contact_name')}"
        
    data = {
        "user_id": user_id,
        "type": tx_type,
        "amount": amount,
        "description": description.strip(),
        "timestamp": datetime.utcnow().isoformat(),
        "source": source
    }
    
    try:
        result = databases.create_document(
            database_id=DB_ID,
            collection_id=COL_TRANSACTIONS,
            document_id=ID.unique(),
            data=data
        )
        return result
    except Exception as e:
        print(f"[Appwrite] Failed to save transaction: {e}")
        return None
