import React, { useState, useEffect } from "react";
import { api, handleError } from "helpers/api";
import Player from "models/Player";
import {useNavigate} from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/JoinGame.scss";
import "styles/views/CreateGame.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import { Popover } from "@mantine/core";

const FormField = (props) => {
  return (
    <div className="joinGame field">
      <label className="joinGame label">{props.label}</label>
      <warning className="joinGame warning">{props.warning}</warning>
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
  warning: PropTypes.string,
  onChange: PropTypes.func,
};

const JoinGame = () => {
  const navigate = useNavigate();
  const [lobbyCode, setLobbyCode] = useState(null);
  const [username, setUsername] = useState(null);
  const [invalidUsername, setInvalidUsername] = useState(false);

  //variable for Errorhandling
  const [popoverNonUniqueUsername, setPopoverNonUniqueUsername] = useState(false);
  const [popoverLobbyFull, setPopoverLobbyFull] = useState(false);
  const [popoverWrongLobbyCode, setPopoverWrongLobbyCode] = useState(false);

  useEffect(() => {
    localStorage.clear();
  }, []);

  const doSetUsername = (e) => {
    if (e.length <= 15) {
      setInvalidUsername(false);
      setUsername(e);
    } else {
      setInvalidUsername(true);
    }
  };

  const doJoinGame = async () => {
    try {
      const response1 = await api.post("/players", JSON.stringify({ username, lobbyCode }));
      const player = new Player(response1.data);
      localStorage.setItem("user", player.username);
      localStorage.setItem("playerId", player.playerId);
      localStorage.setItem("lobbyCode", player.lobbyCode);
      localStorage.setItem("lobbyId", player.lobbyId);
      navigate("/waitingroom");
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setPopoverNonUniqueUsername(true);
      } 
      
      else if (error.response && error.response.status === 416){
        setPopoverLobbyFull(true);
      }

      else if (error.response && error.response.status === 404){
        setPopoverWrongLobbyCode(true);
      }
      
      else {
        alert(
          `Something went wrong during the creation of the game: \n${handleError(error)}`
        );
      }
    }
  };

  return (
    <BaseContainer>
      <div className="joinGame background-container">
        <div className="joinGame header">Join an existing game</div>
        <div className="joinGame container">
          <div className="joinGame form">
            {invalidUsername ? (
              <FormField
                label="Choose your username:"
                value={username}
                warning="Max. username length is 15 characters!"
                onChange={(e) => doSetUsername(e)}
              />
            ) : (
              <FormField
                label="Choose your username:"
                value={username}
                onChange={(e) => doSetUsername(e)}
              />
            )}
            <br></br>
            <FormField
              label="Enter a game code:"
              value={lobbyCode}
              onChange={(e) => setLobbyCode(e)}
            />
            <div className="joinGame button-container">
              <Button
                width="100%"
                height="80px"
                disabled={!username || !lobbyCode || invalidUsername}
                onClick={doJoinGame}
              >
                Join Game
              </Button>
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
      </div>
      {popoverNonUniqueUsername && (
        <Popover
          opened={popoverNonUniqueUsername}
          onClose={() => setPopoverNonUniqueUsername(false)}
          withArrow
          shadow="md"
        >
          <Popover.Dropdown className="joinGame dropdown">
            <div className="joinGame popover-container">
              <div className="joinGame heading">Username already taken. Try a different one</div>
              <Button
                width="100%"
                height="40px"
                onClick={() => setPopoverNonUniqueUsername(false)}
              >
                ok
              </Button>
            </div>
          </Popover.Dropdown>
        </Popover>
      )}
      {popoverLobbyFull && (
        <Popover
          opened={popoverLobbyFull}
          onClose={() => setPopoverLobbyFull(false)}
          withArrow
          shadow="md"
        >
          <Popover.Dropdown className="joinGame dropdown">
            <div className="joinGame popover-container">
              <div className="joinGame heading">The Lobby is full. Join another Lobby or create your own.</div>
              <Button
                width="100%"
                height="40px"
                onClick={() => setPopoverLobbyFull(false)}
              >
                ok
              </Button>
            </div>
          </Popover.Dropdown>
        </Popover>
      )}
      {popoverWrongLobbyCode && (
        <Popover
          opened={popoverWrongLobbyCode}
          onClose={() => setPopoverWrongLobbyCode(false)}
          withArrow
          shadow="md"
        >
          <Popover.Dropdown className="joinGame dropdown">
            <div className="joinGame popover-container">
              <div className="joinGame heading">Game code does not exist. Make sure you entered the correct code in capital letters</div>
              <Button
                width="100%"
                height="40px"
                onClick={() => setPopoverWrongLobbyCode(false)}
              >
                ok
              </Button>
            </div>
          </Popover.Dropdown>
        </Popover>
      )}
    </BaseContainer>
  );
};

export default JoinGame;
