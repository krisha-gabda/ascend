from fastapi import FastAPI
from routers.auth import router as auth_router
from routers.tasks import router as task_router

app = FastAPI()

@app.get('/')
def root():
    return { "message": "ASCEND API is running" }

app.include_router(auth_router, prefix='/api/auth', tags=['auth'])
app.include_router(task_router, prefix='/api/tasks', tags=['tasks'])