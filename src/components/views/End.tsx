import React, { useState, useEffect } from "react";
import SockJS from "sockjs-client";
import { over } from "stompjs";
import { getDomain } from "../../helpers/getDomain";
import { api, handleError } from "helpers/api";
import { Spinner } from "components/ui/Spinner";
import {useNavigate, useLocation} from "react-router-dom";
import { Button } from "components/ui/Button";
import BaseContainer from "components/ui/BaseContainer";
import "styles/views/End.scss";

const End = () => {
  // variables needed for establishing websocket connection
  var connection = false;

  const baseURL = getDomain();
  var stompClient = null;
  var subscription = null;
  const gameState = "ENDGAME";
  const role = localStorage.getItem("role");
  
  const navigate = useNavigate();

  //localStorage.removeItem("role");

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
      stompClient = over(socket); // specifying that it's a special type of websocket connection (i.e. using sockJS)
      stompClient.connect({}, function (frame) { // connecting to server websocket: instructions inside "function" will only be executed once we get something (i.e. a connect frame back from the server). Parameter "frame" is what we get from the server. 
        console.log("socket was successfully connected: " + frame);
        connection = true;
        //connection = true;
        setTimeout(function() {// "function" will be executed after the delay (i.e. subscribe is called because we call connect with a function as argument e.g. see createGame.tsx)
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
  let winningContent = <Spinner />;
  let losingContent = <Spinner />;

  if (messageReceived !== null) {
    if(winningTeam  === "WEREWOLVES") { // werewolves won
      if(role === "Werewolf") {  // checking role of player : winning team, losing team view
        content = ( // player is a werewolf and werewolves won
          <div className="end container"> 
            <div className="end crown"></div>
            <div className="end header">Congratulations</div>
            <div className="end highlight">the werewolves have won</div>
            <div className="end heading">You have managed kill enough villagers to gain control of the village.</div>
          </div>);
      } else { // player is not a werewolf and werewolves won
        content = ( 
          <div className="end container">
            <div className="end skull"></div>
            <div className="end highlight">The villagers have lost</div>
            <div className="end heading">The werewolves have irrevocably gained the upper hand.</div>
          </div>);
      }
    } else if (winningTeam === "VILLAGERS") { // villagers won
      if(role !== "Werewolf") { // player is not a werewolf and villagers won
        content = (
          <div className="end container"> 
            <div className="end crown"></div>
            <div className="end header">Congratulations</div>
            <div className="end highlight">the villagers have won</div>
            <div className="end heading">You have successfully eradicated all werewolves, and your village lives on peacefully.</div>
          </div> );
      } else { // player is a werewolf and villagers won
        content = (
          <div className="end container">
            <div className="end skull"></div>
            <div className="end highlight">The werewolves have lost</div>
            <div className="end heading">The villagers managed to eradicate all of you.</div>            </div>); // user is not a werewolf (losing team)
      }
    } else { // tie
      content = (
        <div className="end container">
          <div className="end village"></div>
          <div className="end highlight">The game has ended in a tie.</div>
          <div className="end heading">No team has managed to come out on top; all players have died.</div>
        </div>);
    }
  }

  return (
    <BaseContainer>
      <div className="end background-container">
        <div className= "end header">The game has ended!</div>
        {content}
        {(() => {
          if(!ready) {
            return (
              <div className = "end button-container">
                <Button
                  width="100%"
                  height="40px"
                  onClick={() => doSendReady()}
                >Ok
                </Button>
              </div>)
          } else { 
            return (
              <div className="end container">
                <div className="end wait">Waiting for other players...</div>
                <Spinner />
              </div>)}
        })()}
      </div>
    </BaseContainer>
  );
};

export default End;
