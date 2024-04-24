import React, { useState, useEffect } from "react";
import SockJS from "sockjs-client";
import { over } from "stompjs";
import { getDomain } from "../../helpers/getDomain";
import { api, handleError } from "helpers/api";
import { Spinner } from "components/ui/Spinner";
import {useNavigate, useLocation} from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/VotingReveal.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import { User } from "types";
import NightAction from "./NightAction";

const VotingReveal = () => {
  console.log("I AM ON PAGE VOTING REVEAL NOW");

  // variables needed for establishing websocket connection
  const baseURL = getDomain();
  const navigate = useNavigate();

  var connection = false;
  var stompClient = null;
  var subscription = null;

  // variables needed for role reveal
  const [messageReceived, setMessageReceived] = useState(null);
  var votedPlayer = null;
  var tiedPlayers = [];
  const username = localStorage.getItem("user"); //fetching username from localstorage
  const [ready, setReady] = useState(false);
  let gameState = "REVEALVOTING";

  const lobbyId = localStorage.getItem("lobbyId");

  const findVotedPlayer = () => {
    console.log("Inside findVotedPlayer");
    for(let i=0; i<messageReceived.players.length; i++) { // iterating through list of players to check their isKilled field
      let currentPlayer = messageReceived.players[i];
      if(messageReceived.playerMap[`${currentPlayer.username}`].isKilled) {
        votedPlayer = currentPlayer;
      }
    }
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
      if (messageReceived.gameState === "NIGHT") { // happens after ready was sent by all
        navigate("/nightaction");
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
        stompClient.send("/app/ready", headers, body);
      } catch (e) {
        console.log("Something went wrong starting the game :/");
      }
    }

  }, [ready]);

  useEffect(() => { // This useEffect tracks changes in the lobby --> do I need this for roleReveal?
    if (messageReceived) {
      if (messageReceived.gameState === "NIGHT") {
        navigate("/nightaction");
      } else if (messageReceived.gameState === "ENDGAME") {
        navigate("/end");
      }
    }
  }, [messageReceived]);

  const doSendReady = () => {
    setReady(true);
  }

  let content = <Spinner />; // fetching data
  if(messageReceived !== null) {
    findVotedPlayer();
    if(!votedPlayer) { // i.e. there was at least one tie (no one gets voted out)
      content = (
        <div className="nightAction highlight"> There was a tie... No one was voted out!</div>
      )
    } else { // there was no tie: a player was voted out
      content = (
        <div className = "nightAction highlight">
          {votedPlayer.username}, a {votedPlayer.roleName} was voted out!
        </div>
      );}
  }

  return (
    <BaseContainer>
      <div className="votingReveal container">
        <div className="votingReveal header">The voting results are in!</div>
        {(() => {
          if (!ready) {
            return (
              <div className="votingReveal container">
                {content}
                <Button
                  width="100%"
                  height="40px"
                  onClick={() => doSendReady()}
                >
                  Ok, got it!
                </Button>
              </div>
            );
          } else {
            return (
              <div className="votingReveal header2">
                Waiting for all players to press Ok
              </div>
            );
          }
        })()}
      </div>
    </BaseContainer>
  );
};

export default VotingReveal;
