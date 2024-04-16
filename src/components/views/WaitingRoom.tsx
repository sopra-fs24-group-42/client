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
import { getLobby, getLobbySize} from "helpers/stompClient"

const LobbyMember = ({ user }: { user: User }) => (
  <div className="player container">
    <div className="player username">{user.username}</div>
  </div>
);

LobbyMember.propTypes = {
  user: PropTypes.object,
};

var jsLobbyObjectNumberOfPlayers = 0;

const WaitingRoom = () => {
  console.log("IN WAITING ROOM NOW! THIS IS THE CURRENT LOBBY: ");
  //var localStorageLobbyNumberOfPlayers = JSON.parse(localStorage.getItem("lobby")).length;
  //console.log("Number of players in lobby (from localStorage): " + localStorageLobbyNumberOfPlayers);
  console.log("Number of players in lobby (from js object): " + jsLobbyObjectNumberOfPlayers);
  //console.log("from localstorage" + localStorage.getItem("lobby"));
  //console.log("from getLobby()" + JSON.stringify(getLobby()));
  const navigate = useNavigate();
  const [playersInLobby, setPlayersInLobby] = useState<User []>([]);
  const lobbyCode = localStorage.getItem("lobbyCode");

  useEffect(() => {
    try{
      jsLobbyObjectNumberOfPlayers = getLobby().players.length;
      setPlayersInLobby(getLobby().players);
      console.log("playersssss: " + playersInLobby);
    } catch (e) {
      jsLobbyObjectNumberOfPlayers = 0;
      console.log("no players yet: " + playersInLobby);}

  },[jsLobbyObjectNumberOfPlayers]);

  let content = <Spinner />;

  if (jsLobbyObjectNumberOfPlayers !== 0) {
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
          >
            Start Game
          </Button>
        </div>
      </div>
    </BaseContainer>
  );
};

export default WaitingRoom;