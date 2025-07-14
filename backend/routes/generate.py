from flask import Blueprint, request, jsonify
from services.openai_service import generate_descriptions

generate_bp = Blueprint('generate_bp', __name__)

@generate_bp.route("/generate-description", methods=["POST"])
def generate():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing JSON payload."}), 400

        title = data.get("title")
        features = data.get("features")
        tone = data.get("tone", "professional")

        if not title or not features:
            return jsonify({"error": "'title' and 'features' fields are required."}), 400

        descriptions = generate_descriptions(title, features, tone)
        return jsonify({"descriptions": descriptions[:3]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

