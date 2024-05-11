import React, { useState, useEffect } from "react";
import SockJS from "sockjs-client";
import { over } from "stompjs";
import { getDomain } from "../../helpers/getDomain";
import { api, handleError } from "helpers/api";
import { Spinner } from "components/ui/Spinner";
import {useNavigate, useLocation} from "react-router-dom";
import { Button } from "components/ui/Button";
import RoleNumberInput from "components/ui/RoleNumberInput";
import "styles/views/WaitingRoom.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import { User } from "types";
import { ActionIcon, Popover, NumberInput } from "@mantine/core";
import { IconAdjustments } from "@tabler/icons-react";

const LobbyMember = ({ user }: { user: User }) => (
  <div className="waitingRoom player-container">
    <div className="waitingRoom player-username">{user.username}</div>
  </div>
);

LobbyMember.propTypes = {
  user: PropTypes.object,
};

let stompClient = null;


const WaitingRoom = () => {
  // variables needed for establishing websocket connection
  const [connection, setConnection] = useState(null);
  const [alreadySent, setAlreadySent] = useState(false);
  const baseURL = getDomain();
  var subscription = null;

  const navigate = useNavigate();

  // variables needed for dynamic rendering of waitingRoom
  const [messageReceived, setMessageReceived] = useState(null);
  const [playersInLobby, setPlayersInLobby] = useState<User []>([]); // this variable will store the list of players currently in the lobby
  const [numberOfPlayersInLobby, setNumberOfPlayersInLobby] = useState(0);
  const [numberOfPlayers, setNumberOfPlayers] = useState(0);
  const [hostName, setHostName] = useState(null);
  const [role, setRole] = useState(null);
  // game settings update
  const [popoverOpened, setPopoverOpened] = useState(false);
  const [numberOfWerewolves, setNumberOfWerewolves] = useState(null);
  const [numberOfVillagers, setNumberOfVillagers] = useState(null);
  const [numberOfSeers, setNumberOfSeers] = useState(null);
  const [numberOfSacrifices, setNumberOfSacrifices] = useState(null);
  const [numberOfProtectors, setNumberOfProtectors] = useState(null);

  // variables needed for UI
  const lobbyCode = localStorage.getItem("lobbyCode"); // need this to display at the top of the waitingRoom
  
  // variables needed for conditional button display
  const lobbyId = localStorage.getItem("lobbyId");
  const user = localStorage.getItem("user");

  const connect = async () => {
    return new Promise((resolve, reject) => {
      console.log("Here 1 ");
      const socket = new SockJS(baseURL+"/game"); // creating a new SockJS object (essentially a websocket object)
      //const client = over(socket); // specifying that it's a special type of websocket connection (i.e. using sockJS)
      stompClient = over(socket); // specifying that it's a special type of websocket connection (i.e. using sockJS)
      stompClient.connect({}, function (frame) { // connecting to server websocket: instructions inside "function" will only be executed once we get something (i.e. a connect frame back from the server). Parameter "frame" is what we get from the server.
        console.log("socket was successfully connected: " + frame);
        setConnection(true);

        setTimeout(function() {// "function" will be executed after the delay (i.e. subscribe is called because we call connect with a function as argument e.g. see createGame.tsx)
          //const response = await callback();
          console.log("I waited: I received  MESSAGE frame back based on subscribing!!");
          resolve(stompClient);
        }, 500);
      });
      stompClient.onclose = reason => {
        console.log("Socket was closed, Reason: " + reason);
        setConnection(false);
        setTimeout(() => {
          connect().then(() => console.log("Reconnected")).catch(console.error);
        }, 5000);
        reject(reason);}
    });
  };

  const subscribe = async (destination) => {
    return new Promise( (resolve, reject) => {
      console.log("Here 2 ");
      //stompClient.subscribe(destination, async function(message) {
      subscription = stompClient.subscribe(destination, async function(message) { 
        console.log("Subscription: " + JSON.stringify(subscription));
        // all of this only gets executed when message is received
        console.log("MESSAGE IN SUBSCRIBE: " + JSON.stringify(message));
        //localStorage.setItem("lobby", message.body);
        setMessageReceived(JSON.parse(message.body));
        setPlayersInLobby(JSON.parse(message.body).players);
        setNumberOfPlayersInLobby(JSON.parse(message.body).players.length);
        setNumberOfPlayers(JSON.parse(message.body).numberOfPlayers);
        setHostName(JSON.parse(message.body).hostName);
        resolve(subscription);
      });
    }); 
  }

  // this is executed anytime page is reloaded
  useEffect(() => { // This is executed once upon mounting of waitingRoom --> establishes ws connection & subscribes
    if(!connection) {
      console.log("here 3");
      const connectAndSubscribe = async () => { 
        try {
          await connect();
          subscription = await subscribe(`/topic/lobby/${lobbyId}`);     
        } catch (error) {
          console.error("There was an error connecting or subscribing: ", error);
        }
      };
      connectAndSubscribe();

      if (messageReceived && messageReceived.players) {
        if ((messageReceived.playerMap[`${user}`].roleName) !== null) { //checking if role has been assigned
          setRole(messageReceived.playerMap[`${user}`].roleName);
          navigate("/rolereveal");
        }
        setPlayersInLobby(messageReceived.players);
        setNumberOfPlayersInLobby((messageReceived.players).length);
        setNumberOfPlayers(messageReceived.numberOfPlayers);
        setHostName(messageReceived.hostName);
      }
    }

    return () => {
      const headers = {
        "Content-type": "application/json"
      };
      const body = JSON.stringify({lobbyId});
      try{
        if(!alreadySent && user === localStorage.getItem("toaster")) {
          stompClient.send("/app/startgame", headers, body);
          localStorage.removeItem("toaster");
        }
      } catch (e) {
        console.log("Something went wrong starting the game :/");
      }
    }
  }, []);

  useEffect(() => { // This useEffect tracks changes in the lobby
    console.log("here 4 lobby changed");
    console.log("stompClient 3: ", stompClient);

    if (messageReceived && messageReceived.players) {
      if ((messageReceived.playerMap[`${user}`].roleName) !== null) { //checking if role has been assigned
        setRole(messageReceived.playerMap[`${user}`].roleName);
        navigate("/rolereveal");
      }
      setPlayersInLobby(messageReceived.players);
      setNumberOfPlayersInLobby((messageReceived.players).length);
      setNumberOfPlayers(messageReceived.numberOfPlayers);
      setHostName(messageReceived.hostName);
      console.log("number of players in lobby: " + numberOfPlayersInLobby);
    }
  }, [messageReceived]); 

  const checkIfAllPlayersHere = () => {
    if(numberOfPlayers === numberOfPlayersInLobby) {
      return true;
    }
    
    return false;
  }

  const doStartGame = () => {
    setAlreadySent(true);
    localStorage.setItem("toaster", hostName);
    navigate("/rolereveal"); //--> This triggers dismount of this component, which triggers return value of first useEffect, which triggers a send message to /app/startgame which triggers a broadcast to all players which gets caught in subscribe callback and set as MessageReceived, where I check if role is null, which if it isn't, everyone gets rerouted to /rolereveal
  }

  const doUpdateGameSettings = () => {
    console.log("stompClient 2: ", stompClient);
    console.log("Settings!");
    setPopoverOpened((open) => !open);
  }

  const doSave = async () => {
    if (!stompClient || !stompClient.connected) {
      console.log("Stomp client is not connected, trying to reconnect...");
      try {
        await connect();
        console.log("Reconnected successfully.");
      } catch (error) {
        console.error("Failed to reconnect:", error);

        return;
      }
    }

    const headers = { "Content-type": "application/json" };
    const gameSettings = { numberOfWerewolves, numberOfVillagers, numberOfProtectors, numberOfSeers, numberOfSacrifices};
    const body = JSON.stringify(gameSettings);
    console.log("Save!");
    console.log("number of players werewolves: " + numberOfWerewolves);
    console.log("number of players villagers: " + numberOfVillagers);
    console.log("number of players seers: " + numberOfSeers);
    console.log("number of players sacrifices: " + numberOfSacrifices);
    console.log("number of players protectors: " + numberOfProtectors);

    try {
      stompClient.send(`/app/settings/${lobbyId}`, headers, body);
      setPopoverOpened(false);
    } catch (e) {
      console.error("Something went wrong while updating settings:", e.message);
    }
  };

  let content = <Spinner />;
  let headerMessage = "";

  if (messageReceived !== null) {
    content = (
      <div className ="waitingRoom game-container">
        <ul className= "waitingRoom game-user-list">
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
      <div className="waitingRoom background-container">
        <div className= "waitingRoom header">
          Welcome to game
          <ActionIcon className="waitingRoom setting-button"
            aria-label="Settings"
            onClick={doUpdateGameSettings}
          >
            <IconAdjustments style={{ width: "70%", height: "70%" }} stroke={1.5} />
          </ActionIcon>
        </div>
        <div className= "waitingRoom highlight">{lobbyCode}</div>
        {checkIfAllPlayersHere() ? 
          (<div className="waitingRoom heading">Everyone is here!<br></br>{hostName}, start the game.</div>):
          (<div className="waitingRoom heading">{numberOfPlayersInLobby} / {numberOfPlayers} players have joined,<br></br>
        waiting for {numberOfPlayers - numberOfPlayersInLobby} more.<Spinner /></div>)
        }  
        <div className= "waitingRoom container">
          {content}
          <div className="waitingRoom button-container">
            { user === hostName &&
            <Button
              width="100%"
              height="40px"
              disabled={checkIfAllPlayersHere() === false}
              onClick={() => doStartGame()}
            >Start Game
            </Button>}
          </div>
        </div>
        {popoverOpened && (
          <Popover
            opened={popoverOpened} onClose={() => setPopoverOpened(false)}
            trapFocus
            withArrow
            shadow="md"
          >
            <Popover.Dropdown className="waitingRoom dropdown">
              <RoleNumberInput label="Werewolf" placeholder="1" min={1} value={numberOfWerewolves} onChange={setNumberOfWerewolves} />
              <RoleNumberInput label="Seer" placeholder="1" min={1} value={numberOfSeers} onChange={setNumberOfSeers} />
              <RoleNumberInput label="Villager" placeholder="1" min={1} value={numberOfVillagers} onChange={setNumberOfVillagers} />
              <RoleNumberInput label="Protector" placeholder="1" min={1} value={numberOfProtectors} onChange={setNumberOfProtectors} />
              <RoleNumberInput label="Sacrifice" placeholder="0" min={0} value={numberOfSacrifices} onChange={setNumberOfSacrifices} />
              <Button
                width="100%"
                height="40px"
                disabled={(numberOfWerewolves + numberOfSeers + numberOfVillagers + numberOfProtectors + numberOfSacrifices) < numberOfPlayersInLobby}
                onClick={() => doSave()}
              >Save
              </Button>
            </Popover.Dropdown>
          </Popover>
        )}
      </div>
    </BaseContainer>
  );
};

export default WaitingRoom;
