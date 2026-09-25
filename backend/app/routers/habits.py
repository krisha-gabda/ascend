from fastapi import APIRouter, Depends, HTTPException
from schemas.habits import HabitCreate, HabitResponse, HabitLogResponse
from utils.auth import get_current_user
from database.connection import supabase
from datetime import datetime

router = APIRouter()

@router.post('/create_habit')
def create_habit(habit_input: HabitCreate, current_user = Depends(get_current_user)):
    habit = {
        "user_id": current_user['id'],
        "name": habit_input.name,
        "description": habit_input.description,
        "frequency_type": habit_input.frequency_type.value,
        "frequency_days": habit_input.frequency_days,
    }

    response = supabase.table('habits').insert(habit).execute()
    new_habit = response.data[0]

    if not new_habit:
        raise HTTPException(status_code=401, detail='Details do not match')

    return HabitResponse(
        id=new_habit['id'],
        user_id=new_habit['user_id'],
        name=new_habit['name'],
        description=new_habit['description'],
        frequency_type=new_habit['frequency_type'],
        frequency_days=new_habit['frequency_days'],
        current_streak=new_habit['current_streak'],
        longest_streak=new_habit['longest_streak'],
        is_active=new_habit['is_active'],
        created_at=new_habit['created_at'],
    )


@router.get('/get_habits')
def get_habits(current_user = Depends(get_current_user)):
    response = supabase.table('habits').select('*').eq('user_id', current_user['id']).execute()
    habits = response.data
    result = []

    for habit in habits:
        result.append(HabitResponse(
            id=habit['id'],
            user_id=habit['user_id'],
            name=habit['name'],
            description=habit['description'],
            frequency_type=habit['frequency_type'],
            frequency_days=habit['frequency_days'],
            current_streak=habit['current_streak'],
            longest_streak=habit['longest_streak'],
            is_active=habit['is_active'],
            created_at=habit['created_at'],
        ))

    return result


@router.post('/add_habit_logs')
def add_habit_log(habit_id: str, current_user = Depends(get_current_user)):
    response = supabase.table('habits').select('*').eq('id', habit_id).eq('user_id', current_user['id']).execute()
    habit = response.data[0]

    if not habit:
        raise HTTPException(status_code=401, detail='Details do not match')

    habit_log = {
        'user_id': current_user['id'],
        'habit_id': habit_id,
        'date': datetime.today().strftime('%Y-%m-%d'),
        'status': 'completed',
    }

    habit_log_response = supabase.table('habit_logs').insert(habit_log).execute()
    new_habit_log = habit_log_response.data[0]

    current_streak = habit['current_streak'] + 1
    if current_streak > habit['longest_streak']:
        longest_streak = current_streak
    else:
        longest_streak = habit['longest_streak']

    updated_values = {
        'current_streak': current_streak,
        'longest_streak': longest_streak,
    }

    supabase.table('habits').update(updated_values).eq('id', habit_id).execute()

    return HabitLogResponse(
        id=new_habit_log['id'],
        user_id=new_habit_log['user_id'],
        habit_id=new_habit_log['habit_id'],
        date=new_habit_log['date'],
        status=new_habit_log['status'],
    )