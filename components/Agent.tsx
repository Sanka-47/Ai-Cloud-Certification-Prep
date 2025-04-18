"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.log("Error:", error);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };  
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback");

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
      });

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/");
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/");
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    if (type === "generate") {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        variableValues: {
          username: userName,
          userid: userId,
        },
      });
    } else {
      let formattedQuestions = "";
      if (questions) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }

      await vapi.start(interviewer, {
        variableValues: {
          questions: formattedQuestions,
        },
      });
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br to-indigo-50 rounded-3xl flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-screen-md space-y-6 mb-8">
        {/* AI Interviewer Card */}
        <div className="relative bg-white rounded-xl shadow-lg overflow-hidden border border-indigo-200">
          <div className="bg-indigo-100 text-indigo-800 py-4 px-6">
            <h3 className="text-lg font-semibold">AI Interviewer</h3>
          </div>
          <div className="p-6 flex items-center space-x-4">
            <div className="relative">
              <img
                src="/rb2.png"
                alt="AI Interviewer"
                className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-300"
              />
              {isSpeaking && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-indigo-500 rounded-full animate-ping" />
              )}
            </div>
            <p className="text-gray-700">Ready to guide you through the interview process and assess your skills.</p>
          </div>
          <div className="bg-indigo-50 py-2 px-4 text-sm text-indigo-700 text-center">
            Intelligent Assessment
          </div>
        </div>

        {/* User Profile Card */}
        <div className="relative bg-white rounded-xl shadow-lg overflow-hidden border border-indigo-200">
          <div className="bg-indigo-100 text-indigo-800 py-4 px-6">
            <h3 className="text-lg font-semibold">{userName}</h3>
          </div>
          <div className="p-6 flex items-center space-x-4">
            <img
              src="/pr.png"
              alt="User Profile"
              className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-300"
            />
            <p className="text-gray-700">Your profile for this interview session.</p>
          </div>
          <div className="bg-indigo-50 py-2 px-4 text-sm text-indigo-700 text-center">
            Your Profile
          </div>
        </div>

        {messages.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 max-h-96 overflow-y-auto border border-indigo-200">
            <h4 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Chat Log</h4>
            <div className="space-y-3">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    "py-2 px-4 rounded-lg",
                    index % 2 === 0
                      ? "bg-indigo-50 text-indigo-800 self-start"
                      : "bg-indigo-100 text-indigo-800 self-end text-right"
                  )}
                >
                  <p className="text-sm text-dark-100">
  {msg.role + ": " + msg.content}
</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center">
          {callStatus !== "ACTIVE" ? (
            <button
              className={cn(
                "relative px-8 py-3 rounded-full font-semibold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors duration-300 shadow-md border border-indigo-300",
                callStatus === "CONNECTING"
                  ? "bg-gray-400 text-gray-600 border-gray-400 cursor-not-allowed"
                  : ""
              )}
              onClick={handleCall}
              disabled={callStatus === "CONNECTING"}
            >
              <span
                className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 bg-indigo-300 rounded-full animate-ping",
                  callStatus !== "CONNECTING" && "hidden"
                )}
              />
              {callStatus === "INACTIVE" || callStatus === "FINISHED" ? "Start Interview" : "Connecting..."}
            </button>
          ) : (
            <button
              className="px-8 py-3 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors duration-300 shadow-md"
              onClick={handleDisconnect}
            >
              End Interview
            </button>
          )}
        </div>
      </div>
    </div>
  );



};

export default Agent;
