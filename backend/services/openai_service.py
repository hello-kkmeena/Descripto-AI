import openai
import os

openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_descriptions(title, features, tone):
    if not openai.api_key:
        raise ValueError("Missing OpenAI API key.")

    prompt = f"""Write 3 persuasive eBay product descriptions for:
    Title: {title}
    Features: {features}
    Tone: {tone}
    Keep each under 300 characters and SEO-friendly.
    """

    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )
    text = response['choices'][0]['message']['content']
    return [desc.strip() for desc in text.split('\n') if desc.strip()]
