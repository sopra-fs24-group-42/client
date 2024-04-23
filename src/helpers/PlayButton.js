import React, { useState } from "react";
import "styles/ui/PlayButton.scss"; 

function PlayButton() {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <button className={`play-button ${isPlaying ? "playing" : ""}`} onClick={togglePlay}>
      {isPlaying ? "Pause" : "Play"}
    </button>
  );
}

export default PlayButton;