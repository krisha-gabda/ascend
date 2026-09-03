from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timezone, timedelta
from core.config import get_settings
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database.connection import supabase

settings = get_settings()
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
bearer_scheme = HTTPBearer()

def hash_password(password):
    return pwd_context.hash(password[:72])


def create_jwt_token(user_id: str) -> str:
    payload = {
        'sub': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRY_MINUTES)
    }

    return jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )


def verify_password(plain: str, hashed: str):
    return pwd_context.verify(plain[:72], hashed)


def decode_jwt_token(token: str) -> str:
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=settings.JWT_ALGORITHM)
    except JWTError:
        raise HTTPException(status_code=401, detail='Invalid or expired token')


def get_current_user( credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme) ):
    # token is automatically extracted from the authorization header
    token = credentials.credentials
    payload = decode_jwt_token(token)
    user_id = payload.get('sub')

    result = supabase.table('users').select('*').eq('id', user_id).execute()
    user = result.data[0]

    if len(user) == 0:
        raise HTTPException(status_code=401, detail='User not found')

    return user