from fastapi import APIRouter, Depends, HTTPException
from schemas.habits import HabitCreate, HabitResponse, HabitLogResponse
from utils.auth import get_current_user
from database.connection import supabase
from datetime import date, datetime, timedelta, timezone

router = APIRouter()

def _streaks(logs, today: date, frequency_type: str, frequency_days=None):
    completed_dates = {
        date.fromisoformat(str(log['date'])[:10])
        for log in logs
        if log.get('status') == 'completed'
    }

    if frequency_type in ('weekly', 'monthly'):
        def period_key(day):
            if frequency_type == 'weekly':
                return day - timedelta(days=day.weekday())
            return (day.year, day.month)

        def previous_period(period):
            if frequency_type == 'weekly':
                return period - timedelta(days=7)
            year, month = period
            return (year - 1, 12) if month == 1 else (year, month - 1)

        completed_periods = {period_key(day) for day in completed_dates}
        current_period = period_key(today)
        if current_period not in completed_periods:
            current_period = previous_period(current_period)

        current_streak = 0
        cursor = current_period
        while cursor in completed_periods:
            current_streak += 1
            cursor = previous_period(cursor)

        longest_streak = 0
        for period in completed_periods:
            if previous_period(period) not in completed_periods:
                run_length = 1
                cursor = period
                while previous_period(cursor) in completed_periods:
                    run_length += 1
                    cursor = previous_period(cursor)
                longest_streak = max(longest_streak, run_length)
        return current_streak, longest_streak

    weekday_numbers = {
        'monday': 0,
        'tuesday': 1,
        'wednesday': 2,
        'thursday': 3,
        'friday': 4,
        'saturday': 5,
        'sunday': 6,
    }
    scheduled_weekdays = {
        weekday_numbers[name.lower()]
        for name in (frequency_days or [])
        if name.lower() in weekday_numbers
    } if frequency_type == 'specific_days' else set(range(7))

    def previous_occurrence(day, include_day=False):
        cursor = day if include_day else day - timedelta(days=1)
        for _ in range(7):
            if cursor.weekday() in scheduled_weekdays:
                return cursor
            cursor -= timedelta(days=1)
        return None

    current_streak = 0
    cursor = today if today in completed_dates else previous_occurrence(today)
    while cursor and cursor in completed_dates:
        current_streak += 1
        cursor = previous_occurrence(cursor)

    longest_streak = 0
    for completed_date in completed_dates:
        if previous_occurrence(completed_date) not in completed_dates:
            run_length = 1
            cursor = completed_date
            previous_date = previous_occurrence(cursor)
            while previous_date in completed_dates:
                run_length += 1
                cursor = previous_date
                previous_date = previous_occurrence(cursor)
            longest_streak = max(longest_streak, run_length)

    return current_streak, longest_streak

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
    today = datetime.now(timezone.utc).date()
    habit_ids = [habit['id'] for habit in habits]
    logs = []
    if habit_ids:
        logs = supabase.table('habit_logs').select('habit_id,date,status').eq(
            'user_id', current_user['id']
        ).in_('habit_id', habit_ids).eq('status', 'completed').execute().data

    logs_by_habit = {}
    for log in logs:
        logs_by_habit.setdefault(log['habit_id'], []).append(log)

    result = []

    for habit in habits:
        habit_logs = logs_by_habit.get(habit['id'], [])
        current_streak, longest_streak = _streaks(
            habit_logs,
            today,
            habit['frequency_type'],
            habit['frequency_days'],
        )
        result.append(HabitResponse(
            id=habit['id'],
            user_id=habit['user_id'],
            name=habit['name'],
            description=habit['description'],
            frequency_type=habit['frequency_type'],
            frequency_days=habit['frequency_days'],
            current_streak=current_streak,
            longest_streak=longest_streak,
            completed_today=any(str(log['date'])[:10] == today.isoformat() for log in habit_logs),
            is_active=habit['is_active'],
            created_at=habit['created_at'],
        ))

    return result


@router.post('/add_habit_logs')
def add_habit_log(habit_id: str, current_user = Depends(get_current_user)):
    response = supabase.table('habits').select('*').eq('id', habit_id).eq('user_id', current_user['id']).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail='Habit not found')
    habit = response.data[0]

    today = datetime.now(timezone.utc).date()
    existing_log = supabase.table('habit_logs').select('*').eq(
        'user_id', current_user['id']
    ).eq('habit_id', habit_id).eq('date', today.isoformat()).execute()
    if existing_log.data:
        raise HTTPException(status_code=409, detail='This habit has already been recorded today')

    habit_log = {
        'user_id': current_user['id'],
        'habit_id': habit_id,
        'date': today.isoformat(),
        'status': 'completed',
    }

    try:
        habit_log_response = supabase.table('habit_logs').insert(habit_log).execute()
    except Exception as error:
        duplicate_log = supabase.table('habit_logs').select('id').eq(
            'user_id', current_user['id']
        ).eq('habit_id', habit_id).eq('date', today.isoformat()).execute()
        if duplicate_log.data:
            raise HTTPException(status_code=409, detail='This habit has already been recorded today') from error
        raise HTTPException(status_code=500, detail='Unable to record habit') from error

    new_habit_log = habit_log_response.data[0]
    all_logs = supabase.table('habit_logs').select('date,status').eq(
        'user_id', current_user['id']
    ).eq('habit_id', habit_id).eq('status', 'completed').execute().data
    current_streak, longest_streak = _streaks(
        all_logs,
        today,
        habit['frequency_type'],
        habit['frequency_days'],
    )

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
        current_streak=current_streak,
        longest_streak=longest_streak,
    )