from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from pwdlib import PasswordHash
from app.core.config import settings
password_hash = PasswordHash.recommended()
ALGORITHM = "HS256"
def hash_password(password: str) -> str: return password_hash.hash(password)
def verify_password(password: str, hashed: str) -> bool:
    try: return password_hash.verify(password, hashed)
    except Exception: return False
def create_token(user_id: int) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    return jwt.encode({"sub": str(user_id), "exp": exp}, settings.jwt_secret, algorithm=ALGORITHM)
def token_user_id(token: str):
    try: return int(jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM]).get("sub"))
    except (JWTError, TypeError, ValueError): return None
