import React, { useState, useEffect } from "react";
import SockJS from "sockjs-client";
import { over } from "stompjs";
import { getDomain } from "../../helpers/getDomain";
import { api, handleError } from "helpers/api";
import { Spinner } from "components/ui/Spinner";
import {useNavigate, useLocation} from "react-router-dom";
import { Button } from "components/ui/Button";
import BaseContainer from "components/ui/BaseContainer";
import "styles/views/NightAction.scss";
import PropTypes from "prop-types";
import { User } from "types";

const End = () => {
  // variables needed for establishing websocket connection
  var connection = false;

  const baseURL = getDomain();
  var stompClient = null;
  var subscription = null;
  const gameState = "ENDGAME";
  
  const navigate = useNavigate();

  localStorage.removeItem("role");

  const [messageReceived, setMessageReceived] = useState(null);
  const [winningTeam, setWinningTeam] = useState(null);

  const [ready, setReady] = useState(false);
  const [alreadySent, setAlreadySent] = useState(false);

  // variables needed for UI  
  const lobbyId = localStorage.getItem("lobbyId");
  const username = localStorage.getItem("user");

  const connect = async () => {
    return new Promise((resolve, reject) => {
      const socket = new SockJS(baseURL+"/game"); // creating a new SockJS object (essentially a websocket object)
      //const client = over(socket); // specifying that it's a special type of websocket connection (i.e. using sockJS)
      stompClient = over(socket); // specifying that it's a special type of websocket connection (i.e. using sockJS)
      stompClient.connect({}, function (frame) { // connecting to server websocket: instructions inside "function" will only be executed once we get something (i.e. a connect frame back from the server). Parameter "frame" is what we get from the server. 
        console.log("socket was successfully connected: " + frame);
        connection = true;
        //connection = true;
        setTimeout(function() {// "function" will be executed after the delay (i.e. subscribe is called because we call connect with a function as argument e.g. see createGame.tsx)
          //const response = await callback();
          console.log("I waited: I received  MESSAGE frame back based on subscribing!!");
          resolve(stompClient);
        }, 500);
      });
      stompClient.onclose = reason => {
        connection = false;
        console.log("Socket was closed, Reason: " + reason);
        reject(reason);}
    });
  };

  const subscribe = async (destination) => { 
    return new Promise( (resolve, reject) => {
      //stompClient.subscribe(destination, async function(message) {
      subscription = stompClient.subscribe(destination, async function(message) { 
        console.log("Subscription: " + JSON.stringify(subscription));
        // all of this only gets executed when message is received
        console.log("MESSAGE IN SUBSCRIBE: " + JSON.stringify(message));
        //localStorage.setItem("lobby", message.body);
        setMessageReceived(JSON.parse(message.body));
        resolve(subscription);
      });
    }); 
  }

  useEffect(() => { // This is executed once upon mounting of waitingRoom --> establishes ws connection & subscribes
    //if(!connection) { 
    const connectAndSubscribe = async () => { 
      try {
        await connect();
        subscription = await subscribe(`/topic/lobby/${lobbyId}`);     
      } catch (error) {
        console.error("There was an error connecting or subscribing: ", error);
      }
    };
    connectAndSubscribe();

    if (messageReceived) {
      if (messageReceived.gameState === "WAITINGROOM") {
        navigate("/waitingroom");}
      setWinningTeam(messageReceived.winnerSide);
    }

    return () => {
      const headers = {
        "Content-type": "application/json"
      };
      try {
        if(!alreadySent) { // to avoid SEND frames being sent doubled
          stompClient.send("/app/ready", headers, JSON.stringify({username, gameState}));
        }
      } catch (e) {
        console.log("Something went wrong sending information: " + e);
      }
    }
  }, [ready, connection]);

  useEffect(() => { // This useEffect tracks changes in the lobby
    if (messageReceived) {
      if (messageReceived.gameState === "WAITINGROOM") {
        navigate("/waitingroom");}
      setWinningTeam(messageReceived.winnerSide);
    }
  }, [messageReceived]); 

  const doSendReady = () => {
    setReady(true);
    setAlreadySent(true);
  }

  let content = <Spinner />;

  if (messageReceived !== null) {
    content = (
      <div className="nightAction highlight">The {winningTeam} won!</div>
    );}

  return (
    <BaseContainer>
      <div className= "nightAction header">The game has ended!</div>
      {(() => {
        if(!ready) {
          return (
            <div className = "nightAction container">
              {content}
              <Button
                width="100%"
                height="40px"
                onClick={() => doSendReady()}
              >Ok
              </Button>
            </div>
          )
        }    
        else { 
          return (
            {content})}
      })()}
    </BaseContainer>
  );
};

export default End;
