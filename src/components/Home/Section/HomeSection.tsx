import '../../../assets/Home/section.scss';
import { Link } from 'react-router-dom';
import PCWorldcup from './PCWorldcup';
import { useQuery } from '@tanstack/react-query';
import { DocumentData } from 'firebase/firestore';
import { useAppSelector } from '../../../hooks/redux';
import { categoryCounts } from '../../../Utils/categoryCounts';
import { dashboardPopWolrdcup } from '../../../server/readStore';

function HomeSection() {
  //로컬 스토리지 게임 데이터
  const localGame = localStorage.getItem('game-data');
  const parseGameData = localGame ? JSON.parse(localGame) : null;

  //redux에 저장된 인기 카테고리 배열
  const popCategoryData = useAppSelector((state) => state.popCategoryReducers.popCategoryReducer);

  //카테고리 배열 순위 재정렬 메소드
  const categoryCountArray = categoryCounts(popCategoryData);

  //리액트 쿼리
  const {
    data: popData,
    status,
    error,
  } = useQuery<
    | {
        worldcupId: string;
        worldcupInfo: DocumentData;
      }[]
    | null
  >({
    queryKey: ['dash_popWorldcupApi', categoryCountArray],
    queryFn: () => dashboardPopWolrdcup(categoryCountArray),
  });

  return (
    <div className='home-section-container'>
      {parseGameData && (
        <>
          <h1>진행중인 월드컵</h1>
          <div className='now-playing-game'>
            <Link to={`/play-game/${parseGameData.GameId}`}>
              <div className='cover'>
                <h2>{parseGameData.GameTitle}</h2>
              </div>
              <div className='img-wrapper'>
                <img src={parseGameData.GameImage[0].filePath} alt='' />
                <img src={parseGameData.GameImage[1].filePath} alt='' />
              </div>
            </Link>
          </div>
        </>
      )}
      <h1>인기 카테고리 월드컵 top20</h1>
      {status === 'success' && !error && popData && <PCWorldcup popData={popData} />}
    </div>
  );
}

export default HomeSection;
