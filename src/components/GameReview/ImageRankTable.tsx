import React, { useState } from 'react';
import { ImageRankData } from '../../types/Worldcup';

function ImageRankTable(props: {
  allImg: {
    fileIndex: number;
    fileName: string;
    filePath: string;
  }[];
  imgRankData: ImageRankData[];
}) {
  //테이블 데이터 리밋 상태
  const [limit, setLimit] = useState<number>(4);

  //전달받은 props들을 하나의 배열로 합체
  const mergedData = props.allImg
    .map((aData) => {
      //기존 이미지 데이터에서 우승횟수를 추가시키기 위함. 같은 파일경로를 같는 데이터에 우승 횟수 추가, 없으면 0
      const findWinRate = props.imgRankData.find((iData) => iData.filePath === aData.filePath)?.winRate;
      return {
        fileIndex: aData.fileIndex,
        fileName: aData.fileName,
        filePath: aData.filePath,
        winRate: findWinRate ? findWinRate : 0,
      };
    })
    .sort((winA, winB) => winB.winRate - winA.winRate); //우승 횟수 순으로 내림차순 정렬

  //해당 월드컵의 최다 우승 횟수의 비율만큼 백분율을 반환(그래프 구현 용도)
  let maxValue = 0;
  mergedData.forEach((row) => {
    if (row.winRate > maxValue) {
      maxValue = row.winRate;
    } //해당 월드컵의 최다 우승 횟수를 maxValue에 할당
  });
  const getPercentage = (winRate: number) => {
    //백분율 반환
    return (winRate / maxValue) * 100;
  };

  return (
    <section className='game-review-rank'>
      <table className='review-rank-table'>
        <thead>
          <tr>
            <td>순위</td>
            <td>이미지</td>
            <td>이름</td>
            <td>우승 횟수</td>
          </tr>
        </thead>
        <tbody>
          {mergedData.slice(0, limit).map((data, index) => (
            <tr key={data.fileIndex}>
              <td>{data.winRate === 0 ? '-' : index + 1}</td>
              <td>
                <img src={data.filePath} alt='' />
              </td>
              <td>{data.fileName}</td>
              <td>
                {data.winRate === 0 ? (
                  '우승 기록이 없습니다.'
                ) : (
                  <div
                    className='percentage-graph'
                    style={{
                      width: `${getPercentage(data.winRate)}%`,
                    }}
                  >
                    {data.winRate}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {limit < mergedData.length && (
        <div className='more-rank'>
          <button onClick={() => setLimit((prev) => prev + 4)}>더보기</button>
        </div>
      )}
    </section>
  );
}

export default ImageRankTable;
