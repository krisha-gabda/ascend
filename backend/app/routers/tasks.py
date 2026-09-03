from fastapi import APIRouter, Depends, HTTPException
from schemas.tasks import TaskCreate, TaskResponse
from utils.auth import get_current_user
from database.connection import supabase

router = APIRouter()

@router.get('/get_tasks')
def view_tasks(current_user = Depends(get_current_user)):
    try:
        response = supabase.table('tasks').select('*').eq('user_id', current_user['id']).execute()
        tasks = response.data
        result = []

        for task in tasks:
            result.append(TaskResponse(
                id=task['id'],
                name=task['name'],
                description=task['description'],
                status=task['status'],
                created_at=task['created_at'],
            ))

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Something went wrong: {e}')


@router.post('/add_task')
def create_tasks(task_input: TaskCreate, current_user = Depends(get_current_user)):
    try:
        task = {
            'user_id': current_user['id'],
            'name': task_input.name,
            'description': task_input.description,
        }

        response = supabase.table('tasks').insert(task).execute()
        if not response.data:
            raise HTTPException(status_code=401, detail='User not found')

        task = response.data[0]

        return TaskResponse(
            id=task['id'],
            name=task['name'],
            description=task['description'],
            status=task['status'],
            created_at=task['created_at'],
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Something went wrong: {e}')


@router.post('/complete_task')
def complete_task(task_id: str, current_user = Depends(get_current_user)):
    response = supabase.table('tasks').select('*').eq('id', task_id).eq('user_id', current_user['id']).execute()
    task = response.data[0]

    if not task:
        raise HTTPException(status_code=401, detail='Details do not match')

    updated_response = supabase.table('tasks').update({'status': 'completed'}).eq('id', task_id).eq('user_id', current_user['id']).execute()
    updated_task = updated_response.data[0]

    return TaskResponse(
        id=updated_task['id'],
        name=updated_task['name'],
        description=updated_task['description'],
        status=updated_task['status'],
        created_at=updated_task['created_at'],
    )
