import React, { useEffect, useState } from 'react';
import '../assets/MyPage/myPage.scss';
import { Link, useNavigate } from 'react-router-dom';
import MyWorldcup from '../components/MyPage/MyWorldcup';
import PlayedWorldcup from '../components/MyPage/PlayedWorldcup';
import { MyPageDataType, MyWorldcupCommentType } from '../types/MyPage';
import MyComment from '../components/MyPage/MyComment';
import {
  getMyPlayAmount,
  getMyWorldcupComment,
  getMyWorldcupCommentWorldcup,
  getPlayedWorldcup,
  getUserData,
  getUserWorldcupHistory,
} from '../server/readStore';

function MyPage() {
  //로컬스토리지에 존재하는 게임 데이터(중간에 나온 게임일 경우 남음)
  const remainData = localStorage.getItem('game-data');
  //로컬스토리지에 존재하는 유저 데이터
  const user = localStorage.getItem('pickit-user');
  const parseUser = user ? JSON.parse(user) : null;
  //네비게이션
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      alert('로그인 후 이용 가능합니다.');
      navigate('/login');
    }
  }, [navigate, user]);
  // 내월드컵/참여/댓글 메뉴 선택 상태
  const [filterMenu, setFilterMenu] = useState<'내 월드컵' | '참여' | '댓글'>('내 월드컵');
  // 내 프로필 정보 상태 ["이미지경로", "닉네임"]
  const [myProfile, setMyProfile] = useState<string[]>();
  //내 월드컵
  const [myWorldcupData, setMyWorldcupData] = useState<MyPageDataType[]>();
  //참여 월드컵
  const [myPlayedData, setMyPlayedData] = useState<(MyPageDataType | null)[]>();
  //유저별 월드컵 참여 기록
  const [myHistory, setMyHistory] = useState<
    {
      gameId: string;
      playedAt: number;
    }[]
  >();
  //내 댓글
  const [myCommentData, setMyCommentData] = useState<MyWorldcupCommentType[]>([]);
  //내 댓글의 월드컵 정보
  const [myCommentWorldcup, setMyCommentWorldcup] = useState<(MyPageDataType | null)[]>();
  //데이터 불러온 후 상태에 할당
  useEffect(() => {
    if (user) {
      //회원 프로필 이미지 및 닉네임 불러오기
      getUserData(String(parseUser.UserId)).then((res) => setMyProfile(res));
      //내 월드컵, 참여 월드컵 불러오기
      getMyPlayAmount(String(parseUser.UserId))
        .then((res) => {
          //1차 state할당
          setMyWorldcupData(res.myWorldcup);
          //참여 월드컵 ID값 반환 후 다른 함수에 전송
          return res.playedWorldcup;
          //참여한 월드컵 ID의 월드컵 전체 정보
        })
        .then((playedData) => getPlayedWorldcup(playedData).then((res2) => setMyPlayedData(res2)));
      //유저별 월드컵 참여 기록 불러오기
      getUserWorldcupHistory(String(parseUser.UserId)).then((res) => setMyHistory(res));
      //내 댓글 불러오기
      getMyWorldcupComment(JSON.parse(user).UserId).then((res3) => {
        setMyCommentData(res3);
        getMyWorldcupCommentWorldcup(res3).then((res4) => setMyCommentWorldcup(res4));
      });
    }
  }, []);
  return myProfile && myWorldcupData && myPlayedData && myHistory && myCommentData && myCommentWorldcup && user ? (
    <div className='mypage-container'>
      <aside className='mypage-aside'>
        <div className='aside-profile'>
          <img src={myProfile[0] === 'default' ? '/images/user.png' : myProfile[0]} alt='' />
          <h2>{myProfile[1]}</h2>
          <Link to='/edit-profile'>프로필 수정</Link>
          <div className='my-played'>
            <div onClick={() => setFilterMenu('내 월드컵')}>
              <h3>{myWorldcupData.length}</h3>
              <p>내 월드컵</p>
            </div>
            <div onClick={() => setFilterMenu('참여')}>
              <h3>{myPlayedData.length}</h3>
              <p>참여</p>
            </div>
            <div onClick={() => setFilterMenu('댓글')}>
              <h3>{myCommentData.length}</h3>
              <p>댓글</p>
            </div>
          </div>
        </div>
        {remainData && (
          <div className='aside-remain-game'>
            <h2>아직 끝나지 않은 게임이 있어요!</h2>
            <div className='game-info'>
              <div className='img-wrapper'>
                <img src={JSON.parse(remainData).GameImage[0].filePath} alt='' />
                <img src={JSON.parse(remainData).GameImage[1].filePath} alt='' />
              </div>
              <div>
                <h3>{JSON.parse(remainData).GameTitle}</h3>
              </div>
            </div>
            <Link to={`/play-game/${JSON.parse(remainData).GameId}`}>
              <button>플레이</button>
            </Link>
          </div>
        )}
      </aside>
      <section className='mypage-section'>
        <div className='menu-filter'>
          <button onClick={() => setFilterMenu('내 월드컵')} className={filterMenu === '내 월드컵' ? 'selected' : ''}>
            내 월드컵
          </button>
          <button onClick={() => setFilterMenu('참여')} className={filterMenu === '참여' ? 'selected' : ''}>
            참여
          </button>
          <button onClick={() => setFilterMenu('댓글')} className={filterMenu === '댓글' ? 'selected' : ''}>
            댓글
          </button>
        </div>
        {filterMenu === '내 월드컵' && <MyWorldcup data={myWorldcupData} />}
        {filterMenu === '참여' && <PlayedWorldcup data={myPlayedData} history={myHistory} />}
        {filterMenu === '댓글' && <MyComment commentData={myCommentData} commentWolrdcup={myCommentWorldcup} />}
      </section>
    </div>
  ) : (
    <div className='before-game-message'>
      <h2>데이터를 불러오는 중입니다...</h2>
      <div className='loading-spiner'>
        <hr />
        <div />
      </div>
    </div>
  );
}

export default MyPage;
