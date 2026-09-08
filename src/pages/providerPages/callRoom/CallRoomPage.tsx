import React, { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { Loader2, XCircle } from "lucide-react";
import { toast } from "react-toastify";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getApiBaseUrl } from "@/apiServices/config/api";
import { CallRoomLobby } from "./components/CallRoomLobby";
import { CallRoomEnded } from "./components/CallRoomEnded";
import { CallRoomVideoGrid } from "./components/CallRoomVideoGrid";
import { CallRoomControls } from "./components/CallRoomControls";
import { FloatingCallWidget } from "./components/FloatingCallWidget";

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

interface PendingMediaRequest {
  fromName: string;
}

export const CallRoomPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";
  const audioOnlyParam = searchParams.get("audioOnly") === "true";

  const [callInfo, setCallInfo] = useState<CallInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [stage, setStage] = useState<CallStage>("idle");
  const [stageMessage, setStageMessage] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(audioOnlyParam);
  const [peerCameraOff, setPeerCameraOff] = useState(audioOnlyParam);
  const [isRequestingVideo, setIsRequestingVideo] = useState(false);
  const [pendingMediaRequest, setPendingMediaRequest] =
    useState<PendingMediaRequest | null>(null);
  const [pendingGuest, setPendingGuest] = useState<PendingGuest | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const makingOfferRef = useRef(false);
  const ignoreOfferRef = useRef(false);
  const isPoliteRef = useRef(false);

  const backendUrl = getApiBaseUrl();
  const socketOrigin = backendUrl.split("/api")[0];

  // Load call details and verify token
  useEffect(() => {
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

        setCallInfo(json?.data ?? null);
      } catch {
        setLoadError("Something went wrong. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    loadCallInfo();
  }, [token, backendUrl]);

  // Call duration timer
  useEffect(() => {
    if (stage !== "connected") return;
    const interval = setInterval(
      () => setCallDurationSeconds((s) => s + 1),
      1000,
    );
    return () => clearInterval(interval);
  }, [stage]);

  function cleanupCall(finalStage: CallStage, message?: string) {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    remoteStreamRef.current = null;

    if (socketRef.current) {
      socketRef.current.emit("leave_call", { appointmentId });
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setStage(finalStage);
    if (message) setStageMessage(message);
    setIsJoining(false);
    setIsMinimized(false);
  }

  async function renegotiate() {
    const pc = peerConnectionRef.current;
    const socket = socketRef.current;
    if (!pc || !socket) return;

    try {
      makingOfferRef.current = true;
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("webrtc_offer", { appointmentId, sdp: pc.localDescription });
    } catch (err) {
      console.error("Renegotiation failed:", err);
    } finally {
      makingOfferRef.current = false;
    }
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
      const [stream] = event.streams;
      if (remoteVideoRef.current && stream) {
        remoteVideoRef.current.srcObject = stream;
      }
      if (stream && remoteStreamRef.current !== stream) {
        remoteStreamRef.current = stream;
        stream.onremovetrack = (e) => {
          if (e.track.kind === "video") setPeerCameraOff(true);
        };
      }
      if (event.track.kind === "video") setPeerCameraOff(false);
    };

    pc.onnegotiationneeded = renegotiate;

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
        video: !audioOnlyParam,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const socket = io(socketOrigin, {
        transports: ["websocket", "polling"],
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        socket.emit("join_call", { appointmentId, token });
      });

      socket.on("guest_waiting_approval_pending", () => {
        setStage("waiting-for-approval");
        setIsJoining(false);
      });

      socket.on("guest_waiting_approval", (payload: PendingGuest) => {
        setPendingGuest(payload);
      });

      socket.on(
        "call_authorized",
        async ({ iceServers }: { iceServers: RTCIceServer[] }) => {
          isPoliteRef.current = callInfo?.role === "guest";
          setPendingGuest(null);
          setStage("waiting-for-peer");
          setIsJoining(false);
          await createPeerConnection(iceServers);
        },
      );

      socket.on(
        "call_joined",
        async ({ iceServers }: { iceServers: RTCIceServer[] }) => {
          // Emitted alongside "call_authorized" for the same event — ignore if
          // we've already set up the peer connection from that handler.
          if (peerConnectionRef.current) return;
          isPoliteRef.current = callInfo?.role === "guest";
          setStage("waiting-for-peer");
          setIsJoining(false);
          await createPeerConnection(iceServers);
        },
      );

      socket.on("call_denied", () => {
        cleanupCall("ended", "The provider denied entry to this call.");
      });

      socket.on("peer_joined", () => {
        setStage("connecting");
        renegotiate();
      });

      socket.on(
        "webrtc_offer",
        async ({ sdp }: { sdp: RTCSessionDescriptionInit }) => {
          const pc = peerConnectionRef.current;
          if (!pc) return;

          const offerCollision =
            sdp.type === "offer" &&
            (makingOfferRef.current || pc.signalingState !== "stable");
          ignoreOfferRef.current = !isPoliteRef.current && offerCollision;
          if (ignoreOfferRef.current) return;

          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          if (sdp.type === "offer") {
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit("webrtc_answer", {
              appointmentId,
              sdp: pc.localDescription,
            });
          }
          setStage("connected");
        },
      );

      socket.on(
        "webrtc_answer",
        async ({ sdp }: { sdp: RTCSessionDescriptionInit }) => {
          const pc = peerConnectionRef.current;
          if (!pc) return;

          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          setStage("connected");
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

      socket.on("call_media_request", ({ kind }: { kind: string }) => {
        if (kind !== "video") return;
        const fromName =
          callInfo?.role === "guest"
            ? callInfo?.providerName
            : callInfo?.guestName;
        setPendingMediaRequest({
          fromName: fromName || "The other participant",
        });
      });

      socket.on(
        "call_media_response",
        async ({ kind, accepted }: { kind: string; accepted: boolean }) => {
          if (kind !== "video") return;
          setIsRequestingVideo(false);

          if (!accepted) {
            toast.info("The other participant declined to enable video.");
            return;
          }

          try {
            const videoStream = await navigator.mediaDevices.getUserMedia({
              video: true,
            });
            const videoTrack = videoStream.getVideoTracks()[0];
            localStreamRef.current?.addTrack(videoTrack);
            if (peerConnectionRef.current && localStreamRef.current) {
              peerConnectionRef.current.addTrack(
                videoTrack,
                localStreamRef.current,
              );
            }
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = localStreamRef.current;
            }
            setIsCameraOff(false);
          } catch {
            toast.error("Could not access your camera.");
          }
        },
      );

      socket.on("peer_left", () => {
        setStage("waiting-for-peer");
        setPeerCameraOff(true);
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
        const errorMessage = message || "Failed to connect to the call.";
        toast.error(errorMessage);
        cleanupCall("error", errorMessage);
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
    const stream = localStreamRef.current;
    const pc = peerConnectionRef.current;
    if (!stream || !pc) return;

    const existingVideoTrack = stream.getVideoTracks()[0];

    if (existingVideoTrack && !isCameraOff) {
      // Downgrade: actually remove the video track and renegotiate back to audio-only.
      const sender = pc
        .getSenders()
        .find((s) => s.track === existingVideoTrack);
      if (sender) pc.removeTrack(sender);
      existingVideoTrack.stop();
      stream.removeTrack(existingVideoTrack);
      setIsCameraOff(true);
      return;
    }

    if (existingVideoTrack && isCameraOff) {
      existingVideoTrack.enabled = true;
      setIsCameraOff(false);
      return;
    }

    // No video track yet — ask the other participant before upgrading to video.
    if (isRequestingVideo) return;
    setIsRequestingVideo(true);
    socketRef.current?.emit("call_media_request", {
      appointmentId,
      kind: "video",
    });
  }

  function handleRespondMediaRequest(accepted: boolean) {
    socketRef.current?.emit("call_media_response", {
      appointmentId,
      kind: "video",
      accepted,
    });
    setPendingMediaRequest(null);
  }

  function handleLeaveCall() {
    cleanupCall("ended", "You left the call.");
    navigate("/chat");
  }

  function handleApproveGuest(socketId: string, approved: boolean) {
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
    setPendingGuest(null);
  }

  const loggedInUserFullName = useSelector(
    (state: RootState) => state?.LoginUserDetail?.userDetails?.user?.fullName,
  );

  const participantName = React.useMemo(() => {
    if (!callInfo) return "Participant";
    if (loggedInUserFullName) {
      if (
        callInfo.guestName?.toLowerCase() === loggedInUserFullName.toLowerCase()
      ) {
        return callInfo.providerName || "Provider";
      }
      if (
        callInfo.providerName?.toLowerCase() ===
        loggedInUserFullName.toLowerCase()
      ) {
        return callInfo.guestName || "Guest";
      }
    }
    return callInfo.providerName || callInfo.guestName || "Participant";
  }, [callInfo, loggedInUserFullName]);

  const isLiveCall = stage !== "idle" && stage !== "ended" && stage !== "error";

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center p-4">
      <div
        className={`w-full max-w-4xl rounded-2xl border border-gray-200 bg-white p-6 shadow-xl ${
          isLiveCall && isMinimized ? "hidden" : ""
        }`}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Loader2 size={32} className="animate-spin text-primaryColorDark" />
            <p className="mt-3 text-sm">Loading call details...</p>
          </div>
        ) : loadError ? (
          <div className="py-12 text-center">
            <XCircle size={40} className="mx-auto text-rose-500" />
            <h3 className="mt-3 text-lg font-bold text-textColor">
              Call Error
            </h3>
            <p className="mt-1 text-sm text-textGreyColor">{loadError}</p>
            <button
              type="button"
              onClick={() => navigate("/chat")}
              className="mt-4 rounded-full bg-primaryColorDark px-5 py-2 text-xs font-semibold text-white shadow-xs"
            >
              Return to Chat
            </button>
          </div>
        ) : stage === "idle" ? (
          <CallRoomLobby
            callInfo={callInfo}
            audioOnlyParam={audioOnlyParam}
            isJoining={isJoining}
            onJoinCall={handleJoinCall}
          />
        ) : stage === "ended" || stage === "error" ? (
          <CallRoomEnded
            stageMessage={stageMessage}
            onReturn={() => navigate("/chat")}
          />
        ) : (
          // Kept mounted (just visually hidden via the outer card above) while
          // minimized so the audio/video elements never unmount and the live
          // stream keeps playing uninterrupted.
          <div>
            <CallRoomVideoGrid
              remoteVideoRef={remoteVideoRef}
              localVideoRef={localVideoRef}
              isCameraOff={isCameraOff}
              peerCameraOff={peerCameraOff}
              participantName={participantName}
              pendingGuest={pendingGuest}
              onApproveGuest={handleApproveGuest}
              stage={stage}
              callDurationSeconds={callDurationSeconds}
              pendingMediaRequest={pendingMediaRequest}
              onRespondMediaRequest={handleRespondMediaRequest}
            />

            <CallRoomControls
              isMuted={isMuted}
              isCameraOff={isCameraOff}
              isRequestingVideo={isRequestingVideo}
              onToggleMute={handleToggleMute}
              onToggleCamera={handleToggleCamera}
              onLeaveCall={handleLeaveCall}
              onMinimize={() => setIsMinimized(true)}
            />
          </div>
        )}
      </div>

      {isLiveCall && isMinimized && (
        <FloatingCallWidget
          participantName={participantName}
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          isRequestingVideo={isRequestingVideo}
          callDurationSeconds={callDurationSeconds}
          onToggleMute={handleToggleMute}
          onToggleCamera={handleToggleCamera}
          onLeaveCall={handleLeaveCall}
          onExpand={() => setIsMinimized(false)}
        />
      )}
    </div>
  );
};

export default CallRoomPage;
