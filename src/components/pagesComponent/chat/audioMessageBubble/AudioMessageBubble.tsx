import React, { useState, useRef } from "react";
import { FaPlay, FaPause, FaMicrophone } from "react-icons/fa";

interface AudioMessageBubbleProps {
  mediaUrl: string;
  durationSeconds?: number | null;
  isSender?: boolean;
}

const AudioMessageBubble: React.FC<AudioMessageBubbleProps> = ({
  mediaUrl,
  durationSeconds,
  isSender = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number>(durationSeconds || 0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isRecoveringDurationRef = useRef(false);
  const hasRecoveredDurationRef = useRef(false);

  // Generate 22 deterministic waveform bar heights for WhatsApp-like aesthetic
  const waveformPattern = [
    30, 50, 80, 40, 60, 100, 70, 40, 90, 60, 30, 80, 50, 70, 90, 40, 60, 80, 50,
    30, 70, 40,
  ];

  const progressFraction = duration > 0 ? currentTime / duration : 0;

  const togglePlay = () => {
    if (!mediaUrl || mediaUrl === "null" || !mediaUrl.trim()) {
      console.warn("Audio URL is invalid or empty");
      return;
    }
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.playbackRate = playbackRate;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.error("❌ Audio playback failed:", err);
            setIsPlaying(false);
          });
      }
    }
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = fraction * duration;
    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const toggleSpeed = () => {
    const speeds = [1.0, 1.5, 2.0];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const formatTime = (secs: number) => {
    if (!isFinite(secs) || isNaN(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const getMimeType = (url: string) => {
    if (!url) return "audio/webm";
    const lower = url.toLowerCase();
    if (lower.includes(".webm")) return "audio/webm";
    if (lower.includes(".mp3")) return "audio/mpeg";
    if (lower.includes(".ogg")) return "audio/ogg";
    if (lower.includes(".wav")) return "audio/wav";
    if (lower.includes(".m4a") || lower.includes(".mp4")) return "audio/mp4";
    return "audio/webm";
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-2xl max-w-70 sm:max-w-85 my-1 shadow-sm relative transition-all ${
        isSender
          ? "bg-primaryColorDark text-white ml-auto rounded-tr-none"
          : "bg-white text-gray-900 border border-gray-200 rounded-tl-none"
      }`}
    >
      <audio
        ref={audioRef}
        preload="auto"
        onLoadedMetadata={() => {
          const audio = audioRef.current;
          if (!audio) return;

          if (isFinite(audio.duration)) {
            setDuration(Math.round(audio.duration));
            return;
          }

          // Chrome/MediaRecorder WebM blobs often report duration as
          // Infinity until the browser is forced to seek through the file.
          // We only do this once per element: the forced seek-to-end leaves
          // the element's seekable range in a state where it won't reliably
          // play from the start again, so we reload it fresh afterwards.
          if (hasRecoveredDurationRef.current) return;

          isRecoveringDurationRef.current = true;
          const recoverDuration = () => {
            audio.removeEventListener("timeupdate", recoverDuration);
            if (isFinite(audio.duration)) {
              setDuration(Math.round(audio.duration));
            }
            isRecoveringDurationRef.current = false;
            hasRecoveredDurationRef.current = true;
            audio.load();
          };
          audio.addEventListener("timeupdate", recoverDuration);
          audio.currentTime = Number.MAX_SAFE_INTEGER;
        }}
        onTimeUpdate={() => {
          if (
            audioRef.current &&
            !isRecoveringDurationRef.current &&
            isFinite(audioRef.current.currentTime)
          ) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
          }
        }}
        onError={(e) => {
          console.log("Here is the error : ", e);
          const audio = audioRef.current;

          if (audio?.error) {
            console.error("Audio playback error:", {
              code: audio.error.code,
              message: audio.error.message,
              src: audio.currentSrc || mediaUrl,
            });
          }

          setIsPlaying(false);
        }}
      >
        <source src={mediaUrl} type={getMimeType(mediaUrl)} />
      </audio>

      {/* WhatsApp Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-95 cursor-pointer ${
          isSender
            ? "bg-white text-primaryColorDark hover:bg-gray-100"
            : "bg-primaryColorDark text-white hover:bg-primaryColor"
        }`}
      >
        {isPlaying ? (
          <FaPause className="text-sm" />
        ) : (
          <FaPlay className="text-sm ml-0.5" />
        )}
      </button>

      {/* Waveform & Duration Column */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-10">
        {/* Interactive WhatsApp Waveform */}
        <div
          onClick={handleWaveformClick}
          className="flex items-center gap-0.75 h-6 cursor-pointer group py-1"
          title="Click to seek"
        >
          {waveformPattern.map((h, i) => {
            const barFraction = i / waveformPattern.length;
            const isPlayed = barFraction <= progressFraction;

            return (
              <span
                key={i}
                className={`w-0.75 rounded-full transition-colors duration-150 ${
                  isPlayed
                    ? isSender
                      ? "bg-white"
                      : "bg-primaryColorDark"
                    : isSender
                      ? "bg-white/40"
                      : "bg-gray-300"
                }`}
                style={{ height: `${h}%` }}
              />
            );
          })}
        </div>

        {/* Timestamp & Mic Icon Footer */}
        <div className="flex items-center justify-between text-[11px] font-mono opacity-85 leading-none">
          <div className="flex items-center gap-1">
            <FaMicrophone
              className={`text-[10px] ${isSender ? "text-emerald-300" : "text-emerald-600"}`}
            />
            <span>
              {isPlaying ? formatTime(currentTime) : formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Speed Multiplier Button */}
      <button
        type="button"
        onClick={toggleSpeed}
        className={`text-[10px] font-bold px-2 py-1 rounded-full transition-all shrink-0 self-center cursor-pointer ${
          isSender
            ? "bg-white/20 text-white hover:bg-white/30"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
        title="Playback Speed"
      >
        {playbackRate.toFixed(1)}x
      </button>
    </div>
  );
};

export default AudioMessageBubble;
