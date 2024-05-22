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
      <div className="frontpage detailed-instructions">Survive the night is a party game which requires at least 4 people to play. A designated player creates a new game, allowing others to join via a unique game code.<br></br>Once everyone has joined, every player will receive a role, which must be kept a secret. The following roles exist in the game: <br></br> <b>- Protector</b> <b>- Seer</b> <b>- Sacrifice</b> <b>- Werewolf</b> <b>- Villager</b> The ratio of roles can be changed by the host in the settings while waiting for all players to join.<br></br>Villagers, seers, protectors and sacrifices are on the same team. Villagers win when they have identified and voted out all werewolf players. The werewolves win when the number of players left on the villagers team is less than or equal to the number of werewolves left in the game.
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
