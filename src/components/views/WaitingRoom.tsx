import React, { useState, useEffect } from "react";
import { api, handleError } from "helpers/api";
import { Spinner } from "components/ui/Spinner";
import Player from "models/Player";
import Lobby from "models/Lobby";
import {useNavigate} from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/WaitingRoom.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import { User, GameRoom } from "types";
import {connect, subscribe, send, getLobby, getLobbySize} from "helpers/stompClient"

const Member = ({ user }: {user: User}) => (
  <div className="player container">
    <div className="player username">{user.username}</div>
  </div>
);
Member.propTypes = {
  user: PropTypes.object,
};

const gameRoom = ({ lobs }: {lobs: Lobby}) => (
  <div className="player container">
    <div className="player username">{lobs.lobbyCode}</div>
  </div>
);
gameRoom.propTypes = {
  lobs: PropTypes.object,
};


const FormField = (props) => {

  return (
    <div className="joinGame field">
      <label className="joinGame label">{props.label}</label>
      <input
        className="joinGame input"
        placeholder="enter here.."
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </div>
  );
};

FormField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
};

//var lobby = null;


const WaitingRoom = () => {
  var storedLobby = localStorage.getItem("lobby");
  var playersInLobby = 0;
  setTimeout(function() {
  storedLobby = localStorage.getItem("lobby");
  }, 800);
  
  //const { lobby } = useLobby();
  //var lobby = null;
  const navigate = useNavigate();
  //var playersInLobby = 0;
  //const [players, setPlayers] = useState<Player[]>([]);
  //var [playersInLobby, setPlayersInLobby] = useState(0);
  //var [lobby, setLobby] = useState<Lobby>({});
  const [selection, setSelection] = useState<string>(null);
  const lobbyCode = localStorage.getItem("lobbyCode");
  console.log("inside waiting room: first?")

  useEffect(() => {
    setTimeout(function() {
      try{
        storedLobby = localStorage.getItem("lobby");
        playersInLobby = storedLobby["players"].length;
        console.log("playersssss: " + playersInLobby);
      } catch (e) { playersInLobby = 0;
      console.log("no players yet: " + playersInLobby);}
      }, 800);
    //lobby = getLobby();
    //playersInLobby = getLobbySize();
    //getCurrentLobby();
    //setLobby(getLobby);
    //console.log("set the lobbbyyyy: " + lobby);
    //in here: get the players currently in the lobby and assign them to setPlayers
    //console.log("useEffect: first?");
    //setPlayersInLobby(getLobbySize());
    //setPlayers(JSON.stringify(getLobby()["players"]));
    //setPlayers(lobby.players || []);
    //console.log("Current players:", lobby.players);
    //console.log("useEffect players: " + players);

  },[playersInLobby]);

  const doSelection = () => {
    const lobbyId = localStorage.getItem("lobbyId");
    let username = localStorage.getItem("user");
    let body = JSON.stringify({username, selection});
    send(`/topic/lobby/${lobbyId}`, body);
    //send("/app/test", body);
  }

  let content = <Spinner />;

  if (playersInLobby !== 0) {
    content = (
      <div className ="game">
        <div className= "WaitingRoom header">there are players here!</div>
        <div className= "WaitingRoom header">{storedLobby}</div>

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
        <div className="joinGame form">
          <FormField
            label="Who is your selection?"
            value={selection}
            onChange={(e: string) => setSelection(e)}
          />
          <div className="joinGame button-container">
            <Button
              width="100%"
              height="40px"
              onClick={() => doSelection()}
            >
              send selection
            </Button>
          </div>
        </div>
      </div>
    </BaseContainer>
  );
};



/**
 * You can get access to the history object's properties via the useLocation, useNavigate, useParams, ... hooks.
 */
export default WaitingRoom;