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

load_dotenv()

app = FastAPI(title="Synergy Link API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

users_db = {}
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
async def register_user(user: UserRegister):
    if user.email in users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user.password)
    users_db[user.email] = {
        "hashed_password": hashed_password,
        "profile": None,
        "network": [],
        "created_at": datetime.utcnow().isoformat()
    }
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/login", response_model=Token)
async def login_user(user: UserLogin):
    if user.email not in users_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    user_data = users_db[user.email]
    if not verify_password(user.password, user_data["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/profile")
async def create_user_profile(profile: UserProfile, current_user: str = Depends(verify_token)):
    if current_user not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    
    users_db[current_user]["profile"] = profile.dict()
    return {"message": "Profile created successfully", "user_email": current_user}

@app.get("/api/profile")
async def get_user_profile(current_user: str = Depends(verify_token)):
    if current_user not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile = users_db[current_user]["profile"]
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return profile

@app.post("/api/network")
async def add_network_connection(connection: NetworkConnection, current_user: str = Depends(verify_token)):
    if current_user not in users_db:
        raise HTTPException(status_code=404, detail="User not found")

    users_db[current_user]["network"].append(connection.dict())
    return {"message": "Network connection added successfully"}

@app.get("/api/network")
async def get_user_network(current_user: str = Depends(verify_token)):
    if current_user not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"network": users_db[current_user]["network"]}

@app.post("/api/vision-map")
async def generate_vision_map(template: str, current_user: str = Depends(verify_token)):
    if current_user not in users_db:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = users_db[current_user]
    vision_map = {
        "user_email": current_user,
        "profile": user_data["profile"],
        "network": user_data["network"],
        "template": template,
        "generated_at": datetime.utcnow().isoformat()
    }

    return {"vision_map": vision_map}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
