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
  const [connection, setConnection] = useState(null);

  const baseURL = getDomain();
  var stompClient = null;
  var subscription = null;
  
  const navigate = useNavigate();
  let gameState = "NIGHT";

  // variables needed for dynamic rendering of waitingRoom
  const [messageReceived, setMessageReceived] = useState(null);
  const [playersInLobby, setPlayersInLobby] = useState(null);

  const [selection, setSelection] = useState(null);
  const [ready, setReady] = useState(false);

  const [revealRole, setRevealRole] = useState(null);

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
        setConnection(true);
        //connection = true;
        setTimeout(function() {// "function" will be executed after the delay (i.e. subscribe is called because we call connect with a function as argument e.g. see createGame.tsx)
          //const response = await callback();
          console.log("I waited: I received  MESSAGE frame back based on subscribing!!");
          resolve(stompClient);
        }, 500);
      });
      stompClient.onclose = reason => {
        setConnection(false);
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
    console.log("IM IN USEEFFFFFEECT")

    return () => {
      const headers = {
        "Content-type": "application/json"
      };
      let selectionRequest = localStorage.getItem("selection");
      const body = JSON.stringify({username, selectionRequest});
      try {
        stompClient.send(`/app/${role}/nightaction`, headers, body);
        stompClient.send("/app/ready", headers, JSON.stringify({username, gameState}));
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
      setRevealRole(messageReceived.playerMap[`${selection}`].roleName);
    } catch (e) {
      console.log("Could not fetch role: " + e);
    }
  }

  const doSendSelection = () => {
    localStorage.setItem("selection", selection);
    //selectionRequest = selection;
    setReady(true);
    //console.log("INSIDE DOSENDSELECTION: " + selection);
    //console.log("selection request" + selectionRequest);
  }
  
  let content = <Spinner />;

  if (messageReceived !== null) {
    content = (
      <div className ="game">
        <ul className= "game user-list">
          {playersInLobby.map((user: User) => (
            <li key={user.username}
              onClick={() => setSelection(user.username)}
              className={`player container ${selection === user.username ? "selected" : ""}`}
            >
              < LobbyMember user={user} />
            </li>
          ))}
        </ul>
      </div>
    );}

  return (
    <BaseContainer>
      <div className= "nightAction header">Night has fallen...
        {(() => {
          if(role === "Werewolf") {
            return (
              <BaseContainer>
                <div className= "nightAction heading">{username}, select someone to kill.</div>
                {selection && <div className= "nightAction heading2">You have selected {selection} </div>}
                <div className= "nightAction container">{content}
                  {selection &&
                    <Button
                      width="100%"
                      height="40px"
                      onClick={() => doSendSelection()}
                    >Kill {selection}
                    </Button>}
                </div>
              </BaseContainer>
            )
          } else if (role === "Seer") {
            return (
              <BaseContainer>
                {(() => {
                  if (selection && !revealRole) {
                    return (
                      <div className="nightAction heading2">You have selected {selection}
                        <div className="nightAction container">{content}
                          <Button
                            width="100%"
                            height="40px"
                            onClick={() => doReveal()}
                          >
                            See who {selection} is
                          </Button>
                        </div>
                      </div>
                    );
                  } else if (selection && revealRole) {
                    return (
                      <div className="nightAction container">
                        <div className="nightAction highlight">{selection} is a {revealRole}</div>
                        <div className="nightAction button-container">
                          <Button
                            width="100%"
                            height="40px"
                            onClick={() => doSendSelection()}
                          >
                            Ok, got it
                          </Button>
                        </div>
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
                <div className= "nightAction heading">{username}, select someone so as not to arouse suspicion.</div>
                {selection && <div className= "nightAction heading2">You have selected {selection} </div>}
                <div className= "nightAction container">{content}
                  {selection &&
                    <Button
                      width="100%"
                      height="40px"
                      onClick={() => doSendSelection()}
                    >Click me to avoid suspicion
                    </Button>}
                </div>
              </BaseContainer>
            )
          }
        })()}
      </div>
    </BaseContainer>
  );
};

export default NightAction;
