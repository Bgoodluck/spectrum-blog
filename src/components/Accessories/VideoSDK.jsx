import React, { useEffect, useMemo, useRef, useState } from "react";
import { MeetingProvider, useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import { authToken, createMeeting } from "../../Api";
import ReactPlayer from "react-player";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { gsap } from "gsap";
import { Copy, Check, Mic, Video, Share, Users } from "lucide-react";
import { supabase } from "@/helpers/supabase-config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Chat message component with avatar support
const ChatMessage = ({ sender, message, timestamp, isHost }) => (
  <div className="p-2 rounded bg-gray-600 mb-2">
    <div className="flex items-center gap-2">
      {isHost && (
        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
          <Users className="w-4 h-4 text-white" />
        </div>
      )}
      <div className="flex-1">
        <div className="font-semibold text-sm">{sender}</div>
        <div className="text-white">{message}</div>
        <div className="text-xs text-gray-400">{timestamp}</div>
      </div>
    </div>
  </div>
);

// Enhanced chat component
const ChatComponent = ({ meetingId, role }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const channel = supabase
      .channel(`meeting-${meetingId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => setMessages(prev => [...prev, payload.new])
      )
      .subscribe();

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: true });

      if (!error) setMessages(data || []);
    };

    fetchMessages();
    return () => supabase.removeChannel(channel);
  }, [meetingId]);

  const sendMessage = async (e) => {
    e?.preventDefault(); // Handle both button click and form submit
    if (!newMessage.trim()) return;

    try {
      await supabase
        .from('messages')
        .insert([{
          meeting_id: meetingId,
          sender: role,
          content: newMessage,
          sender_name: currentUser?.username || 'Anonymous',
          is_vip: currentUser?.isVIP || false
        }]);
      
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className="bg-gray-700 h-[500px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Live Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col h-full overflow-hidden p-4">
        <div 
          ref={chatContainerRef} 
          className="flex-1 overflow-y-auto mb-4 space-y-2"
        >
          {messages.map((msg, idx) => (
            <ChatMessage
              key={msg.id || idx}
              sender={msg.sender_name}
              message={msg.content}
              timestamp={new Date(msg.created_at).toLocaleTimeString()}
              isHost={msg.sender === 'host'}
            />
          ))}
        </div>
        <form onSubmit={sendMessage} className="mt-auto flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-600 text-white"
          />
          <Button type="submit" variant="secondary">
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// Enhanced co-host invite component
const CoHostInvite = ({ meetingId, onClose, currentCoHosts }) => {
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const copyInviteLink = async () => {
    try {
      const inviteLink = `${window.location.origin}/join/${meetingId}?role=cohost`;
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const sendInvite = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    try {
      if (currentCoHosts >= 4) {
        alert('Maximum number of co-hosts (4) reached');
        return;
      }

      const { error } = await supabase
        .from('co_host_invites')
        .insert([{
          meeting_id: meetingId,
          email: email,
          status: 'pending'
        }]);

      if (error) throw error;
      
      alert(`Invitation sent to ${email}`);
      onClose();
    } catch (error) {
      console.error('Error sending invite:', error);
      alert('Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  // Stop propagation to prevent modal from closing when clicking inside useMeeting
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-md bg-gray-700 p-4"
        onClick={handleModalClick}
      >
        <CardHeader>
          <CardTitle>Invite Co-host ({currentCoHosts}/4 co-hosts)</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={sendInvite} className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Meeting Link</label>
              <div className="flex items-center space-x-2">
                <Input 
                  value={`${window.location.origin}/join/${meetingId}?role=cohost`}
                  readOnly 
                  className="bg-gray-600 text-white"
                />
                <Button
                  type="button"
                  onClick={copyInviteLink}
                  variant="outline"
                  size="icon"
                  className="hover:bg-gray-600"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm mb-2">Co-host Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="bg-gray-600 text-white"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onClose}
                className="hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || currentCoHosts >= 4}
              >
                {isLoading ? 'Sending...' : 'Send Invite'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Enhanced participant view component
const ParticipantView = ({ participantId }) => {
  const micRef = useRef(null);
  const {
    webcamStream,
    micStream,
    webcamOn,
    micOn,
    isLocal,
    displayName,
    screenShareStream,
    screenShareOn
  } = useParticipant(participantId);

  const videoStream = useMemo(() => {
    if (webcamOn && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      return mediaStream;
    }
    if (screenShareOn && screenShareStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(screenShareStream.track);
      return mediaStream;
    }
    return null;
  }, [webcamStream, webcamOn, screenShareStream, screenShareOn]);

  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);
        micRef.current.srcObject = mediaStream;
        micRef.current.play().catch(error => 
          console.error("Audio play failed:", error)
        );
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);


  return (
    <div className="relative">
      <audio ref={micRef} autoPlay playsInline muted={isLocal} />
      {videoStream && (
        <div className="relative">
          <ReactPlayer
            playsinline
            pip={false}
            light={false}
            controls={false}
            muted={isLocal}
            playing={true}
            url={videoStream}
            height="300px"
            width="300px"
            onError={(err) => console.log(err, "participant video error")}
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded">
            {displayName} {isLocal ? "(You)" : ""}
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced meeting view component
const MeetingView = ({ meetingId, onMeetingLeave, role }) => {
  const [joined, setJoined] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [coHosts, setCoHosts] = useState([]);
  const [joinError, setJoinError] = useState(null);
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const {
    join,
    leave,
    toggleMic,
    toggleWebcam,
    toggleScreenShare,
    participants,
    localWebcamOn,
    localMicOn,
    localScreenShareOn
  } = useMeeting({
    onMeetingJoined: () => {
      setJoined("JOINED");
      setJoinError(null);
    },
    onMeetingLeft: onMeetingLeave,
    onError: (error) => {
      console.error("Meeting error:", error);
      setJoinError(error.message || "Failed to join meeting");
      setJoined(null);
    },
    onParticipantJoined: (participantId) => {
      const participant = participants.get(participantId);
      if (participant?.role === 'cohost') {
        setCoHosts(prev => [...prev, participantId]);
      }
    },
    onParticipantLeft: (participantId) => {
      setCoHosts(prev => prev.filter(id => id !== participantId));
    },
    onWebcamRequested: ({ accept, reject }) => {
      accept();
    },
    onMicRequested: ({ accept, reject }) => {
      accept();
    },
    // onError: (error) => {
    //   console.error("Meeting error:", error);
    // }
  });

   // Update local state when media states change
   useEffect(() => {
    setIsWebcamOn(localWebcamOn);
    setIsMicOn(localMicOn);
    setIsScreenSharing(localScreenShareOn);
  }, [localWebcamOn, localMicOn, localScreenShareOn]);

  const handleJoinMeeting = async () => {
    try {
      setJoined("JOINING");
      setJoinError(null);
      await join();
    } catch (error) {
      console.error("Failed to join meeting:", error);
      setJoinError("Failed to join meeting. Please check your meeting ID and try again.");
      setJoined(null);
    }
  };

  if (joinError) {
    return (
      <div className="p-4 bg-red-500 rounded-lg text-white mb-4">
        <p>{joinError}</p>
        <Button 
          onClick={() => {
            setJoinError(null);
            onMeetingLeave();
          }}
          className="mt-2"
        >
          Back to Home
        </Button>
      </div>
    );
  }

  if (joined !== "JOINED") {
    return (
      <Button 
        onClick={handleJoinMeeting}
        disabled={joined === "JOINING"}
      >
        {joined === "JOINING" ? "Joining..." : "Join Stream"}
      </Button>
    );
  }

  const handleWebcamToggle = async () => {
    try {
      await toggleWebcam();
    } catch (error) {
      console.error("Failed to toggle webcam:", error);
    }
  };

  const handleMicToggle = async () => {
    try {
      await toggleMic();
    } catch (error) {
      console.error("Failed to toggle mic:", error);
    }
  };

  const handleScreenShareToggle = async () => {
    try {
      await toggleScreenShare();
    } catch (error) {
      console.error("Failed to toggle screen share:", error);
    }
  };

  if (joined !== "JOINED") {
    return (
      <Button onClick={() => {
        setJoined("JOINING");
        join();
      }}>
        Join Stream
      </Button>
    );
  }


  return (
    <div className="container">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg">Meeting ID: {meetingId}</h3>
        <div className="space-x-2">
          {(role === 'host' || role === 'cohost') && (
            <>
              <Button 
                onClick={handleMicToggle} 
                variant={isMicOn ? "default" : "outline"}
                className={isMicOn ? "bg-blue-500" : ""}
              >
                <Mic className="h-4 w-4 mr-2" />
                {isMicOn ? "Mic On" : "Mic Off"}
              </Button>
              
              <Button 
                onClick={handleWebcamToggle}
                variant={isWebcamOn ? "default" : "outline"}
                className={isWebcamOn ? "bg-blue-500" : ""}
              >
                <Video className="h-4 w-4 mr-2" />
                {isWebcamOn ? "Camera On" : "Camera Off"}
              </Button>
              
              <Button 
                onClick={handleScreenShareToggle}
                variant={isScreenSharing ? "default" : "outline"}
                className={isScreenSharing ? "bg-blue-500" : ""}
              >
                <Share className="h-4 w-4 mr-2" />
                {isScreenSharing ? "Stop Sharing" : "Share Screen"}
              </Button>
            </>
          )}
          
          {role === 'host' && (
            <Button onClick={() => setShowInvite(true)} variant="secondary">
              Invite Co-host
            </Button>
          )}
          
          <Button onClick={leave} variant="destructive">
            Leave Stream
          </Button>
        </div>
      </div>

      {showInvite && (
        <CoHostInvite 
          meetingId={meetingId}
          currentCoHosts={coHosts.length}
          onClose={() => setShowInvite(false)}
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        {[...participants.values()].map((participant) => (
          <ParticipantView
            key={participant.id}
            participantId={participant.id}
          />
        ))}
      </div>
    </div>
  );
};

// Main VideoSDK component
const VideoSDK = ({ initialMode }) => {
  const { currentUser } = useSelector((state) => state?.user);
  const isVIP = currentUser?.rest.isVip;
  const [mode, setMode] = useState(initialMode || (isVIP ? "host" : "viewer"));
  const [meetingId, setMeetingId] = useState(null);
  const [inputMeetingId, setInputMeetingId] = useState("");
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const isHost = useMemo(() => mode === "host", [mode]);
  const navigate = useNavigate()

console.log("currentUser", isVIP)
  useEffect(() => {
    // Update mode when initialMode prop changes
    if (initialMode && isVIP) {
      setMode(initialMode);
    }
  }, [initialMode, isVIP]);

  useEffect(() => {
    // Redirect non-VIP users trying to access host mode
    if (initialMode === "host" && !isVIP) {
      navigate("/live-stream");
    }
  }, [initialMode, isVIP, navigate]);

  // Get meeting ID from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const meetingIdFromUrl = params.get('meetingId');
    const roleFromUrl = params.get('role');
    
    if (meetingIdFromUrl) {
      setMeetingId(meetingIdFromUrl);
      setInputMeetingId(meetingIdFromUrl);
    }
    
    if (roleFromUrl === 'cohost' && isVIP) {
      setMode('cohost');
    }
  }, [isVIP]);
  

  const handleCreateMeeting = async () => {
    try {
      setError(null);
      const newMeetingId = await createMeeting({ token: authToken });
      setMeetingId(newMeetingId);
      setInputMeetingId(newMeetingId);
      
      // Update URL with meeting ID
      const newUrl = `${window.location.pathname}?meetingId=${newMeetingId}`;
      window.history.pushState({}, '', newUrl);
    } catch (error) {
      console.error("Failed to create meeting:", error);
      setError("Failed to create meeting. Please try again.");
    }
  };

  const handleJoinMeeting = async () => {
    if (!inputMeetingId) {
      setError("Please enter a valid meeting ID");
      return;
    }
    
    try {
      setError(null);
      // Verify meeting exists before joining
      const response = await fetch(`https://api.videosdk.live/v2/rooms/${inputMeetingId}`, {
        headers: {
          Authorization: authToken,
        },
      });

      if (!response.ok) {
        throw new Error("Invalid meeting ID or meeting has ended");
      }

      setMeetingId(inputMeetingId);
      
      // Update URL with meeting ID and role
      const params = new URLSearchParams(window.location.search);
      params.set('meetingId', inputMeetingId);
      if (mode === 'cohost') {
        params.set('role', 'cohost');
      }
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState({}, '', newUrl);
    } catch (error) {
      console.error("Failed to join meeting:", error);
      setError(error.message || "Failed to join meeting. Please check the meeting ID and try again.");
    }
  };

  const getRoleFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const urlRole = params.get('role');
    
    // If user is VIP, they can be cohost when specified in URL
    if (isVIP && urlRole === 'cohost') {
      return 'cohost';
    }
    
    // If user is VIP and explicitly set as host
    if (isVIP && mode === 'host') {
      return 'host';
    }
    
    // Default to viewer for non-VIP users or when no specific role is set
    return 'viewer';
  };

  // const getRoleFromUrl = () => {
  //   const params = new URLSearchParams(window.location.search);
  //   return params.get('role') === 'cohost' ? 'cohost' : 'viewer';
  // };

  // const handleCreateMeeting = async () => {
  //   try {
  //     const newMeetingId = await createMeeting({ token: authToken });
  //     setMeetingId(newMeetingId);
  //   } catch (error) {
  //     console.error("Failed to create meeting:", error);
  //   }
  // };

  const handleReturn = ()=>{
    navigate('/');
  }



  return (
    <div ref={containerRef} className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
            {error}
          </div>
        )}
        <Button onClick={() => navigate('/')}>
          Back
        </Button>
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            LiveStream Studio
          </h1>
          <div className="space-x-4">
            {!meetingId && isVIP && (
              <>
                {mode === "host" ? (
                  <Button onClick={handleCreateMeeting}>Create Stream</Button>
                ) : (
                  <>
                    <Button
                      onClick={() => setMode("host")}
                      className="bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      Become a Host
                    </Button>
                    <Button
                      onClick={() => setMode("cohost")}
                      className="bg-gradient-to-r from-pink-500 to-purple-500"
                    >
                      Join as Co-host
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className="stream-container">
          <Card className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-6">
              {meetingId ? (
                <MeetingProvider
                  config={{
                    meetingId,
                    micEnabled: isVIP && getRoleFromUrl() !== 'viewer',
                    webcamEnabled: isVIP && getRoleFromUrl() !== 'viewer',
                    name: getRoleFromUrl() === 'host' ? 'Host' : 
                          getRoleFromUrl() === 'cohost' ? 'Co-host' : 'Viewer',
                    role: getRoleFromUrl()
                  }}
                  token={authToken}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <MeetingView
                        meetingId={meetingId}
                        onMeetingLeave={() => {
                          setMeetingId("");
                          setInputMeetingId("");
                          // Clear URL parameters
                          const newUrl = window.location.pathname;
                          window.history.pushState({}, '', newUrl);
                        }}
                        role={getRoleFromUrl()}
                      />
                    </div>
                    <div>
                      <ChatComponent 
                        meetingId={meetingId}
                        role={getRoleFromUrl()}
                      />
                    </div>
                  </div>
                </MeetingProvider>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4 p-8">
                  {isHost ? (
                    <p className="text-xl">Click "Create Stream" to start streaming</p>
                  ) : (
                    <div className="w-full max-w-md space-y-4">
                      <Input
                        type="text"
                        placeholder="Enter Stream ID"
                        className="bg-gray-700 rounded-lg px-4 py-2 w-full"
                        value={inputMeetingId}
                        onChange={(e) => setInputMeetingId(e.target.value)}
                      />
                      <Button 
                        onClick={handleJoinMeeting}
                        className="w-full"
                      >
                        Join Stream
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VideoSDK;

