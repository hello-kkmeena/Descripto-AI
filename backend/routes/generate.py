from flask import Blueprint, request, jsonify
from services.gemini_service import generate_descriptions
from utils.logger import api_logger, log_errors
import time

generate_bp = Blueprint('generate_bp', __name__)

@log_errors('generate')
@generate_bp.route("/generate-description", methods=["POST"])
def generate():
    """Generate product descriptions using AI"""
    
    # Log the incoming request
    api_logger.info("Generate description request received", 
                   method=request.method,
                   endpoint=request.endpoint,
                   content_type=request.content_type)
    
    try:
        # Get request data
        data = request.get_json()
        if not data:
            api_logger.warning("Missing JSON payload in request")
            return jsonify({"error": "Missing JSON payload."}), 400

        # Extract and validate required fields
        title = data.get("title")
        features = data.get("features")
        tone = data.get("tone", "professional")

        # Log the request data (without sensitive info)
        api_logger.debug("Request data received", 
                        title_length=len(title) if title else 0,
                        features_length=len(features) if features else 0,
                        tone=tone)

        if not title or not features:
            api_logger.warning("Missing required fields", 
                             has_title=bool(title),
                             has_features=bool(features))
            return jsonify({"error": "'title' and 'features' fields are required."}), 400

        # Validate field lengths
        if len(title) > 200:
            api_logger.warning("Title too long", title_length=len(title))
            return jsonify({"error": "Title must be less than 200 characters."}), 400

        if len(features) > 1000:
            api_logger.warning("Features too long", features_length=len(features))
            return jsonify({"error": "Features must be less than 1000 characters."}), 400

        # Validate tone
        valid_tones = ['professional', 'fun', 'friendly']
        if tone not in valid_tones:
            api_logger.warning("Invalid tone provided", tone=tone, valid_tones=valid_tones)
            return jsonify({"error": f"Tone must be one of: {', '.join(valid_tones)}"}), 400

        # Generate descriptions
        api_logger.info("Generating descriptions", 
                       title_length=len(title),
                       features_length=len(features),
                       tone=tone)
        
        start_time = time.time()
        descriptions = generate_descriptions(title, features, tone)
        generation_time = round((time.time() - start_time) * 1000, 2)
        
        # Log successful generation
        api_logger.info("Descriptions generated successfully", 
                       count=len(descriptions),
                       generation_time_ms=generation_time)
        
        return jsonify({
            "descriptions": descriptions[:3],
            "generation_time_ms": generation_time,
            "count": len(descriptions[:3])
        })
        
    except Exception as e:
        # Log the error (this will be handled by the decorator)
        api_logger.error("Error in generate endpoint", error=e)
        raise

@generate_bp.route("/generate-description", methods=["OPTIONS"])
def generate_options():
    """Handle CORS preflight requests for generate endpoint"""
    api_logger.debug("CORS preflight request for generate endpoint")
    return jsonify({"status": "ok"}), 200

