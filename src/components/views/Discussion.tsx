import React, { useState, useRef, useEffect } from "react";
import SockJS from "sockjs-client";
import { over } from "stompjs";
import { getDomain } from "../../helpers/getDomain";
import { useNavigate } from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/Discussion.scss";
import BaseContainer from "components/ui/BaseContainer";
import { Spinner } from "components/ui/Spinner";


const Discussion = () => {
  const navigate = useNavigate();
  const Ref = useRef(null);
  const [timer, setTimer] = useState("00:00");

  var connection = false;
  let gameState = "DISCUSSION";
  const baseURL = getDomain();
  var stompClient = null;
  var subscription = null;
  const username = localStorage.getItem("user");

  const [messageReceived, setMessageReceived] = useState(null);
  const [playersInLobby, setPlayersInLobby] = useState(null);
  const [ready, setReady] = useState(false);
  const [alreadySent, setAlreadySent] = useState(false);
  const lobbyId = localStorage.getItem("lobbyId");

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
      if (messageReceived.gameState === "VOTING") {
        navigate("/voting");
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
        if(!alreadySent) { // to stop sending SEND frames doubled
          stompClient.send("/app/ready", headers, JSON.stringify({username, gameState}));
        } 
      } catch (e) {
        console.log("Something went wrong sending selection information: " + e);
      }
    }
  }, [ready]);

  useEffect(() => { // This useEffect tracks changes in the lobby
    if (messageReceived) {
      if (messageReceived.gameState === "VOTING") {
        navigate("/voting");
      }
      setPlayersInLobby(messageReceived.players);
    }
  }, [messageReceived]); 

  const getTimeRemaining = (e) => {
    const total = Date.parse(e) - Date.parse(new Date());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);

    return {
      total,
      minutes,
      seconds,
    };
  };

  const startTimer = (e) => {
    let { total, minutes, seconds } = getTimeRemaining(e);
    if (total >= 0) {
      // Continue updating the timer
      setTimer(
        `${minutes > 9 ? minutes : "0" + minutes}:${
          seconds > 9 ? seconds : "0" + seconds}`
      );
    } else {
      // Timer expires, navigate to another page
      setReady(true);
      setAlreadySent(true);
      //navigate("/voting");
      clearInterval(Ref.current);
    }
  };

  const clearTimer = (e) => {
    setTimer("05:00");
    if (Ref.current) clearInterval(Ref.current);
    const id = setInterval(() => {
      startTimer(e);
    }, 1000);
    Ref.current = id;
  };

  const doSendReady = () => {
    setReady(true);
    setAlreadySent(true);
  }

  const getDeadTime = () => {
    let deadline = new Date();
    deadline.setSeconds(deadline.getSeconds() + 300);

    return deadline;
  };

  useEffect(() => {
    clearTimer(getDeadTime());

    return () => {
      if (Ref.current) {
        clearInterval(Ref.current);
      }
    };
  }, []);

  return (
    <div className="discussion total-background">
      <BaseContainer>
        <div className="discussion background-container">
          <div className="discussion container">
            <div className="discussion timer"></div>
            <div className="discussion header">Who was it?</div>
            <div className="discussion header">Discuss!</div>
            <div className="discussion highlight">{timer}</div>
            {(() => {
              if (!ready) {
                return (
                  <div className="discussion button-container">
                    <Button
                      width="100%"
                      height="50px"
                      onClick={() => doSendReady()}>
                      Skip
                    </Button>
                  </div>
                )
              }
              else {
                return (
                  <div className="discussion container">
                    <div className="discussion wait">Waiting for other players...</div>
                    <Spinner />
                  </div>
                )
              }
            })()}
          </div>
        </div>
      </BaseContainer>
    </div>
  );
};

export default Discussion;
