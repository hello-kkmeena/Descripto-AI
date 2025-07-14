from flask import Flask
from flask_cors import CORS
from routes.generate import generate_bp
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

app.register_blueprint(generate_bp)

if __name__ == "__main__":
    app.run(debug=True)