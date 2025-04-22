// context/CubeNavigationContext.js
import React, { createContext, useContext, useState } from 'react';

const CubeNavigationContext = createContext();

export const useCubeNav = () => useContext(CubeNavigationContext);

export const CubeNavProvider = ({ children }) => {
  const [profileStack, setProfileStack] = useState([]);

  const pushProfile = (username) => {
    setProfileStack((prev) => [...prev, username]);
  };

  const popProfile = () => {
    setProfileStack((prev) => prev.slice(0, -1));
  };

  const resetToHome = () => {
    setProfileStack([]);
  };

  return (
    <CubeNavigationContext.Provider value={{ profileStack, pushProfile, popProfile, resetToHome }}>
      {children}
    </CubeNavigationContext.Provider>
  );
};
