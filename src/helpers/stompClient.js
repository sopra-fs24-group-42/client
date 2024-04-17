import SockJS from "sockjs-client";
import { over, client } from "stompjs";
import { getDomain } from "./getDomain";
import Lobby from "../models/Lobby.js";
import { useLobby } from "./lobbyContext";

var ws = null;
var connection = false;
const baseURL = getDomain();

var stompClient = null;

var lobby = new Lobby();
//console.log(lobby);

export var connect = async (callback) => {
  return new Promise((resolve, reject) => {
    var socket = new SockJS(baseURL+"/game"); // creating a new SockJS object (essentially a websocket object)
    stompClient = over(socket); // specifying that it's a special type of websocket connection (i.e. using sockJS)
    stompClient.connect({}, function (frame) { // connecting to server websocket: instructions inside "function" will only be executed once we get something (i.e. a connect frame back from the server). Parameter "frame" is what we get from the server. 
      console.log("socket was successfully connected: " + frame);
      connection = true;
      setTimeout(async function() {// "function" will be executed after the delay (i.e. subscribe is called because we call connect with a function as argument e.g. see createGame.tsx)
        await callback();
        console.log("I waited: I received a CONNECT frame back!!");
        resolve(stompClient);
      }, 500);
    })  // passing a callback function as argument to STOMP's connect method --> this will be the call to subscribe
  }, function(error) {
    console.log("There was an error in connecting: " + error);
    connection = false;
    reject(error);
  });
  //stompClient.onclose = reason => {
  //connection = false;
  //console.log("Socket was closed, Reason: " + reason);
  //});
}

export const subscribe = async (destination, callback) => { // we call this function with destination and sendUsername as parameters (where sendUsername is a function that sends the user's username)
  return new Promise((resolve, reject) => {
    //const { updateLobby } = useLobby();
    stompClient.subscribe(destination, function(message) {
      console.log("subscribed to " + destination + " successfully");
      console.log("received message at " + destination);
      console.log(JSON.parse(message.body));
      localStorage.setItem("lobby", message.body);
      setLobby(JSON.parse(message.body));
      //updateLobby(JSON.parse(message.body));
      resolve(stompClient);
    });
    //callback(); 
    console.log("I waited: for the client to SEND");
  }, function (error) {
    console.log("There was an error in subscribing: " + error);
  }); 
}

function setLobby(messageBody) { //messageBody should be parsed already! 
  lobby.lobbyCode = messageBody.lobbyCode;
  lobby.lobbyId = messageBody.lobbyId;
  lobby.hostName = messageBody.hostName;
  lobby.numberOfPlayers = messageBody.numberOfPlayers;
  lobby.players = messageBody.players;
  lobby.gameSettings = messageBody.gameSettings;
  lobby.gameState = messageBody.gameState;
  console.log("lobby as a js object::: " + JSON.stringify(getLobby()));
  console.log("lobby players list inside js lobby object::: " + JSON.stringify(getLobby()["players"]));
  console.log("lobby players list inside js lobby object SIZE: " + getLobby()["players"].length);

}

export const unsubscribe = (mapping) => {
  stompClient.unsubscribe(mapping, function (data) {});
}

export const send = async (destination, body) => {
  const headers = {
    "Content-Type": "application/json"};
  stompClient.send(destination, headers, body);
}

export function getSubscribedToLobby() {return subscribedToLobby;}

export function getLobby() {return lobby;}

export function getLobbySize() {
  try {return lobby["players"].length;} catch (e){return 0;}}

export let getConnection = () => connection;

export const disconnect = () => {
  if (stompClient !== null) ws.disconnect();
  connection = false
  console.log("Disconnected websocket.");
}

