import React, { useState, useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { over } from "stompjs";
import { getDomain } from "../../helpers/getDomain";
import { Spinner } from "components/ui/Spinner";
import {useNavigate, useLocation} from "react-router-dom";
import { Button } from "components/ui/Button";
import BaseContainer from "components/ui/BaseContainer";
import "styles/views/NightAction.scss";
import PropTypes from "prop-types";
import { User } from "types";

const LobbyMember = ({ user }: { user: User }) => (
  <div className="nightAction player-container">
    <div className="nightAction player-username">{user.username.slice(0,-5)}</div>
  </div>
);

LobbyMember.propTypes = {
  user: PropTypes.object,
};

const NightAction = () => {
  // variables needed for establishing websocket connection
  var connection = false;

  const baseURL = getDomain();
  var stompClient = null;
  var subscription = null;
  
  const navigate = useNavigate();
  const Ref = useRef(null);
  const [timer, setTimer] = useState("00:00");

  let gameState = "NIGHT";

  // variables needed for dynamic rendering of waitingRoom
  const [messageReceived, setMessageReceived] = useState(null);
  const [playersInLobby, setPlayersInLobby] = useState(null);
  const [alreadySent, setAlreadySent] = useState(false);
  const [abstained, setAbstained] = useState(false);
  const [selected, setSelected] = useState("");
  const [nightActionDone, setNightActionDone] = useState(false);
  const [seerBlock, setSeerBlock] = useState(false);

  // for seer role
  var sentReady = false;
  const [ready, setReady] = useState(false);
  const [revealRole, setRevealRole] = useState(null);

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

  // variables needed for UI  
  const lobbyId = localStorage.getItem("lobbyId");
  const username = localStorage.getItem("user");
  const role = localStorage.getItem("role");

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
      subscription = stompClient.subscribe(destination, async function(message) { 
        console.log("Subscription: " + JSON.stringify(subscription));
        // all of this only gets executed when message is received
        setMessageReceived(JSON.parse(message.body));
        setPlayersInLobby(JSON.parse(message.body).players);
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
    if(localStorage.getItem("seerPersist") === "t") {
      setSeerBlock(true);
    }

    if (messageReceived) {
      if (messageReceived.gameState === "REVEALNIGHT") {
        navigate("/nightreveal");
      } else if (messageReceived.gameState === "ENDGAME") {
        navigate("/end");
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
          stompClient.send(`/app/${role}/nightaction`, headers, body);
          setTimeout(() => {
            stompClient.send("/app/ready", headers, JSON.stringify({username, gameState}));
          }, 1000);
          sentReady = true; // for seer
        }
      } catch (e) {
        console.log("Something went wrong sending selection information: " + e);
      }
    }
  }, [ready]); 

  useEffect(() => { // This useEffect tracks changes in the lobby
    if (messageReceived) {
      if (messageReceived.gameState === "REVEALNIGHT") {
        navigate("/nightreveal");
      } else if (messageReceived.gameState === "ENDGAME") {
        navigate("/end");
      }
      setPlayersInLobby(messageReceived.players);
      setNightActionDone(messageReceived.playerMap[username].isReady);
      console.log(`USER IS READY? ${nightActionDone}`);
    }
  }, [messageReceived]); 

  useEffect(() => { 
    console.log(`USER IS READY? ${nightActionDone}`);
  }, [nightActionDone]); 

  const doReveal = () => {
    try{
      setRevealRole(messageReceived.playerMap[`${selected}`].roleName);
      localStorage.setItem("seerPersist", "t");
    } catch (e) {
      console.log("Could not fetch role: " + e);
    }
  }

  const doSendSelected = () => {
    setReady(true);
    setAlreadySent(true);
  }

  const doAbstain = () => {
    setReady(true);
    setAlreadySent(true);
    setAbstained(true);
    localStorage.setItem("abstainedPersist", "t");
    localStorage.setItem("selected", "");
  }

  useEffect(() => {
    if(selected !== "") {
      localStorage.setItem("selected", selected);}
  },[selected])


  let content = <Spinner />;
  let werewolfContent = <Spinner />;
  let protectorContent = <Spinner />;

  if (messageReceived !== null) {
    content = (
      <div className ="nightAction game-container">
        <ul className= "nightAction game-user-list">
          {playersInLobby.map((user: User) => {
            if(user.username !== username && user.isAlive) {
              return (
                <li key={user.username}
                  onClick={() => setSelected(user.username)}
                  className={`nightAction player-container ${"isNotWerewolf"} ${selected === user.username ? "selected" : ""}`}
                >
                  < LobbyMember user={user} />
                </li>
              );
            }      
          })}
        </ul>
      </div>
    );
    protectorContent = (
      <div className ="nightAction game-container">
        <ul className= "nightAction game-user-list">
          {playersInLobby.map((user: User) => {
            if(user.isAlive) {
              return (
                <li key={user.username}
                  onClick={() => setSelected(user.username)}
                  className={`nightAction player-container ${"isNotWerewolf"} ${selected === user.username ? "selected" : ""}`}
                >
                  < LobbyMember user={user} />
                </li>
              );
            }      
          })}
        </ul>
      </div>
    );

    werewolfContent = (
      <div className ="nightAction game-container">
        <ul className= "nightAction game-user-list">
          {playersInLobby.map((user: User) => {
            let isWerewolf = user.roleName === "Werewolf";
            if(user.username !== username && user.isAlive) {
              return (
                <li key={user.username}
                  onClick={() => setSelected(user.username)}
                  className={`nightAction player-container ${isWerewolf ? "isWerewolf" : "isNotWerewolf"} ${selected === user.username ? "selected" : ""}`}
                >
                  < LobbyMember user={user} />
                </li>
              );
            } 
          })}
        </ul>
      </div>
    );
  }

  return (
    <BaseContainer>
      <div className="nightAction background-container">
        <div className= "nightAction header1">Night has fallen...</div>
        <div className="nightAction highlight">{timer}</div>
        {(() => {
          if(role === "Werewolf") {
            return (
              <div className = "nightAction container">
                {(() => {
                  if((ready && (selected !== "" || abstained)) || nightActionDone) { // selected someone and confirmed
                    return (
                      <div className="nightAction container">
                        {localStorage.getItem("abstainedPersist") === "t" ? 
                          <div className= "nightAction heading">You have chosen to abstain</div>:
                          <div className= "nightAction heading">You have attempted to kill {localStorage.getItem("selected").slice(0,-5)}</div>
                        }
                        <div className= "nightAction wait">Waiting for all players to finish their night actions...<br></br></div>
                        <Spinner />
                      </div>)}
                  else if (selected !== "" && !ready && !nightActionDone) { // selected someone but not confirmed
                    return (
                      <div className = "nightAction container">
                        <div className= "nightAction heading">You have selected {selected.slice(0,-5)} 
                          <div className= "nightAction container">{werewolfContent}
                            <div className = "nightAction button-container">
                              <Button
                                width="100%"
                                height="40px"
                                onClick={() => doSendSelected()}
                              >Kill
                              </Button>
                              <Button
                                width="100%"
                                height="40px"
                                onClick={() => doAbstain()}
                              >Abstain
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>)
                  } else if(!nightActionDone){ // not selected anyone yet
                    return (
                      <div className = "nightAction container">
                        <div className= "nightAction heading">{username.slice(0,-5)},<br></br> select someone to kill.    
                          <div className= "nightAction container">{werewolfContent} </div>
                          <div className = "nightAction button-container">
                            <Button
                              width="100%"
                              height="40px"
                              onClick={() => doSendSelected()}
                              disabled={true}
                            >Kill
                            </Button>
                            <Button
                              width="100%"
                              height="40px"
                              onClick={() => doAbstain()}
                            >Abstain
                            </Button>
                          </div>
                        </div>
                      </div>)}
                })()}
              </div>
            )
          } else if (role === "Seer") {
            return (
              <div className = "nightAction container">
                {(() => {
                  if (selected !== "" && !revealRole && !abstained && !nightActionDone && !seerBlock) { // selected someone but not seen the role yet 
                    return (
                      <div className="nightAction heading">You have selected <br></br> {selected.slice(0,-5)}
                        <div className="nightAction container">{content}
                          <div className="nightAction button-container">
                            <Button
                              width="100%"
                              height="40px"
                              onClick={() => doReveal()}
                            >See role
                            </Button>
                            <Button
                              width="100%"
                              height="40px"
                              onClick={() => doAbstain()} // TODO: set revealRole to true ?
                            >Abstain
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  } else if (selected !== "" && revealRole && !ready && !nightActionDone && !seerBlock) { // selected someone and looking at role
                    return (
                      <div className="nightAction container">
                        {(() => {
                          if(revealRole === "Werewolf") {
                            return (
                              <div className="nightAction container">
                                <div className="nightAction werewolf"></div>
                              </div>
                            );
                          } else if(revealRole === "Seer") {
                            return (
                              <div className="nightAction role-container">
                                <div className="nightAction seer"></div>
                              </div>
                            );
                          } else if (revealRole === "Villager") {
                            return (
                              <div className="nightAction container">
                                <div className="nightAction villager"></div>
                              </div>
                            )
                          } else if (revealRole === "Protector") {
                            return (
                              <div className="nightAction container">
                                <div className="nightAction protector"></div>
                              </div>
                            )
                          } else if (revealRole === "Sacrifice") {
                            return (
                              <div className="nightAction container">
                                <div className="nightAction sacrifice"></div>
                              </div>
                            )
                          }
                        })()}
                        <div className="nightAction header1">{selected.slice(0,-5)} is a</div>
                        <div className="nightAction role-highlight">{revealRole}</div>
                        <div className="nightAction button-container">
                          <Button
                            width="100%"
                            height="40px"
                            onClick={() => doSendSelected()}
                          >Ok, got it
                          </Button>
                        </div>
                      </div>
                    );
                  } else if (((selected !== "" && revealRole && ready) || (abstained)) || nightActionDone || seerBlock) { // selected someone, seen their role and confirmed
                    return (
                      <div className="nightAction container">
                        {localStorage.getItem("abstainedPersist") === "t" ? 
                          <div className="nightAction heading">You have chosen to abstain</div> :
                          <div className="nightAction heading">You chose to look at <br></br>{localStorage.getItem("selected").slice(0,-5)}</div>
                        }
                        <div className="nightAction wait">Waiting for all players to finish their night actions...<br></br></div>
                        <Spinner />
                      </div>
                    );
                  }
                  else if(!nightActionDone){ // not selected anyone yet (seer)
                    return (
                      <div className = "nightAction container">
                        <div className="nightAction heading">{username.slice(0,-5)},<br></br> whose role do you want to see?
                          <div className="nightAction container">{content} </div>
                        </div>
                        <div className = "nightAction button-container">
                          <Button
                            width="100%"
                            height="40px"
                            onClick={() => doSendSelected()}
                            disabled={true}
                          >See role
                          </Button>
                          <Button
                            width="100%"
                            height="40px"
                            onClick={() => doAbstain()}
                          >Abstain
                          </Button>
                        </div>
                      </div>
                    );}
                })()}
              </div>
            )
          } else if(role === "Sacrifice") {
            return (
              <div className = "nightAction container">
                {(() => {
                  if((ready && (selected !== "" || abstained)) || nightActionDone) { // selected someone and confirmed or abstained
                    return (
                      <div className= "nightAction container">
                        {localStorage.getItem("abstainedPersist") === "t" ? 
                          <div className="nightAction heading">You have chosen to abstain</div> :
                          <div className="nightAction heading">You have chosen to die with <br></br>{localStorage.getItem("selected").slice(0,-5)}</div>
                        }
                        <div className= "nightAction wait">Waiting for all players to finish their night actions...<br></br></div>
                        <Spinner />
                      </div>)
                  } else if (selected !== "" && !ready && !nightActionDone) { // selected someone but not confirmed
                    return(
                      <div className = "nightAction container">
                        <div className= "nightAction heading">You have selected <br></br> {selected.slice(0,-5)}
                          <div className= "nightAction container">{content}
                            <div className="nightAction button-container">
                              <Button
                                width="100%"
                                height="40px"
                                onClick={() => doSendSelected()}
                              >Sacrifice
                              </Button>
                              <Button
                                width="100%"
                                height="40px"
                                onClick={() => doAbstain()}
                              >Abstain
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  } else if(!nightActionDone){ // not selected anyone yet (sacrifice)
                    return (
                      <div className = "nightAction container">
                        <div className="nightAction heading">{username.slice(0,-5)},<br></br> choose someone to die with you
                          <div className="nightAction container">{content} </div>
                        </div>
                        <div className = "nightAction button-container">
                          <Button
                            width="100%"
                            height="40px"
                            onClick={() => doSendSelected()}
                            disabled={true}
                          >Sacrifice
                          </Button>
                          <Button
                            width="100%"
                            height="40px"
                            onClick={() => doAbstain()}
                          >Abstain
                          </Button>
                        </div>
                      </div>
                    );}
                })()}
              </div>
            )
          } else if(role === "Protector") {
            return (
              <div className = "nightAction container">
                {(() => {
                  if((ready && (selected !== "" || abstained)) || nightActionDone) { // selected someone and confirmed or abstained (protector)
                    return (
                      <div className= "nightAction container">
                        {localStorage.getItem("abstainedPersist") === "t" ? 
                          <div className="nightAction heading">You have chosen to abstain</div> :
                          <div className="nightAction heading">You have chosen to protect <br></br>{localStorage.getItem("selected").slice(0,-5)}</div>
                        }
                        <div className= "nightAction wait">Waiting for all players to finish their night actions...<br></br></div>
                        <Spinner />
                      </div>)
                  } else if (selected !== "" && !ready && !nightActionDone) { // selected someone but not confirmed (protector)
                    return(
                      <div className = "nightAction container">
                        <div className= "nightAction heading">You have selected <br></br> {selected.slice(0,-5)}
                          <div className= "nightAction container">{protectorContent}
                            <div className="nightAction button-container">
                              <Button
                                width="100%"
                                height="40px"
                                onClick={() => doSendSelected()}
                              >Protect
                              </Button>
                              <Button
                                width="100%"
                                height="40px"
                                onClick={() => doAbstain()}
                              >Abstain
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  } else if(!nightActionDone) { // not selected anyone yet (protector)
                    return (
                      <div className = "nightAction container">
                        <div className="nightAction heading">{username.slice(0,-5)},<br></br> choose someone to protect
                          <div className="nightAction container">{protectorContent} </div>
                        </div>
                        <div className = "nightAction button-container">
                          <Button
                            width="100%"
                            height="40px"
                            onClick={() => doSendSelected()}
                            disabled={true}
                          >Protect
                          </Button>
                          <Button
                            width="100%"
                            height="40px"
                            onClick={() => doAbstain()}
                          >Abstain
                          </Button>
                        </div>
                      </div>
                    );}
                })()}
              </div>
            )
          } else { // Villager
            return (
              <div className = "nightAction container">
                {(() => {
                  if((ready && (selected !== "" || abstained)) || nightActionDone) { // selected someone and confirmed or abstained (villager)
                    return (
                      <div className= "nightAction container">
                        {localStorage.getItem("abstainedPersist") === "t" ? 
                          <div className="nightAction heading">You have chosen to abstain</div> :
                          <div className="nightAction heading"></div>
                        }
                        <div className= "nightAction wait">Waiting for all players to finish their night actions...<br></br></div>
                        <Spinner />
                      </div>)}
                  else if (selected !== "" && !ready && !nightActionDone) { // selected someone but not confirmed yet (villager)
                    return(
                      <div className = "nightAction container">
                        <div className= "nightAction heading">You have selected {selected.slice(0,-5)}
                          <div className= "nightAction container">{content}
                            <div className="nightAction button-container">
                              <Button
                                width="100%"
                                height="40px"
                                onClick={() => doSendSelected()}
                              >Pretend to not be a villager
                              </Button>
                              <Button
                                width="100%"
                                height="40px"
                                onClick={() => doAbstain()}
                              >Abstain
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>)
                  } else if(!nightActionDone) { // not selected anyone yet (villager)
                    return (
                      <div className = "nightAction container">
                        <div className= "nightAction heading">{username.slice(0,-5)},<br></br> as a villager, you can only hope to survive the night
                          <div className= "nightAction container">{content} </div>
                          <div className="nightAction button-container">
                            <Button
                              width="100%"
                              height="40px"
                              disabled = {true}
                              onClick={() => doSendSelected()}
                            >Pretend to not be a villager
                            </Button>
                            <Button
                              width="100%"
                              height="40px"
                              onClick={() => doAbstain()}
                            >Abstain
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  }
                })()}
              </div>
            )
          }
        })()}
      </div>
    </BaseContainer>
  );
};

export default NightAction;
