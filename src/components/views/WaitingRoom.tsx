import React, { useState, useEffect } from "react";
import { api, handleError } from "helpers/api";
import { Spinner } from "components/ui/Spinner";
import Lobby from "models/Lobby";
import {useNavigate, useLocation} from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/WaitingRoom.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import { User } from "types";
import { connect, subscribe, getLobby, getLobbySize, getConnection} from "helpers/stompClient";
import { useLobby} from "helpers/lobbyContext";

const LobbyMember = ({ user }: { user: User }) => (
  <div className="player container">
    <div className="player username">{user.username}</div>
  </div>
);

LobbyMember.propTypes = {
  user: PropTypes.object,
};

const WaitingRoom = () => {
  const navigate = useNavigate();
  //const location = useLocation();
  //let data = location.state;
  var [messageReceived, setMessageReceived] = useState();
  const [playersInLobby, setPlayersInLobby] = useState<User []>([]); // this variable will store the list of players currently in the lobby
  //localStorage.setItem("data", data);
  //console.log("DATA: " + JSON.stringify(data));
  const lobbyCode = getLobby().lobbyCode; // need this to display at the top of the waitingRoom
  //var messageReceived = null; 
  //const [currentLobby, setCurrentLobby] = useState({}); // this variable will store the lobby object (dictionary)
  //const [messageReceived, setMessageReceived] = useState(null);
  //const [numberOfPlayersInLobby, setNumberOfPlayersInLobby] = useState(0);

  useEffect(() => {
    if(!getConnection()) {
    const connectAndSubscribe = async () => {
      try {
        await connect(subscribeToLobby);
      } catch (error) {
        console.error("There was an error connecting or subscribing: ", error);
      }
    };
    connectAndSubscribe();}
    //setPlayersInLobby(messageReceived.players);
    //return {};
  }, []);

  useEffect(() => {
    if (messageReceived) {
      setPlayersInLobby(messageReceived.players);
    }
  }, [messageReceived]);  // Proper handling when messageReceived updates

  //try {
    //await connect(subscribeToLobby);
    //console.log("I waited: CONNECT, SUBSCRIBE AND SEND FINISHED?");
  //} catch (e) {
    //console.log("There was an errror: " + e);
  //};

  async function subscribeToLobby() {
    const lobbyId = localStorage.getItem("lobbyId");
    const message = await subscribe(`/topic/lobby/${lobbyId}`);
    console.log("MESSAGE IN SUBSCRIBE: " + JSON.stringify(message));
    setMessageReceived(message);
    //messageReceived = message;
    //setNumberOfPlayersInLobby(message.players.length);
    //setCurrentLobby(message);
    console.log("I set messageReceived: " + messageReceived);
  }

  //useEffect(() => {
    //setPlayersInLobby(messageReceived.players);
  //}, [messageReceived]);
  
  //async function doSetup() {
    //return new Promise((resolve, reject) => {
      //try {
        //await connect(subscribeToLobby);
      //} catch (e) {
        //console.log("There was an error: " + e);
      //}
    //}, function(error) {

    //});
  //}


  //useEffect( () => {

   // data = location.state
    //setPlayersInLobby(data.players);
    //console.log("something's happening");
  //}, [location]);

  let content = <Spinner />;

  if (messageReceived) {
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
          <Button
            width="100%"
            height="40px"
            disabled={true}
          >
            Start Game
          </Button>
        </div>
      </div>
    </BaseContainer>
  );
};

export default WaitingRoom;