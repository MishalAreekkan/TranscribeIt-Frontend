import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import TranscriptionUpload from "./TranscriptionUpload";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";

// Mock axios
jest.mock("axios");

describe("TranscriptionUpload", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render component correctly", () => {
    render(
      <>
        <TranscriptionUpload />
        <ToastContainer />
      </>
    );
    
    expect(screen.getByText("Upload-to-Text Conversion")).toBeInTheDocument();
    expect(screen.getByText("Upload audio and get text in no time!")).toBeInTheDocument();
    expect(screen.getByLabelText(/Upload audio file/)).toBeInTheDocument();
  });

  test("should show error message when invalid file is uploaded", async () => {
    const file = new File(["test"], "test.txt", { type: "text/plain" });
    
    render(
      <>
        <TranscriptionUpload />
        <ToastContainer />
      </>
    );
    
    const fileInput = screen.getByLabelText("Upload audio file");
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText("Please upload a valid audio file.")).toBeInTheDocument();
    });
  });

  test("should upload valid file and show transcription", async () => {
    const file = new File(["test"], "test.mp3", { type: "audio/mp3" });
    const mockTranscription = { transcript: "This is a mock transcription" };

    axios.post.mockResolvedValueOnce({ data: mockTranscription });
    axios.get.mockResolvedValueOnce({ data: [{ transcript: "Previous transcription" }] });

    render(
      <>
        <TranscriptionUpload />
        <ToastContainer />
      </>
    );
    
    const fileInput = screen.getByLabelText("Upload audio file");
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText("This is a mock transcription")).toBeInTheDocument();
    });
  });

  test("should show error toast on upload failure", async () => {
    const file = new File(["test"], "test.mp3", { type: "audio/mp3" });

    axios.post.mockRejectedValueOnce({ response: { data: { error: "Upload failed" } } });
    
    render(
      <>
        <TranscriptionUpload />
        <ToastContainer />
      </>
    );
    
    const fileInput = screen.getByLabelText("Upload audio file");
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Upload failed");
    });
  });

  test("should toggle previous transcriptions", async () => {
    const mockTranscriptions = [{ id: 1, transcript: "Previous transcription" }];
    axios.get.mockResolvedValueOnce({ data: mockTranscriptions });

    render(
      <>
        <TranscriptionUpload />
        <ToastContainer />
      </>
    );

    // Show previous transcriptions
    fireEvent.click(screen.getByText("Show Previous Transcriptions"));

    await waitFor(() => {
      expect(screen.getByText("Previous transcription")).toBeInTheDocument();
    });

    // Hide previous transcriptions
    fireEvent.click(screen.getByText("Hide Previous Transcriptions"));

    await waitFor(() => {
      expect(screen.queryByText("Previous transcription")).not.toBeInTheDocument();
    });
  });

  test("should render toast container", () => {
    render(
      <>
        <TranscriptionUpload />
        <ToastContainer />
      </>
    );
    
    const toastContainer = screen.getByTestId("toast-container");
    expect(toastContainer).toBeInTheDocument();
  });
});
