# Survive the Night
<div style="text-align: justify"> 

Check out the back-end implementation [here](https://github.com/sopra-fs24-group-42/server).

## 📖 Table of Contents

1. [Introduction](#introduction)
2. [Technologies](#technologies)
3. [High-level Components](#high-level-components)
4. [Launch & Development](#launch--development)
5. [Illustrations](#illustrations)
6. [Roadmap](#roadmap)
7. [Authors](#authors)
8. [Acknowledgments](#acknowledgments)
9. [License](#license)

## Introduction <a name="introduction"></a>
In the evolving world of digital interaction, traditional role-playing games like Werewolf require a modern solution to bridge the gap between virtual and physical game spaces. Our project seeks to digitize these beloved social activities, allowing users to engage in immersive narrative-driven experiences from any location. By developing a web application that supports game setup, role assignment, and real-time interaction through voice-to-text technology, we aim to replicate the communal atmosphere of these games online. Utilizing technologies such as React for the frontend and Node.js for the backend, alongside WebSocket for real-time communication and third-party APIs for voice recognition, this project stands as a testament to the innovative application of web development skills and AI integration. This initiative not only aligns with the course's focus on creating cutting-edge web applications but also offers a solution to the limitations posed by physical distance in social gaming.

## Technologies <a id="technologies"></a>
// Technologies used (short).

During the development of the front-end, we used the following technologies:

* [JavaScript]() - Programming language
* [REACT](https://reactjs.org/) - Front-end JavaScript Library used mainly for Hooks
* [Stomp](https://stomp-js.github.io/stomp-websocket/) - Used for websocket communication with the server
* [Google Cloud Text-to-Speech API](https://cloud.google.com/text-to-speech/?utm_source=google&utm_medium=cpc&utm_campaign=emea-ch-all-de-dr-bkws-all-all-trial-%7Bmatchtype%7D-gcp-1707574&utm_content=text-ad-none-any-DEV_%7Bdevice%7D-CRE_%7Bcreative%7D-ADGP_%7B_dsadgroup%7D-KWID_%7B_dstrackerid%7D-%7Btargetid%7D-userloc_%7Bloc_physical_ms%7D&utm_term=KW_%7Bkeyword%7D-NET_%7Bnetwork%7D-PLAC_%7Bplacement%7D&%7B_dsmrktparam%7D%7Bignore%7D&%7B_dsmrktparam%7D&gclsrc=aw.ds&gad_source=1&gclid=CjwKCAjwr7ayBhAPEiwA6EIGxG33Q6L4eJWnLkzXBZ5FXbQ_lYYSrb1PmWgjV9mQaOEKemZDA6TdMhoCpJoQAvD_BwE&gclsrc=aw.ds&hl=en) - used to incorperate the automated Narration
* [Google Cloud](https://cloud.google.com/gcp/?hl=de&utm_source=google&utm_medium=cpc&utm_campaign=emea-ch-all-de-bkws-all-all-trial-e-gcp-1707574&utm_content=text-ad-none-any-DEV_c-CRE_554508006169-ADGP_Hybrid+%7C+BKWS+-+EXA+%7C+Txt+-+GCP+-+General+-+v3-KWID_43700060389294309-kwd-6458750523-userloc_9187657&utm_term=KW_google%20cloud-NET_g-PLAC_&&gad_source=1&gclid=CjwKCAjwr7ayBhAPEiwA6EIGxCgj6yr0qBDqIbATub4ITjJg381-LR80X3dpxf-pvkhGdq4ZlO70GhoCiWcQAvD_BwE&gclsrc=aw.ds) - used for deploying the Client and hosting
// TODO: include Mantine core library (for tables), include react icons

## High-level Components <a id="high-level-components"></a>
// High-level components: Identify your project’s 3-5 main components. What is their role?
How are they correlated? Reference the main class, file, or function in the README text
with a link.

## Launch & Development <a id="launch--development"></a>
// Launch & Deployment: Write down the steps a new developer joining your team would
have to take to get started with your application. What commands are required to build and
run your project locally? How can they run the tests? Do you have external dependencies
or a database that needs to be running? How can they do releases?
These are the steps a new developer joining the team would
have to take to get started with the application.

### Prerequisites
As the application is mainly written in JavaScript, downloading [Node.js](https://nodejs.org) is needed. All other
dependencies, including React, get installed with:

```npm install```

Furthermore, you need to install the libraries used :

* Depending on your existing setup, you might need to install more.

To be able to run the Appliacation you require an API Key for the Google Text-to-Speech AI.<br />
Check [the Documentation](https://cloud.google.com/text-to-speech/docs/before-you-begin) in case you require assistance activating the Cloud Text-to-Speech AI.<br />

Once you activate the Cloud Text-to-Speech AI on your account follow the next steps to create a API Key.<br />
1. Navigate to "APIs & Services" in the Navigation Menu
2. Select Credentials
3. Create a new API Key by pressing the "+ CREATE CREDENTIALS" and Selecting API Key.
4. We recommend restricting the Access of the created API KEY to the Cloud Text-to-Speech API. You can do so by clicking on "Edit API key"

To use the API locally create in the Client Repository a .env file with the following content:<br />

```REACT_APP_API_KEY="YOUR_API_KEY"```<br />

Substitute "YOUR_API_KEY" with the previously created API Key.<br />

If you plan on Deploying the Application with github Actions on google Cloud, make sure to add the API KEY to a Github Secret and reference it in the Workflow.<br />
If you name your Github Actions Secret "REACT_APP_API_KEY", you do not need to change the Workflow in main.yml.<br />

### Commands to build and run the project locally

Start the app with: `npm run dev`

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

**We strongly recommend to use Google Chrome in full screen *only*, no matter if you have deployed the app or
are accessing it locally**.

### Tests

Run the tests with: `npm run test`

> For macOS user running into a 'fsevents' error: https://github.com/jest-community/vscode-jest/issues/423

### Build

To build the app, run `npm run build` <br>

### Deployment
Deployment to the Google App Engine happens automatically when pushed to main. 

### External dependencies

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
//Authors and acknowledgment.
* [Charlotte Model](https://github.com/cmodel1)
* [Polina Kuptsova](https://github.com/kuppolina)
* [Lukas Niedhart](https://github.com/lukasniedh)
* [Rafael Urech](https://github.com/DaKnechtCoder)

## Acknowledgments <a id="acknowledgements"></a>
We want to thank our Teaching Assistant [Marco Leder](https://github.com/marcoleder) for guiding us through the course.

## Attributions <a id="attributions"></a>

We want to attribute the source that allowed us to use the pictures

// Example of sourcing an image

* Birds: Images by <a href="https://www.freepik.com/free-vector/hand-drawn-cute-animal-avatars-element-set_32987087.htm">Freepik</a>


## ©️ License <a id="license"></a>
//License: Say how your project is licensed (see License guide3).
This project is licensed under the GNU GPLv3 License. 

</div>
