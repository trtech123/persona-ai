"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePersonaStore } from "@/store/usePersonaStore";
import PersonaDebateWindow from "@/components/PersonaDebateWindow";
import Button from "@/components/ui/Button";
import { DebateMessage } from "@/types";
import { io, Socket } from "socket.io-client";

export default function DebateRoom() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Use granular selectors for stability
  const personas = usePersonaStore((state) => state.personas);
  const activeDebateSessionId = usePersonaStore(
    (state) => state.activeDebateSession?.id
  );
  const activeDebateSessionTopic = usePersonaStore(
    (state) => state.activeDebateSession?.topic
  );
  const activeDebateSessionPersonaIds = usePersonaStore(
    (state) => state.activeDebateSession?.personaIds
  );
  const createDebateSession = usePersonaStore(
    (state) => state.createDebateSession
  );
  const endDebateSession = usePersonaStore((state) => state.endDebateSession);
  const addDebateMessage = usePersonaStore((state) => state.addDebateMessage);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Effect for initializing the debate session based on URL params
  useEffect(() => {
    console.log("Running session init effect...");
    const topic = searchParams?.get("topic");
    const personaIdsParam = searchParams?.get("personas")?.split(",") || [];

    if (!topic || personaIdsParam.length < 2) {
      console.error(
        "Debate setup error: Missing topic or personas, redirecting."
      );
      if (!isLoading && !error) router.push("/debate");
      return;
    }

    const decodedTopic = decodeURIComponent(topic);
    // Compare with granular state
    if (
      !activeDebateSessionId ||
      activeDebateSessionTopic !== decodedTopic ||
      JSON.stringify(activeDebateSessionPersonaIds?.sort()) !==
        JSON.stringify(personaIdsParam.sort())
    ) {
      console.log("Creating or updating debate session in store...");
      // Ensure personaIdsParam is passed correctly
      createDebateSession(personaIdsParam, decodedTopic);
    }
    // Depend on granular state pieces and creation function
  }, [
    searchParams,
    createDebateSession,
    activeDebateSessionId,
    activeDebateSessionTopic,
    activeDebateSessionPersonaIds,
  ]);

  // Effect for establishing and cleaning up the socket connection
  useEffect(() => {
    // Only attempt connection if session ID exists
    if (!activeDebateSessionId) {
      console.log(
        "Waiting for activeDebateSessionId before connecting socket..."
      );
      setIsLoading(true);
      // Ensure error is cleared if we are waiting
      setError(null);
      return;
    }

    console.log(
      "Attempting Socket.IO connection for session:",
      activeDebateSessionId
    );
    setIsLoading(true); // Reset loading state when trying to connect
    setError(null); // Clear previous errors

    const socketInstance = io(window.location.origin, {
      reconnectionAttempts: 3,
      // Ensure transport is websocket primarily
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      console.log("Socket.IO connected successfully:", socketInstance.id);
      setSocket(socketInstance);
      setIsLoading(false);
      setError(null);
      // Join the debate room using the stable session ID
      socketInstance.emit("join-debate", activeDebateSessionId);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket.IO connection error:", err);
      setError(
        `Connection failed: ${err.message}. Please check server and network.`
      );
      setIsLoading(false);
      socketInstance.disconnect();
      setSocket(null);
    });

    // Cleanup function
    return () => {
      console.log(
        "Disconnecting socket instance for session:",
        activeDebateSessionId
      );
      socketInstance.disconnect();
      setSocket(null);
    };

    // Re-run connection logic ONLY if the active session ID changes
  }, [activeDebateSessionId]);

  // Stable callback for handling incoming messages
  const handleIncomingMessage = useCallback(
    (message: DebateMessage & { sessionId: string }) => {
      console.log("Received message:", message);
      // Use the stable activeDebateSessionId for comparison
      if (
        activeDebateSessionId &&
        message.sessionId === activeDebateSessionId
      ) {
        addDebateMessage(activeDebateSessionId, message.personaId, message);
      } else {
        console.warn(
          "Received message for inactive/different session:",
          message
        );
      }
      // Depend only on the ID and the add function reference
    },
    [activeDebateSessionId, addDebateMessage]
  );

  // Effect for managing the message listener
  useEffect(() => {
    if (!socket) {
      console.log("Socket not available, skipping listener setup.");
      return; // Only listen if socket is connected
    }

    console.log("Setting up message listener for socket:", socket.id);
    socket.on("debate-message", handleIncomingMessage);

    // Cleanup listener
    return () => {
      console.log("Removing message listener for socket:", socket.id);
      socket.off("debate-message", handleIncomingMessage);
    };
    // Re-run ONLY if socket instance or the stable handler function changes
  }, [socket, handleIncomingMessage]);

  // Effect to end debate session when component unmounts (if it was active)
  // This uses a ref to capture the session ID on mount to avoid dependency issues
  const sessionIdRef = React.useRef<string | undefined>();
  useEffect(() => {
    sessionIdRef.current = activeDebateSessionId;
  }, [activeDebateSessionId]);

  useEffect(() => {
    // Return the cleanup function
    return () => {
      const idToEnd = sessionIdRef.current;
      if (idToEnd) {
        console.log(
          "DebateRoom unmounting, ending session captured on mount:",
          idToEnd
        );
        // Call endDebateSession with the captured session ID
        // Need to get the function ref without causing re-renders
        usePersonaStore.getState().endDebateSession(idToEnd);
      }
    };
  }, []); // Empty dependency array: runs only on mount and unmount

  // ----- Render Logic -----

  if (isLoading) {
    // Render loading state
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-rose-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to debate room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    // Render error state
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-rose-50/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push("/debate")}>
            Return to Debate Setup
          </Button>
        </div>
      </div>
    );
  }

  // After loading and error checks, verify prerequisites for rendering the debate
  if (!socket || !socket.connected || !activeDebateSessionId) {
    console.warn(
      "Debate prerequisites not met AFTER loading (socket/session), rendering redirect/fallback..."
    );
    // Redirect if not already redirecting or on the setup page
    if (
      typeof window !== "undefined" &&
      window.location.pathname !== "/debate"
    ) {
      // Simple timeout to prevent potential rapid redirects if state flaps
      setTimeout(() => router.push("/debate"), 50);
    }
    // Render fallback while redirecting
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-rose-50/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">
            Connection issue or session ended. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  // Filter personas based on the stable activeDebateSessionId
  // Ensure activeDebateSessionPersonaIds is available before filtering
  const currentPersonaIds = activeDebateSessionPersonaIds || [];
  const debatePersonas = personas.filter((p) =>
    currentPersonaIds.includes(p.id)
  );

  // Render the main debate UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-rose-50/30 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Debate: {activeDebateSessionTopic || "Loading Topic..."}{" "}
            {/* Use granular topic */}
          </h1>
          <Button
            variant="outline"
            onClick={() => {
              if (activeDebateSessionId)
                endDebateSession(activeDebateSessionId);
              if (socket) socket.disconnect();
              setSocket(null);
              router.push("/debate");
            }}
          >
            End Debate & Exit
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {debatePersonas.map((persona) => (
            <PersonaDebateWindow
              key={persona.id}
              persona={persona}
              socket={socket}
              sessionId={activeDebateSessionId} // Pass stable ID
            />
          ))}
        </div>
      </div>
    </div>
  );
}
