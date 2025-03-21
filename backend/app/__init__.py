# Init file to make app a package
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).parent.parent / '.env'
if os.path.exists(env_path):
    load_dotenv(dotenv_path=env_path)
    print(f"Loaded environment variables from {env_path}")
    
    # Check if CLAUDE_API_KEY is set
    if os.getenv("CLAUDE_API_KEY"):
        key_length = len(os.getenv("CLAUDE_API_KEY"))
        print(f"CLAUDE_API_KEY found with length: {key_length}")
    else:
        print("WARNING: CLAUDE_API_KEY not found in environment variables")
else:
    print(f"No .env file found at {env_path}")
