import React from 'react';
import { INotice } from '../../types/Banner';
import { getYYYYMMDD } from '../../Utils/getYYYYMMDD';

function NoticeModal(prop: { data: INotice }) {
  return (
    <div className='notice-modal-container'>
      <div className='title'>
        <h1>{prop.data.noticeTitle}</h1>
        <p>작성일: {getYYYYMMDD(prop.data.createAt)}</p>
      </div>
      <div className='description'>
        <textarea defaultValue={prop.data.noticeDescription} readOnly />
      </div>
    </div>
  );
}

export default NoticeModal;
