import requests
import json
import uuid
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"  # Update this if your backend runs on a different port
API_PREFIX = "/api/v1"

# Test user credentials
USER_EMAIL = "admin@example.com"
USER_PASSWORD = "password"

# Helper function to format the response
def format_response(response):
    try:
        return json.dumps(response.json(), indent=2)
    except:
        return response.text

# 1. Login to get token
def get_auth_token():
    print("\n1. Login to get access token")
    login_url = f"{BASE_URL}{API_PREFIX}/auth/login"
    login_data = {
        "username": USER_EMAIL,
        "password": USER_PASSWORD
    }
    
    response = requests.post(login_url, data=login_data)
    if response.status_code != 200:
        print(f"Login failed: {response.status_code}")
        print(format_response(response))
        exit(1)
    
    token_data = response.json()
    token = token_data.get("access_token")
    print("Login successful!")
    return token

# 2. Create a test story
def create_story(token):
    print("\n2. Creating a test story")
    create_url = f"{BASE_URL}{API_PREFIX}/stories/"
    headers = {"Authorization": f"Bearer {token}"}
    story_data = {
        "title": f"Test Story {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "description": "This is a test story description created for API testing."
    }
    
    response = requests.post(create_url, json=story_data, headers=headers)
    if response.status_code != 200:
        print(f"Story creation failed: {response.status_code}")
        print(format_response(response))
        exit(1)
    
    story = response.json()
    print(f"Story created successfully with ID: {story['id']}")
    print(f"Title: {story['title']}")
    return story

# 3. Update the story
def update_story(token, story_id):
    print(f"\n3. Updating story {story_id}")
    update_url = f"{BASE_URL}{API_PREFIX}/stories/{story_id}"
    headers = {"Authorization": f"Bearer {token}"}
    update_data = {
        "title": f"Updated Test Story {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "description": "This description has been updated via the API."
    }
    
    response = requests.put(update_url, json=update_data, headers=headers)
    if response.status_code != 200:
        print(f"Story update failed: {response.status_code}")
        print(format_response(response))
        exit(1)
    
    updated_story = response.json()
    print("Story updated successfully!")
    print(f"New title: {updated_story['title']}")
    print(f"New description: {updated_story['description']}")
    return updated_story

# 4. Verify the story exists after update
def get_story(token, story_id):
    print(f"\n4. Verifying story {story_id} exists")
    get_url = f"{BASE_URL}{API_PREFIX}/stories/{story_id}"
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(get_url, headers=headers)
    if response.status_code != 200:
        print(f"Story retrieval failed: {response.status_code}")
        print(format_response(response))
        exit(1)
    
    story = response.json()
    print("Story retrieved successfully!")
    print(f"Title: {story['title']}")
    return story

# 5. Delete the story
def delete_story(token, story_id):
    print(f"\n5. Deleting story {story_id}")
    delete_url = f"{BASE_URL}{API_PREFIX}/stories/{story_id}"
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.delete(delete_url, headers=headers)
    if response.status_code != 204:
        print(f"Story deletion failed: {response.status_code}")
        print(format_response(response))
        exit(1)
    
    print("Story deleted successfully!")
    return True

# 6. Verify the story no longer exists
def verify_deletion(token, story_id):
    print(f"\n6. Verifying story {story_id} was deleted")
    get_url = f"{BASE_URL}{API_PREFIX}/stories/{story_id}"
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(get_url, headers=headers)
    if response.status_code == 404:
        print("Verification successful - Story no longer exists!")
        return True
    else:
        print(f"Unexpected response: {response.status_code}")
        print(format_response(response))
        return False

if __name__ == "__main__":
    # Run the test sequence
    token = get_auth_token()
    story = create_story(token)
    updated_story = update_story(token, story["id"])
    get_story(token, story["id"])
    delete_story(token, story["id"])
    verify_deletion(token, story["id"])
    
    print("\nAll tests completed successfully!")
