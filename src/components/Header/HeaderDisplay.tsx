import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';

function HeaderDisplay() {
  //현재 경로가 'play-game' (게임 진행중 일 때)
  const isGamePage = useLocation().pathname.includes('/play-game');
  return isGamePage ? null : <Header />;
}

export default HeaderDisplay;
