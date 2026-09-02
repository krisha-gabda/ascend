from fastapi import FastAPI
from routers.auth import router as auth_router

app = FastAPI()

@app.get('/')
def root():
    return { "message": "ASCEND API is running" }

app.include_router(auth_router, prefix='/api/auth', tags=['auth'])