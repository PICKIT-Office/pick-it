import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/Sign/sign.scss';
import '../assets/Sign/find.scss';
import { useForm } from 'react-hook-form';
import { UserFind } from '../types/Sign';
import { findPassword } from '../server/readStore';

function FindUser() {
  //폼 이벤트 시 로딩 동작
  const [loadingPW, setLoadingPW] = useState<boolean>(false);
  //검색 결과 상태
  const [resultPW, setResultPW] = useState<null | 'empty' | string>(null);
  //비밀번호 열람 토글
  const [passwordView, setPasswordView] = useState<boolean>(false);
  //리액트 훅 폼
  const { handleSubmit: pw_handle, register: pw_register } = useForm<UserFind>({
    mode: 'onSubmit',
  });

  //비밀번호 찾기 폼 이벤트
  const findPWValid = async (data: UserFind) => {
    setLoadingPW(true);
    await findPassword(data.inputText).then((result) => setResultPW(result));
    setLoadingPW(false);
  };
  return (
    <section className='sign-container'>
      <img src='/images/introduce.png' alt='소개이미지' className='sign-introduce' />
      <div className='find-container'>
        <div className='find-form'>
          <h1>비밀번호 찾기</h1>
          <form className='find-form-section' onSubmit={pw_handle(findPWValid)}>
            <input
              type='text'
              autoComplete='off'
              placeholder='아이디를 입력해주세요.'
              {...pw_register('inputText', {
                required: true,
              })}
            />
            <button type='submit' disabled={loadingPW}>
              {loadingPW ? '로딩중...' : '비밀번호 검색'}
            </button>
          </form>
          <div className={'find-result' + (resultPW && resultPW !== 'empty' ? ' getcolor' : '')}>
            {resultPW
              ? resultPW !== 'empty'
                ? passwordView
                  ? resultPW
                  : '*********'
                : '존재하지 않는 아이디 입니다.'
              : ''}

            {resultPW && passwordView ? (
              <button>
                <svg
                  onClick={() => setPasswordView(false)}
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth='2'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88'
                  />
                </svg>
              </button>
            ) : (
              <button>
                <svg
                  onClick={() => setPasswordView(true)}
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke-width='2'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z'
                  />
                  <path strokeLinecap='round' strokeLinejoin='round' d='M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className='find-form-bottom'>
        <p>계정을 찾으셨나요? PICKIT 커뮤니티에 참여해주세요!</p>
        <Link to='/login'>로그인</Link>
      </div>
    </section>
  );
}

export default FindUser;
