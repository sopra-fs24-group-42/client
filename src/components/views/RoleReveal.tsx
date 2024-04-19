import React, { useState, useEffect } from "react";
import SockJS from "sockjs-client";
import { over } from "stompjs";
import { getDomain } from "../../helpers/getDomain";
import { api, handleError } from "helpers/api";
import { Spinner } from "components/ui/Spinner";
import {useNavigate, useLocation} from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/WaitingRoom.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import { User } from "types";


const RoleReveal = () => {
  console.log("I AM ON PAGE ROLE REVEAL NOW");

  // variables needed for establishing websocket connection
  const baseURL = getDomain();
  const navigate = useNavigate();
  var stompClient = null;

  // variables needed for dynamic rendering of waitingRoom
  const [messageReceived, setMessageReceived] = useState(null);
  const [numberOfPlayers, setNumberOfPlayers] = useState(0);
  const [hostName, setHostName] = useState(null);
  const [disconnected, setDisconnected] = useState(false);

  // variables needed for UI
  const waitingHeading = "Waiting for all players to join...";
  const readyHeading = `Everyone's here! ${hostName}, start the game.`;
  const lobbyCode = localStorage.getItem("lobbyCode"); // need this to display at the top of the waitingRoom
  
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
        setDisconnected(true);
        console.log("Socket was closed, Reason: " + reason);
        reject(reason);}
    });
  };

  const subscribe = async (destination) => { 
    return new Promise( (resolve, reject) => {
      stompClient.subscribe(destination, async function(message) { 
        console.log("I AM STILL SUBSCRIBED AND RECEIVED A MESSAGE");
        // all of this only gets executed when message is received
        console.log("this is the message: " + JSON.stringify(message));
        //localStorage.setItem("lobby", message.body);
        setMessageReceived(JSON.parse(message.body));
        resolve(JSON.parse(message.body));
      });
    }); 
  }

  useEffect(() => { // This is executed once upon mounting of waitingRoom --> establishes ws connection & subscribes
    //if(!connection) { 
    //const connectAndSubscribe = async () => { 
    //try {
    //await connect();
    //await subscribe(`/topic/lobby/${lobbyId}`);      
    //} catch (error) {
    //console.error("There was an error connecting or subscribing: ", error);
    //}
    //};
    //connectAndSubscribe();}

    if (messageReceived && messageReceived.players) {
      console.log("I received a MESSAGE AGAIN!")
    }
  }, []);

  useEffect(() => { // This useEffect tracks changes in the lobby
    console.log("I am in Role reveal useEffect now!");
    if (messageReceived && messageReceived.players) {
      // TODO: include if statement here that checks if the role field of the user (i.e. the user that is you, not the one who joined) is null or not
      // and if not, then navigate to roleReveal and pass role as props.
      // Also, might have to unsubscribe at this point here as well (depends on if I can (re)subscribe multiple times w/o consequences and always trigger broadcast or not!)
      // if(messageReceived.players.${user}.role !== null) {navigate("/rolereveal", {state: messageReceived.players.${user}.role});}
    }
  }, [messageReceived, disconnected===true]); //disconnected===true is a WIP: hoping this will update the lobby view to show that a user dropped out.

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

  const doTest = () => {
    navigate("/rolereveal");
  }


  return (
    <BaseContainer>
      <div className= "waitingRoom header">This is the role reveal page 
        <div className= "waitingRoom highlight">Under construction!
        </div>
      </div>
      <div className= "waitingRoom container">
        <div className="waitingRoom button-container">
          <Button
            width="100%"
            height="40px"
            onClick={() => doSendMessageToServer()}
          >
            Test Send Message to Server
          </Button>
        </div>
      </div>
    </BaseContainer>
  );
};

export default RoleReveal;
