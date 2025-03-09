import os
import aiohttp
import json
from typing import Optional

class ClaudeService:
    """Service for interacting with Claude AI API"""
    
    BASE_URL = "https://api.anthropic.com/v1/messages"
    
    def __init__(self):
        """Initialize Claude service with API key from environment"""
        self.api_key = os.getenv("CLAUDE_API_KEY", "")
        if not self.api_key:
            print("WARNING: CLAUDE_API_KEY not set in environment. Gherkin generation will fail.")
        else:
            print(f"Claude API key found. Length: {len(self.api_key)} characters.")
    
    async def generate_gherkin(self, title: str, description: str) -> Optional[str]:
        """
        Generate Gherkin specification from user story description
        
        Args:
            title: The user story title
            description: The user story description
            
        Returns:
            String containing the Gherkin format or None if the request failed
        """
        if not self.api_key:
            print("ERROR: CLAUDE_API_KEY not set, cannot generate Gherkin. Using fallback.")
            return None
            
        # Create the prompt for Claude
        prompt = f"""Convert the following user story to Gherkin format:

Title: {title}

Description:
{description}

Output the Gherkin specification only, without additional explanations.
"""

        print(f"\nSending request to Claude API with prompt length: {len(prompt)} chars")

        try:
            # Set up the request payload
            payload = {
                "model": "claude-3-sonnet-20240229",
                "max_tokens": 1000,
                "temperature": 0,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            }
            
            # Create headers
            headers = {
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
                "x-api-key": self.api_key
            }
            
            # Send the request
            async with aiohttp.ClientSession() as session:
                print(f"Sending request to Claude API endpoint: {self.BASE_URL}")
                async with session.post(
                    self.BASE_URL, 
                    headers=headers, 
                    json=payload
                ) as response:
                    status_code = response.status
                    print(f"Claude API response status: {status_code}")
                    
                    if status_code != 200:
                        error_text = await response.text()
                        print(f"ERROR from Claude API: {error_text}")
                        return None
                    
                    result = await response.json()
                    print(f"Received response from Claude API: {type(result)}")
                    
                    # Extract the response content
                    if result and "content" in result and len(result["content"]) > 0:
                        # Get the text from the response
                        gherkin_text = result["content"][0]["text"]
                        print(f"Successfully extracted Gherkin text, length: {len(gherkin_text)} chars")
                        return gherkin_text
                    else:
                        print(f"Failed to extract content from Claude API response: {result}")
                        return None
                    
        except Exception as e:
            print(f"EXCEPTION when calling Claude API: {str(e)}")
            # Print traceback for more details
            import traceback
            traceback.print_exc()
            return None
            
    def fallback_gherkin_generation(self, title: str, description: str) -> str:
        """
        Fallback method to generate basic Gherkin format if API call fails
        
        Args:
            title: The user story title
            description: The user story description
            
        Returns:
            String containing the basic Gherkin format
        """
        print("\nGenerating fallback Gherkin format...")
        
        # Clean up the title for feature name
        feature_name = title.strip()
        
        # Create a clean scenario name
        scenario_name = title.strip()
        if scenario_name.lower().startswith("hu"):
            # Remove the HU identifier if present (e.g., "HU01 - Some title" -> "Some title")
            parts = scenario_name.split("-", 1)
            if len(parts) > 1:
                scenario_name = parts[1].strip()
        
        # Start building the Gherkin
        gherkin = f"Feature: {feature_name}\n\n"
        gherkin += f"  Scenario: {scenario_name}\n"
        
        # Process the description to extract Given/When/Then
        sentences = [s.strip() for s in description.replace(".", ".\n").split("\n") if s.strip()]
        
        # Determine the appropriate structure based on sentence count
        if len(sentences) >= 3:
            # If we have 3+ sentences, use the first three for Given/When/Then
            gherkin += f"    Given {sentences[0]}\n"
            gherkin += f"    When {sentences[1]}\n"
            gherkin += f"    Then {sentences[2]}\n"
            
            # Add any additional sentences as And clauses
            for i, sentence in enumerate(sentences[3:]):
                gherkin += f"    And {sentence}\n"
                
        elif len(sentences) == 2:
            # With 2 sentences, use first for Given, second for Then, and add a generic When
            gherkin += f"    Given {sentences[0]}\n"
            gherkin += f"    When the user performs the required action\n"
            gherkin += f"    Then {sentences[1]}\n"
            
        elif len(sentences) == 1:
            # With 1 sentence, use it for Given and add generic When/Then
            gherkin += f"    Given {sentences[0]}\n"
            gherkin += f"    When the user performs the required action\n"
            gherkin += f"    Then the expected outcome is achieved\n"
            
        else:
            # With no sentences, create a completely generic structure
            gherkin += "    Given the initial context for the user story\n"
            gherkin += "    When the user performs the required action\n"
            gherkin += "    Then the expected outcome is achieved\n"
            
        print(f"Generated fallback Gherkin with {len(gherkin)} characters.")
        return gherkin
