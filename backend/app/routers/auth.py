from fastapi import APIRouter, HTTPException
from database.connection import supabase
from schemas.auth import UserRegister, TokenResponse, UserResponse
from utils.auth import hash_password, create_jwt_token
import uuid

router = APIRouter()

@router.post('/register')
def register(user_data: UserRegister):
    user_check = supabase.table('users').select('email').eq('email', user_data.email).execute()
    if len(user_check.data) != 0:
        raise HTTPException(status_code=400, detail='User already registered')

    try:
        hashed_password = hash_password(user_data.password)
        data = {
            "email": user_data.email,
            "password_hash": hashed_password
        }

        result = supabase.table('users').insert(data).execute()
        jwt_token = create_jwt_token(user_id=result.data[0]['id'])

        return TokenResponse(
            access_token=jwt_token,
            user=UserResponse(
                id=result.data[0]['id'],
                email=result.data[0]['email'],
                created_at=result.data[0]['created_at'],
            )
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Something went wrong: {e}')
