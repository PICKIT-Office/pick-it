import React, { useCallback } from 'react';
import { useAppDispatch } from './redux';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../server/firebase';
import { getReset } from '../store/worldcup/createWorldcup';

//로그아웃 커스텀 훅
function useSignOut(path: string) {
  //redux dispatch 요청 메소드
  const dispatch = useAppDispatch();
  //네비게이터
  const navigate = useNavigate();
  //useCallback으로 동작 구현
  const getClear = useCallback(() => {
    if (path) {
      //로그아웃 메소드
      signOut(auth);
      //로컬스토리지 로그인, 게임 데이터 정보 삭제
      localStorage.removeItem('pickit-user');
      localStorage.removeItem('game-data');
      //전역 상태 초기화
      dispatch(getReset()); //redux초기화
      //페이지로 이동
      navigate(path);
    }
  }, []); //빈 의존성 배열
  return getClear;
}

export default useSignOut;
