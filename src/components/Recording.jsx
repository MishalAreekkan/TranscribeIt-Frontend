import React, { useState, useEffect } from "react";
import axios from "axios";
import { BsMicFill } from "react-icons/bs";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Ensure you import the necessary CSS

const Recording = () => {
  const [transcription, setTranscription] = useState("");
  const [savedTranscriptions, setSavedTranscriptions] = useState([]);
  const [error, setError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [socket, setSocket] = useState(null);
  const [showSaved, setShowSaved] = useState(false); // Toggle for saved transcriptions

  // Start recording and transcription
  const startTranscription = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
        const DG_KEY = "deb4972d01a1d7f69f57558cdcad0e0ca5767ae8";
        const newSocket = new WebSocket("wss://api.deepgram.com/v1/listen", ["token", DG_KEY]);

        newSocket.onopen = () => {
          recorder.addEventListener("dataavailable", (event) => {
            if (newSocket.readyState === WebSocket.OPEN) {
              newSocket.send(event.data);
            }
          });
          recorder.start(250);
        };

        newSocket.onmessage = (message) => {
          const received = JSON.parse(message.data);
          const transcript = received.channel.alternatives[0]?.transcript;
          if (transcript) {
            setTranscription((prev) => prev + " " + transcript);
          }
        };

        newSocket.onerror = (event) => {
          console.error("WebSocket error:", event);
          setError("Error connecting to transcription service.");
          toast.error("Error connecting to transcription service.");
        };

        newSocket.onclose = () => {
          if (recorder.state !== "inactive") {
            recorder.stop();
          }
          stream.getTracks().forEach((track) => track.stop());
          setIsRecording(false);
          toast.success("Recording stopped!");
        };

        setMediaRecorder(recorder);
        setSocket(newSocket);
        setIsRecording(true);
        toast.success("Recording started!");
      })
      .catch((err) => {
        console.error("Microphone access error:", err);
        setError("Failed to access microphone: " + err.message);
        toast.error("Failed to access microphone.");
      });
  };

  // Stop recording and save transcription
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
    if (socket) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    }
  
    if (transcription.trim()) {
      axios
        .post("http://127.0.0.1:8000/TextTranscript/", {
          text: transcription,
        })
        .then((res) => {
          console.log("Transcription saved:", res.data);
          toast.success("Transcription saved!");
  
          // Immediately add the new transcription to the saved list
          setSavedTranscriptions((prevTranscriptions) => [
            res.data, // Assuming the response contains the saved transcription data
            ...prevTranscriptions,
          ]);
        })
        .catch((err) => {
          console.error("Error saving transcription:", err);
          setError("Error saving transcription: " + err.message);
          toast.error("Error saving transcription.");
        });
    }
  
    setIsRecording(false);
    setTranscription("");
  };

  // Fetch saved transcriptions on component mount
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/TextTranscript/")
      .then((res) => {
        setSavedTranscriptions(res.data);
      })
      .catch((err) => {
        console.error("Error fetching transcriptions:", err);
        setError("Error fetching transcriptions: " + err.message);
        toast.error("Error fetching transcriptions.");
      });
  }, []);

  return (
    <div className="mx-auto p-4 sm:p-6 h-[600px] overflow-auto max-w-7xl bg-gradient-to-br from-black via-gray-800 to-gray-900 rounded-lg shadow-xl border border-gray-700">
      <h1 className="text-2xl animate-pulse sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-purple-500 to-pink-500 mb-6 text-center">
        Voice-to-Text Conversion
      </h1>

      <div className="flex justify-center mb-6">
        {!isRecording ? (
          <button
            onClick={startTranscription}
            className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-full shadow-lg transform hover:scale-105 hover:shadow-xl transition active:scale-95 focus:ring-4 focus:ring-purple-300 flex items-center justify-center"
          >
            <span className="text-xl sm:text-2xl font-bold">
              <BsMicFill />
            </span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-lg transform hover:scale-105 hover:shadow-xl transition active:scale-95 focus:ring-4 focus:ring-red-300 flex items-center justify-center"
          >
            <div className="flex space-x-1">
              <div className="w-2 h-4 sm:h-6 bg-red-600 rounded animate-wave"></div>
              <div className="w-2 h-6 sm:h-8 bg-red-500 rounded animate-wave animation-delay-200"></div>
              <div className="w-2 h-3 sm:h-4 bg-red-600 rounded animate-wave animation-delay-400"></div>
              <div className="w-2 h-5 sm:h-7 bg-red-500 rounded animate-wave animation-delay-600"></div>
            </div>
          </button>
        )}
      </div>

      <div className="p-4 sm:p-6 border border-gray-700 rounded-lg shadow-lg bg-gradient-to-br from-gray-800 to-black">
        {error ? (
          <p className="text-pink-400 font-semibold text-center">{`Error: ${error}`}</p>
        ) : (
          <p className="text-gray-200 text-base sm:text-lg text-center">
            {transcription || "Convert your voice to text in no time!"}
          </p>
        )}
      </div>

      <div className="text-center">
        <button
          onClick={() => setShowSaved(!showSaved)}
          className="py-2 px-2 mt-5 bg-purple-500 text-white rounded shadow hover:bg-purple-600 transition"
        >
          {showSaved ? "Hide Previous Transcriptions" : "Show Previous Transcriptions"}
        </button>
      </div>

      {showSaved && (
          <div className="mt-4 max-h-60 sm:max-h-80 overflow-auto bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 shadow-inner">
              <ul className="space-y-2">
              {savedTranscriptions.map((item, index) => (
              <li
                key={index}
                className="bg-gray-700 text-gray-300 p-3 rounded-lg shadow-sm hover:text-pink-400 cursor-pointer"

                onClick={() => console.log(item.text)}
              >
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Add the following CSS for the animation
const style = `
  @keyframes wave {
    0%, 100% {
      transform: scaleY(1);
    }
    50% {
      transform: scaleY(1.5);
    }
  }

  .animate-wave {
    animation: wave 1s ease-in-out infinite;
  }

  .animation-delay-200 {
    animation-delay: 0.2s;
  }

  .animation-delay-400 {
    animation-delay: 0.4s;
  }

  .animation-delay-600 {
    animation-delay: 0.6s;
  }
`;

document.head.insertAdjacentHTML("beforeend", `<style>${style}</style>`);

export default Recording;
