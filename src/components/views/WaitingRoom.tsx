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
import { send, getLobby, getLobbySize} from "helpers/stompClient";
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
  console.log("IN WAITING ROOM NOW! THIS IS THE CURRENT LOBBY: ");

  const navigate = useNavigate();
  //const { lobby } = useLobby();
  const [playersInLobby, setPlayersInLobby] = useState<User []>([]);
  const [lobbyCode2, setLobbyCode] = useState(null);
  const lobbyCode = localStorage.getItem("lobbyCode");

  const allPlayersHereCheck = () => {
    try {
      const totalPlayers = getLobby().numberOfPlayers;
      console.log("Total number of players: " + totalPlayers);
      const hostPlayer = getLobby().hostName;
      const username = localStorage.getItem("username");
      console.log("hostPlayer: " + hostPlayer);
      if ((playersInLobby.length === totalPlayers) && hostPlayer === username) {
        return true;
      }
    } catch (e) {
      console.log("Error: Couldn't execute total player check, maybe lobby is empty? " + e);
    }

    return false;
  }

  useEffect(() => {
    function fetchLobby() {
      
      try {
        setPlayersInLobby(getLobby().players);
        console.log("SETTING PLAYERS IN LOBBY IN GETLOBBY: " + playersInLobby);
      } catch (e) {
        console.log("problem: " + e);}
    }
    fetchLobby()
    ;},

  [playersInLobby]);

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