import openai
import os
import time
from utils.logger import api_logger

# Set OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_descriptions(title, features, tone):
    """Generate E-commerce product descriptions using OpenAI API"""
    
    # Log the generation request
    api_logger.info("OpenAI API request initiated", 
                   title_length=len(title),
                   features_length=len(features),
                   tone=tone)
    
    if not openai.api_key:
        api_logger.error("OpenAI API key not found")
        raise ValueError("Missing OpenAI API key.")

    # Create the prompt
    prompt = f"""Write persuasive E-commerce product descriptions for:
    Title: {title}
    Features: {features}
    Tone: {tone}
    Keep each under 300 characters and SEO-friendly.
    """

    try:
        # Log the API call
        api_logger.debug("Making OpenAI API call", 
                        model="gpt-4",
                        prompt_length=len(prompt))
        
        # Make the API call

        time.sleep(2)

        # response = {
        #     "choices": [
        #         {
        #             "message": {"content": f"This is a test response {title} {features} {tone}"}
        #         }
        #     ]
        # };

    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=500
    )
        
        # Extract and process the response
    text = response['choices'][0]['message']['content']
        descriptions = [desc.strip() for desc in text.split('\n') if desc.strip()]
        
        # Log successful response
        api_logger.info("OpenAI API call successful", 
                       response_length=len(text),
                       description_count=len(descriptions),
                       usage_tokens=response.get('usage', {}))
        
        return descriptions
       
        
    except openai.error.RateLimitError as e:
        api_logger.error("OpenAI rate limit exceeded", error=e)
        raise Exception("OpenAI rate limit exceeded. Please try again later.")
        
    except openai.error.InvalidRequestError as e:
        api_logger.error("OpenAI invalid request", error=e)
        raise Exception("Invalid request to OpenAI API.")
        
    except openai.error.AuthenticationError as e:
        api_logger.error("OpenAI authentication failed", error=e)
        raise Exception("OpenAI authentication failed. Please check API key.")
        
    except openai.error.APIError as e:
        api_logger.error("OpenAI API error", error=e)
        raise Exception("OpenAI API error. Please try again later.")
        
    except Exception as e:
        api_logger.error("Unexpected error in OpenAI service", error=e)
        raise Exception("Failed to generate descriptions. Please try again.")
