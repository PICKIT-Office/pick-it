import React from 'react';
import '../../../assets/Home/banner.scss';
import DashBoard from './DashBoard';
import PopRank from './PopRank';
function Banner() {
  return (
    <div className='banner-container'>
      <PopRank />
      <DashBoard />
    </div>
  );
}
export default Banner;
