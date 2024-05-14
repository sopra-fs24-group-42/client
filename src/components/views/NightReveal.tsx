import React, { useState, useEffect } from "react";
import SockJS from "sockjs-client";
import { over } from "stompjs";
import { getDomain } from "../../helpers/getDomain";
import { api, handleError } from "helpers/api";
import { Spinner } from "components/ui/Spinner";
import {useNavigate, useLocation} from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/NightReveal.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import { User } from "types";
import TextSamplesRevealNightpre from "helpers/TextSamples/TextSamplesRevealNightpre";
import TextSamplesRevealNightpost from "helpers/TextSamples/TextSamplesRevealNightpost";

const NightReveal = () => {
  // variables needed for establishing websocket connection
  const baseURL = getDomain();
  const navigate = useNavigate();

  localStorage.removeItem("selected");

  var connection = false;
  var stompClient = null;
  var subscription = null;
  
  // variables needed for role reveal
  const [messageReceived, setMessageReceived] = useState(null);
  const [killedPlayers, setKilledPlayers] = useState([]);
  const username = localStorage.getItem("user"); //fetching username from localstorage
  const [ready, setReady] = useState(false);
  const [alreadySent, setAlreadySent] = useState(false);
  const [hostName, setHostName] = useState(null);
  let gameState = "REVEALNIGHT";

  const lobbyId = localStorage.getItem("lobbyId");

  const findKilledPlayers = () => {
    console.log("Inside findKilledPlayers");
    let foundPlayers = [];
    for (let i = 0; i < messageReceived.players.length; i++) { // iterating through list of players to check their isKilled field
      let currentPlayer = messageReceived.players[i];
      if (messageReceived.playerMap[currentPlayer.username].isKilled) { // Check if the current player was marked as killed
        foundPlayers.push(currentPlayer); // Correctly pushing currentPlayer into the foundPlayers array
      }
    }
    setKilledPlayers(foundPlayers); // Update the state with the list of killed players
    foundPlayers.forEach(player => {
      if (username === player.username) {
        navigate("/deadscreen", { state: player }); // Navigate to deadscreen if the current user is one of the killed players
      }
    });
  }

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
      findKilledPlayers();
      setHostName(messageReceived.hostName);
      if (messageReceived.gameState === "DISCUSSION") { // happens after ready was sent by all
        navigate("/discussion");
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
      findKilledPlayers();
      setHostName(messageReceived.hostName);
      if (messageReceived.gameState === "DISCUSSION") {
        navigate("/discussion");
      } else if (messageReceived.gameState === "ENDGAME"){
        navigate("/end");
      }
    }
  }, [messageReceived]);

  const doSendReady = () => {
    setReady(true);
    setAlreadySent(true);
  }

  let content = <Spinner />;
  if (messageReceived !== null) {
    if (killedPlayers.length > 0) {
      content = (
        <div>
          {killedPlayers.map((player, index) => ( // Ensure index is correctly used here
            <div
              key={player.username}
              className="nightAction highlight"
              style={{ marginBottom: index !== killedPlayers.length - 1 ? "20px" : "0" }}
            >
              {player.username}, a {player.roleName} was killed!
            </div>
          ))}
        </div>
      );
      /*
        <div className="nightAction highlight">
          {killedPlayers.map(player => (
            <div key={player.username} className="killedPlayer">
              {player.username}, a {player.roleName} was killed!
            </div>
          ))}
        </div>
      );
      */

    } else {
      content = (
        <div className="nightAction highlight">
          Everyone survived last night!
        </div>
      );
    }
  }
  //variables needed for TexttoSpeechAPI
  const [data, setData] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [playPressed, setPlayPressed] = useState(false);  // State to track if Playbutton has been pressed

  
  useEffect(() => {
    if(hostName) {
      if (username === hostName) {  
        //const PartOneText = TextSamplesRevealNightpre[Math.floor(Math.random() * textSamples.length)];  
        //const PartTwoText = TextSamplesRevealNightpost[Math.floor(Math.random() * textSamples.length)];  
        //if(killedPlayer) {
        //  const individualText = concat(killedPlayer.username," has been killed during the Night");
        //}
        //else {
        //  const individual = "nobody has been killed during the night"}
        const RevealNightPre = textSamples.RevealNightPre;
        const RevealNightPost = textSamples.RevealNightPost;

        /*logic to differentiat between the number of killed players and making the text for the 
        API dynamical and integrating username aswell as Role into the API Call. The maximum amount
        of players that can die during a night is with standard gamerules 3. However, if the host 
        chooses to have more than 1 sacrifice potentially unlimited number of players could die in 
        one night. therefore the logic supports unlimited killed players
        */

        if (killedPlayers.length === 0) {
          const RevealNightMid = textSamples.RevealVotingSurvival;

        } else if (foundPlayers.length === 1) {
          const player = foundPlayers[0];
          const RevealNightMid = `${player.username} a ${player.roleName} has been killed last night.`;
          console.log(RevealNightMid); 
        } else {
          const RevealNightMid = "";
          for (let i = 0; i < foundPlayers.length -1; i++) {
            const player = foundPlayers[i];
            RevealNightMid += `${player.username} a ${player.roleName}, `;
          } 
          player = foundPlayers[foundPlayers.length - 1];
          RevealNightMid += `$and {player.username} a ${player.roleName} have been killed.`
        }
           

        const selectedText = RevealNightPre + " " + RevealNightPost + " " + RevealNightMid;
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
        }
        fetchData();
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
    <BaseContainer>
      <div className ="nightReveal background-container">
        <div className="nightReveal container">
          <div className="nightReveal header">Dawn has broken...</div>
          {content}
          {(() => {
            if (!ready) {
              return (
                <div className="nightReveal button-container">
                  {username !== hostName &&
                  <Button
                    width="100%"
                    height="40px"
                    onClick={() => doSendReady()}
                  >Ok
                  </Button>
                  }
                  {username === hostName &&
                  <Button
                    width="100%"
                    height="40px"
                    onClick={() => doSendReady()}
                    disabled={!playPressed}  // Disable OK button until audio is played
                  >Ok
                  </Button>
                  }
                  { username === hostName &&
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
              );
            } else {
              return (
                <div className="nightReveal container">
                  <div className="nightReveal wait">Waiting for other players...</div>
                  <Spinner />
                </div>
              );
            }
          })()}
        </div>
      </div>
    </BaseContainer>
  );
};

export default NightReveal;
