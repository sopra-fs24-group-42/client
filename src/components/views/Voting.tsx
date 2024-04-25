import React, { useState, useEffect, useRef } from "react";
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

const LobbyMember = ({ user }: { user: User }) => (
  <div className="player container">
    <div className="player username">{user.username}</div>
  </div>
);

LobbyMember.propTypes = {
  user: PropTypes.object,
};

const Voting = () => {
  // variables needed for establishing websocket connection
  var connection = false;

  const baseURL = getDomain();
  var stompClient = null;
  var subscription = null;
  
  const navigate = useNavigate();
  const Ref = useRef(null);
  const [timer, setTimer] = useState("00:00:00");
  let gameState = "VOTING";

  const [messageReceived, setMessageReceived] = useState(null);
  const [playersInLobby, setPlayersInLobby] = useState(null);

  const [selected, setSelected] = useState(null);
  var votedPlayer = null;

  const [ready, setReady] = useState(false);
  const [alreadySent, setAlreadySent] = useState(false);

  // variables needed for UI  
  const lobbyId = localStorage.getItem("lobbyId");
  const username = localStorage.getItem("user");

  const getTimeRemaining = (e) => {
    const total = Date.parse(e) - Date.parse(new Date());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / 1000 / 60 / 60) % 24);

    return {
      total,
      hours,
      minutes,
      seconds,
    };
  };

  const startTimer = (e) => {
    let { total, hours, minutes, seconds } = getTimeRemaining(e);
    if (total >= 0) {
      // Continue updating the timer
      setTimer(
        `${hours > 9 ? hours : "0" + hours}:${
          minutes > 9 ? minutes : "0" + minutes}:${
          seconds > 9 ? seconds : "0" + seconds}`
      );
    } else {
      // Timer expires, navigate to another page
      try {
        let selection = localStorage.getItem("selected");}
      catch (e) {
        localStorage.setItem("selected", null);}
      setReady(true);
      clearInterval(Ref.current);
    }
  };

  const clearTimer = (e) => {
    setTimer("00:00:10");
    if (Ref.current) clearInterval(Ref.current);
    const id = setInterval(() => {
      startTimer(e);
    }, 1000);
    Ref.current = id;
  };

  const getDeadTime = () => {
    let deadline = new Date();
    deadline.setSeconds(deadline.getSeconds() + 15);

    return deadline;
  };

  useEffect(() => {
    clearTimer(getDeadTime());

    return () => {
      if (Ref.current) {
        clearInterval(Ref.current);}
    };
  }, []);


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
        setPlayersInLobby(JSON.parse(message.body).players);
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
      if (messageReceived.gameState === "REVEALVOTING") {
        navigate("/revealvoting");
      }
      setPlayersInLobby(messageReceived.players);
    }

    return () => {
      const headers = {
        "Content-type": "application/json"
      };
      let selection = localStorage.getItem("selected");
      const body = JSON.stringify({username, selection});                        
      try {
        if(!alreadySent) { // to avoid SEND frames being sent doubled
          stompClient.send("/app/voting", headers, body);
          stompClient.send("/app/ready", headers, JSON.stringify({username, gameState}));
          setAlreadySent(true);}
      } catch (e) {
        console.log("Something went wrong sending selection information: " + e);
      }
    }
  }, [ready, connection]);

  useEffect(() => { // This useEffect tracks changes in the lobby
    if (messageReceived) {
      if (messageReceived.gameState === "REVEALVOTING") {
        navigate("/revealvoting");
      }
      setPlayersInLobby(messageReceived.players);
    }
  }, [messageReceived]); 

  const doSendSelected = () => {
    setReady(true);
  }
  
  useEffect(() => {
    localStorage.setItem("selected", selected);
  },[selected])

  let content = <Spinner />;

  if (messageReceived !== null) {
    content = (
      <div className ="game">
        <ul className= "game user-list">
          {playersInLobby.map((user: User) => {
            if(user.isAlive && user.username !== username) { // only display other players that are still alive and also not yourself
              return (
                <li key={user.username}
                  onClick={() => setSelected(user.username)}
                  className={`player container ${selected === user.username ? "selected" : ""}`}
                >
                  < LobbyMember user={user} />
                </li>
              );
            }

            return null;
          })}
        </ul>
      </div>
    );}

  return (
    <BaseContainer>
      <div className= "nightAction header">Time to put it to a vote!
        <div className="waitingRoom highlight">{timer}</div>
        <BaseContainer>
          {(() => {
            if(ready && selected) {
              return (
                <div className= "nightAction heading2">Waiting for all players to submit their vote...</div>)}
            else if (selected && !ready) {
              return (
                <div>
                  <div className= "nightAction heading2">You have selected {selected} </div>
                  <div className= "nightAction container">{content}
                    <Button
                      width="100%"
                      height="40px"
                      onClick={() => doSendSelected()}
                    >Vote for {selected}
                    </Button>
                  </div>
                </div>)
            } else { 
              return (
                <div>
                  <div className= "nightAction heading">{username}, select who you want to vote out.</div>    
                  <div className= "nightAction container">{content} </div>
                </div>
              )
            }
          })()}
        </BaseContainer>
      </div>
    </BaseContainer>
  );
};

export default Voting;
