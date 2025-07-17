import google.generativeai as genai
import os
import time
from utils.logger import api_logger
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Configure Google Generative AI
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Configure rate limiter
limiter = Limiter(
    key_func=get_remote_address,  # Uses client IP address
    default_limits=["200 per day"],
    storage_uri="memory://"
)

def generate_descriptions(title, features, tone):
    """Generate product descriptions using Google Gemini API"""
    
    # Log the generation request
    api_logger.info("Gemini API request initiated", 
                   title_length=len(title),
                   features_length=len(features),
                   tone=tone)
    
    if not os.getenv("GOOGLE_API_KEY"):
        api_logger.error("Google API key not found")
        raise ValueError("Missing Google API key.")

    # Create the prompt
    prompt = f"""Write one persuasive E-commerce product descriptions for:
    Title: {title}
    Features: {features}
    Tone: {tone}
    Keep under 300 characters and SEO-friendly.
    Return only the description, no other text.
    """

    try:
        # Log the API call
        api_logger.debug("Making Gemini API call", 
                        model="models/gemini-2.0-flash-lite",
                        prompt_length=len(prompt))
        
        # Initialize the model
        model = genai.GenerativeModel('models/gemini-2.0-flash-lite')
        
        # Make the API call
        response = model.generate_content(prompt)
        
        # Extract and process the response
        text = response.text
        descriptions = [desc.strip() for desc in text.split('\n') if desc.strip()]
        
        # Log successful response
        api_logger.info("Gemini API call successful", 
                       response_length=len(text),
                       description_count=len(descriptions))
        
        return descriptions
       
        
    except Exception as e:
        api_logger.error("Unexpected error in Gemini service", error=e)
        raise Exception("Failed to generate descriptions. Please try again.") 