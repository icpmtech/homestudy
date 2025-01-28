from flask import Flask, request, jsonify, send_file
from transformers import pipeline
from flask_cors import CORS
from gtts import gTTS
import os

app = Flask(__name__)
CORS(app)

# Load Hugging Face Models
question_answering = pipeline("question-answering", model="distilbert-base-cased-distilled-squad")
summarization = pipeline("summarization", model="facebook/bart-large-cnn")
translation = pipeline("translation_en_to_pt", model="Helsinki-NLP/opus-mt-en-pt")

@app.route("/qa", methods=["POST"])
def qa():
    data = request.json
    context = data.get("context", "")
    question = data.get("question", "")
    if context and question:
        answer = question_answering({"question": question, "context": context})
        return jsonify({"answer": answer["answer"]})
    return jsonify({"error": "Provide context and question"}), 400

@app.route("/summarize", methods=["POST"])
def summarize():
    data = request.json
    text = data.get("text", "")
    if text:
        summary = summarization(text, max_length=50, min_length=25, do_sample=False)
        return jsonify({"summary": summary[0]["summary_text"]})
    return jsonify({"error": "Provide text to summarize"}), 400

@app.route("/translate", methods=["POST"])
def translate():
    data = request.json
    text = data.get("text", "")
    if text:
        translation_result = translation(text)
        return jsonify({"translation": translation_result[0]["translation_text"]})
    return jsonify({"error": "Provide text to translate"}), 400

@app.route("/tts", methods=["POST"])
def tts():
    data = request.json
    text = data.get("text", "")
    if text:
        tts = gTTS(text=text, lang="en")
        file_path = "output.mp3"
        tts.save(file_path)
        return send_file(file_path, as_attachment=True)
    return jsonify({"error": "Provide text for TTS"}), 400

if __name__ == "__main__":
    app.run(debug=True)
