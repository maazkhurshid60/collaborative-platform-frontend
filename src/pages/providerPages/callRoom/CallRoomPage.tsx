import React, { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { Loader2, XCircle } from "lucide-react";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getApiBaseUrl } from "@/apiServices/config/api";
import { CallRoomLobby } from "./components/CallRoomLobby";
import { CallRoomEnded } from "./components/CallRoomEnded";
import { CallRoomVideoGrid } from "./components/CallRoomVideoGrid";
import { CallRoomControls } from "./components/CallRoomControls";

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
  const [pendingGuest, setPendingGuest] = useState<PendingGuest | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

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

  function cleanupCall(finalStage: CallStage, message?: string) {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;

    if (socketRef.current) {
      socketRef.current.emit("leave_call", { appointmentId });
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
        video: !audioOnlyParam,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      if (audioOnlyParam) {
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

      socket.on(
        "guest_admitted",
        async ({ iceServers }: { iceServers: RTCIceServer[] }) => {
          setPendingGuest(null);
          setStage("connecting");

          const pc = await createPeerConnection(iceServers);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          socket.emit("offer", { appointmentId, offer });
        },
      );

      socket.on("guest_denied", () => {
        cleanupCall("ended", "The provider denied entry to this call.");
      });

      const handleCallAuthorized = ({ iceServers }: { iceServers: RTCIceServer[] }) => {
        createPeerConnection(iceServers);
        setStage("waiting-for-peer");
        setIsJoining(false);
      };

      socket.on("call_authorized", handleCallAuthorized);
      socket.on("call_joined", handleCallAuthorized);

      socket.on("peer_joined", async () => {
        console.log("👋 Peer joined the call room, creating WebRTC offer...");
        setStage("connecting");
        const pc = peerConnectionRef.current;
        if (pc) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("offer", { appointmentId, offer });
        }
      });

      socket.on(
        "offer",
        async ({ offer }: { offer: RTCSessionDescriptionInit }) => {
          setStage("connected");
          const pc = peerConnectionRef.current;
          if (!pc) return;

          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.emit("answer", { appointmentId, answer });
        },
      );

      socket.on(
        "answer",
        async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
          setStage("connected");
          const pc = peerConnectionRef.current;
          if (!pc) return;

          await pc.setRemoteDescription(new RTCSessionDescription(answer));
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
    navigate("/chat");
  }

  function handleApproveGuest(socketId: string, approved: boolean) {
    socketRef.current?.emit("approve_guest", { socketId, approved });
  }

  const loggedInUserFullName = useSelector(
    (state: RootState) => state?.LoginUserDetail?.userDetails?.user?.fullName
  );

  const participantName = React.useMemo(() => {
    if (!callInfo) return "Participant";
    if (loggedInUserFullName) {
      if (callInfo.guestName?.toLowerCase() === loggedInUserFullName.toLowerCase()) {
        return callInfo.providerName || "Provider";
      }
      if (callInfo.providerName?.toLowerCase() === loggedInUserFullName.toLowerCase()) {
        return callInfo.guestName || "Guest";
      }
    }
    return callInfo.providerName || callInfo.guestName || "Participant";
  }, [callInfo, loggedInUserFullName]);

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Loader2 size={32} className="animate-spin text-primaryColorDark" />
            <p className="mt-3 text-sm">Loading call details...</p>
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
          <div>
            <CallRoomVideoGrid
              remoteVideoRef={remoteVideoRef}
              localVideoRef={localVideoRef}
              isCameraOff={isCameraOff}
              participantName={participantName}
              pendingGuest={pendingGuest}
              onApproveGuest={handleApproveGuest}
              stage={stage}
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

export default CallRoomPage;
