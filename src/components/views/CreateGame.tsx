import React, { useState } from "react";
import { api, handleError } from "helpers/api";
import Player from "models/Player";
import Lobby from "models/Lobby";
import {useNavigate} from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/Login.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import {connect, subscribe} from "helpers/stompClient"

/*
It is possible to add multiple components inside a single file,
however be sure not to clutter your files with an endless amount!
As a rule of thumb, use one file per component and only add small,
specific components that belong to the main one in the same file.
 */


const FormField = (props) => {

  return (
    <div className="login field">
      <label className="login label">{props.label}</label>
      <input
        className="login input"
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

const CreateGame = () => {
  const navigate = useNavigate();
  const [numberPlayers, setNumberPlayers] = useState<string>(null);
  const [username, setUsername] = useState<string>(null);

  function subscribeToLobby() {
    const lobbyId = localStorage.getItem("lobbyId");
    subscribe(`topic/lobby/${lobbyId}`);}

  const doCreateGame = async () => {
    try {
      // creating a new Player object out of the host
      const response1 = await api.post("/players", JSON.stringify({username}));
      // Get the returned user and update a new object.
      const player = new Player(response1.data);
      // Store the token into the local storage.
      localStorage.setItem("user", player.username);
      // creating a new Lobby object 
      const response2 = await api.post("/lobbies", JSON.stringify({numberPlayers}));
      const lobby = new Lobby(response2.data);
      localStorage.setItem("lobbyId", lobby.lobbyId);
      // upgrading to a websocket connection
      connect(subscribeToLobby)
      // Login successfully worked --> navigate to the route /game in the GameRouter
      navigate("/waitingroom");
    } catch (error) {
      alert(
        `Something went wrong during the creation of the game: \n${handleError(error)}`
      );
    }
  };

  return (
    <BaseContainer>
      <div className="login container">
        <h2>Group 42</h2>
        <div className="login form">
          <FormField
            label="How many people are playing?"
            value={numberPlayers}
            onChange={(e: string) => setNumberPlayers(e)}
          />
          <FormField
            label="Choose your username:"
            value={username}
            onChange={(e: string) => setUsername(e)}
          />
          <div className="createGame button-container">
            <Button
              disabled={!username || !username}
              width="100%"
              onClick={() => doCreateGame()}
            >
              Create Game
            </Button>
            <Button
              width="100%"
              onClick={() => navigate("/game")}
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
export default CreateGame;