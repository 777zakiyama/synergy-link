from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from .database import get_db, create_db_and_tables
from .models import User

load_dotenv()

app = FastAPI(title="Synergy Link API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

create_db_and_tables()

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    import secrets
    SECRET_KEY = secrets.token_hex(32)
    print("Warning: Using generated SECRET_KEY for development. Set SECRET_KEY environment variable in production.")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

skills_db = []
industries_db = [
    "IT Industry",
    "Finance Industry", 
    "Healthcare Industry",
    "Education Industry",
    "Manufacturing Industry",
    "Retail Industry",
    "Consulting Industry",
    "Media & Entertainment",
    "Real Estate",
    "Government & Public Sector"
]
visions_db = [
    "Innovation Leader",
    "Problem Solver",
    "Team Builder",
    "Strategic Thinker",
    "Customer Champion",
    "Growth Driver",
    "Quality Expert",
    "Sustainability Advocate"
]

class UserRegister(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserProfile(BaseModel):
    name: str
    company: str
    skills: List[str]
    vision: Optional[str] = None

class NetworkConnection(BaseModel):
    industry: str
    strength: str  # "Very Strong", "Strong", "Normal"

class VisionMap(BaseModel):
    user_email: str
    profile: UserProfile
    network: List[NetworkConnection]
    template: str  # "mindmap", "dashboard", "infographic"

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not isinstance(email, str) or email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return email
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

@app.get("/")
async def root():
    return {"message": "Synergy Link API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/industries")
async def get_industries():
    return {"industries": industries_db}

@app.get("/visions")
async def get_visions():
    return {"visions": visions_db}

@app.post("/api/register", response_model=Token)
async def register_user(user: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        profile=None,
        network=[]
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/login", response_model=Token)
async def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/profile")
async def create_user_profile(profile: UserProfile, current_user: str = Depends(verify_token), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == current_user).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_user.profile = profile.dict()
    db.commit()
    return {"message": "Profile created successfully", "user_email": current_user}

@app.get("/api/profile")
async def get_user_profile(current_user: str = Depends(verify_token), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == current_user).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if db_user.profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return db_user.profile

@app.post("/api/network")
async def add_network_connection(connection: NetworkConnection, current_user: str = Depends(verify_token), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == current_user).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if db_user.network is None:
        db_user.network = []
    db_user.network.append(connection.dict())
    db.commit()
    return {"message": "Network connection added successfully"}

@app.get("/api/network")
async def get_user_network(current_user: str = Depends(verify_token), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == current_user).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"network": db_user.network or []}

@app.post("/api/vision-map")
async def generate_vision_map(template: str, current_user: str = Depends(verify_token), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == current_user).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    vision_map = {
        "user_email": current_user,
        "profile": db_user.profile,
        "network": db_user.network or [],
        "template": template,
        "generated_at": datetime.utcnow().isoformat()
    }

    return {"vision_map": vision_map}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
