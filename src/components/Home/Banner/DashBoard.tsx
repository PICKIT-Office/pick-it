import React from 'react';
import Charts from './Charts';
import Notice from './Notice';
function DashBoard() {
  return (
    <div className='banner-dashboard'>
      <h1 className='banner-dashboard-title'>인기 검색어 및 카테고리</h1>
      <Charts />
      <Notice />
    </div>
  );
}
export default DashBoard;
