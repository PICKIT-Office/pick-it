import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '../../hooks/redux';
import { scrollStep3, updateStep2 } from '../../store/worldcup/createWorldcup';

function Step2() {
  //redux dispatch 요청 메소드
  const dispatch = useAppDispatch();
  //select 토글 상태
  const [selectToggle, setSelectToggle] = useState<boolean>(false);
  //토너먼트 범위 select option value상태
  const [optionValue, setOptionValue] = useState<number>();
  //리액트 훅 폼
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<{ category: string }>({ mode: 'onSubmit' });
  //설정된 카테고리들을 담는 배열
  const [categoryArray, setCategoryArray] = useState<string[]>([]);
  //카테고리 등록 핸들러
  const handleCategory = (data: { category: string }) => {
    //카테고리 최대 개수 제한
    if (categoryArray.length < 3) {
      setCategoryArray([...categoryArray, data.category]); //배열 state의 setState
      reset();
    } else {
      alert('카테고리는 최대 3개까지만 입력 가능합니다.');
    }
  };
  //다음 단계로 버튼 클릭 이벤트
  const step2Valid = () => {
    //토너먼트가 선택되고 카테고리 배열 값이 존재할 때
    if (optionValue && categoryArray.length > 0) {
      const sendData = {
        //Redux에 전송할 데이터 값을 하나의 객체로 정리
        tournamentRange: optionValue,
        category: categoryArray,
      };
      //redux의 updateStep1 action 함수에 payload값으로 데이터 전송
      dispatch(updateStep2(sendData));
      /* updateStep2 입력 데이터가 성공적으로 redux 전역 상태값에 저장 되었을 시,
    다음 step3로 가기 위한 조건문 검사 후 step3 이동 */
      dispatch(scrollStep3(3));
    } else {
      alert('토너먼트 혹은 카테고리가 입력되지 않았습니다.');
    }
  };
  return (
    <div className='create-game-step12'>
      <h3 className='steps-page-number'>2 / 3</h3>
      <h1 className='steps-page-title'>월드컵 토너먼트 및 카테고리 설정</h1>
      <p className='steps-page-desc'>월드컵 토너먼트 범위를 선택하고 카테고리를 3개 이하로 추가해주세요.</p>

      <div className='step12-form'>
        <div className='select-tournament'>
          {optionValue ? optionValue + '강' : '토너먼트를 선택해주세요.'}
          <motion.svg
            onClick={() => setSelectToggle((prev) => !prev)}
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth='1.5'
            stroke='currentColor'
            animate={selectToggle ? { rotateZ: 180 } : {}}
          >
            <path strokeLinecap='round' strokeLinejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' />
          </motion.svg>
          {selectToggle && (
            <div className='tournament-options'>
              <span
                onClick={() => {
                  setOptionValue(8);
                  setSelectToggle(false);
                }}
              >
                8강
              </span>
              <span
                onClick={() => {
                  setOptionValue(16);
                  setSelectToggle(false);
                }}
              >
                16강
              </span>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit(handleCategory)}>
          <input
            className='category-input'
            type='text'
            autoComplete='off'
            placeholder='카테고리를 4글자 이하로 입력해주세요. (Enter 키 입력)'
            {...register('category', {
              required: true,
              validate: {
                max: (value: string) => value.length < 5 || '카테고리는 최대 4글자로 설정해주세요.',
              },
            })}
          />
          <p className='step-error-message'>{errors.category && errors.category.message}</p>
        </form>
        <div className='category-list'>
          {categoryArray.map((data, number) => (
            <span key={number}>
              {data}
              <svg
                onClick={() => {
                  setCategoryArray((items) => items.filter((_, index) => index !== number)); //Array[number]값에 있는 인덱스를 제거
                }}
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth='2'
                stroke='#000'
              >
                <path strokeLinecap='round' strokeLinejoin='round' d='M6 18 18 6M6 6l12 12' />
              </svg>
            </span>
          ))}
        </div>
        <button className='next-step-button' onClick={step2Valid}>
          다음 단계로
        </button>
      </div>
    </div>
  );
}

export default Step2;
