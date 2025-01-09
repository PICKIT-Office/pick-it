import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/Sign/sign.scss';
import RegisterUser from '../components/Sign/RegisterUser';

function Register() {
  return (
    <section className='sign-container'>
      <img src='/images/introduce.png' alt='소개이미지' className='sign-introduce' />
      <div className='register-container'>
        <h1 className='register-form-top'>계정 생성</h1>

        <RegisterUser />

        <div className='register-form-bottom'>
          <p>계정이 있으신가요? PICKIT 커뮤니티에 참여해주세요!</p>
          <Link to='/login'>로그인</Link>
        </div>
      </div>
    </section>
  );
}

export default Register;
