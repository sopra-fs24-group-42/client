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

const NightAction = () => {
  // variables needed for establishing websocket connection
  var connection = false;

  const baseURL = getDomain();
  var stompClient = null;
  var subscription = null;
  
  const navigate = useNavigate();
  const Ref = useRef(null);
  const [timer, setTimer] = useState("00:00:00");

  let gameState = "NIGHT";

  // variables needed for dynamic rendering of waitingRoom
  const [messageReceived, setMessageReceived] = useState(null);
  const [playersInLobby, setPlayersInLobby] = useState(null);
  const [alreadySent, setAlreadySent] = useState(false);

  const [selected, setSelected] = useState(null);
  var sentReady = false;

  const [ready, setReady] = useState(false);

  const [revealRole, setRevealRole] = useState(null);

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

  // variables needed for UI  
  const lobbyId = localStorage.getItem("lobbyId");
  const username = localStorage.getItem("user");
  const role = localStorage.getItem("role");

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
      if (messageReceived.gameState === "REVEALNIGHT") {
        navigate("/nightreveal");
      }
      setPlayersInLobby(messageReceived.players);
    }
    //}
    console.log("IM IN USEEFFFFFEECT");

    return () => {
      const headers = {
        "Content-type": "application/json"
      };
      let selection = localStorage.getItem("selected");
      console.log("THIS IS THE SELECTION: " + localStorage.getItem("selection"));
      console.log("THIS IS SELECTION" + selection);
      const body = JSON.stringify({username, selection});
      try {
        if(!alreadySent) { // to avoid SEND frames being sent doubled 
          stompClient.send(`/app/${role}/nightaction`, headers, body);
          setTimeout(function() {
            stompClient.send("/app/ready", headers, JSON.stringify({username, gameState}));
            sentReady = true;
            setAlreadySent(true);
          },500);}
      } catch (e) {
        console.log("Something went wrong sending selection information: " + e);
      }
    }
  }, [ready]);

  useEffect(() => { // This useEffect tracks changes in the lobby
    console.log("something is hapaapapapeenning");
    if (messageReceived) {
      if (messageReceived.gameState === "REVEALNIGHT") {
        navigate("/nightreveal");
      }
      setPlayersInLobby(messageReceived.players);
    }
  }, [messageReceived]); 

  const doReveal = () => {
    try{
      setRevealRole(messageReceived.playerMap[`${selected}`].roleName);
    } catch (e) {
      console.log("Could not fetch role: " + e);
    }
  }

  const doSendSelected = () => {
    setReady(true);
  }

  useEffect(() => {
    localStorage.setItem("selected", selected);
    console.log("SELECTED SOMEONE JUST NOW: " + localStorage.getItem("selected"));
  },[selected])

  let content = <Spinner />;

  if (messageReceived !== null) {
    content = (
      <div className ="game">
        <ul className= "game user-list">
          {playersInLobby.map((user: User) => {
            if(user.username !== username) {
              return (
                <li key={user.username}
                  onClick={() => setSelected(user.username)}
                  className={`player container ${selected === user.username ? "selected" : ""}`}
                >
                  < LobbyMember user={user} />
                </li>
              );
            }
        
            return null; // Do not render anything if the condition is true
          })}
        </ul>
      </div>
    );}

  return (
    <BaseContainer>
      <div className= "nightAction header">Night has fallen...
        <div className="waitingRoom highlight">{timer}</div>
        {(() => {
          if(role === "Werewolf") {
            return (
              <BaseContainer>
                {(() => {
                  if(ready && selected) {
                    return (
                      <div className="waitingRoom container">
                        <div className= "nightAction heading2">Waiting for all players to complete their night actions...</div>
                      </div>)}
                  else if (selected && !ready) {
                    return (
                      <div>
                        <div className= "nightAction heading2">You have selected {selected} </div>
                        <div className= "nightAction container">{content}
                          <Button
                            width="100%"
                            height="40px"
                            onClick={() => doSendSelected()}
                          >Kill {selected}
                          </Button>
                        </div>
                      </div>)
                  } else { 
                    return (
                      <div>
                        <div className= "nightAction heading">{username}, select someone to kill.</div>    
                        <div className= "nightAction container">{content} </div>
                      </div>
                    )
                  }
                })()}
              </BaseContainer>
            )
          } else if (role === "Seer") {
            return (
              <BaseContainer>
                {(() => {
                  if (selected && !revealRole) {
                    return (
                      <div className="nightAction heading2">You have selected {selected}
                        <div className="nightAction container">{content}
                          <Button
                            width="100%"
                            height="40px"
                            onClick={() => doReveal()}
                          >
                            See who {selected} is
                          </Button>
                        </div>
                      </div>
                    );
                  } else if (selected && revealRole && !ready) {
                    return (
                      <div className="nightAction container">
                        <div className="nightAction highlight">{selected} is a {revealRole}</div>
                        <Button
                          width="100%"
                          height="40px"
                          onClick={() => doSendSelected()}
                        >
                          Ok, got it
                        </Button>
                      </div>
                    );
                  } else if (selected && revealRole && ready) {
                    return (
                      <div className="nightAction container">
                        <div className="nightAction heading2">Waiting for all players to complete their night action</div>
                      </div>
                    );
                  }
                  else {
                    return (
                      <div className="nightAction heading2">{username}, whose role do you want to see?
                        <div className="nightAction container">{content} </div>
                      </div>
                    );
                  }
                })()}
              </BaseContainer>
            )
          } else {
            return (
              <BaseContainer>
                {(() => {
                  if(ready && selected) {
                    return (
                      <div className= "nightAction container">
                        <div className= "nightAction heading2">Waiting for all players to complete their night actions...</div>
                      </div>)}
                  else if (selected && !ready) {
                    return (
                      <div>
                        <div className= "nightAction heading2">You have selected {selected} </div>
                        <div className= "nightAction container">{content}
                          <Button
                            width="100%"
                            height="40px"
                            onClick={() => doSendSelected()}
                          >Click me to avoid suspicion
                          </Button>
                        </div>
                      </div>)
                  } else { 
                    return (
                      <div>
                        <div className= "nightAction heading">{username}, select someone to avoid suspicion.</div>    
                        <div className= "nightAction container">{content} </div>
                      </div>
                    )
                  }
                })()}
              </BaseContainer>
            )
          }
        })()}
      </div>
    </BaseContainer>
  );
};

export default NightAction;
