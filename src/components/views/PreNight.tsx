import React, { useState, useEffect } from "react";
import SockJS from "sockjs-client";
import { over } from "stompjs";
import { getDomain } from "../../helpers/getDomain";
import { Spinner } from "components/ui/Spinner";
import {useNavigate, useLocation} from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/PreNight.scss";
import BaseContainer from "components/ui/BaseContainer";
import textSamples from "helpers/TextSamples/TextSamples.json";

const PreNight = () => {
  // variables needed for establishing websocket connection
  const baseURL = getDomain();
  const navigate = useNavigate();

  localStorage.removeItem("selected");

  var connection = false;
  var stompClient = null;
  var subscription = null;
  
  // variables needed for role reveal
  const [messageReceived, setMessageReceived] = useState(null);
  const username = localStorage.getItem("user"); //fetching username from localstorage
  const [ready, setReady] = useState(false);
  const [alreadySent, setAlreadySent] = useState(false);
  const [hostName, setHostName] = useState(null);
  let gameState = "PRENIGHT";

  const lobbyId = localStorage.getItem("lobbyId");

  const connect = async () => {
    return new Promise((resolve, reject) => {
      console.log("INSIDE CONNECT");
      const socket = new SockJS(baseURL+"/game"); // creating a new SockJS object (essentially a websocket object)
      stompClient = over(socket); // specifying that it's a special type of websocket connection (i.e. using sockJS)
      stompClient.connect({}, function (frame) { // connecting to server websocket: instructions inside "function" will only be executed once we get something (i.e. a connect frame back from the server). Parameter "frame" is what we get from the server. 
        console.log("socket was successfully connected: " + frame);
        connection = true;
        setTimeout( function() {// "function" will be executed after the delay (i.e. subscribe is called because we call connect with a function as argument e.g. see createGame.tsx)
          //const response = await callback();
          console.log("I waited: I received  MESSAGE frame back based on subscribing!!");
          resolve(stompClient);
        }, 500);
      });
      stompClient.onclose = reason => {
        console.log("Socket was closed, Reason: " + reason);
        connection = false;
        reject(reason);}
    });
  };

  const subscribe = async (destination) => { 
    return new Promise( (resolve, reject) => {
      subscription = stompClient.subscribe(destination, async function(message) { 
        console.log("I AM STILL SUBSCRIBED AND RECEIVED A MESSAGE");
        // all of this only gets executed when message is received
        console.log("this is the message: " + JSON.stringify(message));
        setMessageReceived(JSON.parse(message.body));
        setHostName(JSON.parse(message.body).hostName);
        resolve(subscription);
      });
    }); 
  }

  useEffect(() => { // This is executed once upon mounting of roleReveal --> establishes ws connection & subscribes
    console.log("INSIDE USEEFFECT");
    if(!connection) {  
      const connectAndSubscribe = async () => { 
        try {
          await connect();
          subscription = await subscribe(`/topic/lobby/${lobbyId}`);
        } catch (error) {
          console.error("There was an error connecting or subscribing: ", error);
        }
      };
      connectAndSubscribe();}
    console.log("I connected?");

    if (messageReceived) {
      setHostName(messageReceived.hostName);
      if (messageReceived.gameState === "NIGHTREVEAL") { // happens after ready was sent by all
        navigate("/nightreveal");
      } else if (messageReceived.gameState === "ENDGAME"){
        navigate("/end");
      }
    }

    return () => {
      const headers = {
        "Content-type": "application/json"
      };
      const body = JSON.stringify({username, gameState});
      try{
        if(!alreadySent) { // to avoid SEND frames being sent doubled
          stompClient.send("/app/ready", headers, body);
        }
      } catch (e) {
        console.log("Something went wrong starting the game :/");
      }
    }

  }, [ready]);

  useEffect(() => { // This useEffect tracks changes in the lobby --> do I need this for roleReveal?
    console.log("I am in Role reveal useEffect now!");
    if (messageReceived) {
      setHostName(messageReceived.hostName);
      /*for(let i=0; i<messageReceived.players.length; i++) { // iterating through list of players to check their isKilled field 
        let currentPlayer = messageReceived.players[i];
        if(messageReceived.playerMap[`${currentPlayer.username}`].isReady) {
          setReady(true);
          setAlreadySent(true);
        }     
      }*/
      if (messageReceived.gameState === "NIGHT") {
        navigate("/nightaction");
      } else if (messageReceived.gameState === "ENDGAME"){
        navigate("/end");
      }
    }
  }, [messageReceived]);

  const doSendReady = () => {
    setReady(true);
    setAlreadySent(true);
  }

  //variables needed for TexttoSpeechAPI
  const [data, setData] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [playPressed, setPlayPressed] = useState(false);  // State to track if Playbutton has been pressed
  const [dataNotFetched, setDataNotFetched] = useState(true);

  
  useEffect(() => {
    if(hostName) {
      if (username === hostName && dataNotFetched) {  
        //const PartOneText = TextSamplesRevealNightpre[Math.floor(Math.random() * textSamples.length)];  
        //const PartTwoText = TextSamplesRevealNightpost[Math.floor(Math.random() * textSamples.length)];  
        //if(killedPlayer) {
        //  const individualText = concat(killedPlayer.username," has been killed during the Night");
        //}
        //else {
        //  const individual = "nobody has been killed during the night"}
        const preNightNarrations = textSamples.PreNightNarration;
        const selectedText = textSamples.PreNightNarration[Math.floor(Math.random() * textSamples.PreNightNarration.length)]
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
              "text": selectedText
            },
            "voice": {
              "languageCode": "en-US",
              "name": "en-US-Studio-Q"
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
        }
        fetchData();
        setDataNotFetched(false);
      } 
    } 
  }, [hostName])
  
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
    setPlayPressed(true);  // Marks that the play button has been pressed
    console.log("File has been decoded and AudioURL has been set")
    
  };

  return (
    <div className="PreNight total-background">
      <BaseContainer>
        <div className="PreNight background-container">
          <div className="PreNight container">
            <div className="PreNight header">Night has Fallen...</div>
            <div className="nightReveal container">
              <div className="nightReveal wait">Listen to the Narrator on the Hosts Device...</div>
              <Spinner />
            </div>
            <div className="PreNight button-container">
              {username === hostName && 
                <Button
                  width="100%"
                  height="40px"
                  onClick={() => doSendReady()}
                  disabled={!playPressed}  // Disable OK button until audio is played
                >Ok
                </Button>
              }
              {username === hostName && !dataNotFetched &&
                <Button
                  width="100%"
                  height="40px"
                  onClick={DecodeAndPlay}
                >Press to Play
                </Button>
              }
              {audioUrl && (
                <audio controls src={audioUrl} autoPlay />
              )}
            </div>
          </div>
        </div>
      </BaseContainer>
    </div>
  );
};

export default PreNight;
