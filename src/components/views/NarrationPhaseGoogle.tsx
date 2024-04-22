import React, { useState, useEffect } from "react";
import Header from "./Header";
import { api, handleError } from "helpers/api";
import {useNavigate} from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/FrontPage.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import Base64ToMp3Decoder from "helpers/Base64ToMp3Decoder";
import Fetcher from "helpers/Fetcher";
import PlayButton from "helpers/PlayButton";


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Google Narration phase Night</h1>
        <Base64ToMp3Decoder />
        <h1>Fetcher</h1>
        <Fetcher />
        <h1>Music Player</h1>
        <PlayButton />
      </header>
    </div>
  );
}

export default App;


/*
It is possible to add multiple components inside a single file,
however be sure not to clutter your files with an endless amount!
As a rule of thumb, use one file per component and only add small,
specific components that belong to the main one in the same file.
 */

/*

const [srcFile, setsrcFile] = Usestate(null);

var SecretURL = "https://texttospeech.googleapis.com/v1beta1/text:synthesize?fields=audioContent&key=AIzaSyBlJaTPDS1CFbQmJISrSR9_0NY3nu58U1k"

(async () => {
  var rawResponse = await fetch(SecretURL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: {
      "audioConfig": {
        "audioEncoding": "LINEAR16",
        "pitch": 0,
        "speakingRate": 1
      },
      "input": {
        "text": "Night has fallen over the quiet village, and as the moon climbs high, a thick fog rolls in, shrouding everything in silence. Now is the time for secrets to come alive. While the villagers lay in restless slumber, those with hidden agendas rise. Wolves, awaken from your guise and prowl the misty shadows. Choose wisely whom you will visit tonight, for your survival hinges on your cunning. Seer, your time has come to peer beyond the veil. Gaze into the crystal orb and discern the true nature of one among us. Choose wisely, for knowledge is power. Witch, the potions on your shelf glimmer under the moon's pale light. Tonight, you may wield the power to save a life or take one. Consider your choices carefully, for each action reverberates through the shadows. Guardian, your watchful eyes and steady hands protect the innocent. Choose someone to shield from the night’s malevolent embrace. As the night deepens, let your decisions be guided by stealth and wisdom. Remember, the day will come soon, and with it, the time for reckoning. Close your eyes now, and fate will take its course. Good luck, villagers and creatures of the night. May the dawn find you all"
      },
      "voice": {
        "languageCode": "en-US",
        "name": "en-US-Neural2-J"
      }
    }

  }')
  });
  const content = await rawResponse.json();

  console.log(content);
})();


  return (
    <div>
      <Header height="100" /> 
      <BaseContainer>
      <div className="NarrationPhase header">
        Shhhh, be silent and listen
      </div>
      <Button
              width="100%"
              height="30px"
              onClick={() => TextToSpeech()}
            >
              Play
            </Button>
      </BaseContainer>
    </div>
  );
};

/**
 * You can get access to the history object's properties via the useLocation, useNavigate, useParams, ... hooks.
 */

