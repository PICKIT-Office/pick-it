import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/MyPage/editProfile.scss';
import { uploadProfile } from '../server/uploadStorage';
import { AnimatePresence, motion } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import EditNickName from '../components/MyPage/EditProfile/EditNickName';
import EditPassword from '../components/MyPage/EditProfile/EditPassword';
import DeleteUser from '../components/MyPage/EditProfile/DeleteUser';
import { getUserData } from '../server/readStore';
import { setMyProfileImage } from '../server/updateStore';

function EditProfile() {
  //로컬스토리지에 존재하는 유저 데이터
  const user = localStorage.getItem('pickit-user');
  const parseUser = user ? JSON.parse(user) : null;
  //네비게이션
  const navigate = useNavigate();
  // 내 프로필 정보 상태 ["이미지경로", "닉네임"]
  const [myProfile, setMyProfile] = useState<string[]>();
  // input file 온체인지 저장 상태
  const [inputFile, setInputFile] = useState<File | null>(null);
  const setOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setInputFile(event.target.files[0]);
    } else {
      setInputFile(null);
    }
  };
  //프로필 변경 시 로딩 동작
  const [changeLoading, setChangeLoading] = useState<boolean>(false);
  //닉네임 or 비밀번호 or 회원탈퇴 버튼 클릭 팝업 상태
  const [editPopUp, setEditPopUp] = useState<boolean>(false);
  // 닉네임 변경, 비밀번호 변경, 회원탈퇴 팝업
  const [popUpType, setPopUpType] = useState<'닉네임' | '비밀번호' | '회원탈퇴'>();
  //로그인 여부 확인
  useEffect(() => {
    if (!user) {
      alert('로그인 후 이용 가능합니다.');
      navigate('/login');
    }
  }, [navigate, user]);

  useEffect(() => {
    if (user) {
      //회원 프로필 이미지 및 닉네임 불러오기
      getUserData(String(parseUser.UserId)).then((res) => setMyProfile(res));
    }
  }, []);

  // 프로필 이미지 변경 핸들러
  const changeProfileImg = async (changeType: 'change' | 'default') => {
    //단순 변경인지 기본이미지 초기화인지
    setChangeLoading(true);
    if (user) {
      if (changeType === 'change') {
        if (inputFile) {
          await uploadProfile(parseUser.UserId, inputFile).then((imgPath) =>
            setMyProfileImage(parseUser.UserId, imgPath),
          );
        } else {
          alert('변경할 이미지를 업로드 해주세요.');
          setChangeLoading(false);
          return;
        }
      } else if (changeType === 'default') {
        await setMyProfileImage(parseUser.UserId, 'default');
      }
    }
    setInputFile(null);
    setChangeLoading(false);
    navigate('/mypage');
  };

  return myProfile && user ? (
    <>
      <section className='edit-profile-container'>
        <div className='edit-main'>
          <div className='edit-img'>
            <h1>프로필 수정</h1>
            <label htmlFor='profile-img'>
              <div className='img-wrapper'>
                {inputFile ? (
                  <img src={URL.createObjectURL(inputFile) as string} alt='' />
                ) : (
                  <img src={myProfile[0] === 'default' ? '/images/user.png' : myProfile[0]} alt='' />
                )}
                <div className='icon-wrapper'>
                  <svg viewBox='0 0 80 80' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path
                      fillRule='evenodd'
                      clipRule='evenodd'
                      d='M75 70C75 72.76 72.76 75 70 75H57.08L38.66 56.3375L60 34.9975L75 49.9975V70ZM10 75C7.24 75 5 72.76 5 70V67.6525L24.8625 49.8625L50.0025 75H10ZM20 10C25.5225 10 30 14.4775 30 20C30 25.5225 25.5225 30 20 30C14.4775 30 10 25.5225 10 20C10 14.4775 14.4775 10 20 10ZM70 0H10C4.4775 0 0 4.4775 0 10V70C0 75.5225 4.4775 80 10 80H70C75.5225 80 80 75.5225 80 70V10C80 4.4775 75.5225 0 70 0ZM20 25C22.76 25 25 22.76 25 20C25 17.24 22.76 15 20 15C17.24 15 15 17.24 15 20C15 22.76 17.24 25 20 25Z'
                    />
                  </svg>
                  이미지 변경하기
                </div>
              </div>
              <input type='file' id='profile-img' accept='image/*' onChange={(event) => setOnChange(event)} />
            </label>
            <div>
              <button disabled={changeLoading} className='common-buttons' onClick={() => changeProfileImg('change')}>
                {changeLoading ? '로딩 중...' : '이미지 저장'}
              </button>
              <button disabled={changeLoading} className='common-buttons' onClick={() => changeProfileImg('default')}>
                {changeLoading ? '로딩 중...' : '기본 이미지로 변경'}
              </button>
            </div>
          </div>
          <table className='nickname-password-table'>
            <tbody>
              <tr>
                <td>닉네임</td>
                <td>{myProfile[1]}</td>
                <td>
                  <button
                    className='common-buttons'
                    onClick={() => {
                      setEditPopUp(true);
                      setPopUpType('닉네임');
                    }}
                  >
                    변경하기
                  </button>
                </td>
              </tr>
              <tr>
                <td>비밀번호</td>
                <td>**********</td>
                <td>
                  <button
                    className='common-buttons'
                    onClick={() => {
                      setEditPopUp(true);
                      setPopUpType('비밀번호');
                    }}
                  >
                    변경하기
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button
          className='common-buttons delete-user-trigger'
          onClick={() => {
            setEditPopUp(true);
            setPopUpType('회원탈퇴');
          }}
        >
          회원탈퇴
        </button>
      </section>
      <AnimatePresence>
        {editPopUp && (
          <motion.div className='edit-popup' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className='edit-popup-container'>
              <IoClose onClick={() => setEditPopUp(false)} />
              {popUpType === '닉네임' && <EditNickName userId={parseUser.UserId} userName={myProfile[1]} />}
              {popUpType === '비밀번호' && <EditPassword userId={parseUser.UserId} loginToken={parseUser.LoginToken} />}
              {popUpType === '회원탈퇴' && <DeleteUser userId={parseUser.UserId} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  ) : (
    <div className='before-game-message'>
      <h2>계정 정보를 불러오는 중입니다...</h2>
      <div className='loading-spiner'>
        <hr />
        <div />
      </div>
    </div>
  );
}

export default EditProfile;
