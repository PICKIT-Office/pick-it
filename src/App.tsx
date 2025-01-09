import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import '../src/assets/global.scss';
import './assets/userPopup/userPopup.scss';
import CreateGame from './pages/CreateGame';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthContext } from './context/AuthContext';
import Contents from './pages/Contents';
import UserPopup from './components/UserPopup/UserPopup';
import { PopupContext } from './context/PopupContext';
import { LocalUserData, PopupUserData } from './types/Sign';
import FindUser from './pages/FindUser';
import PlayGame from './pages/PlayGame';
import GameReview from './pages/GameReview';
import HeaderDisplay from './components/Header/HeaderDisplay';
import MyPage from './pages/MyPage';
import EditProfile from './pages/EditProfile';
import EditWorldcup from './pages/EditWorldcup';
import NoticePage from './pages/NoticePage';
import Community from './pages/Community';
import ScrollToTop from './context/ScrollTop';
import { getUserData } from './server/readStore';

function App() {
  const [userData, setUserData] = useState<PopupUserData>({
    nickName: '',
    imgUrl: '',
  });

  //로그인 여부 확인
  const { user }: any = AuthContext();
  if (user.isLogin) {
    localStorage.setItem(
      //로컬 스토리지 등록
      'pickit-user',
      JSON.stringify({
        LoginToken: user.user.uid,
        UserId: String(user.user.email).slice(
          0,
          String(user.user.email).indexOf('@'), //이메일 도메인 제거
        ),
      }),
    );
  }

  const localUser: string | null = localStorage.getItem('pickit-user');
  // 객체 문자열을 json 객체로 파싱
  const localDataParse: LocalUserData = localUser ? JSON.parse(localUser) : null;

  const { userPopupToggle } = PopupContext();

  // (userid) 사용자를 조회하여 상태값에 저장하는 비동기 함수
  const getProfileData = async (userid: string) => {
    // userid 값을 파라미터로 넘겨 사용자 조회
    const profileData = await getUserData(userid);

    // 조회된 사용자의 이미지 경로와 닉네임 저장
    setUserData({
      nickName: profileData[1],
      imgUrl: profileData[0],
    });
  };

  useEffect(() => {
    if (localUser && userPopupToggle) {
      getProfileData(localDataParse.UserId);
    }
  }, [localUser, userPopupToggle]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <HeaderDisplay />
      {localUser && userPopupToggle ? <UserPopup userData={userData} /> : null}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/pop-category/:id' element={<Home />} />
        <Route path='/notice' element={<NoticePage />} />
        <Route path='/contents' element={<Contents />} />
        <Route path='/play-game/:id' element={<PlayGame />} />
        <Route path='/game-review/:id' element={<GameReview />} />
        <Route path='/create-game' element={<CreateGame />} />
        <Route path='/community' element={<Community />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/find-user' element={<FindUser />} />
        <Route path='/mypage' element={<MyPage />} />
        <Route path='/edit-profile' element={<EditProfile />} />
        <Route path='/game-edit/:id' element={<EditWorldcup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
