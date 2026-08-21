import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Loader2, XCircle, X } from "lucide-react";

import { getApiBaseUrl } from "@/apiServices/config/api";
import { CallRoomLobby } from "@/pages/providerPages/callRoom/components/CallRoomLobby";
import { CallRoomEnded } from "@/pages/providerPages/callRoom/components/CallRoomEnded";
import { CallRoomVideoGrid } from "@/pages/providerPages/callRoom/components/CallRoomVideoGrid";
import { CallRoomControls } from "@/pages/providerPages/callRoom/components/CallRoomControls";

export interface CallInfo {
  appointmentId: string;
  role: "guest" | "provider";
  providerName: string;
  guestName: string;
  startTime: string;
  endTime: string;
  canJoinNow: boolean;
}

export type CallStage =
  | "idle"
  | "connecting"
  | "waiting-for-approval"
  | "waiting-for-peer"
  | "connected"
  | "ended"
  | "error"
  | "ringing"
  | "calling"
  | "";

export interface PendingGuest {
  socketId: string;
  guestName: string;
}

export interface ActiveCallState {
  isOpen: boolean;
  appointmentId: string;
  token: string;
  audioOnly?: boolean;
}

interface CallRoomModalProps {
  activeCall: ActiveCallState | null;
  onClose: () => void;
}

class OutgoingRingtone {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private intervalId: any = null;

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    try {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.playRing();
      this.intervalId = setInterval(() => this.playRing(), 4000);
    } catch {
      // AudioContext error catch
    }
  }

  private playRing() {
    if (!this.ctx || !this.isPlaying) return;
    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.frequency.value = 440;
      osc2.frequency.value = 480;

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.8);
      osc2.stop(now + 1.8);
    } catch {
      // Ignore oscillator playback issues
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}

export const CallRoomModal: React.FC<CallRoomModalProps> = ({
  activeCall,
  onClose,
}) => {
  const appointmentId = activeCall?.appointmentId ?? "";
  const token = activeCall?.token ?? "";
  const audioOnly = activeCall?.audioOnly ?? false;

  const [callInfo, setCallInfo] = useState<CallInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [stage, setStage] = useState<CallStage>("idle");
  const [stageMessage, setStageMessage] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(audioOnly);
  const [pendingGuest, setPendingGuest] = useState<PendingGuest | null>(null);
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const ringtoneRef = useRef<OutgoingRingtone | null>(null);

  const backendUrl = getApiBaseUrl();
  const socketOrigin = backendUrl.split("/api")[0];

  // Outgoing ringing audio effect
  useEffect(() => {
    if (stage === "ringing") {
      if (!ringtoneRef.current) {
        ringtoneRef.current = new OutgoingRingtone();
      }
      ringtoneRef.current.start();
    } else {
      ringtoneRef.current?.stop();
      ringtoneRef.current = null;
    }
    return () => {
      ringtoneRef.current?.stop();
      ringtoneRef.current = null;
    };
  }, [stage]);

  // Call duration counter
  useEffect(() => {
    let timerId: any = null;
    if (stage === "connected") {
      timerId = setInterval(() => {
        setCallDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDurationSeconds(0);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [stage]);

  // 30-second Ringing/Connecting Timeout (Missed Call detection)
  useEffect(() => {
    let timeoutId: any = null;
    if (stage === "ringing" || stage === "connecting") {
      timeoutId = setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.emit("call_missed", { appointmentId });
        }
        cleanupCall("ended", "No answer. Call missed.");
      }, 30000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [stage, appointmentId]);

  // Reset all call state whenever a new call session is opened. Required
  // because this modal stays mounted between calls (it toggles via
  // activeCall instead of unmounting), so stale state from a previous call
  // (e.g. stage "ended") would otherwise leak into the next one.
  useEffect(() => {
    if (!activeCall?.isOpen) return;

    setCallInfo(null);
    setIsLoading(true);
    setLoadError(null);
    setStage("idle");
    setStageMessage(null);
    setIsJoining(false);
    setIsMuted(false);
    setIsCameraOff(audioOnly);
    setPendingGuest(null);
    setCallDurationSeconds(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCall?.appointmentId, activeCall?.isOpen]);

  // Load call details and verify token
  useEffect(() => {
    if (!activeCall?.isOpen) return;

    async function loadCallInfo() {
      if (!backendUrl || !token) {
        setLoadError("This call link is invalid or has expired.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${backendUrl}/appointments/public/call/${token}`,
        );
        const json = await response.json().catch(() => null);

        if (!response.ok) {
          setLoadError(
            json?.message || "This call link is invalid or has expired.",
          );
          return;
        }

        const info = json?.data ?? null;
        setCallInfo(info);

        // Auto-join immediately for seamless direct calling
        if (info) {
          setTimeout(() => {
            handleJoinCall();
          }, 150);
        }
      } catch {
        setLoadError("Something went wrong. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    loadCallInfo();
  }, [token, backendUrl, activeCall?.isOpen]);

  function cleanupCall(finalStage: CallStage, message?: string) {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;

    if (socketRef.current) {
      socketRef.current.emit("leave_call", {
        appointmentId,
        durationSeconds: callDurationSeconds,
      });
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setStage(finalStage);
    if (message) setStageMessage(message);
    setIsJoining(false);
  }

  async function createPeerConnection(iceServers: RTCIceServer[]) {
    const pc = new RTCPeerConnection({ iceServers });

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("ice_candidate", {
          appointmentId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    if (localStreamRef.current) {
      for (const track of localStreamRef.current.getTracks()) {
        pc.addTrack(track, localStreamRef.current);
      }
    }

    peerConnectionRef.current = pc;
    return pc;
  }

  async function handleJoinCall() {
    if (!token || !appointmentId) return;

    setIsJoining(true);
    setStage("connecting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: !audioOnly,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      if (audioOnly) {
        stream.getVideoTracks().forEach((t) => (t.enabled = false));
      }

      const socket = io(socketOrigin, {
        transports: ["websocket", "polling"],
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        socket.emit("join_call", { appointmentId, token });
      });

      socket.on("waiting_for_approval", () => {
        setStage("waiting-for-approval");
        setIsJoining(false);
      });

      socket.on("guest_waiting_approval", (payload: PendingGuest) => {
        setPendingGuest(payload);
      });

      // The provider's peer connection (already created via call_authorized)
      // initiates the WebRTC offer once notified via peer_joined below, so
      // the admitted guest only needs to clear its own waiting-room UI here.
      socket.on("call_admitted", () => {
        setPendingGuest(null);
        setStage("connecting");
      });

      socket.on("call_denied", ({ message }: { message?: string } = {}) => {
        cleanupCall(
          "ended",
          message || "The provider denied entry to this call.",
        );
      });

      const handleCallAuthorized = ({
        iceServers,
      }: {
        iceServers: RTCIceServer[];
      }) => {
        createPeerConnection(iceServers);
        setStage("calling");
        setIsJoining(false);
      };

      socket.on("call_authorized", handleCallAuthorized);
      socket.on("call_joined", handleCallAuthorized);

      socket.on("target_ringing", () => {
        console.log("🔔 Target device is ringing!");
        setStage("ringing");
      });

      socket.on("peer_joined", async () => {
        console.log("👋 Peer joined the call room, creating WebRTC offer...");
        setStage("connecting");
        const pc = peerConnectionRef.current;
        if (pc) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("webrtc_offer", { appointmentId, sdp: offer });
        }
      });

      socket.on(
        "webrtc_offer",
        async ({ sdp }: { sdp: RTCSessionDescriptionInit }) => {
          setStage("connected");
          const pc = peerConnectionRef.current;
          if (!pc) return;

          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.emit("webrtc_answer", { appointmentId, sdp: answer });
        },
      );

      socket.on(
        "webrtc_answer",
        async ({ sdp }: { sdp: RTCSessionDescriptionInit }) => {
          setStage("connected");
          const pc = peerConnectionRef.current;
          if (!pc) return;

          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        },
      );

      socket.on(
        "ice_candidate",
        async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
          const pc = peerConnectionRef.current;
          if (!pc) return;

          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch {
            // ignore candidate error
          }
        },
      );

      socket.on("peer_left", () => {
        setStage("waiting-for-peer");
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
      });

      socket.on("call_ended", ({ reason }: { reason?: string }) => {
        const message =
          reason === "ended_by_peer"
            ? "The other participant ended the call."
            : "Call has ended.";
        cleanupCall("ended", message);
      });

      socket.on("call_expired", () => {
        cleanupCall("ended", "This call session has expired.");
      });

      socket.on("call_error", ({ message }: { message?: string }) => {
        cleanupCall("error", message || "Failed to connect to the call.");
      });
    } catch {
      cleanupCall(
        "error",
        "Could not access your camera or microphone. Please check browser permissions.",
      );
    }
  }

  function handleToggleMute() {
    if (!localStreamRef.current) return;
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  }

  function handleToggleCamera() {
    if (!localStreamRef.current) return;
    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOff(!videoTrack.enabled);
    }
  }

  function handleLeaveCall() {
    cleanupCall("ended", "You left the call.");
    onClose();
  }

  function handleApproveGuest(socketId: string, approved: boolean) {
    setPendingGuest(null);
    if (approved) {
      socketRef.current?.emit("admit_guest", {
        appointmentId,
        guestSocketId: socketId,
      });
    } else {
      socketRef.current?.emit("deny_guest", {
        appointmentId,
        guestSocketId: socketId,
      });
    }
  }

  const participantName = React.useMemo(() => {
    if (!callInfo) return "Participant";
    if (callInfo.role === "guest") return callInfo.providerName || "Provider";
    return callInfo.guestName || "Guest";
  }, [callInfo]);

  if (!activeCall || !activeCall.isOpen) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-4xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        {/* Modal Header */}
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${stage === "connected" ? "bg-emerald-400" : "bg-amber-400"} opacity-75`}
              />
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${stage === "connected" ? "bg-emerald-500" : "bg-amber-500"}`}
              />
            </span>
            <h3 className="text-base font-bold text-textColor dark:text-white">
              {audioOnly ? "Voice Call Session" : "Video Call Session"}{" "}
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 ml-1">
                (
                {stage === "connected"
                  ? "Connected"
                  : stage === "ringing"
                    ? "Ringing..."
                    : "Calling..."}
                )
              </span>
            </h3>
          </div>
          <button
            type="button"
            onClick={handleLeaveCall}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            title="Close Call Window"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Loader2 size={32} className="animate-spin text-primaryColorDark" />
            <p className="mt-3 text-sm">Loading call session...</p>
          </div>
        ) : loadError ? (
          <div className="py-12 text-center">
            <XCircle size={40} className="mx-auto text-rose-500" />
            <h3 className="mt-3 text-lg font-bold text-textColor dark:text-white">
              Call Error
            </h3>
            <p className="mt-1 text-sm text-textGreyColor">{loadError}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 rounded-full bg-primaryColorDark px-5 py-2 text-xs font-semibold text-white shadow-xs cursor-pointer"
            >
              Close Window
            </button>
          </div>
        ) : stage === "idle" ? (
          <CallRoomLobby
            callInfo={callInfo}
            audioOnlyParam={audioOnly}
            isJoining={isJoining}
            onJoinCall={handleJoinCall}
          />
        ) : stage === "ended" || stage === "error" ? (
          <CallRoomEnded stageMessage={stageMessage} onReturn={onClose} />
        ) : (
          <div>
            <CallRoomVideoGrid
              remoteVideoRef={remoteVideoRef}
              localVideoRef={localVideoRef}
              isCameraOff={isCameraOff}
              participantName={participantName}
              stage={stage}
              audioOnly={audioOnly}
              callDurationSeconds={callDurationSeconds}
              pendingGuest={pendingGuest}
              onApproveGuest={handleApproveGuest}
            />

            <CallRoomControls
              isMuted={isMuted}
              isCameraOff={isCameraOff}
              onToggleMute={handleToggleMute}
              onToggleCamera={handleToggleCamera}
              onLeaveCall={handleLeaveCall}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CallRoomModal;
