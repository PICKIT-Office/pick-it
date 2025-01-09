import React from 'react';
import CategoryChart from './CategoryChart';
import SearchChart from './SearchChart';
function Charts() {
  return (
    <div className='banner-dashboard-charts'>
      <SearchChart />
      <CategoryChart />
    </div>
  );
}
export default Charts;
