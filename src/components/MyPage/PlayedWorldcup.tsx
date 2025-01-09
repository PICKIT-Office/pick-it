import React from 'react';
import { MyPageDataType } from '../../types/MyPage';
import { compareTime } from '../../Utils/compareTime';
import { Link } from 'react-router-dom';
import { WorldcupImage } from '../../types/Worldcup';

function PlayedWorldcup(props: { data: (MyPageDataType | null)[]; history: { gameId: string; playedAt: number }[] }) {
  //Set()생성자를 이용하여 배열 내의 중복된 값을 찾아낸다
  const uniqueNames = new Set();
  const historyFilter = props.history
    .sort((A, B) => B.playedAt - A.playedAt)
    .filter((item) => {
      if (uniqueNames.has(item.gameId)) {
        return false; // 중복된 이름이면 제외
      } else {
        uniqueNames.add(item.gameId); // 고유한 이름은 추가
        return true;
      }
    });

  //참여한 월드컵 전체 정보와 해당 유저의 참여 기록을 합친 배열 생성
  const mergedData: {
    gameId: string;
    worldcupTitle: string;
    worldcupDescription: string;
    worldcupImages: WorldcupImage[];
    category: string[];
    view: number;
    playedAt: number;
    thumbnail: number[];
  }[] = historyFilter
    .map((data) => {
      //해당 루프의 아이디 값을 가진 월드컵 데이터 불러오기
      const matchIndex = props.data.find((gameData) => gameData && gameData.gameId === data.gameId);
      return {
        exist: matchIndex ? true : false,
        gameId: data.gameId,
        worldcupTitle: matchIndex?.gameInfo.worldcupTitle,
        worldcupDescription: matchIndex?.gameInfo.worldcupDescription,
        worldcupImages: matchIndex?.gameInfo.worldcupImages,
        category: matchIndex?.gameInfo.category,
        view: matchIndex?.gameInfo.view,
        playedAt: data.playedAt,
        thumbnail: matchIndex?.gameInfo.thumbnail,
      };
    })
    .filter((items) => items.exist !== false);
  return mergedData.length === 0 ? (
    <div className='mypage-no-data'>참여하신 월드컵이 없습니다.</div>
  ) : (
    <div className='mypage-worldcup-container'>
      <div style={{ marginTop: '3rem' }}></div>
      <div className='mypage-card-container'>
        {mergedData.map((item) => (
          <div className='card' key={item.gameId}>
            <div className='img-wrapper'>
              <img
                src={
                  item.worldcupImages.sort(
                    //파일인덱스 오름차순 정렬
                    (a, b) => a.fileIndex - b.fileIndex,
                  )[item.thumbnail[0]].filePath //썸네일 인덱스에 지정된 파일경로
                }
                alt=''
              />
              <img
                src={
                  item.worldcupImages.sort(
                    //파일인덱스 오름차순 정렬
                    (a, b) => a.fileIndex - b.fileIndex,
                  )[item.thumbnail[1]].filePath //썸네일 인덱스에 지정된 파일경로
                }
                alt=''
              />
            </div>
            <div className='card-wrapper'>
              <div className='group-one'>
                <h2>{item.worldcupTitle}</h2>
                <p>{item.worldcupDescription}</p>
              </div>
              <div className='group-two'>
                <div className='category'>
                  {item.category.map((text: string, n: number) => (
                    <span key={n}>#{text}</span>
                  ))}
                </div>
                <h3>조회수: {item.view}회</h3>
                <h4>{compareTime(item.playedAt)}에 플레이 했습니다.</h4>
                <div className='card-links'>
                  <Link to={`../play-game/${item.gameId}`}>시작하기</Link>
                  <Link to={`../game-review/${item.gameId}`}>랭킹보기</Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlayedWorldcup;
