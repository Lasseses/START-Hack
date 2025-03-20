import logging
from typing import Dict, Any, Optional, List
import time
import threading

MAX_SESSIONS = 50

class Tiles:
    position: tuple[int, int]
    id: int
    title: str
    description: str
    data: Any

# Modified in-memory storage to include timestamps
sessions: Dict[str, Dict[str, Any]] = {}  # session_id -> {timestamp, tiles}

def cleanup_old_sessions():
    """Remove sessions older than 3 minutes"""
    current_time = time.time()
    expired_sessions = []
    
    for session_id, session_data in sessions.items():
        if current_time - session_data["timestamp"] > 180:  # 3 minutes = 180 seconds
            expired_sessions.append(session_id)
    
    for session_id in expired_sessions:
        del sessions[session_id]
    
    # Schedule the next cleanup
    cleanup_timer = threading.Timer(60, cleanup_old_sessions)  # Check every minute
    cleanup_timer.daemon = True
    cleanup_timer.start()

def session_exists(session_id: str) -> bool:
    return session_id in sessions

def create_session(session_id: str):
    if len(sessions) >= MAX_SESSIONS:
        logging.warning("Maximum number of sessions exceeded")
    
    sessions[session_id] = {
        "timestamp": time.time(),
        "tiles": []
    }

def get_session(session_id: str) -> List[Tiles]:
    if not session_exists(session_id):
        return []
    return sessions[session_id]["tiles"]

def update_session_timestamp(session_id: str):
    """Update the last access timestamp of a session"""
    if session_exists(session_id):
        sessions[session_id]["timestamp"] = time.time()

def trigger_workflow(session_id: str, prompt: str):
    # Update the timestamp when the session is accessed
    update_session_timestamp(session_id)
    # This is where you would trigger the workflow to execute the dashboard
    pass

# Start the cleanup timer when your application starts
cleanup_timer = threading.Timer(60, cleanup_old_sessions)
cleanup_timer.daemon = True
cleanup_timer.start()