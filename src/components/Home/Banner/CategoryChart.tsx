import React, { useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { useQuery } from '@tanstack/react-query';
import { useAppDispatch } from '../../../hooks/redux';
import { updateCategory } from '../../../store/worldcup/popCategory';
import { categoryCounts } from '../../../Utils/categoryCounts';
import { dashboardPopCategory } from '../../../server/readStore';

function CategoryChart() {
  //redux dispatch 요청 메소드
  const dispatch = useAppDispatch();
  //리액트 쿼리
  const {
    data: categoryData,
    status,
    error,
  } = useQuery({
    queryKey: ['categoryChartApi'],
    queryFn: dashboardPopCategory,
  });
  //컴포넌트 렌더링 이후에 전역 상태 업데이트
  useEffect(() => {
    if (status === 'success' && !error && categoryData) {
      //인기카테고리 reducer업데이트
      dispatch(updateCategory(categoryData));
    }
  }, [categoryData]);
  //리액트 쿼리 요청이 완료되면 컴포넌트를 리턴
  if (status === 'success' && !error && categoryData) {
    const categoryCountArray = categoryCounts(categoryData).slice(0, 7);

    //ApexChart옵션 및 시리즈 상수 선언
    const option: ApexOptions = {
      chart: {
        fontFamily: 'p_bold',
        offsetY: 0,
        type: 'bar' as 'bar',
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          borderRadius: 2,
          horizontal: true,
          distributed: true,
          barHeight: '70%',
        },
      },
      colors: ['#000'],
      dataLabels: {
        enabled: true,
      },
      legend: {
        show: false,
      },
      grid: {
        borderColor: '#c8c8c8',
        xaxis: {
          lines: {
            show: true,
          },
        },
      },
      xaxis: {
        //카테고리: categoryCounts데이터의 검색어
        categories: categoryCountArray.map((data) => {
          return '#' + data.name;
        }),
        labels: {
          formatter: function (val: string) {
            return val;
          },
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        min: 0,
        tickAmount: 5,
      },
      yaxis: {
        reversed: true,
        labels: {
          show: true,
        },
        axisTicks: {
          show: true,
        },
      },
      tooltip: {
        y: {
          formatter: function (val: number) {
            return val + '개';
          },
        },
      },
    };

    const series = [
      //차트: categoryCounts데이터의 검색 횟수
      {
        name: '태그 개수',
        data: categoryCountArray.map((data) => {
          return data.count;
        }),
      },
    ];

    return <ReactApexChart type='bar' options={option} series={series} width={'160%'} height={320} />;
  } else {
    return null;
  }
}
export default CategoryChart;
