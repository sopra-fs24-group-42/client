import React, { useState } from "react";
import { api, handleError } from "helpers/api";
import Lobby from "models/Lobby";
import {useNavigate} from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/CreateGame.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";

const FormField = (props) => {

  return (
    <div className="createGame field">
      <label className="createGame label">{props.label}</label>
      <input
        className="createGame input"
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
  const [numberOfPlayers, setNumberOfPlayers] = useState<string>(null);
  const [hostName, setHostName] = useState<string>(null);

  const doCreateGame = async () => {
    try {
      // creating a new Lobby object which also creates the host player object
      const response = await api.post("/lobbies", JSON.stringify({hostName, numberOfPlayers}));
      const lobby = new Lobby(response.data);
      localStorage.setItem("user", lobby.hostName);
      localStorage.setItem("lobbyCode", lobby.lobbyCode);
      localStorage.setItem("lobbyId", lobby.lobbyId);
      localStorage.setItem("numberOfPlayers", lobby.numberOfPlayers);
      navigate("/waitingroom");            
    } catch (error) {
      alert(
        `Something went wrong during the creation of the game: \n${handleError(error)}`
      );
    }
  };

  return (
    <BaseContainer>
      <div className="createGame header">
        Create a new game
      </div>
      <div className="createGame container">
        <div className="createGame form">
          <FormField
            label="How many people are playing?"
            value={numberOfPlayers}
            onChange={(e: string) => setNumberOfPlayers(e)}
          />
          <FormField
            label="Choose your username:"
            value={hostName}
            onChange={(e: string) => setHostName(e)}
          />
          <div className="createGame space"></div>
          <div className="createGame button-container">
            <Button
              width="100%"
              height="80px"
              disabled={!hostName || !numberOfPlayers}
              onClick={() => doCreateGame()}
            >
            Create Game
            </Button>
          </div>
          <div className="createGame button-container">
            <Button
              width="100%"
              height="30px"
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

export default CreateGame;