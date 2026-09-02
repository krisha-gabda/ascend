from supabase import create_client, Client
from core.config import get_settings
from passlib.context import CryptContext

settings = get_settings()
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
my_password = 'password'

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SECRET_KEY)