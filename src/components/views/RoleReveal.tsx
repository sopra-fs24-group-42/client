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
  console.log("I AM ON PAGE ROLE REVEAL NOW");

  // variables needed for establishing websocket connection
  const baseURL = getDomain();
  const navigate = useNavigate();
  const role = useLocation().state; //this is the player's role
  console.log(role);

  let connection = false;
  var stompClient = null;
  var subscription = null;

  // variables needed for dynamic rendering of waitingRoom
  const [messageReceived, setMessageReceived] = useState(null);
  const [hostName, setHostName] = useState(null);
  //const [disconnected, setDisconnected] = useState(false);

  // variables needed for UI
  const werewolfText = "Werewolf";
  const werewolfImage = "roleReveal werewolf";
  const werewolfInstructions = "As a werewolf, your goal is to kill\n everyone without them realizing it's you!";
  const villagerText = "Villager";
  const villagerImage = "roleReveal villager";
  const villagerInstructions = "As a villager, your goal is to survive and identify the werewolves!";
  const seerText = "Seer";
  const seerImage = "roleReveal seer";
  const seerInstructions = "As a seer, you can choose to see a player's role during the night.";
  let displayText = "";
  let displayImage = "";
  let displayInstructions = "";
  
  // variables needed for conditional button display
  const lobbyId = localStorage.getItem("lobbyId");
  const user = localStorage.getItem("user");

  const connect = async () => {
    return new Promise((resolve, reject) => {
      var socket = new SockJS(baseURL+"/game"); // creating a new SockJS object (essentially a websocket object)
      stompClient = over(socket); // specifying that it's a special type of websocket connection (i.e. using sockJS)
      stompClient.connect({}, function (frame) { // connecting to server websocket: instructions inside "function" will only be executed once we get something (i.e. a connect frame back from the server). Parameter "frame" is what we get from the server. 
        console.log("socket was successfully connected: " + frame);
        setTimeout( function() {// "function" will be executed after the delay (i.e. subscribe is called because we call connect with a function as argument e.g. see createGame.tsx)
          //const response = await callback();
          console.log("I waited: I received  MESSAGE frame back based on subscribing!!");
          resolve(stompClient);
        }, 500);
      });
      stompClient.onclose = reason => {
        console.log("Socket was closed, Reason: " + reason);
        reject(reason);}
    });
  };

  const subscribe = async (destination) => { 
    return new Promise( (resolve, reject) => {
      subscription = stompClient.subscribe(destination, async function(message) { 
        console.log("I AM STILL SUBSCRIBED AND RECEIVED A MESSAGE");
        // all of this only gets executed when message is received
        console.log("this is the message: " + JSON.stringify(message));
        //localStorage.setItem("lobby", message.body);
        setMessageReceived(JSON.parse(message.body));
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
          //stompClient.send(`/topic/lobby/${lobbyId}`, headers, body);     
        } catch (error) {
          console.error("There was an error connecting or subscribing: ", error);
        }
      };
      connectAndSubscribe();
    }
    if (messageReceived) {
      console.log("I received a MESSAGE AGAIN!");
    }

    return () => {
      if(subscription) {
        subscription.unsubscribe();
      }
      if(stompClient) {
        stompClient.disconnect();
      }
    }
  }, []);

  useEffect(() => { // This useEffect tracks changes in the lobby --> do I need this for roleReveal??
    console.log("I am in Role reveal useEffect now!");
    if (messageReceived && messageReceived.players) {
    }
  }, [messageReceived]); //disconnected===true is a WIP: hoping this will update the lobby view to show that a user dropped out.

  const doSendMessageToServer = () => {
    const headers = {
      "Content-type": "application/json"
    };
    const body = JSON.stringify({lobbyId});
    try{
      stompClient.send(`/topic/lobby/${lobbyId}`, headers, body);
      console.log("message sent!");
    } catch (e) {
      console.log("Something went wrong while sending a message to the server :/ " + e);
    }
  }

  let content = <Spinner />;
  if (role === "Werewolf") {
    displayText = werewolfText;
    content = <div className="roleReveal werewolf"></div>
    displayInstructions = werewolfInstructions;
  }
  else if (role === "seer") {
    displayText = seerText;
    content = <div className="roleReveal seer"></div>
    displayInstructions = seerInstructions;
  }
  else if (role === "villager") {
    displayText = villagerText;
    content = <div className="roleReveal villager"></div>
    displayInstructions = villagerInstructions;
  }

  return (
    <BaseContainer>
      <div className= "roleReveal header1">Shhhh! Keep this a secret. 
        <div className= "roleReveal header2" >Your role is...</div>
      </div>
      <div className= "roleReveal container">
        <div className= "roleReveal highlight" >{displayText}</div>
        <div className= "roleReveal instructions" >{displayInstructions}</div>
        <div className="roleReveal button-container">
          <Button
            width="100%"
            height="40px"
            onClick={()=> doSendMessageToServer()}
          >
            Ok, got it!
          </Button>
        </div>
      </div>
    </BaseContainer>
  );
};

export default RoleReveal;
