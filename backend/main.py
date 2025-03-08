import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, users, stories, tasks, documents
from app.core.config import settings

app = FastAPI(
    title="Developer Platform MVP",
    description="Internal Developer Platform for managing user stories, tasks, and documentation",
    version="0.1.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
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

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
