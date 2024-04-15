import React, { useState } from "react";
import { api, handleError } from "helpers/api";
import Player from "models/Player";
import Lobby from "models/Lobby";
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

const WaitingRoom = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>(null);
  const [selection, setSelection] = useState<string>(null);

  const doSelection = () => {
    const lobbyId = localStorage.getItem("lobbyId");
    let username = localStorage.getItem("user");
    let body = JSON.stringify({username, selection});
    send(`/topic/lobby/${lobbyId}`, body);
    //send("/app/test", body);
  }

  return (
    <BaseContainer>
      <div className= "waitingRoom header">Welcome to game </div>
      <div className= "waitingRoom container">
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