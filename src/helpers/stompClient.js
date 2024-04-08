import SockJS from "sockjs-client";
import { over, client } from "stompjs";
import { getDomain } from "./getDomain";

// Question: do I have to include this 'global' initialization when I basically do it inside the methods??
// ## INITIALIZATION ##
// Option 1
// initialization of websocket connection in a node.js app:

//var Stomp = require('@stomp/stompjs'); // requiring the stompjs module
//var client = Stomp.overWS("ws://localhost:15674/ws"); // connecting a STOMP broker over a websocket 
// if you wanted to connect a STOMP broker over a TCP connection, you would use 
//var client = Stomp.overTCP('localhoast', '61613');

// Option 2
// initialization of websocket connection in a web browser with regular websocket:

//var url = "ws://localhost:15674/ws"
//var client = client(url); // from g9 project

// Option 3
// initialization of a custom websocket connection in a web browser:
//<script src="http://cdn.sockjs.org/sockjs-0.3.min.js"></script>
//<script>
// use SockJS implementation instead of the browser's native implementation    //var ws = new SockJS(url);
//var client = Stomp.over(ws);
//[...]
//</script>

// ## INITIALIZATION OVER ##

var websocket = null;
var connection = false;
const baseURL = getDomain();

export var connect = (callback) => { // passing a callback function as argument to STOMP's connect method
  var websocket = new SockJS(baseURL+"/game"); // creating a new SockJS object (essentially a websocket object)
  var client = over(websocket); // specifying that it's a special type of websocket connection (i.e. using sockJS)
  websocket.connect({}, () => { // connecting to server websocket
    setTimeout(function() {// "function" will be executed after the delay (i.e. subscribe is called because we call connect with a function as argument e.g. see createGame.tsx)
      //ws.subscribe('/topic/greetings', function (greeting) {
      //console.log(JSON.parse(greeting.body).content);
      //console.log("Socket was connected.")
      // });
    }, 500);
    connection = true;
    callback();
    /* ws.subscribe("/queue/errors", function(message) {
        console.log("Error " + message.body);
        }); // Subscribe to error messages through this*/
  });
  websocket.onclose = reason => {
    connection = false;
    console.log("Socket was closed, Reason: " + reason);
  }
}

export const subscribe = (mapping, callback) => {
  websocket.subscribe(mapping, function (data) {
    callback(JSON.parse(data.body)); // This is already the body!!!
  });
}

export const unsubscribe = (mapping) => {
  websocket.unsubscribe(mapping, function (data) {});
}

export let getConnection = () => connection;

export const disconnect = () => {
  if (websocket !== null) websocket.disconnect();
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