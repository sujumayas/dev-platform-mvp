import uvicorn
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, users, stories, tasks, documents, dashboard
from app.core.config import settings

# Check for Claude API key at startup
if settings.CLAUDE_API_KEY:
    key_length = len(settings.CLAUDE_API_KEY)
    print(f"\n>>> CLAUDE_API_KEY found! (length: {key_length})")
else:
    print("\n>>> WARNING: CLAUDE_API_KEY not set! Design analysis will use fallback mode.")
    print(">>>          Set the CLAUDE_API_KEY in the .env file to use the actual Claude API.")

app = FastAPI(
    title="Developer Platform MVP",
    description="Internal Developer Platform for managing user stories, tasks, and documentation",
    version="0.1.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(stories.router, prefix="/stories", tags=["User Stories"])
app.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
app.include_router(documents.router, prefix="/documents", tags=["Documents"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
