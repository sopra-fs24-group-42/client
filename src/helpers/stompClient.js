import SockJS from "sockjs-client";
import { over, client } from "stompjs";
import { getDomain } from "./getDomain";

var ws = null;
var connection = false;
const baseURL = getDomain();

var stompClient = null;

export var connect = (callback) => { // passing a callback function as argument to STOMP's connect method --> this will be the call to subscribe
  var socket = new SockJS(baseURL+"/game"); // creating a new SockJS object (essentially a websocket object)
  stompClient = over(socket); // specifying that it's a special type of websocket connection (i.e. using sockJS)
  stompClient.connect({}, function (frame) { // connecting to server websocket: instructions inside "function" will only be executed once we get something (i.e. a connect frame back from the server). Parameter "frame" is what we get from the server. 
    console.log("socket was successfully connected: " + frame);
    connection = true;
    setTimeout(function() {// "function" will be executed after the delay (i.e. subscribe is called because we call connect with a function as argument e.g. see createGame.tsx)
    }, 500);
    callback();
    /* ws.subscribe("/queue/errors", function(message) {
        console.log("Error " + message.body);
        }); // Subscribe to error messages through this*/
  });
  stompClient.onclose = reason => {
    connection = false;
    console.log("Socket was closed, Reason: " + reason);
  }
}

export const subscribe = (destination, callback) => { // we call this function with destination and sendUsername as parameters (where sendUsername is a function that sends the user's username)
  const subsciption = stompClient.subscribe(destination, function(message) { 
    console.log("received message on " + destination + ": " + message.body);
    console.log(JSON.parse(message.body));
  });
  setTimeout(function() {
  }, 500);
  callback(); // this 
  console.log("subscribed to " + destination + " successfully");
}

export const unsubscribe = (mapping) => {
  stompClient.unsubscribe(mapping, function (data) {});
}

export const send = (destination, body) => {
  const headers = {
    "Content-Type": "application/json"
  };
  stompClient.send(destination, headers, body);
}

export let getConnection = () => connection;

export const disconnect = () => {
  if (stompClient !== null) ws.disconnect();
  connection = false
  console.log("Disconnected websocket.");
}

//export const startGame = (lobbyId, token) => {
//    const requestBody = JSON.stringify({lobbyId});
//    const headers = {
//        Authorization: `Bearer ${token}`,
//       'Content-Type': 'application/json'
//    };
//    ws.send("/app/games/" + lobbyId, headers, requestBody);
//}