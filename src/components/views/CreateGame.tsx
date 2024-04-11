import React, { useState } from "react";
import { api, handleError } from "helpers/api";
import Player from "models/Player";
import Lobby from "models/Lobby";
import {useNavigate} from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/CreateGame.scss";
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
    <div className="frontpage field">
      <label className="frontpage label">{props.label}</label>
      <input
        className="frontpage input"
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
  const [hostName, setHostName] = useState<string>(null);

  function subscribeToLobby() {
    const lobbyId = localStorage.getItem("lobbyId");
    subscribe(`topic/lobby/${lobbyId}`);}

  const doCreateGame = async () => {
    try {
      // creating a new Player object out of the host
      //const response1 = await api.post("/players", JSON.stringify({username}));
      // Get the returned user and update a new object.
      //const player = new Player(response1.data);
      // Store the token into the local storage.
      //localStorage.setItem("user", player.username);
      // creating a new Lobby object which also creates the host player object
      const response = await api.post("/lobbies", JSON.stringify({hostName, numberPlayers}));
      const lobby = new Lobby(response.data);
      localStorage.setItem("user", lobby.hostName);
      localStorage.setItem("lobbyCode", lobby.lobbyCode);
      //localStorage.setItem("players", lobby.players);
      //localStorage.setItem("numberOfPlayers", lobby.numberOfPlayers);
      //localStorage.setItem("gameState", lobby.gameState);
      //localStorage.setItem("lobbyId", lobby.lobbyId);
      // upgrading to a websocket connection
      connect(subscribeToLobby)
      navigate("/waitingroom");
    } catch (error) {
      alert(
        `Something went wrong during the creation of the game: \n${handleError(error)}`
      );
    }
  };

  return (
    <BaseContainer>
    <h2>Create a new game</h2>
      <div className="createGame container">
        <div className="createGame form">
          <FormField
            label="How many people are playing?"
            value={numberPlayers}
            onChange={(e: string) => setNumberPlayers(e)}
          />
          <FormField
            label="Choose your username:"
            value={hostName}
            onChange={(e: string) => setHostName(e)}
          />
          <div className="createGame button-container">
            <Button
              disabled={!hostName || !numberPlayers}
              
              onClick={() => doCreateGame()}
            >
              Create Game
            </Button>
            <Button
              width="100%"
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
export default CreateGame;