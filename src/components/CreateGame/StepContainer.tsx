import React from 'react';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';

function StepContainer(prop: { pageProp: number }) {
  //페이지 프로퍼티값에 따른 렌더링 구분
  switch (prop.pageProp) {
    case 1:
      return <Step1 />;
    case 2:
      return <Step2 />;
    case 3:
      return <Step3 />;
    default:
      return null;
  }
}

export default StepContainer;
