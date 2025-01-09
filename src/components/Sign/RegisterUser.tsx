import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { RegisterType } from '../../types/Sign';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../server/firebase';
import { uploadProfile } from '../../server/uploadStorage';
import { AnimatePresence, motion } from 'framer-motion';
import { capitalLetters, englishLetters, specialLetters } from '../../Utils/regExp';
import { nickNameCheck, userIdCheck } from '../../server/readStore';
import { getAuthenticInfo } from '../../server/createStore';

function RegisterUser() {
  //네비게이터
  const navigate = useNavigate();
  //회원가입 완료 되었을 시 생성되는 팝업 상태
  const [popUp, setPopUp] = useState<boolean>(false);
  //폼 이벤트 시 로딩 동작
  const [loading, setLoading] = useState<boolean>(false);
  //프로필 이미지 프리뷰 상태 및 관리
  const [preview, setPreview] = useState<string | null>(null);
  const getPreview = (fileImg: File | null) => {
    if (fileImg) {
      if (fileImg.size >= 2097152) {
        //파일이 2MB이상일 경우 리턴
        alert('파일 용량이 초과되었습니다.');
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(fileImg);
      }
    } else {
      setPreview(null);
    }
  };

  //닉네임, 아이디 임시 저장 상태값
  const [checkedNickName, setCheckedNickName] = useState<string>('');
  const [checkedUserId, setCheckeUserId] = useState<string>('');

  //중복 확인이 완료된 후의 폼 데이터 값
  const [finalData, setFinalData] = useState<RegisterType>();
  //리액트 훅 폼
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<RegisterType>({ mode: 'onSubmit' });

  //폼 이벤트: 닉네임, 아이디 중복체크
  const onRepeatValid = (data: RegisterType) => {
    setLoading(true);

    nickNameCheck(data.registerNickName).then((response) => setCheckedNickName(response));
    userIdCheck(data.registerId).then((response) => setCheckeUserId(response));

    setFinalData(data);
  };

  //중복 확인 1차
  useEffect(() => {
    //닉네임이 중복일 경우
    if (checkedNickName === 'already-exist') {
      alert('닉네임이 중복되었습니다.');
      setLoading(false);
    } else if (checkedUserId === 'already-exist') {
      alert('아이디가 중복되었습니다.');
      setLoading(false);
    } else {
      onRegisterValid();
    }
  }, [checkedUserId, checkedNickName]);

  //폼 이벤트: 회원가입
  const onRegisterValid = async () => {
    if (finalData) {
      //파이어베이스 프로필 이미지 업로드 메소드
      const profileImg = await uploadProfile(
        finalData.registerId,
        finalData.registerImg.length <= 0 ? undefined : finalData.registerImg[0], //fileList에 값이 없으면 undefined를 인자로 전송
      );
      //파이어베이스 사용자 등록 메소드
      await createUserWithEmailAndPassword(auth, finalData.registerId + '@pick.it', finalData.registerPw)
        //DB에 회원정보 추가 저장
        .then((response) =>
          getAuthenticInfo(
            response.user.uid,
            finalData.registerId,
            finalData.registerPw,
            finalData.registerNickName,
            profileImg,
          ),
        )
        .catch((error) => console.log(error.message));
      setPopUp(true);
      reset();
      setPreview(null);
      setLoading(false);
    }
  };

  //회원가입 완료 팝업 확인 클릭 이벤트
  const registerComplete = () => {
    //로그아웃 메소드
    signOut(auth);
    //로컬스토리지 로그인 정보 삭제
    localStorage.removeItem('pickit-user');
    navigate('/login');
  };
  return (
    <>
      <form className='register-form-section' onSubmit={handleSubmit(onRepeatValid)}>
        <table>
          <tbody>
            <tr>
              <td>
                <h1>닉네임</h1>
              </td>
              <td>
                <input
                  type='text'
                  autoComplete='off'
                  {...register('registerNickName', {
                    required: '*(영문소문자/숫자, 특수문자 제외, 4~16자)',
                    validate: {
                      min: (value: string) => value.length >= 2 || '*닉네임은 최소 2자입니다.',
                      max: (value: string) => value.length <= 16 || '*닉네임은 최대 16자입니다.',
                      letter: (value: string) =>
                        !value.match(specialLetters) || //특수문자 정규표현식 검사
                        '*특수문자는 사용할 수 없습니다.',
                    },
                  })}
                />
              </td>
              <td>
                <p>
                  {errors.registerNickName
                    ? errors.registerNickName.message
                    : '*(영문소문자/숫자, 특수문자 제외, 4~16자)'}
                </p>
              </td>
            </tr>
            <tr>
              <td>
                <h1>아이디</h1>
              </td>
              <td>
                <input
                  type='text'
                  autoComplete='off'
                  {...register('registerId', {
                    required: '*(영문소문자/숫자, 특수문자 제외, 4~16자)',
                    validate: {
                      min: (value: string) => value.length >= 4 || '*아이디는 최소 4자입니다.',
                      max: (value: string) => value.length <= 16 || '*아이디는 최대 16자입니다.',
                      specialLetter: (value: string) =>
                        !value.match(specialLetters) || //특수문자 정규표현식 검사
                        '*특수문자는 사용할 수 없습니다.',
                      englishLetter: (value: string) =>
                        !value.match(englishLetters) || //영문자 정규표현식 검사
                        '*영문, 숫자 이외에는 사용할 수 없습니다.',
                      capitalLetter: (value: string) =>
                        !value.match(capitalLetters) || //영문대문자 정규표현식 검사
                        '*소문자만 사용할 수 있습니다.',
                    },
                  })}
                />
              </td>
              <td>
                <p>{errors.registerId ? errors.registerId.message : '*(영문소문자/숫자, 특수문자 제외, 4~16자)'}</p>
              </td>
            </tr>

            <tr>
              <td>
                <h1>비밀번호</h1>
              </td>
              <td>
                <input
                  type='password'
                  autoComplete='off'
                  {...register('registerPw', {
                    required: '*(영문대소문자/숫자, 6~16자)',
                    validate: {
                      min: (value: string) => value.length >= 6 || '*비밀번호는 최소 6자입니다.',
                      max: (value: string) => value.length <= 16 || '*비밀번호는 최대 16자입니다.',
                    },
                  })}
                />
              </td>
              <td>
                <p>{errors.registerPw ? errors.registerPw.message : '*(영문대소문자/숫자, 6~16자)'}</p>
              </td>
            </tr>
            <tr>
              <td>
                <h1>프로필 이미지</h1>
              </td>
              <td>
                <label htmlFor='pImg'>
                  <div>
                    {preview ? (
                      <img src={preview} alt='이미지 프리뷰' />
                    ) : (
                      <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth='1'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z'
                        />
                      </svg>
                    )}
                  </div>
                  <input
                    type='file'
                    accept='image/*'
                    {...register('registerImg', {
                      required: false,
                    })}
                    onChange={({ target }: any) => {
                      target ? getPreview(target.files[0]) : getPreview(null);
                    }}
                    id='pImg'
                  />
                </label>
              </td>
              <td>
                <p>*(2MB이하, png/jpg/webp파일)</p>
              </td>
            </tr>
          </tbody>
        </table>
        <button className='register-submit' type='submit' disabled={loading}>
          {loading ? '로딩 중...' : '계정 생성'}
        </button>
      </form>

      <AnimatePresence>
        {popUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={popUp ? { opacity: 1 } : { opacity: 0 }}
            exit={{ opacity: 0 }}
            className='register-success-popup'
          >
            <motion.div initial={{ scale: 0 }} animate={popUp ? { scale: 1 } : { scale: 0 }} exit={{ scale: 0 }}>
              <h2>
                <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth='1.5'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
                  />
                </svg>
                Pickit의 회원이 되신 것을 환영합니다!
              </h2>
              <button onClick={registerComplete}>로그인 화면으로</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default RegisterUser;
