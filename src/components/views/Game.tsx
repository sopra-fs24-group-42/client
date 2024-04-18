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

const LobbyMember = ({ user }: { user: User }) => (
  <div className="player container">
    <div className="player username">{user.username}</div>
  </div>
);

LobbyMember.propTypes = {
  user: PropTypes.object,
};

const WaitingRoom = () => {

  // variables needed for establishing websocket connection
  var connection = false;
  const baseURL = getDomain();
  var stompClient = null;

  const navigate = useNavigate();
  const [messageReceived, setMessageReceived] = useState(null);
  const [playersInLobby, setPlayersInLobby] = useState<User []>([]); // this variable will store the list of players currently in the lobby
  const [numberOfPlayersInLobby, setNumberOfPlayersInLobby] = useState(0);
  const [numberOfPlayers, setNumberOfPlayers] = useState(0);
  const [hostName, setHostName] = useState(null);
  const [disconnected, setDisconnected] = useState(false);

  const lobbyCode = localStorage.getItem("lobbyCode"); // need this to display at the top of the waitingRoom
  const lobbyId = localStorage.getItem("lobbyId");
  const user = localStorage.getItem("user");
  //const numberOfPlayers = parseInt(localStorage.getItem("numberOfPlayers"), 10);

  const connect = async () => {
    return new Promise((resolve, reject) => {
      var socket = new SockJS(baseURL+"/game"); // creating a new SockJS object (essentially a websocket object)
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
        connection = false;
        setDisconnected(true);
        console.log("Socket was closed, Reason: " + reason);
        reject(reason);}
    });
  };

  const subscribe = async (destination) => { 
    return new Promise( (resolve, reject) => {
      stompClient.subscribe(destination, async function(message) { 
        // all of this only gets executed when message is received
        console.log("MESSAGE IN SUBSCRIBE: " + JSON.stringify(message));
        //localStorage.setItem("lobby", message.body);
        setMessageReceived(JSON.parse(message.body));
        setPlayersInLobby(JSON.parse(message.body).players);
        setNumberOfPlayersInLobby(JSON.parse(message.body).players.length);
        setNumberOfPlayers(JSON.parse(message.body).numberOfPlayers);
        setHostName(JSON.parse(message.body).hostName);
        resolve(JSON.parse(message.body));
      });
    }); 
  }

  useEffect(() => { // This is executed once upon mounting of waitingRoom --> establishes ws connection & subscribes
    if(!connection) { 
      const connectAndSubscribe = async () => { 
        try {
          await connect();
          await subscribe(`/topic/lobby/${lobbyId}`);      
        } catch (error) {
          console.error("There was an error connecting or subscribing: ", error);
        }
      };
      connectAndSubscribe();}

    if (messageReceived && messageReceived.players) {
      setPlayersInLobby(messageReceived.players);
      setNumberOfPlayersInLobby((messageReceived.players).length);
      setNumberOfPlayers(messageReceived.numberOfPlayers);
      setHostName(messageReceived.hostName);
    }
  }, []);

  useEffect(() => { // This useEffect tracks changes in the lobby
    console.log("something is hapaapapapeenning");
    if (messageReceived && messageReceived.players) {
      setPlayersInLobby(messageReceived.players);
      setNumberOfPlayersInLobby((messageReceived.players).length);
      setNumberOfPlayers(messageReceived.numberOfPlayers);
      setHostName(messageReceived.hostName);
      console.log("number of players in lobby: " + numberOfPlayersInLobby);
    }
  }, [messageReceived, disconnected===true]); 

  const checkIfAllPlayersHere = () => {
    if(numberOfPlayers === numberOfPlayersInLobby) {
      return true;
    }

    return false;
  }


  let content = <Spinner />;

  if (messageReceived !== null) {
    content = (
      <div className ="game">
        <ul className= "game user-list">
          {playersInLobby.map((user: User) => (
            <li key={user.username}>
              < LobbyMember user={user} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <BaseContainer>
      <div className= "waitingRoom header">Welcome to game 
        <div className= "waitingRoom highlight">{lobbyCode}</div>
      </div>
      <div>
      </div>
      <div className= "waitingRoom container">
        {content}
        <div className="waitingRoom button-container">
          { user === hostName &&
          <Button
            width="100%"
            height="40px"
            disabled={checkIfAllPlayersHere() === false}
          >
            Start Game
          </Button>}
        </div>
      </div>
    </BaseContainer>
  );
};

export default WaitingRoom;