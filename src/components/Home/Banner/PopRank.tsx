import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardPopRank } from '../../../server/readStore';

function PopRank() {
  //참이면 1~10위, 거짓이면 11~20위를 표시
  const [rankPage, setRankPage] = useState<boolean>(true);
  //리액트 쿼리
  const {
    data: popRankData,
    status,
    error,
  } = useQuery({
    queryKey: ['popRankApi'],
    queryFn: dashboardPopRank,
  });

  return (
    <div className='banner-pop'>
      <h1>인기 월드컵 순위</h1>
      {status === 'success' && !error ? (
        <>
          <div className='banner-pop-title'>
            {popRankData.length >= 11 && (
              <span onClick={() => setRankPage((prev) => !prev)}>{rankPage ? '11 ~ 20위' : '1 ~ 10위'}</span>
            )}
          </div>
          <div className='banner-pop-rank'>
            {popRankData.slice(rankPage ? 0 : 10, rankPage ? 10 : 20).map((data, number) => (
              <Link to={`/game-review/${data.worldcupId}`} key={number}>
                <div>
                  <span>{rankPage ? number + 1 : number + 11}</span>
                  <p>{data.worldcupTitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className='chart-loading'>
          <h2>데이터를 불러오는 중입니다...</h2>
          <div className='loading-spiner'>
            <hr />
            <div />
          </div>
        </div>
      )}
    </div>
  );
}
export default PopRank;
