from pydantic import BaseModel
from typing import Dict, Any, Optional, List

class InitialQuery(BaseModel):
    prompt: str
    session_id: str

class CanvasData(BaseModel):
    diff_id: str
    session_id: str
    timestamp: int
    tiles: Dict[str, Any]


class CanvasDiff(BaseModel):
    canvas_id: str
    changes: Dict[str, Any]

class CanvasDiffResponse(BaseModel):
    diff_id: str
    canvas_id: str
    timestamp: int
    changes: Dict[str, Any]

class QueryResponse(BaseModel):
    query_id: str
    status: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class ApiKey(BaseModel):
    api_key: str
    user: str
