from pydantic import BaseModel

class TaskCreate(BaseModel):
    name: str
    description: str | None


class TaskResponse(BaseModel):
    id: str
    name: str
    status: str
    description: str
    created_at: str