from fastapi import FastAPI, HTTPException, Depends, status, Header
from src.server.models import InitialQuery
from src.server.functions import create_session, get_session, session_exists, trigger_workflow
import uvicorn
import time
import logging

# Initialize FastAPI app
app = FastAPI(title="Canvas API", description="API for AssetIQ canvas operations with authentication")
# Configure logging
logging.basicConfig(level=logging.DEBUG)

# In-memory API key storage (replace with a database in production)
# Pre-defined API keys for the example
API_KEYS = {
    "8917239871289129389": {
        "user": "admin",
        "created_at": int(time.time())
    }
}

# API Key authentication
async def verify_api_key(API_KEY: str = Header(...)):
    if API_KEY not in API_KEYS:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key",
        )
    return API_KEYS[API_KEY]

@app.post("/canvas")
async def trigger_dashboard(commons: InitialQuery = Depends(), user=Depends(verify_api_key)):

    session_id = commons.session_id
    prompt = commons.prompt

    if not session_exists(session_id):
        logging.info(f"Session {session_id} does not exist, creating a new session")
        create_session(session_id)
    
    trigger_workflow(session_id, prompt)
    logging.info(f"Workflow triggered for session {session_id} with prompt: {prompt}")


@app.get("/canvas/{session_id}")
async def get_session_canvas(session_id: str, user=Depends(verify_api_key)):

    if not session_exists(session_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found, please reload the page",
        )
    
    return get_session(session_id)


# Run the application
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)