
from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    return "PlatformAlert API is running "

@app.route("/status")
def status():
    return jsonify({"status": "ok", "service": "api"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
