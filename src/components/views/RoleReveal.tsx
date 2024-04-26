import React, { useState, useEffect } from "react";
import SockJS from "sockjs-client";
import { over } from "stompjs";
import { getDomain } from "../../helpers/getDomain";
import { api, handleError } from "helpers/api";
import { Spinner } from "components/ui/Spinner";
import {useNavigate, useLocation} from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/RoleReveal.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import { User } from "types";

const RoleReveal = () => {

  // variables needed for establishing websocket connection
  const baseURL = getDomain();
  const navigate = useNavigate();

  const [connection, setConnection] = useState(false);
  var stompClient = null;
  var subscription = null;
  
  // variables needed for role reveal
  const [messageReceived, setMessageReceived] = useState(null);
  const username = localStorage.getItem("user");
  const [role, setRole] = useState(null); 
  const [ready, setReady] = useState(false);
  const [alreadySent, setAlreadySent] = useState(false);
  let gameState = "WAITINGROOM";

  localStorage.removeItem("role");

  // variables needed for UI
  // TODO: Move text variables to another file so it's not so cluttered here
  const werewolfText = "Werewolf";
  const werewolfImage = "roleReveal werewolf";
  const werewolfInstructions = "As a werewolf, your goal is to kill\n everyone without them realizing it's you!";
  const villagerText = "Villager";
  const villagerImage = "roleReveal villager";
  const villagerInstructions = "As a villager, your goal is to survive and identify the werewolves!";
  const seerText = "Seer";
  const seerImage = "roleReveal seer";
  const seerInstructions = "As a seer, you can choose to see a player's role during the night.";
  let displayImage = "";
  let displayText = "";

  const lobbyId = localStorage.getItem("lobbyId");

  const connect = async () => {
    return new Promise((resolve, reject) => {
      const socket = new SockJS(baseURL+"/game"); // creating a new SockJS object (essentially a websocket object)
      stompClient = over(socket); // specifying that it's a special type of websocket connection (i.e. using sockJS)
      stompClient.connect({}, function (frame) { // connecting to server websocket: instructions inside "function" will only be executed once we get something (i.e. a connect frame back from the server). Parameter "frame" is what we get from the server. 
        console.log("socket was successfully connected: " + frame);
        setConnection(true);
        setTimeout( function() {// "function" will be executed after the delay (i.e. subscribe is called because we call connect with a function as argument e.g. see createGame.tsx)
          //const response = await callback();
          console.log("I waited: I received  MESSAGE frame back based on subscribing!!");
          resolve(stompClient);
        }, 500);
      });
      stompClient.onclose = reason => {
        console.log("Socket was closed, Reason: " + reason);
        setConnection(false);
        reject(reason);}
    });
  };

  const subscribe = async (destination) => { 
    return new Promise( (resolve, reject) => {
      subscription = stompClient.subscribe(destination, async function(message) { 
        // all of this only gets executed when message is received
        //localStorage.setItem("lobby", message.body);
        setMessageReceived(JSON.parse(message.body));
        setRole(JSON.parse(message.body).playerMap[`${username}`].roleName);
        resolve(subscription);
      });
    }); 
  }

  useEffect(() => { // This is executed once upon mounting of roleReveal --> establishes ws connection & subscribes
    //if(!connection) { 
    const connectAndSubscribe = async () => { 
      try {
        await connect();
        subscription = await subscribe(`/topic/lobby/${lobbyId}`);
        //stompClient.send(`/topic/lobby/${lobbyId}`, headers, body);
      } catch (error) {
        console.error("There was an error connecting or subscribing: ", error);
      }
    };
    setTimeout(function() {// "function" will be executed after the delay (i.e. subscribe is called because we call connect with a function as argument e.g. see createGame.tsx)
      connectAndSubscribe();}, 600);
    if (messageReceived) {
      console.log("GAME STATE: " + messageReceived.gameState);
      if (messageReceived.gameState === "NIGHT") {
        localStorage.setItem("role", role);
        navigate("/nightaction");
      }
      setRole(messageReceived.playerMap[`${username}`].roleName);
    }

    return () => {
      try{
        const headers = {
          "Content-type": "application/json"
        };
        const body = JSON.stringify({username, gameState});
        // Again, this does not work here. For some reason StompClient becomes null. 
        if(!alreadySent){
          stompClient.send("/app/ready", headers, body);
          setAlreadySent(true);}
      } catch (e) {
        console.log("Something went wrong while sending a message to the server :/ " + e);
      }
    }

  }, [ready]);

  useEffect(() => { // This useEffect tracks changes in the lobby --> do I need this for roleReveal?
    console.log("I am in Role reveal useEffect now!");
    if (messageReceived && messageReceived.players) {
      console.log("GAME STATE: " + messageReceived.gameState);
      if (messageReceived.gameState === "NIGHT") {
        localStorage.setItem("role", role);
        navigate("/nightaction");
      }
      setRole(messageReceived.playerMap[`${username}`].roleName);
      console.log(role);
    }
  }, [messageReceived]); 

  const doSendReady = () => {
    setReady(true);
  }

  let displayInstructions = <Spinner />;
  if (role === "Werewolf") {
    displayText = werewolfText;
    displayInstructions = werewolfInstructions;
    displayImage = (
      <div className="roleReveal werewolf"></div>)
  }
  else if (role === "Seer") {
    displayText = seerText;
    displayInstructions = seerInstructions;
    displayImage = (
      <div className="roleReveal seer"></div>)
  }
  else if (role === "Villager") {
    displayText = villagerText;
    displayInstructions = villagerInstructions;
    displayImage = (
      <div className="roleReveal villager"></div>)
  }

  return (
    <BaseContainer>
      <div className= "roleReveal header1">Shhhh! Keep this a secret. 
        <div className= "roleReveal header2" >Your role is...</div>
      </div>
      <div className= "roleReveal container">
        {displayImage}
        <div className= "roleReveal highlight" >{displayText}</div>
        <div className= "roleReveal instructions" >{displayInstructions}</div>
        <div className="roleReveal button-container">
          { ready ?
            <div className= "roleReveal header3">
            Waiting until all players are ready...</div> :
            <Button
              width="100%"
              height="40px"
              onClick={()=> doSendReady()}
            >
              Ok, got it!
            </Button>} 
        </div>
      </div>
    </BaseContainer>
  );
};

export default RoleReveal;
