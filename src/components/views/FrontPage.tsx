import React, { useState, useEffect } from "react";
import Header from "./Header";
import { api, handleError } from "helpers/api";
import { useNavigate } from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/FrontPage.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import { ActionIcon, Popover } from "@mantine/core";
import { Trophy, InfoCircle } from "tabler-icons-react";

/*
It is possible to add multiple components inside a single file,
however be sure not to clutter your files with an endless amount!
As a rule of thumb, use one file per component and only add small,
specific components that belong to the main one in the same file.
 */

const FrontPage = () => {
  const navigate = useNavigate();
  const [instructionsPopover, setInstructionsPopover] = useState(false);

  useEffect(() => { // This useEffect tracks changes in the lobby
    localStorage.clear();
  }, []);

  let popoverContent = (
    <div>
      <div className="frontpage header1">🧑‍🌾👩‍🌾Surive the Night 🐺</div>
      <div className="frontpage header1">Game Rules:</div>
      <div className="frontpage detailed-instructions">Enter game instructions here
      </div>
    </div>
  );


  const doInstructions = () => {
    setInstructionsPopover((open) => !open);
  }

  return (
    <div className="frontpage total-background">
      <BaseContainer>
        <div className="frontpage background-container">
          <div className="frontpage trophy-container">
            <ActionIcon className="frontpage trophy-button"
              aria-label="Trophy"
              withArrow
              onClick={() => navigate("/leaderboard")}
            >
              <Trophy size={48}/>
            </ActionIcon>
            <ActionIcon className="frontpage trophy-button"
              aria-label="infoCircle"
              withArrow
              onClick={() => doInstructions()}
            >
              <InfoCircle 
                size={48}
                strokeWidth={1.8}/>
            </ActionIcon>
          </div>
          <Header height="100" />
          <div className="frontpage button-container">
            <Button
              onClick={() => navigate("/joingame")}>
              Join an existing game
            </Button>
            <Button
              onClick={() => navigate("/creategame")}
            >Create a new game
            </Button>
          </div>
          {instructionsPopover && (
            <Popover
              opened={instructionsPopover} 
              onClose={() => setInstructionsPopover(false)}
              withArrow
              shadow="md">
              <Popover.Dropdown className="frontpage dropdown">
                <div className="frontpage popover-container">
                  {popoverContent}
                  <Button
                    width="100%"
                    height="40px"
                    onClick={() => setInstructionsPopover(false)}
                  >Ok
                  </Button>
                </div>
              </Popover.Dropdown>
            </Popover>
          )}
        </div>
      </BaseContainer>
    </div>
  );
};

/**
 * You can get access to the history object's properties via the useLocation, useNavigate, useParams, ... hooks.
 */
export default FrontPage;
