import React, { useState, useEffect } from "react";
import SockJS from "sockjs-client";
import { over } from "stompjs";
import { getDomain } from "../../helpers/getDomain";
import { Spinner } from "components/ui/Spinner";
import {useNavigate, useLocation} from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/VotingReveal.scss";
import BaseContainer from "components/ui/BaseContainer";
import { Table, TableData } from "@mantine/core"; // TODO: implement detailed 
import textSamples from "helpers/TextSamples/TextSamples.json";

const VotingReveal = () => {
  localStorage.removeItem("selected");

  // variables needed for establishing websocket connection
  const baseURL = getDomain();
  const navigate = useNavigate();

  var connection = false;
  var stompClient = null;
  var subscription = null;

  // variables needed for role reveal
  const [messageReceived, setMessageReceived] = useState(null);
  var votedPlayer = null;
  var firstVotedPlayer = null;
  var secondVotedPlayer = null;
  var thirdVotedPlayer = null;
  var sortedPlayersByVotes = [];
  const username = localStorage.getItem("user"); //fetching username from localstorage
  const [ready, setReady] = useState(false);
  let gameState = "REVEALVOTING";
  const [alreadySent, setAlreadySent] = useState(false);

  const lobbyId = localStorage.getItem("lobbyId");

  //variables needed for TexttoSpeechAPI
  const [data, setData] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [playPressed, setPlayPressed] = useState(false);  // State to track if Playbutton has been pressed
  const [hostName, setHostName] = useState(null); //required so that the APIcall gets only made by the host and only the host can play the sound
  const [dataNotFetched, setDataNotFetched] = useState(true);

  const findVotedPlayer = () => {
    for(let i=0; i<messageReceived.players.length; i++) { // iterating through list of players to check their isKilled field
      let currentPlayer = messageReceived.players[i];
      if(messageReceived.playerMap[`${currentPlayer.username}`].isKilled) {
        votedPlayer = currentPlayer;
      }
    }
    if(votedPlayer) { //re-routing the voted out player to /deadscreen
      if (username === votedPlayer.username) {
        navigate("/deadscreen", {state: votedPlayer});
      }
    }
    let playersCopy = messageReceived.players
    playersCopy.sort((a,b) => a.numberOfvotes - b.numberOfVotes); //sorting players according to number of votes in desc order
    firstVotedPlayer = playersCopy[0];
    secondVotedPlayer = playersCopy[1];
    thirdVotedPlayer = playersCopy[2];
  }

  const connect = async () => {
    return new Promise((resolve, reject) => {
      const socket = new SockJS(baseURL+"/game"); // creating a new SockJS object (essentially a websocket object)
      stompClient = over(socket); // specifying that it's a special type of websocket connection (i.e. using sockJS)
      stompClient.connect({}, function (frame) { // connecting to server websocket: instructions inside "function" will only be executed once we get something (i.e. a connect frame back from the server). Parameter "frame" is what we get from the server.
        connection = true;
        setTimeout( function() {// "function" will be executed after the delay (i.e. subscribe is called because we call connect with a function as argument e.g. see createGame.tsx)
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
        // all of this only gets executed when message is received
        setMessageReceived(JSON.parse(message.body));
        setHostName(JSON.parse(message.body).hostName);
        resolve(subscription);
      });
    });
  }

  useEffect(() => { // This is executed once upon mounting of roleReveal --> establishes ws connection & subscribes
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

    if (messageReceived) {
      setHostName(messageReceived.hostName);
      if (messageReceived.gameState === "PRENIGHT") { // happens after ready was sent by all
        navigate("/prenight");
      } else if (messageReceived.gameState === "ENDGAME") {
        navigate("/end");
      }
    }

    return () => {
      const headers = {
        "Content-type": "application/json"
      };
      const body = JSON.stringify({username, gameState});
      try{
        if(!alreadySent) {
          stompClient.send("/app/ready", headers, body);}
      } catch (e) {
        console.log("Something went wrong starting the game :/");
      }
    }

  }, [ready]);

  useEffect(() => { // This useEffect tracks changes in the lobby --> do I need this for roleReveal?
    if (messageReceived) {
      setHostName(messageReceived.hostName);
      if (messageReceived.gameState === "PRENIGHT") {
        navigate("/prenight");
      } else if (messageReceived.gameState === "ENDGAME") {
        navigate("/end");
      }
    }
  }, [messageReceived]);

  const doSendReady = () => {
    setReady(true);
    setAlreadySent(true);
  }

  let content = <Spinner />; // fetching data
  if(messageReceived !== null) {
    findVotedPlayer();
    // attempt to use table from Mantine....
    // const tableData: TableData = {
    //   head: ['Player', 'Number of Votes'],
    //   body: [
    //     [firstVotedPlayer.username, firstVotedPlayer.numberOfVotes],
    //     [secondVotedPlayer.username, secondVotedPlayer.numberOfVotes],
    //     [thirdVotedPlayer.username, thirdVotedPlayer.numberOfVotes],
    //   ],
    // };
    let details = (
      // <div>
      // <Table data={tableData} />
      // </div>
      <div className="votingReveal container">
        <div className="votingReveal details-container">
          <div className="votingReveal details-heading">Detailed results:</div>
          <div className="votingReveal heading">
            <div className="votingReveal heading">{firstVotedPlayer.username} received {firstVotedPlayer.numberOfVotes} votes<br></br></div>
          </div>
          <div className="votingReveal heading">
            <div className="votingReveal heading">{secondVotedPlayer.username} received {secondVotedPlayer.numberOfVotes} votes<br></br></div>
          </div>
          <div className="votingReveal heading">
            <div className="votingReveal heading">{thirdVotedPlayer.username} received {thirdVotedPlayer.numberOfVotes} votes<br></br></div>
          </div>
        </div>
      </div>
    )
    if(!votedPlayer) { // i.e. there was at least one tie (no one gets voted out)
      content = (
        <div className="votingReveal container">
          <div className="votingReveal header"> There was a tie...</div>
          <div className="votingReveal highlight">No one was voted out!</div>
          {details}
        </div>
      )
    } else { // there was no tie: a player was voted out
      if(votedPlayer.roleName === "Seer") {
        content = (
          <div className = "votingReveal container">
            <div className = "votingReveal seer"></div>
            <div className = "votingReveal header">{votedPlayer.username}, <br></br> a
              <div className = "votingReveal highlight">{votedPlayer.roleName}</div></div>
            <div className = "votingReveal header">was voted out!</div>
            {details}
          </div>)
      } else if (votedPlayer.roleName === "Villager") {
        content = (
          <div className = "votingReveal container">
            <div className = "votingReveal villager"></div>
            <div className = "votingReveal header">{votedPlayer.username}, <br></br> a</div>
            <div className = "votingReveal highlight">{votedPlayer.roleName}</div>
            <div className = "votingReveal header">was voted out!</div>
            {details}
          </div>)
      } else if (votedPlayer.roleName === "Werewolf") {
        content = (
          <div className = "votingReveal container">
            <div className = "votingReveal werewolf"></div>
            <div className = "votingReveal header">{votedPlayer.username}, <br></br> a</div>
            <div className = "votingReveal highlight">{votedPlayer.roleName}</div>
            <div className = "votingReveal header">was voted out!</div>
            {details}
          </div>)
      } else if (votedPlayer.roleName === "Protector") {
        content = (
          <div className = "votingReveal container">
            <div className = "votingReveal protector"></div>
            <div className = "votingReveal header">{votedPlayer.username}, <br></br> a</div>
            <div className = "votingReveal highlight">{votedPlayer.roleName}</div>
            <div className = "votingReveal header">was voted out!</div>
            {details}
          </div>)
      } else if (votedPlayer.roleName === "Sacrifice") {
        content = (
          <div className = "votingReveal container">
            <div className = "votingReveal sacrifice"></div>
            <div className = "votingReveal header">{votedPlayer.username}, <br></br> a</div>
            <div className = "votingReveal highlight">{votedPlayer.roleName}</div>
            <div className = "votingReveal header">was voted out!</div>
            {details}
          </div>)
      }
    }
  }

  useEffect(() => {
    if(hostName) {
      if (username === hostName && dataNotFetched) {
        console.log("Entered the API Useffect")   
        const RevealVotingPre = textSamples.RevealVotingPre[Math.floor(Math.random() * textSamples.RevealVotingPre.length)];
        const RevealVotingPost = textSamples.RevealVotingPost[Math.floor(Math.random() * textSamples.RevealVotingPost.length)];
        /*logic to differentiat between the cases if one or no players have been voted out so that 
        the username aswell as Role can be integrated into the API Call. The maximum amount
        of players that can be voted out is 1. 
        */
        let RevealVotingMid;
        if (votedPlayer) {
          RevealVotingMid = `${votedPlayer.username} <break time=\"500ms\"/>  a ${votedPlayer.roleName}, was selected by the Village`;
        }
        else {
          RevealVotingMid = "Noone was chosen to die.";
        }

        const selectedText = "<speak>" + RevealVotingPre + " " + "<break time=\"1s\"/> " + RevealVotingMid + " " + "<break time=\"2s\"/> " + RevealVotingPost + "</speak>";
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
              "ssml": selectedText
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
  }, [hostName, votedPlayer])

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
      <div className="votingReveal background-container">
        <div className="votingReveal header">The votes have been counted!</div>
        {content}
        {(() => {
          if (!ready) {
            return (
              <div className="votingReveal button-container">
                {username !== hostName &&
                <Button
                  width="100%"
                  height="40px"
                  onClick={() => doSendReady()}
                >
                  Ok, got it!
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
              <div className="votingReveal container">
                <div className="votingReveal wait">Waiting for other players...</div>
                <Spinner />
              </div>
            );
          }
        })()}
      </div>
    </BaseContainer>
  );
};

export default VotingReveal;
