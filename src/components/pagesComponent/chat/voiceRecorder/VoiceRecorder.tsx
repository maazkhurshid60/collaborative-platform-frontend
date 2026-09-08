import React, { useState, useRef, useEffect } from "react";
import {
  FaTrash,
  FaPause,
  FaPlay,
  FaPaperPlane,
  FaStop,
  FaMicrophone,
} from "react-icons/fa";
import { toast } from "react-toastify";
import fixWebmDuration from "fix-webm-duration";

interface VoiceRecorderProps {
  onSendVoice: (audioFile: File, durationSeconds: number) => void;
  onCancel?: () => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onSendVoice,
  onCancel,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const hasStartedRef = useRef(false);

  // Wall-clock tracking used to patch the correct Duration into the
  // recorded WebM blob — MediaRecorder never writes it itself, which
  // otherwise leaves playback duration/pacing broken in the browser.
  const elapsedMsRef = useRef(0);
  const segmentStartRef = useRef<number | null>(null);

  const getElapsedMs = () => {
    const running =
      segmentStartRef.current !== null
        ? Date.now() - segmentStartRef.current
        : 0;
    return elapsedMsRef.current + running;
  };

  // MediaRecorder never writes a Duration element into WebM output, which
  // leaves the browser guessing at playback pacing/duration later. Patch it
  // in with the actual wall-clock recording time before the blob is used.
  const patchDuration = async (blob: Blob, mimeType: string) => {
    if (!mimeType.includes("webm")) return blob;
    try {
      return await fixWebmDuration(blob, getElapsedMs());
    } catch (err) {
      console.error("Failed to patch WebM duration:", err);
      return blob;
    }
  };

  // Auto-start recording on mount like WhatsApp.
  // Guarded with hasStartedRef + real teardown below because React's Strict
  // Mode double-invokes this effect in development: without a guard and a
  // stream/recorder teardown, the first MediaRecorder instance was left
  // running (orphaned) and kept pushing chunks into the same audioChunksRef
  // array as the second one, corrupting the recorded WebM byte stream.
  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    startRecording();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      const options = MediaRecorder.isTypeSupported("audio/webm")
        ? { mimeType: "audio/webm" }
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? { mimeType: "audio/mp4" }
          : MediaRecorder.isTypeSupported("audio/ogg")
            ? { mimeType: "audio/ogg" }
            : undefined;

      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder.mimeType || "audio/webm";
        const rawBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const blob = await patchDuration(rawBlob, mimeType);
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      elapsedMsRef.current = 0;
      segmentStartRef.current = Date.now();

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      toast.error("Microphone access is required to record voice notes.");
      if (onCancel) onCancel();
    }
  };

  const togglePauseResume = () => {
    if (!mediaRecorderRef.current) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      segmentStartRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (segmentStartRef.current !== null) {
        elapsedMsRef.current += Date.now() - segmentStartRef.current;
        segmentStartRef.current = null;
      }
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleCancel = () => {
    if (isRecording) {
      stopRecording();
    }
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecordingTime(0);
    if (onCancel) onCancel();
  };

  const togglePreviewPlay = () => {
    if (!previewAudioRef.current && audioUrl) {
      previewAudioRef.current = new Audio(audioUrl);
      previewAudioRef.current.onended = () => setIsPreviewPlaying(false);
    }

    if (previewAudioRef.current) {
      if (isPreviewPlaying) {
        previewAudioRef.current.pause();
        setIsPreviewPlaying(false);
      } else {
        previewAudioRef.current.play();
        setIsPreviewPlaying(true);
      }
    }
  };

  const getFileExtension = (mimeType: string) => {
    if (mimeType.includes("ogg")) return "ogg";
    if (mimeType.includes("mp4")) return "m4a";
    return "webm";
  };

  const handleSend = () => {
    if (isRecording && mediaRecorderRef.current) {
      // Stop & send directly
      mediaRecorderRef.current.onstop = async () => {
        const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
        const rawBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const blob = await patchDuration(rawBlob, mimeType);
        const fileExtension = getFileExtension(mimeType);
        const audioFile = new File(
          [blob],
          `voice_note_${Date.now()}.${fileExtension}`,
          {
            type: mimeType,
          },
        );
        onSendVoice(audioFile, recordingTime || 1);
        handleCancel();
      };
      mediaRecorderRef.current.stop();
    } else if (audioBlob) {
      const fileExtension = getFileExtension(audioBlob.type);
      const audioFile = new File(
        [audioBlob],
        `voice_note_${Date.now()}.${fileExtension}`,
        {
          type: audioBlob.type,
        },
      );
      onSendVoice(audioFile, recordingTime || 1);
      handleCancel();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 16 animated waveform bars
  const waveformHeights = [
    40, 70, 30, 90, 50, 80, 40, 100, 60, 85, 35, 75, 45, 95, 55, 65,
  ];

  return (
    <div className="flex items-center justify-between w-full bg-gray-100 px-4 py-2 rounded-full border border-gray-200 shadow-inner animate-fadeIn">
      {/* Left Action: Trash / Cancel */}
      <button
        type="button"
        onClick={handleCancel}
        className="p-2.5 text-gray-500 hover:text-red-500 transition-colors rounded-full hover:bg-gray-200 shrink-0"
        title="Cancel"
      >
        <FaTrash className="text-base" />
      </button>

      {/* Center: WhatsApp Recording Status / Preview Bar */}
      {isRecording ? (
        <div className="flex items-center gap-4 flex-1 justify-center px-4">
          {/* Live Recording Timer */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="relative flex h-3 w-3">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 ${isPaused ? "hidden" : ""}`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${isPaused ? "bg-amber-500" : "bg-red-500"}`}
              ></span>
            </span>
            <span className="text-sm font-mono font-bold text-gray-800">
              {formatTime(recordingTime)}
            </span>
          </div>

          {/* Animated Waveform Visualizer */}
          <div className="flex items-center gap-1 h-6 px-2 overflow-hidden max-w-45 sm:max-w-60 flex-1 justify-center">
            {waveformHeights.map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-300 ${
                  isPaused
                    ? "bg-gray-400 h-2"
                    : "bg-primaryColorDark"
                }`}
                style={{
                  height: isPaused
                    ? "8px"
                    : `${Math.max(15, (h * (Math.sin(recordingTime + i) + 1.2)) / 2)}%`,
                }}
              />
            ))}
          </div>

          {/* Pause / Resume Controls */}
          <button
            type="button"
            onClick={togglePauseResume}
            className="p-2 text-gray-600 hover:text-primaryColorDark transition-colors shrink-0"
            title={isPaused ? "Resume Recording" : "Pause Recording"}
          >
            {isPaused ? (
              <FaMicrophone className="text-base text-red-500 animate-pulse" />
            ) : (
              <FaPause className="text-sm" />
            )}
          </button>

          <button
            type="button"
            onClick={stopRecording}
            className="p-2 text-gray-600 hover:text-primaryColorDark transition-colors shrink-0"
            title="Stop & Preview"
          >
            <FaStop className="text-sm" />
          </button>
        </div>
      ) : (
        /* Preview State */
        <div className="flex items-center gap-3 flex-1 justify-center px-4">
          <button
            type="button"
            onClick={togglePreviewPlay}
            className="p-2 bg-primaryColorDark text-white rounded-full hover:bg-primaryColor transition-transform active:scale-95 shrink-0"
          >
            {isPreviewPlaying ? (
              <FaPause className="text-xs" />
            ) : (
              <FaPlay className="text-xs ml-0.5" />
            )}
          </button>

          <div className="flex-1 bg-gray-300 h-1.5 rounded-full overflow-hidden max-w-50">
            <div
              className={`h-full bg-primaryColorDark ${isPreviewPlaying ? "animate-pulse w-full" : "w-0"}`}
            />
          </div>

          <span className="text-xs font-mono font-semibold text-gray-700 shrink-0">
            {formatTime(recordingTime)}
          </span>
        </div>
      )}

      {/* Right Action: WhatsApp Send Button */}
      <button
        type="button"
        onClick={handleSend}
        className="w-10 h-10 bg-primaryColorDark hover:bg-primaryColor text-white rounded-full flex items-center justify-center shadow-md transition-transform active:scale-95 shrink-0 ml-2"
        title="Send Voice Note"
      >
        <FaPaperPlane className="text-sm ml-0.5" />
      </button>
    </div>
  );
};

export default VoiceRecorder;
