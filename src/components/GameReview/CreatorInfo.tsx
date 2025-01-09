import React, { useEffect, useState } from 'react';
import { ImageRankData } from '../../types/Worldcup';
import { getUserData } from '../../server/readStore';

function CreatorInfo(props: { creatorId: string; imgRankData: ImageRankData[] }) {
  //제작자 프로필 이미지 정보 상태
  const [creatorImg, setCreatorImg] = useState<string[]>();

  //사용자 정보 불러오기
  useEffect(() => {
    getUserData(props.creatorId).then((res) => setCreatorImg(res));
  }, [props.creatorId]);
  return creatorImg ? (
    <div className='info-creator'>
      <h1 className='aside-title'>게임 제작자</h1>
      <div className='creator'>
        <img src={creatorImg[0] === 'default' ? '/images/user.png' : creatorImg[0]} alt='' width={200} />
        {creatorImg[1]}
      </div>
      <div className='buttons'>
        <button className='follow'>팔로우</button>
        <button className='quest'>문의하기</button>
        <button className='report'>신고하기</button>
      </div>
    </div>
  ) : (
    <div></div>
  );
}

export default CreatorInfo;
