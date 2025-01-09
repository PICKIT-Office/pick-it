import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ImageRankData, WorldcupImage } from '../types/Worldcup';
import { DocumentData } from 'firebase/firestore';
import '../assets/Contents/gameReview.scss';
import CreatorInfo from '../components/GameReview/CreatorInfo';
import ImageRankTable from '../components/GameReview/ImageRankTable';
import Comments from '../components/GameReview/Comment';
import { findSelectWorldcup, getImageRankList } from '../server/readStore';

function GameReview() {
  //로그인 상태
  const isUser = localStorage.getItem('pickit-user');
  // 동적 라우팅으로 전송받은 월드컵 아이디 값 조회
  const { id: gameId } = useParams();
  // 이미지 랭킹정보를 저장하는 상태 (gameId값이 잘못되었거나 랭킹이 아예 없을 경우 null을 할당하게 된다)
  const [imgRankData, setImgRankData] = useState<ImageRankData[] | null>(null);
  // 해당 ID의 월드컵 전체정보를 불러오는 상태
  const [allData, setAllData] = useState<{
    gameId: string;
    gameInfo: DocumentData;
  } | null>(null);
  // 데이터 불러오기 로딩 동작
  const [isLoading, setIsLoading] = useState<boolean>(true);

  //현재 회원이 해당 월드컵에서 고른 이미지 데이터 불러오기
  const getMyRecentPick = () => {
    if (isUser && imgRankData) {
      const userId = JSON.parse(isUser).UserId; //유저 ID
      const list = imgRankData
        .map((data) => {
          //이미지 랭크 배열에서 유저ID 배열에 해당 유저가 존재하는 값만 추출
          return data.userId.indexOf(userId) === -1 ? null : data;
        })
        .filter((data) => data !== null); //null값으로 리턴 되는 배열은 제거

      return list[0];
    }
  };

  useEffect(() => {
    if (gameId) {
      //파이어베이스 데이터 요청을 순차대로 진행하기 위해 프로미스체이닝 코드 작성
      getImageRankList(gameId) // 1.이미지 랭킹 조회 데이터 요청
        .then((imgRes) => {
          setImgRankData(imgRes); //상태 할당 1
        })
        .then(
          () =>
            // 2. 해당 월드컵의 전체 정보 조회 데이터 요청
            findSelectWorldcup(gameId).then((dataRes) => setAllData(dataRes)), //상태 할당 2
        )
        .then(() => setIsLoading(false)); // 3.로딩 종료
    }
  }, [gameId]);

  return isLoading ? (
    <div className='before-game-message'>
      <h2>랭킹을 불러오는 중입니다...</h2>
      <div className='loading-spiner'>
        <hr />
        <div />
      </div>
    </div>
  ) : allData && imgRankData ? (
    <>
      <div className='game-review-container'>
        <aside className='game-review-info'>
          <div className='wrapper'>
            <div className='info-name'>
              <h1 className='aside-title'>게임 정보</h1>
              <div className='thunbnail'>
                <div>
                  <img
                    src={
                      allData.gameInfo.worldcupImages.sort(
                        //파일인덱스 오름차순 정렬
                        (a: WorldcupImage, b: WorldcupImage) => a.fileIndex - b.fileIndex,
                      )[allData.gameInfo.thumbnail[0]].filePath //썸네일 인덱스에 지정된 파일경로
                    }
                    alt=''
                  />
                  <img
                    src={
                      allData.gameInfo.worldcupImages.sort(
                        //파일인덱스 오름차순 정렬
                        (a: WorldcupImage, b: WorldcupImage) => a.fileIndex - b.fileIndex,
                      )[allData.gameInfo.thumbnail[1]].filePath //썸네일 인덱스에 지정된 파일경로
                    }
                    alt=''
                  />
                </div>
                {allData.gameInfo.worldcupTitle}
              </div>
              <div className='categories'>
                {allData.gameInfo.category.map((item: string, n: number) => (
                  <span key={n}>#{item}</span>
                ))}
              </div>
            </div>
            {isUser && (
              <div className='info-my-pick'>
                <h1 className='aside-title'>회원님이 최근에 선택한 이미지</h1>
                {getMyRecentPick() ? (
                  <>
                    <img src={getMyRecentPick()?.filePath} alt='' />
                    <span>{getMyRecentPick()?.fileName}</span>
                  </>
                ) : (
                  <h3>* 아직 참여하지 않은 월드컵입니다.</h3>
                )}
              </div>
            )}
            <CreatorInfo creatorId={allData.gameInfo.userId} imgRankData={imgRankData} />
            <Link className='restart-game' to={`/play-game/${gameId}`}>
              <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z'
                />
              </svg>
              월드컵 시작하기
            </Link>
          </div>
        </aside>
        <ImageRankTable allImg={allData.gameInfo.worldcupImages} imgRankData={imgRankData} />
      </div>
      {gameId && <Comments gameId={gameId} userId={isUser ? JSON.parse(isUser).UserId : ''} />}
    </>
  ) : (
    <div className='before-game-message'>랭킹 정보를 불러오지 못했습니다.</div>
  );
}

export default GameReview;
