import React, { useState, useEffect } from "react";
import Header from "./Header";
import { api, handleError } from "helpers/api";
import { useNavigate } from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/FrontPage.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import { Trophy } from "tabler-icons-react";

/*
It is possible to add multiple components inside a single file,
however be sure not to clutter your files with an endless amount!
As a rule of thumb, use one file per component and only add small,
specific components that belong to the main one in the same file.
 */

const FrontPage = () => {
  const navigate = useNavigate();

  useEffect(() => { // This useEffect tracks changes in the lobby
    localStorage.clear();
  }, []);

  return (
    <BaseContainer>
      <div className="frontpage background-container">
        <div className="frontpage button-container">
          <Header height="100" />
          <Button
            onClick={() => navigate("/joingame")}>
            Join an existing game
          </Button>
          <Button
            onClick={() => navigate("/creategame")}
          >Create a new game
          </Button>
        </div>
        <div className="frontpage trophy-container">
          <Trophy className="frontpage trophy-icon"
            size={36}
            onClick={() => navigate("/leaderboard")}
          >Leaderboard
          </Trophy>
        </div>
      </div>
    </BaseContainer>
  );
};

/**
 * You can get access to the history object's properties via the useLocation, useNavigate, useParams, ... hooks.
 */
export default FrontPage;
