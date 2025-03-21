import os
import aiohttp
import json
import base64
from typing import Optional, Dict, Any, Union
from app.core.config import settings

class ClaudeService:
    """Service for interacting with Claude AI API"""
    
    BASE_URL = "https://api.anthropic.com/v1/messages"
    
    def __init__(self):
        """Initialize Claude service with API key from settings"""
        self.api_key = settings.CLAUDE_API_KEY
        if not self.api_key:
            print("WARNING: CLAUDE_API_KEY not set in environment. API calls will fail.")
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
    
    async def analyze_design_image(self, image_url: str) -> Optional[str]:
        """
        Analyze a design image using Claude's vision capabilities to generate a description
        
        Args:
            image_url: URL to the design image
            
        Returns:
            Generated description or None if the request failed
        """
        if not self.api_key:
            print("ERROR: CLAUDE_API_KEY not set, cannot analyze image. Using fallback.")
            return self.fallback_design_analysis()
            
        # Create the prompt for Claude with vision capabilities
        prompt = """Analyze this design image for a software application. 
        
        Please provide a detailed description that would be suitable for a user story description. 
        Focus on:
        1. The main purpose of the screen/interface shown
        2. Key user interactions visible
        3. Important UI elements and their arrangement
        4. The overall user flow or functionality represented
        
        Format your response as a user story description that could be used by a product manager or developer team.
        Do not include phrases like 'In this design' or 'The image shows'. Just describe it directly as if you're writing requirements.
        """

        print(f"\nSending image analysis request to Claude API with prompt length: {len(prompt)} chars")
        print(f"Using image URL: {image_url}")

        try:
            # Set up the request payload for vision analysis
            payload = {
                "model": "claude-3-sonnet-20240229",
                "max_tokens": 1000,
                "temperature": 0,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": prompt
                            },
                            {
                                "type": "image",
                                "source": {
                                    "type": "url",
                                    "url": image_url
                                }
                            }
                        ]
                    }
                ]
            }
            
            print(f"Claude API payload prepared: {json.dumps(payload, indent=2)[:200]}...")
            
            # Create headers
            headers = {
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
                "x-api-key": self.api_key
            }
            
            print(f"Headers prepared (API key length: {len(self.api_key)})")
            
            # Send the request
            async with aiohttp.ClientSession() as session:
                print(f"Sending request to Claude API endpoint: {self.BASE_URL}")
                try:
                    async with session.post(
                        self.BASE_URL, 
                        headers=headers, 
                        json=payload,
                        timeout=30  # Adding a timeout
                    ) as response:
                        status_code = response.status
                        print(f"Claude API response status: {status_code}")
                        
                        response_text = await response.text()
                        print(f"Response text sample: {response_text[:200]}...")
                        
                        if status_code != 200:
                            print(f"ERROR from Claude API: {response_text}")
                            print("Using fallback design analysis")
                            return self.fallback_design_analysis()
                        
                        result = json.loads(response_text)
                        print(f"Parsed JSON response, keys: {list(result.keys())}")
                        
                        # Extract the response content
                        if result and "content" in result and len(result["content"]) > 0:
                            # Get the text from the response
                            generated_text = result["content"][0]["text"]
                            print(f"Successfully extracted generated text, length: {len(generated_text)} chars")
                            return generated_text
                        else:
                            print(f"Failed to extract content from Claude API response")
                            print("Using fallback design analysis")
                            return self.fallback_design_analysis()
                except aiohttp.ClientError as e:
                    print(f"aiohttp ClientError: {str(e)}")
                    print("Using fallback design analysis")
                    return self.fallback_design_analysis()
                    
        except Exception as e:
            print(f"EXCEPTION when calling Claude API for image analysis: {str(e)}")
            # Print traceback for more details
            import traceback
            traceback.print_exc()
            print("Using fallback design analysis")
            return self.fallback_design_analysis()
            
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
        
    def fallback_design_analysis(self) -> str:
        """
        Fallback method to generate a basic description if image analysis fails
        
        Returns:
            Basic description template
        """
        print("\nGenerating fallback design analysis...")
        
        fallback_text = """The design shows a user interface for a software application. 
        The interface appears to include navigation elements, content areas, and interactive components.
        Users can likely interact with various elements on the screen to accomplish tasks within the application.
        The layout follows a structured approach with clear organization of information and functionality.
        
        Additional details would be needed to specify the exact requirements and functionality represented in this design.
        """
        
        print(f"Generated fallback design analysis with {len(fallback_text)} characters.")
        return fallback_text