import React, { useEffect, useState } from 'react';
import '../assets/Sign/sign.scss';
import { useForm } from 'react-hook-form';
import InputField from '../components/Sign/InputField';
import { Link, useNavigate } from 'react-router-dom';
import { LoginType } from '../types/Sign';
import { signInPickit } from '../server/authentication';
function Login() {
  //네비게이터
  const navigate = useNavigate();
  //로그인 상태 확인
  const isLogin: string | null = localStorage.getItem('pickit-user');

  useEffect(() => {
    if (isLogin) {
      navigate('/');
    }
  }, [navigate, isLogin]);
  //로그인 실패 상태
  const [loginFailed, setLoginFailed] = useState<boolean>(false);
  //폼 이벤트 시 로딩 동작
  const [loading, setLoading] = useState<boolean>(false);
  //리액트 훅 폼
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<LoginType>({ mode: 'onSubmit' });
  //폼 이벤트
  const onLoginValid = async (data: LoginType) => {
    setLoginFailed(false);
    setLoading(true);

    await signInPickit(data.loginId + '@pick.it', data.loginPw).catch((error) => setLoginFailed(true));

    setLoading(false);
  };
  return (
    <section className='sign-container'>
      <img src='/images/introduce.png' alt='소개이미지' className='sign-introduce' />
      <div className='login-container'>
        <div className='login-form-top'>
          <h1>로그인</h1>
          <div>
            <Link to='/find-user'>비밀번호 찾기</Link>
          </div>
        </div>
        <form className='login-form-section' onSubmit={handleSubmit(onLoginValid)}>
          <InputField name='loginId' type='text' placeholder='아이디' register={register} error={errors.loginId} />
          <InputField
            name='loginPw'
            type='password'
            placeholder='비밀번호'
            register={register}
            error={errors.loginPw}
          />
          <p className='login-fail-message'>{loginFailed && '아이디 혹은 비밀번호가 일치하지 않습니다.'}</p>
          <button type='submit' disabled={loading}>
            {loading ? '로딩 중...' : '로그인'}
          </button>
        </form>
        <div className='login-form-bottom'>
          <p>계정이 없으신가요? PICKIT 커뮤니티에 참여해주세요!</p>
          <Link to='/register'>계정 생성</Link>
        </div>
      </div>
    </section>
  );
}

export default Login;
