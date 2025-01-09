import React, { useState, createContext, useContext, SetStateAction } from 'react';

export interface ToggleContextType {
  userPopupToggle?: boolean;
  setUserPopupToggle?: React.Dispatch<SetStateAction<boolean>>;
}

const ToggleContext = createContext<ToggleContextType>({});

const PopupProvider = ({ children }: any) => {
  const [userPopupToggle, setUserPopupToggle] = useState<boolean>(false);

  return <ToggleContext.Provider value={{ userPopupToggle, setUserPopupToggle }}>{children}</ToggleContext.Provider>;
};

export const PopupContext = () => useContext(ToggleContext);

export default PopupProvider;
