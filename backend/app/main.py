from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
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

class UserProfile(BaseModel):
    name: str
    company: str
    skills: List[str]
    vision: Optional[str] = None

class NetworkConnection(BaseModel):
    industry: str
    strength: str  # "Very Strong", "Strong", "Normal"

class VisionMap(BaseModel):
    user_id: str
    profile: UserProfile
    network: List[NetworkConnection]
    template: str  # "mindmap", "dashboard", "infographic"

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

@app.post("/users/{user_id}/profile")
async def create_user_profile(user_id: str, profile: UserProfile):
    users_db[user_id] = {
        "profile": profile.dict(),
        "network": [],
        "created_at": "2024-01-01"
    }
    return {"message": "Profile created successfully", "user_id": user_id}

@app.get("/users/{user_id}/profile")
async def get_user_profile(user_id: str):
    if user_id not in users_db:
        return {"error": "User not found"}, 404
    return users_db[user_id]["profile"]

@app.post("/users/{user_id}/network")
async def add_network_connection(user_id: str, connection: NetworkConnection):
    if user_id not in users_db:
        return {"error": "User not found"}, 404

    users_db[user_id]["network"].append(connection.dict())
    return {"message": "Network connection added successfully"}

@app.get("/users/{user_id}/network")
async def get_user_network(user_id: str):
    if user_id not in users_db:
        return {"error": "User not found"}, 404
    return {"network": users_db[user_id]["network"]}

@app.post("/users/{user_id}/vision-map")
async def generate_vision_map(user_id: str, template: str):
    if user_id not in users_db:
        return {"error": "User not found"}, 404

    user_data = users_db[user_id]
    vision_map = {
        "user_id": user_id,
        "profile": user_data["profile"],
        "network": user_data["network"],
        "template": template,
        "generated_at": "2024-01-01"
    }

    return {"vision_map": vision_map}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
