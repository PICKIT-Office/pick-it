import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { useQuery } from '@tanstack/react-query';
import { ICharts } from '../../../types/Banner';
import { dashboardPopSearch } from '../../../server/readStore';

function SearchChart() {
  //리액트 쿼리
  const {
    data: searchData,
    status,
    error,
  } = useQuery<string[]>({
    queryKey: ['searchChartApi'],
    queryFn: dashboardPopSearch,
  });

  //리액트 쿼리 요청이 완료되면 컴포넌트를 리턴
  if (status === 'success' && !error && searchData) {
    //reduce메소드를 사용하여 배열 순회하여 새로운 배열을 반환
    const wordCounts: ICharts[] = searchData
      .reduce<ICharts[]>((acc, word) => {
        // 이미 해당 단어가 존재하는지 확인
        //slice(0, -14)의 의미: 검색어를 저장한 데이터값은 '단어_밀리초'로 구성되어 있기 때문, '_밀리초'의 길이를 뺀 값
        const existWord = acc.find((item) => item.name === word.slice(0, -14));
        //이미 존재하는 데이터 값일 경우 카운트 + 1
        if (existWord) {
          existWord.count += 1;
        } else {
          // 존재하지 않으면 새 객체를 추가
          acc.push({ name: word.slice(0, -14), count: 1 });
        }
        return acc;
      }, [])
      //카운트 내림차순 정렬 후 10개 데이터만 추출 -> 다시 카운트 오름차순 정렬
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .sort((a, b) => a.count - b.count);

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
        enabled: false,
      },
      legend: {
        show: false,
      },
      grid: {
        show: true,
        borderColor: '#c8c8c8',
      },
      xaxis: {
        //카테고리: wordCount데이터의 검색어
        categories: wordCounts.map((word) => {
          return word.name;
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
        tickAmount: 3,
      },
      yaxis: {
        labels: {
          show: true,
        },
      },
      tooltip: {
        y: {
          formatter: function (val: number) {
            return val + '회';
          },
        },
      },
    };

    const series = [
      //차트: wordCount데이터의 검색 횟수
      {
        name: '검색 횟수',
        data: wordCounts.map((data) => {
          return data.count;
        }),
      },
    ];

    return <ReactApexChart type='bar' options={option} series={series} width={'120%'} height={320} />;
  } else {
    return (
      <div className='chart-loading'>
        <h2>데이터를 불러오는 중입니다...</h2>
        <div className='loading-spiner'>
          <hr />
          <div />
        </div>
      </div>
    );
  }
}

export default SearchChart;
