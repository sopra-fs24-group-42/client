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

const Discussion = () => {
  const navigate = useNavigate();
  
  return (
    <div>
      <Header height="100" /> 
      <BaseContainer>
        <Button 
          onClick = {()=> navigate("/joingame")}> 
          ON DISCUSSION PAGE
        </Button>
        <Button 
          style={{"margin-top": "70px"}}
          onClick = {()=> navigate("/creategame")}
        > 
        UNDER CONSTRUCTION
        </Button>
      </BaseContainer>
    </div>
  );
};

/**
 * You can get access to the history object's properties via the useLocation, useNavigate, useParams, ... hooks.
 */
export default Discussion;
