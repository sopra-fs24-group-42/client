import React, { useState, useEffect } from "react";
import SockJS from "sockjs-client";
import { over } from "stompjs";
import { getDomain } from "../../helpers/getDomain";
import { Spinner } from "components/ui/Spinner";
import {useNavigate, useLocation} from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/DeadPlayer.scss";
import BaseContainer from "components/ui/BaseContainer";

const DeadScreen = () => {

  // variables needed for establishing websocket connection
  const baseURL = getDomain();
  const navigate = useNavigate();

  var connection = false;
  var stompClient = null;
  var subscription = null;
  
  // variables needed for role reveal
  const [messageReceived, setMessageReceived] = useState(null);
  var deadPlayer = useLocation().state;
  console.log("dead player: " + deadPlayer.username);
  const username = localStorage.getItem("user"); //fetching username from localstorage
  const [ready, setReady] = useState(false);
  const [alreadySent, setAlreadySent] = useState(false);
  let gameState = "ENDGAME";

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
          //stompClient.send("/app/ready", headers, body);
          setAlreadySent(true);}
      } catch (e) {
        console.log("Something went wrong starting the game :/");
      }
    }

  }, [ready]);

  useEffect(() => { // This useEffect tracks changes in the lobby --> do I need this for roleReveal?
    console.log("I am in Role reveal useEffect now!");
    if (messageReceived) {
      if (messageReceived.gameState === "ENDGAME") {
        navigate("/end");} 
    }
  }, [messageReceived]); 

  return (
    <BaseContainer>
      <div className="deadPlayer background-container">
        <div className="deadPlayer header">{deadPlayer.username}, <br></br> the game ends here for you...</div>
        {(() => {
          if (deadPlayer.numberOfVotes !== 0) { // you were voted out
            return (
              <div className="deadPlayer container">
                <div className = "deadPlayer votedOut"></div>
                <div className="deadPlayer header">You were</div>
                <div className = "deadPlayer highlight">voted out!</div>
              </div>
            );
          } else { // you were killed
            return (
              <div className="deadPlayer container">
                <div className="deadPlayer rip"></div>
                <div className="deadPlayer header">You were</div>
                <div className = "deadPlayer highlight">killed!</div>
              </div>
            );
          }
        })()}
      </div>
    </BaseContainer>
  );
};

export default DeadScreen;
