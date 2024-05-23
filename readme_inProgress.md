# Survive the Night
<div style="text-align: justify"> 

Check out the back-end implementation [here](https://github.com/sopra-fs24-group-42/server).

## 📖 Table of Contents

1. [Introduction](#introduction)
2. [Technologies](#technologies)
3. [High-Level Components](#high-level-components)
    - [The Lobby Object](#the-lobby-object)
    - [Websockets](#websockets)
    - [The useState Variable "ready"](#ready)
4. [Launch & Development](#launch--development)
    - [Getting started](#getting-started)
    - [Prerequisites & installation](#prerequisites-installation)
    - [Text-To-Speech API setup](#tts-setup)
    - [Running locally](#running-locally)
5. [Illustrations](#illustrations)
6. [Roadmap](#roadmap)
7. [Authors](#authors)
8. [Acknowledgments](#acknowledgments)
9. [License](#license)

## Introduction <a name="introduction"></a>
In the evolving world of digital interaction, traditional role-playing games like <i>Werewolf</i> require a modern solution to bridge the gap between virtual and physical game spaces. Our project seeks to digitize this beloved social game to eliminate the need for physical cards, allowing users to engage in an immersive, narration-driven game experience using only their devices at any time. Our implementation stays true to the communal, social setting of the original game by preserving the colocative aspect of the game: players of <i>Survive the Night</i> must be within the same physical space at the same time to play together. Furthermore, the addition of dynamic, realistic-sounding text-to-speech technology enhances the game with an immerisive narrator, allowing all players to enjoy the experience of fully playing the game without any additional responsibilities or duties. We hope you get a kick out of our game and wish you the best of luck to survive the night!

## Technologies <a id="technologies"></a>
To develop the frontend, we used the following technologies:

* [Typescript](https://www.typescriptlang.org/) - Programming language
* [JavaScript](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps/What_is_JavaScript) - Programming language
* [REACT](https://react.dev/) - Frontend library for web and native user interfaces: mainly used for React Hooks
* [SockJS](https://github.com/sockjs/sockjs-client/blob/main/README.md) - JavaScript Library that provides a Websocket-like object: used for websocket communication with the server
* [STOMP JS](https://stomp-js.github.io/stomp-websocket/codo/extra/docs-src/Usage.md.html) - JavaScript/Typescript client for STOMP protocol: used for websocket communication with the server via SockJS
* [Mantine](https://mantine.dev/) - Component library for React: used for the Popover, ActionIcon, NumberInput and Table components
* [Tabler Icons](https://tablericons.com/) - Open source free SVG icons: used for the settings and infocircle icons
* [Google Cloud Text-to-Speech API](https://cloud.google.com/text-to-speech/?utm_source=google&utm_medium=cpc&utm_campaign=emea-ch-all-de-dr-bkws-all-all-trial-%7Bmatchtype%7D-gcp-1707574&utm_content=text-ad-none-any-DEV_%7Bdevice%7D-CRE_%7Bcreative%7D-ADGP_%7B_dsadgroup%7D-KWID_%7B_dstrackerid%7D-%7Btargetid%7D-userloc_%7Bloc_physical_ms%7D&utm_term=KW_%7Bkeyword%7D-NET_%7Bnetwork%7D-PLAC_%7Bplacement%7D&%7B_dsmrktparam%7D%7Bignore%7D&%7B_dsmrktparam%7D&gclsrc=aw.ds&gad_source=1&gclid=CjwKCAjwr7ayBhAPEiwA6EIGxG33Q6L4eJWnLkzXBZ5FXbQ_lYYSrb1PmWgjV9mQaOEKemZDA6TdMhoCpJoQAvD_BwE&gclsrc=aw.ds&hl=en) - Lifelike speech synthesis: used for dynamic, realistic-sounding narration
* [Google Cloud](https://cloud.google.com/gcp/?hl=de&utm_source=google&utm_medium=cpc&utm_campaign=emea-ch-all-de-bkws-all-all-trial-e-gcp-1707574&utm_content=text-ad-none-any-DEV_c-CRE_554508006169-ADGP_Hybrid+%7C+BKWS+-+EXA+%7C+Txt+-+GCP+-+General+-+v3-KWID_43700060389294309-kwd-6458750523-userloc_9187657&utm_term=KW_google%20cloud-NET_g-PLAC_&&gad_source=1&gclid=CjwKCAjwr7ayBhAPEiwA6EIGxCgj6yr0qBDqIbATub4ITjJg381-LR80X3dpxf-pvkhGdq4ZlO70GhoCiWcQAvD_BwE&gclsrc=aw.ds) - Suite of cloud computing serves: used for deployment and hosting

## High-Level Components <a id="high-level-components"></a>
// High-level components: Identify your project’s 3-5 main components. What is their role?
How are they correlated? Reference the main class, file, or function in the README text
with a link.

The frontend can be broken down into a handful of main components that operate on different levels to explain the way it works from a higher level of abstraction. 

Essentially, the frontend is made up of a collection of separate [views](/src/components/views/) that are rendered by specific URLs defined in the [AppRouter](/src/components/routing/routers/AppRouter.js). The display style of what is rendered in a view is specificied in its respective scss [style file](/src/styles/views/). Finally, and most important for the interactive, cooperative part of application, there are two crucial useEffect hooks in every view (except for the frontPage, joinGame and createGame views): [one](https://vscode.dev/github/sopra-fs24-group-42/client/blob/main/src/components/views/WaitingRoom.tsx#L119) that handles the initial websocket connection to the server as well as the subscription to the correct "topic" (i.e., the correct game lobby), and the other that listens to and acts based on incoming messages from the server via the established websocket connection. To see these two useEffect hooks in action, consider the [waitingRoom view](/src/components/views/WaitingRoom.tsx) as an example: the first useEffect handling connection & subscription can be found [here](https://vscode.dev/github/sopra-fs24-group-42/client/blob/main/src/components/views/WaitingRoom.tsx#L119), while the second useEffect hook tracking changes to the game (i.e., the lobby) can be observed [here](https://vscode.dev/github/sopra-fs24-group-42/client/blob/main/src/components/views/WaitingRoom.tsx#L164).

Consider the diagram below for a visual representation and interaction of these high-level components:

![Image]() 

What follows is a more detailed explanation of each high-level component individually: 

### The Lobby Object <a id="the-lobby-object"></a>
A game and its state is captured by a "lobby object". This object is created in the server upon the creation of a new game in the client, and will get continuously updated whenever anything happens that changes the state of the game. For example, when another player joins the game, the lobby object corresponding to this game is updated by the server and broadcasted to all websocket connections subscribed to this particular game endpoint. Specifically, the lobby object pertaining to a game instance contains the following information concerning the game state:
* **lobby ID** - A unique lobby identifier. The lobby ID is required in the server to update and fetch information in the database about the correct lobby. The lobby ID of an existing lobby never changes.  
* **host username** - The current host player's username concatenated with the lobby code of the lobby. The host views differ slightly from other players' views in certain phases. For example, the [preNight](/src/components/views/PreNight.tsx) phase is different for the host player, since the host player is the one who must play the sound of the narration. If the host player is killed or voted out, another player still alive in the game is selected to become the new host, so that the element of narration is not lost.
* **lobby code** - A unique code consisting of 5 characters. Players join a game using this code.  
* **list of players in the lobby** - Players themselves are also objects that are created and stored by the server. Player objects track information about existing players (such as their usernames, their role, whether they're alive, whether they received any votes or were killed, etc.), and they are also stored in the lobby object as a list. This allows the frontend to know how many and which players are currently in the game. 
* **dictionary of players in the lobby** - This field stores the player objects via their usernames as keys instead of simply having them in a list. This allows for faster access to a particular player's role, death status, number of votes, etc., since the username of a player is stored in the localStorage in the frontend upon joining or creating a game. 
* **game state** - The game iterates through the following states: WAITINGROOM, NIGHT, REVEALNIGHT, DISCUSSION, PREVOTING, VOTING, REVEALVOTING, PRENIGHT, ENDGAME. The game state of the game is used to trigger collective navigation of all players to another view in the frontend. 
* **winning team** - The game can end in a tie, the villager team winning, or the werewolf team winning depending on the game state. Winning and losing teams are shown different views in the frontend. 
* **number of players** - The total number of players is set by the host player upon the creation of a game or updated by the host player in the settings in the [waitingRoom](/src/components/views/WaitingRoom.tsx). This field does not reflect the number of players who are currently in the game, rather, the total of players who are to play the game. This information is needed in the frontend to disable the starting of the game until everyone has joined. 
* **minimum number of players** - The minimum number of players ensures no trivial games can be created by default (i.e. games that end immediately and directly in a win or a loss).
* **game settings** - The game settings store the number of roles set in a game.

The lobby object therefore encodes the entire game and its state at any point in time. It is the most crucial element in both the client and the server, as a round of <i>Survive the Night</i> would not be playable without it. The frontend displays information stored inside the lobby object in every view all the time (except for the frontPage, joinGame and createGame views) and routes to other views also based on information in lobby object.

The lobby object is broadcast by the server as a JSON to all websocket connections subscribed to the corresponding lobby endpoint as a response to almost all interactions made by players.  

### Websockets <a id="websockets"></a>
Spontaneous and continuous broadcasting of the lobby object from the server to the client is only possible with an ongoing connection between the client and the server. To establish and maintain such a connection, our application uses websockets to host a running TCP connection. 

In each view (exept for the frontPage, joinGame and createGame views) there are two useEffect hooks that always do the same thing; the following links will reference examples in the voting view. The [first useEffect hook](https://vscode.dev/github/sopra-fs24-group-42/client/blob/main/src/components/views/Voting.tsx#L144) handles the websocket connection setup: first, a websocket connection is established to the server. Upon successful connection, a subscription is made to the correct "topic" (i.e. the corresponding lobby). The [subscription function](https://vscode.dev/github/sopra-fs24-group-42/client/blob/main/src/components/views/Voting.tsx#L128) is very important throughout the whole duration of a player being on a view, since in addition to making a subscription to the corresponding lobby endpoint, the subscribe function also defines a [callback function](https://vscode.dev/github/sopra-fs24-group-42/client/blob/main/src/components/views/Voting.tsx#L131) that handles incoming MESSAGE frames from the server to this subscription endpoint by storing them in a useState variable. These MESSAGE frames are always the lobby object (as a JSON), since this is the only data that is passed from the server to the client across all views. 

It is also the first useEffect that handles the sending of SEND frames to the server, for example to the "/ready" endpoint or to the "/voting" endpoint. This happens via the "ready" useState variable in the useEffect's dependency, which changes based on a player's interaction with the view components. SEND frames are triggered as part of the return function of the useEffect (). The server uses these SEND frames to track the progress of the game and in turn encodes the progress of the game in the lobby object and broadcasts it to the client. 

The [second useEffect hook](https://vscode.dev/github/sopra-fs24-group-42/client/blob/main/src/components/views/Voting.tsx#L184) listens for changes in the useState variable (called "messageReceived") that stores the most recent lobby object by having the variable inside of its dependencies. Based on the view, different fields in the lobby object are read, checked and needed for the display. For example, in the voting view, the gameState field of incoming (i.e. updated) lobby objects is checked against "REVEALVOTING", which is the gameState following the voting phase ("VOTING"). In this view, the server would update the gameState of the lobby object once all alive players have sent a SEND frame to "/ready" endpoint in the server. If the gameState changes, all players are re-routed to the next view in the game sequence.

### The useState Variable "ready"<a id="ready"></a>
The websockets section above referenced a useState variable called "ready"; this useState variable is an important high-level component itself. This boolean variable is declared and instantiated as false on every view featuring a websocket connection, which is every view except for frontPage, createGame and joinGame. 

On each view, players usually have to do a set of actions specific to that view. Again, taking the [voting view](/src/components/views/Voting.tsx) as an example, players have to select a player to vote for and confirm their selection. Alternatively, players may also choose to abstain from voting or simply not vote at all due to the timer running out. In each of these cases, the ready useState variable is changed to true, which triggers the dismount of the first useEffect hook, thus sending a SEND frame via the ongoing websocket connection to the "/ready" server endpoint. This is crucial because even though the server broadcasts the lobby object to the client after any incoming frame from the client, it waits for all (alive) players to send a frame to the "/ready" endpoint before updating the gameState to the next gameState in the sequence.

In all views featuring a websocket connection, the collective re-routing of all players to their next view at the same time is done via the gameState field. Although players may get rerouted to different views (for example, a player that is voting out durnig "VOTING" gets re-routed to "/deadscreen", while remaining players are re-routed to "/votereveal"), it goes without saying that being re-routed at the same time as all the other players is a necessity for a pleasant and exciting game experience. More importantly, the gameState doesn't get updated in the first place without the updating of the ready useState variable to true.  

## Launch & Development <a id="launch--development"></a>
// Launch & Deployment: Write down the steps a new developer joining your team would
have to take to get started with your application. What commands are required to build and
run your project locally? How can they run the tests? Do you have external dependencies
or a database that needs to be running? How can they do releases?
These are the steps a new developer joining the team would
have to take to get started with the application.

### Getting Started <a id="getting-started"></a>
We recommend reading and doing the following:
- work through the [React Quick Start Guide](https://react.dev/learn)
- get an understanding of [CSS basics](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/CSS_basics), [SCSS](https://sass-lang.com/documentation/syntax), and [HTML](https://www.w3schools.com/html/html_intro.asp)

Next, you should look at these to prevalent technologies:

* [React Router](https://reactrouter.com/en/main/start/concepts) - our application frontend features a lot of separate views, the linking and routing of which are handled by the react router.
* [React Hooks](https://blog.logrocket.com/using-hooks-react-router/) - dynamic displays within the same view are largely handled via React Hooks.

### Prerequisites and Installation <a id="prerequisites-installation"></a>
For the local development environment, you will need Node.js.\
Please install the exact version **v20.11.0** which comes with the npm package manager. You can download it [here](https://nodejs.org/download/release/v20.11.0/).\
If you are confused about which download to choose, consult these links:

- **MacOS:** [node-v20.11.0.pkg](https://nodejs.org/download/release/v20.11.0/node-v20.11.0.pkg)
- **Windows 32-bit:** [node-v20.11.0-x86.msi](https://nodejs.org/download/release/v20.11.0/node-v20.11.0-x86.msi)
- **Windows 64-bit:** [node-v20.11.0-x64.msi](https://nodejs.org/download/release/v20.11.0/node-v20.11.0-x64.msi)
- **Linux:** [node-v20.11.0.tar.xz](https://nodejs.org/dist/v20.11.0/node-v20.11.0-linux-x64.tar.xz) (use this [installation guide](https://github.com/nodejs/help/wiki/Installation#how-to-install-nodejs-via-binary-archive-on-linux) if you are new to Linux)

If you happen to have a package manager the following commands can be used:

- **Homebrew:** `brew install node@20.11.0`
- **Chocolatey:** `choco install nodejs-lts --version=20.11.0`

After the installation, update the npm package manager to **10.4.0** by running ```npm install -g npm@10.4.0```\
You can ensure the correct version of node and npm by running ```node -v``` and ```npm --version```, which should give you **v20.11.0** and **10.4.0** respectively.\
Before you start your application for the first time, run this command to install all other dependencies, including React:

```npm install```

### Text-to-Speech API Setup <a id="tts-setup"></a>
After installing both the client and server, you need to create and include a new Google Cloud Text-to-Speech API key in the client before you can run the application in your local environment. 

To activate the Google Cloud Text-to-Speech AI, please follow the [documentation](https://cloud.google.com/text-to-speech/docs/before-you-begin).

Once you have activated the Google Cloud Text-to-Speech AI on your account, follow these steps to create a new API key:
1. Navigate to "APIs & Services" in the Navigation Menu
2. Select Credentials
3. Create a new API Key by pressing the "+ CREATE CREDENTIALS" and Selecting API Key.
4. We recommend restricting the Access of the created API KEY to the Cloud Text-to-Speech API. You can do so by clicking on "Edit API key"

Once you have created a new API key, you must include it in your local client repository: 
1. Create a new file called ".env" inside the root folder of the client
2. Inside this file, paste the following:
```REACT_APP_API_KEY="YOUR_API_KEY"```
3. Replace "YOUR_API_KEY" with your previously created API Key. (Note: the quotation marks must be removed as well).

If you plan on deploying the application with github Actions on google Cloud, make sure to add the API KEY to a Github Secret and reference it in the Workflow.<br />
If you name your Github Actions Secret "REACT_APP_API_KEY", you do not need to change the Workflow in main.yml.<br />

### Running Locally <a id="running-locally"></a>
Now, you're ready to start the app with:

```npm run dev```

You can open [http://localhost:3000](http://localhost:3000) to view it in the browser.\
Notice that the page will reload if you make any edits. You will also see any lint errors in the console (use a Chrome-based browser).\

In order to interact with the application in a meaningful way, you need to install and start the [server] (https://github.com/sopra-fs24-group-42/server) as well.


*Please note: the application was developed for **Google Chrome**, so please stick to Google Chrome (in full screen) whenever you are running it!*

#### Tests

Run the tests with: `npm run test`

> For macOS user running into a 'fsevents' error: https://github.com/jest-community/vscode-jest/issues/423

#### Build

To build the app, run `npm run build` <br>

#### Deployment
Deployment to the Google App Engine happens automatically when pushed to main. You can also trigger deployment manually via gitHub Actions workflows.  

#### External dependencies

Both the client and the server have to be running for the application to behave as expected.

### Contributing
If you want to contribute, please contact the authors first. If you want to make changes to or add features, please do so on your own branch first and properly test it before submitting a pull request to the main repository. 

### Releases 
We recommend to follow this [tutorial](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository) and to properly document and comment your release. 

## Illustrations <a id="illustrations"></a>
//Illustrations: In your client repository, briefly describe and illustrate the main user flow(s)
of your interface. How does it work (without going into too much detail)? Feel free to
include a few screenshots of your application.

## Roadmap <a id="roadmap"></a>
//Roadmap: The top 2-3 features that new developers who want to contribute to your project
could add.

## Authors <a id="authors"></a>
* [Charlotte Model](https://github.com/cmodel1)
* [Polina Kuptsova](https://github.com/kuppolina)
* [Lukas Niedhart](https://github.com/lukasniedh)
* [Rafael Urech](https://github.com/DaKnechtCoder)

## Acknowledgments <a id="acknowledgements"></a>
We want to thank our Teaching Assistant [Marco Leder](https://github.com/marcoleder) for guiding us through the course!

## Attributions <a id="attributions"></a>

We want to attribute the sources that allowed us to use the pictures

// Example of sourcing an image

* Birds: Images by <a href="https://www.freepik.com/free-vector/hand-drawn-cute-animal-avatars-element-set_32987087.htm">Freepik</a>


## ©️ License <a id="license"></a>
//License: Say how your project is licensed (see License guide3).
This project is licensed under the GNU GPLv3 License. 

</div>
