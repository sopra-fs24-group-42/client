import React, { useState, useEffect } from "react";
import {useNavigate} from "react-router-dom";
import { getDomain } from "../../helpers/getDomain";
import { Button } from "components/ui/Button";
import "../../styles/views/NarrationPhase.scss";
import Header from "./Header";
import textSamples from "helpers/TextSamples/TextSamples.json";

function NarrationPhase() {
  const [data, setData] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  
  useEffect(() => {
    const RevealVotingPre = textSamples.RevealVotingPre[Math.floor(Math.random() * textSamples.RevealVotingPre.length)];
    const RevealVotingPost = textSamples.RevealVotingPost[Math.floor(Math.random() * textSamples.RevealVotingPost.length)];
    const selectedText = RevealVotingPre + " " + RevealVotingPost;
    const fetchData = async () => {
      const baseURL = "https://texttospeech.googleapis.com/v1beta1/text:synthesize?fields=audioContent&key="
      const URLSecret = process.env.REACT_APP_API_KEY;
      var fetcherURL = baseURL.concat(URLSecret)
      const requestBody = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify( {"audioConfig": {
          "audioEncoding": "LINEAR16",
          "pitch": 0,
          "speakingRate": 1
        },
        "input": {
          "ssml": "<speak>" + RevealVotingPre + " " + "<break time=\"1s\"/>" + RevealVotingPost + "</speak>"
        },
        "voice": {
          "languageCode": "en-US",
          "name": "en-US-Standard-A"
        }
        })
      };

      try {
        const response = await fetch(fetcherURL, requestBody);
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        const jsonData = await response.json();
        let modifiedString = JSON.stringify(jsonData);
        console.log(modifiedString);
        let newstring = modifiedString.substring(17);
        console.log("firts 17 Elements deleted",newstring);
        newstring = newstring.slice(0, -2);
        console.log("last 2 Elements deleted",newstring);
        newstring = "data:audio/mp3;base64,".concat(newstring)   
        console.log("concatenated",newstring);
        
        setData(newstring);  // Save the JSON response in state
        console.log("Data saved in state:", newstring);
      } catch (error) {
        console.error("Error during fetching the audio file:", error);
      }

      return
    }
    fetchData();
  }, [])

  const DecodeAndPlay = () => {
    // Assuming the base64 string is in the proper format with the data URL prefix
    const base64Content = data.split(",")[1]; // This will ignore the data URL prefix if present
    const byteCharacters = atob(base64Content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "audio/mp3" });

    // Create a URL for the Blob and set it for audio playback
    const newAudioUrl = URL.createObjectURL(blob);
    setAudioUrl(newAudioUrl);
    console.log("File has been decoded and AudioURL has been set")
    
  };
  
  return (
    <div className="NarrationPhase">
      <div className="container">
        <div className="title">Survive the Night</div>
        <div className="subtitle">Shhhhhhhhh. This is the Narration Phase, listen...</div>
        <button className="btn" onClick={DecodeAndPlay}>
          Press to Play
        </button>
        {audioUrl && (
          <audio controls src={audioUrl} autoPlay />
        )}
      </div>
    </div>
    /*
    <BaseContainer>
      <div className="container">
      <button className="btn" onClick={DecodeAndPlay}>Decode and Play</button>
      {audioUrl && <audio controls src={audioUrl} autoPlay />}
      </div>
    </BaseContainer>
    */

    
  );
}

export default NarrationPhase;

