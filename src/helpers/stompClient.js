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
  stompClient.connect({}, function (frame) { // connecting to server websocket
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

export const subscribe = (destination, callback) => {
  stompClient.subscribe(destination, function (frame) {
    console.log("socket was successfully subscribed: " + frame);
    //setTimeout(function() {// "function" will be executed after the delay (i.e. subscribe is called because we call connect with a function as argument e.g. see createGame.tsx)
    //}, 500);
    //callback()
    callback(JSON.parse(frame.body)); // This is already the body!!!
  });
}

export const unsubscribe = (mapping) => {
  stompClient.unsubscribe(mapping, function (data) {});
}

export const send = (destination, body) => {
  const headers = {
    'Content-Type': 'application/json'
};
  stompClient.send(destination, headers, body);
}

export const testMessage = (lobbyId, body) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  stompClient.send("topic/test", headers, body);
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