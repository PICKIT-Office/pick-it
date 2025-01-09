import { DocumentData } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ImageRankData, WorldcupImage } from '../../../types/Worldcup';
import { getImageRankList } from '../../../server/readStore';

function ModalInfo(prop: {
  data: {
    worldcupId: string;
    worldcupInfo: DocumentData;
  };
}) {
  const modalInfo = prop.data.worldcupInfo;
  const modalImages: WorldcupImage[] = prop.data.worldcupInfo.worldcupImages;
  //이미지 랭킹 저장 상태
  const [imageRank, setImageRank] = useState<ImageRankData[] | null>([]);
  //이미지 랭킹 불러오기
  useEffect(() => {
    getImageRankList(prop.data.worldcupId).then((result) => setImageRank(result));
  }, []);

  //전달받은 props들을 하나의 배열로 합체
  const mergedData: {
    fileIndex: number;
    fileName: string;
    filePath: string;
    winRate: number;
  }[] = modalImages
    .map((aData: WorldcupImage) => {
      //기존 이미지 데이터에서 우승횟수를 추가시키기 위함. 같은 파일경로를 같는 데이터에 우승 횟수 추가, 없으면 0
      const findWinRate = imageRank?.find((iData) => iData.filePath === aData.filePath)?.winRate;
      return {
        fileIndex: aData.fileIndex,
        fileName: aData.fileName,
        filePath: aData.filePath,
        winRate: findWinRate ? findWinRate : 0,
      };
    })
    .filter((data) => data !== null)
    .sort((winA, winB) => winB.winRate - winA.winRate);

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
    <>
      <div className='modal-img-wrapper'>
        <img src={modalImages[modalInfo.thumbnail[0]].filePath} alt='' />
        <img src={modalImages[modalInfo.thumbnail[1]].filePath} alt='' />
        <div className='cover-dark'>
          <h2>{modalInfo.worldcupTitle}</h2>
          <p>{modalInfo.worldcupDescription}</p>
          <div className='end-wrapper'>
            <Link to={`/play-game/${prop.data.worldcupId}`}>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth='1.5'
                stroke='currentColor'
              >
                <path strokeLinecap='round' strokeLinejoin='round' d='M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z'
                />
              </svg>
              시작하기
            </Link>
            <div className='categories'>
              {modalInfo.category.map((text: string, i: number) => (
                <span key={i}>#{text}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className='modal-section'>
        {!imageRank ? (
          <div className='item-modal-message'>랭킹 정보를 불러오지 못했습니다.</div>
        ) : imageRank.length === 0 ? (
          <div className='item-modal-message'>
            <h2>랭킹을 불러오는 중입니다...</h2>
            <div className='loading-spiner'>
              <hr />
              <div />
            </div>
          </div>
        ) : (
          <div className='item-modal-wrapper'>
            <table className='item-modal-table'>
              <tbody>
                {mergedData.map((image) => (
                  <tr key={image.fileIndex}>
                    <td>
                      <img src={image.filePath} alt='' />
                    </td>
                    <td>
                      {image.fileName}
                      <p>우승 횟수: {image.winRate}</p>
                      {image.winRate > 0 && (
                        <div
                          className='percentage-graph'
                          style={{
                            width: `${getPercentage(image.winRate)}%`,
                          }}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
export default ModalInfo;
