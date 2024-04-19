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
  let connection = false;
  const baseURL = getDomain();
  var stompClient = null;

  const navigate = useNavigate();

  // variables needed for dynamic rendering of waitingRoom
  const [messageReceived, setMessageReceived] = useState(null);
  const [playersInLobby, setPlayersInLobby] = useState<User []>([]); // this variable will store the list of players currently in the lobby
  const [numberOfPlayersInLobby, setNumberOfPlayersInLobby] = useState(0);
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
      setTimeout(async function() {// "function" will be executed after the delay (i.e. subscribe is called because we call connect with a function as argument e.g. see createGame.tsx)
        connectAndSubscribe();
      }, 1000);}

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
      // TODO: include if statement here that checks if the role field of the user (i.e. the user that is you, not the one who joined) is null or not
      // and if not, then navigate to roleReveal and pass role as props.
      // Also, might have to unsubscribe at this point here as well (depends on if I can (re)subscribe multiple times w/o consequences and always trigger broadcast or not!)
      // if(messageReceived.players.${user}.role !== null) {navigate("/rolereveal", {state: messageReceived.players.${user}.role});}
      setPlayersInLobby(messageReceived.players);
      setNumberOfPlayersInLobby((messageReceived.players).length);
      setNumberOfPlayers(messageReceived.numberOfPlayers);
      setHostName(messageReceived.hostName);
      console.log("number of players in lobby: " + numberOfPlayersInLobby);
    }
  }, [messageReceived, disconnected===true]); //disconnected===true is a WIP: hoping this will update the lobby view to show that a user dropped out.

  const checkIfAllPlayersHere = () => {
    if(numberOfPlayers === numberOfPlayersInLobby) {
      return true;
    }
    
    return false;
  }

  const doStartGame = () => {
    const headers = {
      "Content-type": "application/json"
    };
    const body = JSON.stringify({lobbyId});
    try{
      stompClient.send("/app/startgame", headers, body);
    } catch (e) {
      console.log("Something went wrong while starting the game: " + e);
    }
  }

  const doTest = () => {
    navigate("/rolereveal", {});
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
        <div className= "waitingRoom highlight">{lobbyCode}
          <div className= "waitingRoom heading"> {checkIfAllPlayersHere() ? readyHeading : waitingHeading}</div>
        </div>
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
            onClick={() => doStartGame()}
          >
            Start Game
          </Button>}
          <Button
          onClick={() => doTest()}>
            Test: will remove later
          </Button>
        </div>
      </div>
    </BaseContainer>
  );
};

export default WaitingRoom;
