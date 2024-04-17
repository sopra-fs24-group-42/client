import React, { useState } from "react";
import { api, handleError } from "helpers/api";
import Player from "models/Player";
import {useNavigate} from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/JoinGame.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import {connect, subscribe, send} from "helpers/stompClient"

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

  async function subscribeToLobby() {
    const lobbyId = localStorage.getItem("lobbyId");
    await subscribe(`/topic/lobby/${lobbyId}`);
  }

  function sendUsername() {
    const lobbyId = localStorage.getItem("lobbyId");
    const username = localStorage.getItem("user");
    let selection = "none" // note: not actually making a selection here, just need to trigger lobby broadcast
    let body = JSON.stringify({username, selection}); 
    send("/app/test", body);
  }

  const doJoinGame = async () => {
    try {
      // creating a new Player object out of the joining player
      const response1 = await api.post("/players", JSON.stringify({username, lobbyCode}));
      const player = new Player(response1.data);
      localStorage.setItem("user", player.username);
      localStorage.setItem("lobbyCode", player.lobbyCode);
      localStorage.setItem("lobbyId", player.lobbyId);
      // upgrading to a websocket connection over Sockjs
      await connect(subscribeToLobby);
      console.log("I waited: CONNECT, SUBSCRIBE AND SEND FINISHED?");
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