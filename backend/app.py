import logging
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from transformers import pipeline
from gtts import gTTS
from PIL import Image
import os

# -------------------------------------------------------------------
# 1) CONFIGURE LOGGING
# -------------------------------------------------------------------
logging.basicConfig(
    filename="app.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

app = Flask(__name__)
CORS(app)

# -------------------------------------------------------------------
# 2) LOAD HUGGING FACE MODELS
# -------------------------------------------------------------------
logging.info("Loading Hugging Face models...")

# Example Mistral-like model for math (text-generation).
# Replace "mistralai/mistral-7b-v0.1" with a valid model from HF if available.
# PHI-4 pipeline for math
phi_math_pipeline = pipeline(
    "text-generation",
    model="microsoft/phi-4",  # <-- Replace with the correct model name or checkpoint on HF
    max_length=1024,
    do_sample=False
)
# OCR for printed text
ocr_pipeline = pipeline(
    "image-to-text",
    model="microsoft/trocr-base-printed"
)

# Model-based math solver (original language model)
math_model_pipeline = pipeline(
    "text-generation",
    model="microsoft/rho-math-1b-v0.1"
)

# Question Answering
question_answering = pipeline(
    "question-answering",
    model="distilbert-base-cased-distilled-squad"
)

# Summarization
summarization = pipeline(
    "summarization",
    model="facebook/bart-large-cnn"
)

# Translation (English to Portuguese)
translation = pipeline(
    "translation",
    model="Helsinki-NLP/opus-mt-tc-big-en-pt"
)

logging.info("All models loaded successfully.")

# -------------------------------------------------------------------
# 3.1) ROUTE: SOLVE MATH WITH PHI-4
# -------------------------------------------------------------------
@app.route("/solve-math-phi", methods=["POST"])
def solve_math_phi():
    """
    1. Extract text from image (OCR)
    2. Feed recognized text to the Phi-4 math model pipeline
    3. Return the generated solution

    Endpoint: POST /solve-math-phi
    Form-Data: file=@image.png
    """
    if "file" not in request.files:
        logging.warning("No file provided in /solve-math-phi request.")
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        logging.warning("Empty file in /solve-math-phi request.")
        return jsonify({"error": "Empty file"}), 400

    try:
        # 1) OCR
        image = Image.open(file).convert("RGB")
        ocr_result = ocr_pipeline(image)[0]["generated_text"]
        math_problem = ocr_result.strip()
        logging.info(f"[PHI-4] Math problem recognized: {math_problem}")

        # 2) Generate solution using the PHI-4 pipeline
        generation = phi_math_pipeline(math_problem, max_length=1024, do_sample=False)
        solution_text = generation[0]["generated_text"]
        logging.info(f"[PHI-4] Math solution: {solution_text}")

        # 3) Return recognized text & model's solution
        return jsonify({"problem": math_problem, "solution": solution_text})
    except Exception as e:
        logging.error(f"Error in /solve-math-phi: {str(e)}")
        return jsonify({"error": str(e)}), 500


# -------------------------------------------------------------------
# 3) ROUTE: EXTRACT TEXT ONLY (OCR)
# -------------------------------------------------------------------
@app.route("/extract-text", methods=["POST"])
def extract_text():
    if "file" not in request.files:
        logging.warning("No file provided in /extract-text request.")
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        logging.warning("Empty file in /extract-text request.")
        return jsonify({"error": "Empty file"}), 400

    try:
        image = Image.open(file).convert("RGB")
        result = ocr_pipeline(image)[0]["generated_text"]
        recognized_text = result.strip()
        logging.info(f"Extracted text: {recognized_text}")
        return jsonify({"text": recognized_text})
    except Exception as e:
        logging.error(f"Error in /extract-text: {str(e)}")
        return jsonify({"error": str(e)}), 500

# -------------------------------------------------------------------
# 4) ROUTE: SOLVE MATH FROM IMAGE (MODEL-BASED)
# -------------------------------------------------------------------
@app.route("/solve-math-model", methods=["POST"])
def solve_math_model():
    if "file" not in request.files:
        logging.warning("No file provided in /solve-math-model request.")
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        logging.warning("Empty file in /solve-math-model request.")
        return jsonify({"error": "Empty file"}), 400

    try:
        image = Image.open(file).convert("RGB")
        ocr_result = ocr_pipeline(image)[0]["generated_text"]
        math_problem = ocr_result.strip()
        logging.info(f"Math problem recognized: {math_problem}")

        generation = math_model_pipeline(math_problem, max_length=1024, do_sample=False)
        solution_text = generation[0]["generated_text"]
        logging.info(f"Math model solution: {solution_text}")

        return jsonify({"problem": math_problem, "solution": solution_text})
    except Exception as e:
        logging.error(f"Error in /solve-math-model: {str(e)}")
        return jsonify({"error": str(e)}), 500


# -------------------------------------------------------------------
# 5) ROUTE: QUESTION ANSWERING
# -------------------------------------------------------------------
@app.route("/qa", methods=["POST"])
def qa():
    data = request.json or {}
    context = data.get("context", "")
    question = data.get("question", "")

    if context and question:
        try:
            logging.info(f"QA request: {question}")
            answer = question_answering({"question": question, "context": context})
            logging.info(f"QA answer: {answer['answer']}")
            return jsonify({"answer": answer["answer"]})
        except Exception as e:
            logging.error(f"QA error: {str(e)}")
            return jsonify({"error": "Error processing question"}), 500

    logging.warning("Invalid QA request: missing context or question.")
    return jsonify({"error": "Provide context and question"}), 400

# -------------------------------------------------------------------
# 6) ROUTE: SUMMARIZATION
# -------------------------------------------------------------------
@app.route("/summarize", methods=["POST"])
def summarize_text():
    data = request.json or {}
    text = data.get("text", "")

    if text:
        try:
            logging.info("Summarization request received.")
            summary = summarization(text, max_length=50, min_length=25, do_sample=False)
            logging.info("Summarization completed.")
            return jsonify({"summary": summary[0]["summary_text"]})
        except Exception as e:
            logging.error(f"Summarization error: {str(e)}")
            return jsonify({"error": "Error summarizing text"}), 500

    logging.warning("No text provided for summarization.")
    return jsonify({"error": "Provide text to summarize"}), 400

# -------------------------------------------------------------------
# 7) ROUTE: TRANSLATION
# -------------------------------------------------------------------
@app.route("/translate", methods=["POST"])
def translate_text():
    data = request.json or {}
    text = data.get("text", "")

    if text:
        try:
            logging.info("Translation request received.")
            translation_result = translation(text)
            logging.info("Translation completed.")
            return jsonify({"translation": translation_result[0]["translation_text"]})
        except Exception as e:
            logging.error(f"Translation error: {str(e)}")
            return jsonify({"error": "Error translating text"}), 500

    logging.warning("No text provided for translation.")
    return jsonify({"error": "Provide text to translate"}), 400

# -------------------------------------------------------------------
# 8) ROUTE: TEXT-TO-SPEECH (TTS)
# -------------------------------------------------------------------
@app.route("/tts", methods=["POST"])
def tts():
    from gtts import gTTS

    data = request.json or {}
    text = data.get("text", "")

    if text:
        try:
            logging.info("TTS request received.")
            tts_engine = gTTS(text=text, lang="en")
            file_path = "output.mp3"
            tts_engine.save(file_path)
            logging.info("TTS audio file generated.")
            return send_file(file_path, as_attachment=True)
        except Exception as e:
            logging.error(f"TTS error: {str(e)}")
            return jsonify({"error": "Error generating speech"}), 500

    logging.warning("No text provided for TTS.")
    return jsonify({"error": "Provide text for TTS"}), 400

# -------------------------------------------------------------------
# 9) ROUTE: SOLVE TYPED MATH PROBLEM (Original Model)
# -------------------------------------------------------------------
@app.route("/solve-text-model", methods=["POST"])
def solve_text_model():
    data = request.json or {}
    problem_text = data.get("problem", "").strip()

    if not problem_text:
        logging.warning("No math problem provided in /solve-text-model request.")
        return jsonify({"error": "No math problem provided"}), 400

    try:
        logging.info(f"Typed math problem: {problem_text}")
        generation = math_model_pipeline(problem_text, max_length=60, do_sample=False)
        solution_text = generation[0]["generated_text"]
        logging.info(f"Typed math solution: {solution_text}")

        return jsonify({"problem": problem_text, "solution": solution_text})
    except Exception as e:
        logging.error(f"Error in /solve-text-model: {str(e)}")
        return jsonify({"error": str(e)}), 500

# -------------------------------------------------------------------
# 10) MAIN
# -------------------------------------------------------------------
if __name__ == "__main__":
    logging.info("Starting Flask API (model-based math solver + OCR + Mistral).")
    app.run(debug=True)
