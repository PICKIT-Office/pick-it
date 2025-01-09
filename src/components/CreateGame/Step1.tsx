import React from 'react';
import { useAppDispatch } from '../../hooks/redux';
import { useForm } from 'react-hook-form';
import { scrollStep2, updateStep1 } from '../../store/worldcup/createWorldcup';
import { step1DataType } from '../../types/Worldcup';

function Step1() {
  //redux dispatch 요청 메소드
  const dispatch = useAppDispatch();

  //리액트 훅 폼
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<step1DataType>({
    mode: 'onSubmit',
  });
  /* step1 입력 데이터 redux 저장 */
  const step1Valid = (data: step1DataType) => {
    /* step1 입력 데이터 유효성 통과 시 
    redux의 updateStep1 action 함수에 payload값으로 데이터 전송 */
    dispatch(updateStep1(data));

    /* step1 입력 데이터가 성공적으로 redux 전역 상태값에 저장 되었을 시,
    다음 step2로 가기 위한 조건문 검사 후 step2 이동 */
    dispatch(scrollStep2(2));
  };
  return (
    <div className='create-game-step12'>
      <h3 className='steps-page-number'>1 / 3</h3>
      <h1 className='steps-page-title'>월드컵 제목 및 설명</h1>
      <p className='steps-page-desc'>월드컵 제목과 설명을 작성해주세요.</p>

      <form className='step12-form' onSubmit={handleSubmit(step1Valid)}>
        <input
          type='text'
          autoComplete='off'
          placeholder='제목을 입력해주세요.'
          {...register('worldCupTitle', {
            required: true,
            validate: {
              min: (value: string) => value.length >= 6 || '월드컵 제목은 6글자 이상 입력하셔야 합니다.',
              max: (value: string) => value.length <= 25 || '월드컵 제목은 25글자 이하까지 입력 가능합니다.',
            },
          })}
        />
        <p className='step-error-message'>{errors.worldCupTitle && errors.worldCupTitle.message}</p>
        <textarea
          autoComplete='off'
          placeholder='월드컵을 설명하는 내용을 입력해주세요.'
          {...register('worldcupDescription', {
            required: false,
            validate: {
              max: (value: string) => value.length <= 50 || '월드컵 설명은 50글자 이하까지 입력 가능합니다.',
            },
          })}
        />
        <p className='step-error-message'>{errors.worldcupDescription && errors.worldcupDescription.message}</p>
        <button className='next-step-button' type='submit'>
          다음 단계로
        </button>
      </form>
    </div>
  );
}

export default Step1;
