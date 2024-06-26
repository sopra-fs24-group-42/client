import React, { useState, useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { over } from "stompjs";
import { getDomain } from "../../helpers/getDomain";
import { api, handleError } from "helpers/api";
import { Spinner } from "components/ui/Spinner";
import {useNavigate, useLocation} from "react-router-dom";
import { Button } from "components/ui/Button";
import BaseContainer from "components/ui/BaseContainer";
import "styles/views/Voting.scss";
import PropTypes from "prop-types";
import { User } from "types";

const LobbyMember = ({ user }: { user: User }) => (
  <div className="voting player-container">
    <div className="voting player-username">{user.username.slice(0,-5)}</div>
  </div>
);

LobbyMember.propTypes = {
  user: PropTypes.object,
};

const Voting = () => {
  // variables needed for establishing websocket connection
  var connection = false;

  const baseURL = getDomain();
  var stompClient = null;
  var subscription = null;
  
  const navigate = useNavigate();
  const Ref = useRef(null);
  const [timer, setTimer] = useState("00:00");
  let gameState = "VOTING";

  const [messageReceived, setMessageReceived] = useState(null);
  const [playersInLobby, setPlayersInLobby] = useState(null);

  const [selected, setSelected] = useState("");
  var votedPlayer = null;

  const [ready, setReady] = useState(false);
  const [alreadySent, setAlreadySent] = useState(false);
  const [abstained, setAbstained] = useState(false);
  const [nightActionDone, setNightActionDone] = useState(false);

  // variables needed for UI  
  const lobbyId = localStorage.getItem("lobbyId");
  const username = localStorage.getItem("user");

  const getTimeRemaining = (e) => {
    const total = Date.parse(e) - Date.parse(new Date());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);

    return {
      total,
      minutes,
      seconds,
    };
  };

  const startTimer = (e) => {
    let { total, minutes, seconds } = getTimeRemaining(e);
    if (total >= 0) {
      // Continue updating the timer
      setTimer(
        `${minutes > 9 ? minutes : "0" + minutes}:${
          seconds > 9 ? seconds : "0" + seconds}`
      );
    } else {
      // Timer expires, navigate to another page
      setReady(true);
      setAlreadySent(true);
      clearInterval(Ref.current);
    }
  };

  const clearTimer = (e) => {
    setTimer("02:00");
    if (Ref.current) clearInterval(Ref.current);
    const id = setInterval(() => {
      startTimer(e);
    }, 1000);
    Ref.current = id;
  };

  const getDeadTime = () => {
    let deadline = new Date();
    deadline.setSeconds(deadline.getSeconds() + 120); //120

    return deadline;
  };

  useEffect(() => {
    clearTimer(getDeadTime());

    return () => {
      if (Ref.current) {
        clearInterval(Ref.current);}
    };
  }, []);


  const connect = async () => {
    return new Promise((resolve, reject) => {
      const socket = new SockJS(baseURL+"/game"); // creating a new SockJS object (essentially a websocket object)
      //const client = over(socket); // specifying that it's a special type of websocket connection (i.e. using sockJS)
      stompClient = over(socket); // specifying that it's a special type of websocket connection (i.e. using sockJS)
      stompClient.connect({}, function (frame) { // connecting to server websocket: instructions inside "function" will only be executed once we get something (i.e. a connect frame back from the server). Parameter "frame" is what we get from the server. 
        console.log("socket was successfully connected: " + frame);
        connection = true;
        //connection = true;
        setTimeout(function() {// "function" will be executed after the delay (i.e. subscribe is called because we call connect with a function as argument e.g. see createGame.tsx)
          //const response = await callback();
          console.log("I waited: I received  MESSAGE frame back based on subscribing!!");
          resolve(stompClient);
        }, 500);
      });
      stompClient.onclose = reason => {
        connection = false;
        console.log("Socket was closed, Reason: " + reason);
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
        setNightActionDone(JSON.parse(message.body).playerMap[username].isReady);
        resolve(subscription);
      });
    }); 
  }

  useEffect(() => { // This is executed once upon mounting of waitingRoom --> establishes ws connection & subscribes
    //if(!connection) { 
    const connectAndSubscribe = async () => { 
      try {
        await connect();
        subscription = await subscribe(`/topic/lobby/${lobbyId}`);     
      } catch (error) {
        console.error("There was an error connecting or subscribing: ", error);
      }
    };
    connectAndSubscribe();

    if (messageReceived) {
      if (messageReceived.gameState === "REVEALVOTING") {
        navigate("/revealvoting");
      }
      setPlayersInLobby(messageReceived.players);
      setNightActionDone(messageReceived.playerMap[username].isReady);
    }

    return () => {
      const headers = {
        "Content-type": "application/json"
      };
      let selection = localStorage.getItem("selected");
      const body = JSON.stringify({username, selection});                        
      try {
        if(!alreadySent) { // to avoid SEND frames being sent doubled
          stompClient.send("/app/voting", headers, body);
          setTimeout(() => {
            stompClient.send("/app/ready", headers, JSON.stringify({username, gameState}));
          }, 1000);
        }
      } catch (e) {
        console.log("Something went wrong sending selection information: " + e);
      }
      setAlreadySent(true);
    }
  }, [ready]);

  useEffect(() => { // This useEffect tracks changes in the lobby
    if (messageReceived) {
      if (messageReceived.gameState === "REVEALVOTING") {
        navigate("/revealvoting");
      }
      setPlayersInLobby(messageReceived.players);
      setNightActionDone(messageReceived.playerMap[username].isReady);
    }
  }, [messageReceived]); 

  const doSendSelected = () => {
    setAlreadySent(true);
    setReady(true);
  }

  const doAbstain = () => {
    setAlreadySent(true);
    setReady(true);
    setAbstained(true);
    localStorage.setItem("selected", "");
    localStorage.setItem("abstainedPersist", "t");
  }
  
  useEffect(() => {
    if(selected !== "") {
      localStorage.setItem("selected", selected);}
  },[selected])

  let content = <Spinner />;

  if (messageReceived !== null) {
    content = (
      <div className ="voting game-container">
        <ul className= "voting game-user-list">
          {playersInLobby.map((user: User) => {
            if(user.isAlive && user.username !== username) { // only display other players that are still alive and also not yourself
              return (
                <li key={user.username}
                  onClick={() => setSelected(user.username)}
                  className={`voting player-container ${selected === user.username ? "selected" : ""}`}
                >
                  < LobbyMember user={user} />
                </li>
              );
            }

            return null;
          })}
        </ul>
      </div>
    );}

  return (
    <div className="voting total-background">
      <BaseContainer>
        <div className="voting background-container">
          <div className="voting header">Time to put it to a vote!
            <div className="voting highlight">{timer}</div>
            <BaseContainer>
              {(() => {
                if ((ready && (selected !== "" || abstained)) || nightActionDone) { // selected someone & confirmed
                  return (
                    <div className="voting container">
                      {localStorage.getItem("abstainedPersist") === "t" ?
                        <div className="voting heading">You have chosen to abstain</div> :
                        <div className="voting heading">You have voted for {localStorage.getItem("selected").slice(0, -5)}</div>}
                      <div className="voting wait">Waiting for all players to submit their vote...</div>
                      <Spinner />
                    </div>)
                } else if (selected !== "" && !ready && !nightActionDone) { // selected someone but not confirmed yet
                  return (
                    <div className="voting container">
                      <div className="voting heading">You have selected<br></br> {selected.slice(0, -5)} </div>
                      <div className="voting container">{content}
                        <div className="voting button-container">
                          <Button
                            width="100%"
                            height="40px"
                            onClick={() => doSendSelected()}
                          >Vote
                          </Button>
                          <Button
                            width="100%"
                            height="40px"
                            onClick={() => doAbstain()}
                          >Abstain
                          </Button>
                        </div>
                      </div>
                    </div>)
                } else if (!nightActionDone) { // not selected anyone yet
                  return (
                    <div className="voting container">
                      <div className="voting heading">{username.slice(0, -5)},<br></br> select who you want to vote out.</div>
                      <div className="voting container">{content}</div>
                      <div className="voting button-container">
                        <Button
                          width="100%"
                          height="40px"
                          onClick={() => doSendSelected()}
                          disabled={true}
                        >Confirm
                        </Button>
                        <Button
                          width="100%"
                          height="40px"
                          onClick={() => doAbstain()}
                        >Abstain
                        </Button>
                      </div>
                    </div>
                  )
                }
              })()}
            </BaseContainer>
          </div>
        </div>
      </BaseContainer>
    </div>
  );
};

export default Voting;
