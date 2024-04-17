import React, { useState } from "react";
import { api, handleError } from "helpers/api";
import Player from "models/Player";
import Lobby from "models/Lobby";
import {useNavigate} from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/CreateGame.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import {connect, subscribe, send, getSubscribedToLobby} from "helpers/stompClient";

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
  //let messageReceived = null;

  async function subscribeToLobby() {
    const lobbyId = localStorage.getItem("lobbyId");
    const message = await subscribe(`/topic/lobby/${lobbyId}`);
    console.log("MESSAGE IN SUBSCRIBE: " + message);
    //messageReceived = (message);
    //console.log("I set messageReceived:" + messageReceived);

  }

  // remove:
  //function sendUsername() {
    //const lobbyId = localStorage.getItem("lobbyId");
    //const username = localStorage.getItem("user");
    //let selection = "none" // note: not actually making a selection here, just need to trigger lobby broadcast
    //let body = JSON.stringify({username, selection}); 
    //send("/app/test", body);
  //}

  const doCreateGame = async () => {
    try {
      // creating a new Lobby object which also creates the host player object
      const response = await api.post("/lobbies", JSON.stringify({hostName, numberOfPlayers}));
      const lobby = new Lobby(response.data);
      localStorage.setItem("user", lobby.hostName);
      localStorage.setItem("lobbyCode", lobby.lobbyCode);
      localStorage.setItem("lobbyId", lobby.lobbyId);
      // upgrading to a websocket connection
      //await connect(subscribeToLobby);
      //console.log("I waited: CONNECT, SUBSCRIBE AND SEND FINISHED?");
      //console.log("dataaaa: " + messageReceived);
      //navigate("/waitingroom", {state: messageReceived});
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