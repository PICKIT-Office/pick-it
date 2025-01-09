import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { Link } from 'react-router-dom';
import { getYYYYMMDD } from '../../../Utils/getYYYYMMDD';
import { getNotice } from '../../../server/readStore';
function Notice() {
  //리액트 쿼리
  const { data: noticeData } = useQuery({
    queryKey: ['new_noticeAPI'],
    queryFn: getNotice,
  });
  //내림차순 정렬
  const NoticeDesc = noticeData?.sort((a, b) => b.createAt - a.createAt);

  return NoticeDesc ? (
    <div className='banner-dashboard-notice'>
      <div>
        <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth='1.5' stroke='currentColor'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z'
          />
        </svg>
        공지
      </div>
      <h3>{NoticeDesc[0].noticeTitle}</h3>
      <h4>{getYYYYMMDD(NoticeDesc[0].createAt)}</h4>
      <Link to='/notice'>+ 더 보기</Link>
    </div>
  ) : null;
}
export default Notice;
