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
import { Settings } from "tabler-icons-react";
import { IconAdjustments } from "@tabler/icons-react";

const LobbyMember = ({ user }: { user: User }) => (
  <div className="waitingRoom player-container">
    <div className="waitingRoom player-username">{user.username.slice(0,-5)}</div>
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
  const [leftGame, setLeftGame] = useState(false);
  const baseURL = getDomain();
  var subscription = null;
  localStorage.removeItem("role");

  const navigate = useNavigate();

  // variables needed for dynamic rendering of waitingRoom
  const [messageReceived, setMessageReceived] = useState(null);
  const [playersInLobby, setPlayersInLobby] = useState<User []>([]); // this variable will store the list of players currently in the lobby
  const [numberOfPlayersInLobby, setNumberOfPlayersInLobby] = useState(0);
  const [numberOfPlayers, setNumberOfPlayers] = useState(0);
  const [hostName, setHostName] = useState(null);
  const [role, setRole] = useState(null);
  // game settings update
  const [popoverLeaveGame, setPopoverLeaveGame] = useState(false);
  const [popoverOpened, setPopoverOpened] = useState(false);
  const [numberOfWerewolves, setNumberOfWerewolves] = useState(null);
  const [numberOfVillagers, setNumberOfVillagers] = useState(null);
  const [numberOfSeers, setNumberOfSeers] = useState(null);
  const [numberOfSacrifices, setNumberOfSacrifices] = useState(null);
  const [numberOfProtectors, setNumberOfProtectors] = useState(null);
  const [everyoneHere, setEveryoneHere] = useState(false);


  // variables needed for UI
  const lobbyCode = localStorage.getItem("lobbyCode"); // need this to display at the top of the waitingRoom

  // variables needed for conditional button display
  const lobbyId = localStorage.getItem("lobbyId");
  const username = localStorage.getItem("user");
  const playerId = localStorage.getItem("playerId");

  const connect = async () => {
    return new Promise((resolve, reject) => {
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
        setNumberOfVillagers(JSON.parse(message.body).gameSettings.numberOfVillagers);
        setNumberOfWerewolves(JSON.parse(message.body).gameSettings.numberOfWerewolves);
        setNumberOfSeers(JSON.parse(message.body).gameSettings.numberOfSeers);
        setNumberOfProtectors(JSON.parse(message.body).gameSettings.numberOfProtectors);
        setNumberOfSacrifices(JSON.parse(message.body).gameSettings.numberOfSacrifices);
        resolve(subscription);
      });
    }); 
  }

  // this is executed anytime page is reloaded
  useEffect(() => { // This is executed once upon mounting of waitingRoom --> establishes ws connection & subscribes
    if(!connection) {
      const connectAndSubscribe = async () => {
        try {
          await connect();
          subscription = await subscribe(`/topic/lobby/${lobbyId}`);     
        } catch (error) {
          console.error("There was an error connecting or subscribing: ", error);
        }
      };
      connectAndSubscribe();

      if (messageReceived && messageReceived.players && !leftGame) {
        if ((messageReceived.playerMap[`${username}`].roleName) !== null) { //checking if role has been assigned
          setRole(messageReceived.playerMap[`${username}`].roleName);
          navigate("/rolereveal");
        }
        setPlayersInLobby(messageReceived.players);
        setNumberOfPlayersInLobby((messageReceived.players).length);
        setNumberOfPlayers(messageReceived.numberOfPlayers);
        setHostName(messageReceived.hostName);
        setNumberOfVillagers(messageReceived.gameSettings.numberOfVillagers);
        setNumberOfWerewolves(messageReceived.gameSettings.numberOfWerewolves);
        setNumberOfSeers(messageReceived.gameSettings.numberOfSeers);
        setNumberOfProtectors(messageReceived.gameSettings.numberOfProtectors);
        setNumberOfSacrifices(messageReceived.gameSettings.numberOfSacrifices);
      }
    }

    return () => {
      const headers = {
        "Content-type": "application/json"
      };
      const body = JSON.stringify({lobbyId});
      try{
        if(!alreadySent && username === localStorage.getItem("toaster")) {
          stompClient.send("/app/startgame", headers, body);
          localStorage.removeItem("toaster");
        }
      } catch (e) {
        console.log("Something went wrong starting the game :/");
      }
    }
  }, []);

  useEffect(() => { // This useEffect tracks changes in the lobby
    if (messageReceived && messageReceived.players && !leftGame) {
      if ((messageReceived.playerMap[`${username}`].roleName) !== null) { //checking if role has been assigned
        setRole(messageReceived.playerMap[`${username}`].roleName);
        navigate("/rolereveal");
      }
      setPlayersInLobby(messageReceived.players);
      setNumberOfPlayersInLobby((messageReceived.players).length);
      setNumberOfPlayers(messageReceived.numberOfPlayers);
      setHostName(messageReceived.hostName);
      setNumberOfVillagers(messageReceived.gameSettings.numberOfVillagers);
      setNumberOfWerewolves(messageReceived.gameSettings.numberOfWerewolves);
      setNumberOfSeers(messageReceived.gameSettings.numberOfSeers);
      setNumberOfProtectors(messageReceived.gameSettings.numberOfProtectors);
      setNumberOfSacrifices(messageReceived.gameSettings.numberOfSacrifices);
      if(numberOfPlayers === numberOfPlayersInLobby) {
        setEveryoneHere(true);}
      //checkIfAllPlayersHere();
      console.log("number of players in lobby: " + numberOfPlayersInLobby);
    }
  }, [messageReceived]); 

  // const checkIfAllPlayersHere = () => {
  //   if(numberOfPlayers === numberOfPlayersInLobby) {
  //     setEveryoneHere(true);
  //     return true;
  //   }
    
  //   return false;
  // }

  const doStartGame = () => {
    setAlreadySent(true);
    localStorage.setItem("toaster", hostName);
    navigate("/rolereveal"); //--> This triggers dismount of this component, which triggers return value of first useEffect, which triggers a send message to /app/startgame which triggers a broadcast to all players which gets caught in subscribe callback and set as MessageReceived, where I check if role is null, which if it isn't, everyone gets rerouted to /rolereveal
  }

  const tryLeaveGame = () => {
    setPopoverLeaveGame((open) => !open);
  }

  const doLeaveGame = async () => {
    try {
      setAlreadySent(true);
      setLeftGame(true);
      await api.delete(`/players/${username}`);
      navigate("/frontpage");
    } catch (error) {
      alert(
        `Something went wrong during the deletion of a player: \n${handleError(error)}` 
      )
    }
    
  }

  const doUpdateGameSettings = () => {
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

  let content = "";
  let hostContent = "";
  //let content = <Spinner />;
  //let hostContent = <Spinner />;
  let headerMessage = "";

  if (messageReceived !== null) {
    hostContent = (
      <div className ="waitingRoom host-game-container">
        <ul className= "waitingRoom game-user-list">
          {playersInLobby.map((user: User) => (
            <li key={user.username}>
              < LobbyMember user={user} />
            </li>
          ))}
        </ul>
      </div>
    );
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
      {(() => {
        if(username === hostName) { // host view
          return (
            <div className="waitingRoom background-container">
              <div className="waitingRoom settings-container">
                <ActionIcon className="waitingRoom setting-button"
                  aria-label="Settings"
                  onClick={doUpdateGameSettings}
                >
                  <Settings 
                    size={42}
                    strokeWidth={1.8}
                    color={"#262632"}/>
                </ActionIcon>
              </div>
              <div className= "waitingRoom header">
              Welcome to game
              </div>
              <div className= "waitingRoom highlight">{lobbyCode}</div>
              {everyoneHere ? 
                (<div className="waitingRoom heading">Everyone is here!<br></br>{hostName.slice(0,-5)}, start the game.</div>):
                (<div className="waitingRoom heading">{numberOfPlayersInLobby} / {numberOfPlayers} players have joined,<br></br>
                waiting for {numberOfPlayers - numberOfPlayersInLobby} more.<Spinner /></div>)
              }
              <div className= "waitingRoom container">
                {hostContent}
                <div className="waitingRoom button-container">
                  <Button
                    width="100%"
                    height="40px"
                    disabled={!everyoneHere}
                    onClick={() => doStartGame()}
                  >Start Game
                  </Button>
                  <Button
                    width="100%"
                    height="40px"
                    onClick={() => tryLeaveGame()}
                  >Leave Game
                  </Button>
                </div>
                {popoverOpened && (
                  <Popover
                    opened={popoverOpened} onClose={() => setPopoverOpened(false)}
                    trapFocus
                    withArrow
                    shadow="md"
                  >
                    <Popover.Dropdown className="waitingRoom settings-dropdown">
                      <Button
                        width="10%"
                        height="40px"
                        top= "0"
                        right= "0"
                        onClick={() => setPopoverOpened(false)}
                      >X
                      </Button>
                      <RoleNumberInput label="Werewolves" placeholder="1" min={1} value={numberOfWerewolves} onChange={setNumberOfWerewolves} />
                      <RoleNumberInput label="Seers" placeholder="1" min={1} value={numberOfSeers} onChange={setNumberOfSeers} />
                      <RoleNumberInput label="Villagers" placeholder="1" min={0} value={numberOfVillagers} onChange={setNumberOfVillagers} />
                      <RoleNumberInput label="Protectors" placeholder="1" min={0} value={numberOfProtectors} onChange={setNumberOfProtectors} />
                      <RoleNumberInput label="Sacrifices" placeholder="0" min={0} value={numberOfSacrifices} onChange={setNumberOfSacrifices} />
                      <Button
                        width="100%"
                        height="40px"
                        disabled={(numberOfWerewolves + numberOfSeers + numberOfVillagers + numberOfProtectors + numberOfSacrifices) < numberOfPlayersInLobby
                          && (numberOfWerewolves + numberOfSeers + numberOfVillagers + numberOfProtectors + numberOfSacrifices) < 4
                        }
                        onClick={() => doSave()}
                      >Save
                      </Button>
                    </Popover.Dropdown>
                  </Popover>
                )}
              </div>
            </div>
          )
        } else { // non-host view
          return (
            <div className="waitingRoom background-container">
              <div className= "waitingRoom header">
              Welcome to game
              </div>
              <div className= "waitingRoom highlight">{lobbyCode}</div>
              {everyoneHere ? 
                (<div className="waitingRoom heading">Everyone is here!<br></br>{hostName.slice(0,-5)}, start the game.</div>):
                (<div className="waitingRoom heading">{numberOfPlayersInLobby} / {numberOfPlayers} players have joined,<br></br>
                waiting for {numberOfPlayers - numberOfPlayersInLobby} more.<Spinner /></div>)
              }
              <div className= "waitingRoom container">
                {content}
              </div>
              <div className="waitingRoom button-container">
                <Button
                  width="100%"
                  height="40px"
                  onClick={() => tryLeaveGame()}
                >Leave Game
                </Button>
              </div>
            </div>
          )
        }
      })()}          
      {popoverLeaveGame && (
        <Popover
          opened={popoverLeaveGame} onClose={() => setPopoverLeaveGame(false)}
          withArrow
          shadow="md"
        >
          <Popover.Dropdown className="waitingRoom dropdown">
            <div className="waitingRoom popover-container">
              <div className="waitingRoom heading">Are you sure you want to leave the game?</div>
              <Button
                width="100%"
                height="40px"
                onClick={() => doLeaveGame()}
              >Yes
              </Button>
              <Button
                width="100%"
                height="40px"
                onClick={() => setPopoverLeaveGame(false)}
              >Nevermind
              </Button>
            </div>
          </Popover.Dropdown>
        </Popover>
      )}
    </BaseContainer>
  );
};

export default WaitingRoom;
