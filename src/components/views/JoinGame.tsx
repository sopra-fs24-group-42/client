import React, { useState } from "react";
import { api, handleError } from "helpers/api";
import Player from "models/Player";
import Lobby from "models/Lobby";
import {useNavigate} from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/JoinGame.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import {connect, subscribe, testMessage} from "helpers/stompClient"

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

const JoinGame = () => {
  const navigate = useNavigate();
  const [lobbyCode, setLobbyCode] = useState<string>(null);
  const [username, setUsername] = useState<string>(null);

  function subscribeToLobby() {
    const lobbyId = localStorage.getItem("lobbyId");
    //subscribe("/topic/test");
    subscribe(`/topic/lobby/${lobbyId}`, data => {
            //localStorage.setItem("players1", JSON.stringify(data["players"]));
            //localStorage.setItem("players2", data["players"])
    });
  }

  function sendMessage() {
    testMessage(localStorage.getItem("lobbyId"), JSON.stringify({username, lobbyCode}));
  }

  const doJoinGame = async () => {
    try {
      // creating a new Player object out of the joining player
      const response1 = await api.post("/players", JSON.stringify({username, lobbyCode}));
      const player = new Player(response1.data);
      localStorage.setItem("user", player.username);
      localStorage.setItem("lobbyCode", player.lobbyCode);
      localStorage.setItem("lobbyId", player.lobbyId);
      // upgrading to a websocket connection
      connect(subscribeToLobby);
      navigate("/waitingroom");
    } catch (error) {
      alert(
        `Something went wrong during the creation of the game: \n${handleError(error)}`
      );
    }
  };

  return (
    <BaseContainer>
      <div className= "joinGame header">Join an existing game</div>
      <div className="joinGame container">
        <div className="joinGame form">
          <FormField
            label="Choose your username:"
            value={username}
            onChange={(e: string) => setUsername(e)}
          />
          <FormField
            label="Enter a game code:"
            value={lobbyCode}
            onChange={(e: string) => setLobbyCode(e)}
          />
          <div className="joinGame space"></div>
          <div className="joinGame button-container">
            <Button
              width="100%"
              height="80px"
              disabled={!username || !lobbyCode}
              onClick={() => doJoinGame()}
            >
              Join Game
            </Button>
          </div>
          <div className="joinGame button-container">
            <Button
              width="100%"
              height="40px"
              onClick={() => navigate("/frontpage")}
            >
              Back
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
export default JoinGame;