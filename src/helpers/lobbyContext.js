import React, { createContext, useContext, useState } from 'react';
import PropTypes from "prop-types";
import Lobby from "models/Lobby";

const LobbyContext = createContext(null);

export const LobbyProvider = ({ children }) => {
  const [lobby, setLobby] = useState(new Lobby());
  // Function to update lobby
  const updateLobby = (newLobbyData) => {
    setLobby(prev => ({ ...prev, ...newLobbyData }));
  };

  return (
    <LobbyContext.Provider value={{ lobby, updateLobby }}>
      {children}
    </LobbyContext.Provider>
  );
};

LobbyProvider.propTypes = {
    children: PropTypes.node // 'node' covers anything that can be rendered: numbers, strings, elements or an array containing these types.
};


// Custom hook to use lobby context
export const useLobby = () => useContext(LobbyContext);
