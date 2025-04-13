
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

interface VideoContainerProps {
  type: "user" | "buddy" | "reference";
  label: string;
}

const VideoContainer = ({ type, label }: VideoContainerProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  // For reference videos, we'll just show a placeholder
  const isReference = type === "reference";
  
  const bgColors = {
    user: "bg-buddy-purple-light",
    buddy: "bg-blue-50", 
    reference: "bg-gray-50"
  };

  return (
    <Card className={`overflow-hidden ${bgColors[type]} h-full flex flex-col`}>
      <div className="relative w-full h-full flex-1">
        {/* Video Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isVideoOff || isReference ? (
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center mb-2">
                {type === "reference" ? (
                  <span className="text-2xl font-bold">REF</span>
                ) : (
                  <span className="text-2xl font-bold">{type === "user" ? "YOU" : "BUDDY"}</span>
                )}
              </div>
              <span className="text-sm text-gray-600">
                {isReference ? "Reference Video" : "Camera Off"}
              </span>
            </div>
          ) : (
            <div className="w-full h-full bg-black opacity-20 flex items-center justify-center">
              <span className="text-white">Camera Placeholder</span>
            </div>
          )}
        </div>
        
        {/* Video Label */}
        <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md text-sm">
          {label}
        </div>
        
        {/* Controls - only for user and buddy videos */}
        {!isReference && (
          <div className="absolute bottom-2 right-2 flex space-x-2">
            <Button 
              size="icon" 
              variant="secondary" 
              className="bg-black bg-opacity-50 text-white hover:bg-opacity-70"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
            </Button>
            <Button 
              size="icon" 
              variant="secondary" 
              className="bg-black bg-opacity-50 text-white hover:bg-opacity-70"
              onClick={() => setIsVideoOff(!isVideoOff)}
            >
              {isVideoOff ? <VideoOff size={16} /> : <Video size={16} />}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default VideoContainer;
