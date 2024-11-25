import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaFileUpload, FaMicrophone, FaUpload } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BsFillMicMuteFill, BsMicFill, BsMicMuteFill } from "react-icons/bs";
const TranscriptionUpload = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [transcription, setTranscription] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTranscription, setShowTranscription] = useState(true);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [previousTranscriptions, setPreviousTranscriptions] = useState([]);
  const [showPrevious, setShowPrevious] = useState(false);

  useEffect(() => {
    const fetchTranscriptions = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/UploadTranscribe/");
        setPreviousTranscriptions(response.data);
      } catch (err) {
        toast.error("Error fetching previous transcriptions.");
      }
    };

    fetchTranscriptions();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setError("No file selected.");
      setAudioFile(null);
      return;
    }
    if (!file.type.startsWith("audio/")) {
      setError("Please upload a valid audio file.");
      setAudioFile(null);
      return;
    }

    setAudioFile(file);
    setError(null);
    toast.info("Audio file selected! Uploading...");

    // Immediately upload the file
    await handleUpload(file);
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("audio_file", file);

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("http://127.0.0.1:8000/UploadTranscribe/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        },
      });

      setAudioFile(null);
      setIsFileUploaded(true);
      toast.success("File uploaded successfully! Transcription is starting...");
      setTranscription(response.data.transcript);

      // Fetch the latest transcriptions after upload
      const updatedTranscriptions = await axios.get("http://127.0.0.1:8000/UploadTranscribe/");
      setPreviousTranscriptions(updatedTranscriptions.data);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        "An error occurred while uploading the file. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTranscription = () => {
    setShowTranscription(false);
  };

  const handleTogglePreviousTranscriptions = () => {
    setShowPrevious((prev) => !prev);
  };

  return (
    <div className="mx-auto p-4 sm:p-6 h-[600px] overflow-auto max-w-7xl bg-gradient-to-br from-black via-gray-800 to-gray-900 rounded-lg shadow-xl border border-gray-700">
      <h1 className="text-2xl animate-pulse sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-purple-500 to-pink-500 mb-8 text-center">
        Upload-to-Text Conversion
      </h1>
      <div className="mb-4 w-full sm:w-auto flex justify-center sm:justify-center">
        <label
          htmlFor="audio-file"
          className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-full shadow-lg transform hover:scale-105 hover:shadow-xl transition active:scale-95 focus:ring-4 focus:ring-purple-300 flex items-center justify-center"
        >
          <FaFileUpload className="text-2xl sm:text-3xl" />
        </label>
        <input
          id="audio-file"
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      <div className="p-4 sm:p-6 border border-gray-700 rounded-lg shadow-lg bg-gradient-to-br from-gray-800 to-black">
        {error ? (
          <p className="text-pink-400 font-semibold text-center">{`Error: ${error}`}</p>
        ) : (
          <p className="text-gray-200 text-base sm:text-lg text-center">
            {transcription || "Upload audio and get text in no time!"}
          </p>
        )}
      </div>

      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

      <div className="mt-1">
        <div className="w-full text-center">
          <button
            onClick={handleTogglePreviousTranscriptions}
            className="py-2 px-2 mt-5 bg-purple-500 text-white rounded shadow hover:bg-purple-600 transition"
          >
            {showPrevious ? "Hide Previous Transcriptions" : "Show Previous Transcriptions"}
          </button>
        </div>

        {showPrevious && (
          <div className="mt-4 max-h-60 sm:max-h-80 overflow-auto bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 shadow-inner">
            {previousTranscriptions.length > 0 ? (
              <ul className="space-y-2">
                {previousTranscriptions.map((transcription) => (
                  <li
                    key={transcription.id}
                    className="bg-gray-700 text-gray-300 p-3 rounded-lg shadow-sm hover:text-pink-400 cursor-pointer"
                  >
                    <p className="text-sm sm:text-base">{transcription.transcript}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-center">No previous transcriptions available.</p>
            )}
          </div>
        )}
      </div>

      <ToastContainer />
    </div>
  );
};

export default TranscriptionUpload;
