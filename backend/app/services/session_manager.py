from typing import Dict, Any, Optional

# In-memory session store
# Key: sessionId (string from Africa's Talking)
# Value: dict containing session state and gathered data
_sessions: Dict[str, Dict[str, Any]] = {}

def get_session(session_id: str) -> Optional[Dict[str, Any]]:
    return _sessions.get(session_id)

def create_session(session_id: str, initial_state: str = "NEW_CALL") -> Dict[str, Any]:
    _sessions[session_id] = {
        "state": initial_state,
        "caller_number": None,
        "language": "en", # default
        "onboarding_data": {},
        "transaction_data": {}
    }
    return _sessions[session_id]

def update_session(session_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    if session_id not in _sessions:
        create_session(session_id)
    _sessions[session_id].update(updates)
    return _sessions[session_id]

def delete_session(session_id: str):
    if session_id in _sessions:
        del _sessions[session_id]
