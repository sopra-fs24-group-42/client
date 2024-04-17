import React, { useState, useEffect } from "react";
import { api, handleError } from "helpers/api";
import { Spinner } from "components/ui/Spinner";
import Lobby from "models/Lobby";
import {useNavigate} from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/WaitingRoom.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import { User } from "types";
import { connect, subscribe, getLobby, getLobbySize} from "helpers/stompClient";
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
  const lobbyCode = getLobby().lobbyCode; // need this to display at the top of the waitingRoom
  //const hostPlayer = getLobby().hostName; // need this to check if current player is the host
  //const totalPlayers = getLobby().numberOfPlayers; // need this to check if all players are in the lobby

  const [currentLobby, setCurrentLobby] = useState({}); // this variable will store the lobby object (dictionary)
  const [playersInLobby, setPlayersInLobby] = useState<User []>([]); // this variable will store the list of players currently in the lobby

  //console.log("IN WAITING ROOM NOW! THIS IS THE CURRENT LOBBY: " + JSON.stringify(getLobby()));
  //console.log("This is my username: " + username);

  async function subscribeToLobby() {
    const lobbyId = localStorage.getItem("lobbyId");
    let message = await subscribe(`/topic/lobby/${lobbyId}`);
    setCurrentLobby(message);
    setPlayersInLobby(message["players"]);
    //console.log("MESSAGE IN SUBSCRIBE: " + message);
    //console.log("MESSAGE IN current lobby: " + message);
    //console.log("Extracting players: " + JSON.stringify(message["players"]));
  }
  
  // this function handles displaying of the button only the host and only if all players are here
  const allPlayersHereCheck = () => {
    //try {
      //console.log("Total number of players: " + totalPlayers);
      //onsole.log("hostPlayer: " + hostPlayer);
      //if ((playersInLobby.length === totalPlayers) && hostPlayer === username) {
        //return true;
     // }
    //} catch (e) {
      //console.log("Error: Couldn't execute total player check, maybe lobby is empty? " + e);
    //}

    return false;
  }

  useEffect( () => {
    //first thing: I need to fetch the lobby and set it to currentLobby variable
    async function fetchLobby() {
      //console.log("This is my username: " + username);
      try{
        await subscribeToLobby();
        console.log("MESSAGE: " + currentLobby);
        //const response = await send("/app/test", JSON.stringify({username, selection}));
        //console.log("this is my response: " + JSON.stringify(response));
        //await setCurrentLobby(send("/app/test", JSON.stringify({username, selection})));
        //console.log("I have fetched the current Lobby in useEffect: " + JSON.stringify(currentLobby));
      } catch (e) {
        console.log("there was an error: " + e);
      }
    }
    fetchLobby();

    //function fetchLobbyPlayers() {
      //try {
        //setPlayersInLobby(getLobby().players);
        //console.log("SETTING PLAYERS IN LOBBY IN GETLOBBY: " + playersInLobby);
     // } catch (e) {
       // console.log("problem: " + e);}
    //}
    //fetchLobbyPlayers();
    //localStorage.setItem("newMessage", "false");
  }, [currentLobby]);

  let content = <Spinner />;

  if (playersInLobby) {
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
            disabled={!allPlayersHereCheck()}
          >
            Start Game
          </Button>
        </div>
      </div>
    </BaseContainer>
  );
};

export default WaitingRoom;