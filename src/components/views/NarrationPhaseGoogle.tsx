import React, { useState, useEffect } from "react";
import Header from "./Header";
import { api, handleError } from "helpers/api";
import {useNavigate} from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/FrontPage.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";

/*
It is possible to add multiple components inside a single file,
however be sure not to clutter your files with an endless amount!
As a rule of thumb, use one file per component and only add small,
specific components that belong to the main one in the same file.
 */


const [srcFile, setsrcFile] = Usestate(null);

(async () => {
  const rawResponse = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify('"input": {
      "text": "Android is a mobile operating system developed by Google, based on the Linux kernel and designed primarily for touchscreen mobile devices such as smartphones and tablets."
    },
    "voice": {
      "languageCode": "en-gb",
      "name": "en-GB-Standard-A",
      "ssmlGender": "FEMALE"
    },
    "audioConfig": {
      "audioEncoding": "MP3"
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
export default NarrationPhaseGoogle;
