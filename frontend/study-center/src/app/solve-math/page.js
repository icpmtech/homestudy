"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

export default function SolveMathModelPage() {
  // -----------------------
  // CAMERA REFS
  // -----------------------
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Toggles camera
  const [showCamera, setShowCamera] = useState(false);

  // -----------------------
  // IMAGE & CROP STATES
  // -----------------------
  const [imageData, setImageData] = useState("");
  const [crop, setCrop] = useState({ unit: "%", width: 50, aspect: 0 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imageRef = useRef(null);

  // The final "file" we send to the server
  const [file, setFile] = useState(null);

  // -----------------------
  // TYPED PROBLEM
  // -----------------------
  const [typedProblem, setTypedProblem] = useState("");

  // -----------------------
  // MODEL SELECTION
  // -----------------------
  const [selectedModel, setSelectedModel] = useState("default"); 
  /**
   * "default" => calls default math endpoints
   * "deepseek" => uses /extract-text + /deepseek for images,
   *               or /deepseek for typed text
   */

  // -----------------------
  // RESULT DISPLAY
  // -----------------------
  const [recognizedProblem, setRecognizedProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [error, setError] = useState("");

  // -----------------------
  // LOADING STATES
  // -----------------------
  const [loadingImage, setLoadingImage] = useState(false);
  const [loadingText, setLoadingText] = useState(false);

  // -----------------------
  // HISTORY
  // -----------------------
  const [exercises, setExercises] = useState([]);

  // On mount, load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("exercises");
    if (stored) {
      setExercises(JSON.parse(stored));
    }
  }, []);

  // Save to localStorage whenever `exercises` changes
  useEffect(() => {
    localStorage.setItem("exercises", JSON.stringify(exercises));
  }, [exercises]);

  // -----------------------
  // RIGHT DRAWER (History)
  // -----------------------
  const [showHistory, setShowHistory] = useState(false);

  const toggleHistoryDrawer = () => {
    setShowHistory((prev) => !prev);
  };

  // -----------------------
  // HELPER: Solve with "Default" or "DeepSeek"
  // -----------------------
  /**
   * If "default":
   *   /solve-math-model (images)
   *   /solve-text-model (typed)
   *
   * If "deepseek" for image:
   *   1) /extract-text
   *   2) pass recognized text to /deepseek (as messages)
   *
   * If "deepseek" for typed:
   *   directly call /deepseek with messages
   */

  // ============================================================
  // CAMERA FUNCTIONS
  // ============================================================
  const startCamera = async () => {
    try {
      setShowCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setError("Unable to access camera.");
      console.error(err);
    }
  };

  const stopCamera = () => {
    setShowCamera(false);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
  };

  const takePicture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to Base64
    const dataUrl = canvas.toDataURL("image/png");
    setImageData(dataUrl);

    // Also create a File for the server
    canvas.toBlob((blob) => {
      if (!blob) return;
      const captureFile = new File([blob], "camera_capture.png", { type: "image/png" });
      setFile(captureFile);
    });

    stopCamera();
  };

  // ============================================================
  // FILE UPLOAD
  // ============================================================
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setRecognizedProblem("");
    setSolution("");
    setError("");

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (typeof evt.target.result === "string") {
        setImageData(evt.target.result);
        setFile(selectedFile);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  // ============================================================
  // CROPPING
  // ============================================================
  const onImageLoaded = (img) => {
    imageRef.current = img;
  };

  const onCropComplete = (c) => {
    setCompletedCrop(c);
  };

  const handleApplyCrop = async () => {
    if (!imageRef.current || !completedCrop?.width || !completedCrop?.height) {
      setError("No valid crop selected.");
      return;
    }

    const cropCanvas = document.createElement("canvas");
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;

    cropCanvas.width = completedCrop.width * scaleX;
    cropCanvas.height = completedCrop.height * scaleY;
    const ctx = cropCanvas.getContext("2d");

    ctx.drawImage(
      imageRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );

    return new Promise((resolve) => {
      cropCanvas.toBlob((blob) => {
        if (!blob) {
          setError("Failed to crop image.");
          return;
        }
        const croppedFile = new File([blob], "cropped.png", { type: "image/png" });
        setFile(croppedFile);

        const croppedUrl = cropCanvas.toDataURL("image/png");
        setImageData(croppedUrl);

        setRecognizedProblem("");
        setSolution("");
        resolve();
      }, "image/png");
    });
  };

  // ============================================================
  // SOLVE FROM IMAGE
  // ============================================================
  const handleSolveFromImage = async () => {
    if (!file) {
      setError("Please upload or take a picture first.");
      return;
    }

    setLoadingImage(true);
    setError("");
    setRecognizedProblem("");
    setSolution("");

    try {
      if (selectedModel === "default") {
        // Directly call /solve-math-model
        const formData = new FormData();
        formData.append("file", file);

        const resp = await axios.post("http://localhost:5000/solve-math-model", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setRecognizedProblem(resp.data.problem);
        setSolution(resp.data.solution);

      } else if (selectedModel === "deepseek") {
        // Step 1: /extract-text to get recognized text
        const formData = new FormData();
        formData.append("file", file);

        const ocrResp = await axios.post("http://localhost:5000/extract-text", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const recognizedText = ocrResp.data.text;

        // Step 2: pass recognized text as a user message to /deepseek
        const messages = [
          { role: "user", content: recognizedText }
        ];
        const dsResp = await axios.post("http://localhost:5000/deepseek", { messages });
        const output = dsResp.data.output || "";

        setRecognizedProblem(recognizedText);
        setSolution(output);
      }

    } catch (err) {
      setError(err.response?.data?.error || "An error occurred.");
    } finally {
      setLoadingImage(false);
    }
  };

  // ============================================================
  // SOLVE TYPED TEXT
  // ============================================================
  const handleSolveFromText = async () => {
    if (!typedProblem.trim()) {
      setError("Please enter a math problem or question.");
      return;
    }

    setLoadingText(true);
    setError("");
    setRecognizedProblem("");
    setSolution("");

    try {
      if (selectedModel === "default") {
        // /solve-text-model
        const resp = await axios.post("http://localhost:5000/solve-text-model", {
          problem: typedProblem,
        });
        setRecognizedProblem(resp.data.problem);
        setSolution(resp.data.solution);

      } else if (selectedModel === "deepseek") {
        // Directly pass typed text as user content
        const messages = [
          { role: "user", content: typedProblem }
        ];
        const dsResp = await axios.post("http://localhost:5000/deepseek", { messages });
        const output = dsResp.data.output || "";

        setRecognizedProblem(typedProblem);
        setSolution(output);
      }

    } catch (err) {
      setError(err.response?.data?.error || "An error occurred.");
    } finally {
      setLoadingText(false);
    }
  };

  // ============================================================
  // SAVE EXERCISE
  // ============================================================
  const handleSaveExercise = () => {
    if (!recognizedProblem && !solution) {
      setError("No solution to save.");
      return;
    }

    const newExercise = {
      problem: recognizedProblem,
      solution,
      image: imageData,
      date: new Date().toISOString(),
      model: selectedModel,
    };
    setExercises([newExercise, ...exercises]);

    // Reset states
    setFile(null);
    setTypedProblem("");
    setRecognizedProblem("");
    setSolution("");
    setError("");
    setImageData("");
    setCrop({ unit: "%", width: 50 });
    setCompletedCrop(null);
  };

  // ============================================================
  // LOAD EXERCISE FROM HISTORY
  // ============================================================
  const handleLoadExercise = (ex) => {
    setRecognizedProblem(ex.problem);
    setSolution(ex.solution);
    setImageData(ex.image || "");
    setError("");
    setCrop({ unit: "%", width: 50 });
    setCompletedCrop(null);
    setShowHistory(false);
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="relative flex h-screen w-full bg-gray-900">
      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col items-center p-4 overflow-auto">
        {/* History Toggle Button */}
        <button
          onClick={toggleHistoryDrawer}
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full mb-6 hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-xl"
        >
          📖 History
        </button>

        <div className="bg-gray-800 shadow-2xl rounded-2xl p-6 max-w-xl w-full">
          <h1 className="text-4xl font-extrabold text-center mb-6 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Math Solver
          </h1>

          {/* MODEL SELECTION */}
          <div className="mb-6 flex justify-center gap-2">
            <button
              onClick={() => setSelectedModel("default")}
              className={`px-4 py-2 rounded-full transition-all ${
                selectedModel === "default"
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Default
            </button>
            <button
              onClick={() => setSelectedModel("deepseek")}
              className={`px-4 py-2 rounded-full transition-all ${
                selectedModel === "deepseek"
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              DeepSeek
            </button>
          </div>

          {/* IMAGE SECTION */}
          <div className="bg-gray-700 rounded-xl p-4 mb-6">
            <h2 className="text-lg font-bold mb-3 text-white">📷 Image Solve</h2>
            
            <div className="flex flex-col gap-3 mb-4">
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-500 rounded-xl cursor-pointer hover:border-purple-400 transition-colors">
                <span className="text-gray-400">Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {!showCamera ? (
                <button
                  onClick={startCamera}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-3 rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
                >
                  📸 Open Camera
                </button>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-purple-400">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={takePicture}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-sm p-3 rounded-full hover:scale-110 transition-transform"
                    >
                      ⚪
                    </button>
                  </div>
                  <button
                    onClick={stopCamera}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    Close Camera
                  </button>
                </div>
              )}
            </div>

            {imageData && (
              <div className="mt-4 space-y-3">
                <div className="border-2 border-purple-400 rounded-xl overflow-hidden">
                  <ReactCrop
                    crop={crop}
                    onChange={setCrop}
                    onComplete={onCropComplete}
                    aspect={crop.aspect || undefined}
                  >
                    <img
                      src={imageData}
                      alt="to-crop"
                      ref={imageRef}
                      onLoad={(e) => onImageLoaded(e.currentTarget)}
                      className="w-full max-h-64 object-contain"
                    />
                  </ReactCrop>
                </div>
                <button
                  onClick={handleApplyCrop}
                  className="w-full bg-purple-500/20 text-purple-300 p-2 rounded-lg hover:bg-purple-500/30 transition-colors"
                >
                  ✂️ Apply Crop
                </button>
              </div>
            )}

            <button
              onClick={handleSolveFromImage}
              disabled={loadingImage}
              className={`w-full mt-4 p-3 rounded-xl font-bold transition-all ${
                loadingImage
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-105"
              }`}
            >
              {loadingImage ? "🧠 Processing..." : "✨ Solve from Image"}
            </button>
          </div>

          {/* TEXT SECTION */}
          <div className="bg-gray-700 rounded-xl p-4 mb-6">
            <h2 className="text-lg font-bold mb-3 text-white">✍️ Text Solve</h2>
            <textarea
              className="w-full bg-gray-800 text-white p-3 rounded-lg border-2 border-gray-600 focus:border-purple-400 outline-none placeholder-gray-400"
              placeholder="Enter math problem or question..."
              value={typedProblem}
              onChange={(e) => setTypedProblem(e.target.value)}
              rows="3"
            />
            <button
              onClick={handleSolveFromText}
              disabled={loadingText}
              className={`w-full mt-4 p-3 rounded-xl font-bold transition-all ${
                loadingText
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-105"
              }`}
            >
              {loadingText ? "🧠 Processing..." : "✨ Solve from Text"}
            </button>
          </div>

          {/* RESULTS */}
          {(recognizedProblem || solution) && (
            <div className="bg-gray-700 rounded-xl p-4 mb-4 space-y-3 animate-fade-in">
              <div className="space-y-2">
                <h3 className="text-purple-300 font-semibold">Problem</h3>
                <p className="text-white bg-gray-800 p-3 rounded-lg">
                  {recognizedProblem}
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-green-300 font-semibold">Solution</h3>
                <p className="text-white bg-gray-800 p-3 rounded-lg whitespace-pre-wrap">
                  {solution}
                </p>
              </div>
              <button
                onClick={handleSaveExercise}
                className="w-full bg-gradient-to-r from-green-400 to-cyan-500 text-black p-3 rounded-xl font-bold hover:scale-105 transition-transform"
              >
                💾 Save Solution
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-400/20 text-red-300 rounded-lg animate-shake">
              ⚠️ Error: {error}
            </div>
          )}
        </div>
      </div>

      {/* HISTORY DRAWER */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[380px] bg-gray-800 z-40 transform transition-transform duration-300 ${
          showHistory ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 bg-gray-900 flex justify-between items-center">
          <h2 className="text-xl font-bold text-transparent bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text">
            History
          </h2>
          <button
            onClick={toggleHistoryDrawer}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            ✕
          </button>
        </div>
        
        <div className="h-[calc(100%-60px)] overflow-y-auto p-4 space-y-3">
          {exercises.map((ex, idx) => (
            <div
              key={idx}
              onClick={() => handleLoadExercise(ex)}
              className="group bg-gray-700 rounded-lg p-3 cursor-pointer transform transition-all hover:scale-[101%] active:scale-95"
            >
              {ex.image && (
                <img
                  src={ex.image}
                  alt="exercise"
                  className="w-full h-32 object-contain mb-2 rounded-lg opacity-90 group-hover:opacity-100"
                />
              )}
              <p className="text-white font-medium truncate">{ex.problem}</p>
              <p className="text-gray-400 text-sm truncate">{ex.solution}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-purple-300">Model: {ex.model}</span>
                <span className="text-xs text-gray-500">
                  {new Date(ex.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hidden canvas for camera snapshot */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
