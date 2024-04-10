import React, { useState } from "react";
import { api, handleError } from "helpers/api";
import User from "models/User";
import {useNavigate} from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/Login.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";

/*
It is possible to add multiple components inside a single file,
however be sure not to clutter your files with an endless amount!
As a rule of thumb, use one file per component and only add small,
specific components that belong to the main one in the same file.
 */

const FrontPage = () => {
  const navigate = useNavigate();
  
  return (
    <BaseContainer>
      <Button 
        onClick = {()=> navigate("/joingame")}> 
        Join an existing Game
      </Button>
      <Button onClick = {()=> navigate("/creategame")}
      > 
      Create Game
      </Button>
    </BaseContainer>
  );
};

/**
 * You can get access to the history object's properties via the useLocation, useNavigate, useParams, ... hooks.
 */
export default FrontPage;
