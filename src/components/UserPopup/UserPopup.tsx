import React from 'react';
import { PopupUserData } from '../../types/Sign';
import { PopupContext, ToggleContextType } from '../../context/PopupContext';
import { motion } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import useSignOut from '../../hooks/useSignOut';
import { useNavigate } from 'react-router-dom';

interface PropsUserData {
  userData: PopupUserData;
}

const UserPopup = ({ userData }: PropsUserData) => {
  //로그아웃 커스텀 훅
  const logOut = useSignOut('/');
  //네비게이터
  const navigate = useNavigate();
  const { setUserPopupToggle }: ToggleContextType = PopupContext();
  const containerMotion = {
    initial: {
      opacity: 0,
      y: 10,
    },

    animate: {
      opacity: 1,
      y: 0,

      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
        duration: 0.2,
      },
    },
  };

  const itemMotion = {
    initial: {
      opacity: 0,
    },

    animate: {
      opacity: 1,
    },
  };

  return (
    <motion.div
      className='userPopup-container'
      variants={containerMotion}
      initial='initial'
      animate='animate'
      exit='exit'
    >
      <div className='userPopup-wrap'>
        <div className='close-popup' onClick={() => (setUserPopupToggle ? setUserPopupToggle(false) : 'none')}>
          <IoClose />
        </div>
        <motion.div className='user-profile' variants={itemMotion}>
          <div className='profile-img'>
            <img src={userData.imgUrl === 'default' ? '/images/user.png' : userData.imgUrl} alt='' />
          </div>

          <div className='profile-info'>
            <div className='user-name'>
              <h1>{`${userData.nickName}님 환영합니다.`}</h1>
            </div>
            <button type='button' className='logOut-button' value='로그아웃' onClick={logOut}>
              로그아웃
            </button>
          </div>
        </motion.div>

        <motion.ul className='user-menu' variants={itemMotion}>
          <li>
            <button
              className='menu'
              onClick={() => {
                setUserPopupToggle && setUserPopupToggle(false);
                navigate('/mypage');
              }}
            >
              마이페이지
            </button>
          </li>
        </motion.ul>
      </div>
    </motion.div>
  );
};

export default UserPopup;
