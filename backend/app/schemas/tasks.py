from pydantic import BaseModel

class TaskCreate(BaseModel):
    name: str
    description: str | None = None


class TaskResponse(BaseModel):
    id: str
    name: str
    status: str
    description: str | None = None
    created_at: str