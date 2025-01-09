import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../assets/Contents/gameHeader.scss';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { ShareCommunity, WorldcupImage } from '../../types/Worldcup';
import { getCreateCommunity } from '../../server/createStore';

function GameHeader(prop: { gameId: string; currentMatch: WorldcupImage[] }) {
  //네비게이터
  const navigate = useNavigate();
  //로그인 여부: 로그인 해야 공유하기 가능
  const localUser: string | null = localStorage.getItem('pickit-user');
  const userId = localUser ? JSON.parse(localUser).UserId : null;
  //배열 구조 분해로 각각 매칭 이미지 할당
  const [first, second] = prop.currentMatch;
  //공유하기 모달창 팝업 상태
  const [shareModal, setShareModal] = useState<boolean>(false);
  //공유하기 모달을 띄우기 전 로그인 여부 확인
  const checkShareModal = () => {
    localUser ? setShareModal(true) : alert('로그인 해야 이용할 수 있습니다.');
  };
  //공유하기 리액트 훅 폼
  const { handleSubmit, register, reset } = useForm<ShareCommunity>({
    mode: 'onSubmit',
  });
  //로딩 동작 상태
  const [loading, setLoading] = useState<boolean>(false);
  //공유하기 핸들러 이벤트
  const shareValid = async (inputs: ShareCommunity) => {
    setLoading(true);
    //커뮤니티 글 추가
    await getCreateCommunity(prop.gameId, userId, inputs.title, inputs.subTitle, first, second).then(() => {
      alert('커뮤니티에 글이 등록되었습니다.');
      navigate('/community');
    });
  };

  //월드컵 매칭이 바뀔 때마다 입력된 formState제거
  useEffect(() => {
    reset();
  }, [prop.currentMatch]);
  return (
    <>
      <div className='game-header-container'>
        <Link className='game-header-icons' to='/contents'>
          <svg width='40' height='40' viewBox='0 0 50 50' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M15.4732 15.4705L8.33479 22.619L15.4766 29.7607'
              stroke='black'
              strokeWidth='3'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M20.2381 36.9049H32.1428C36.9047 36.907 39.2857 34.526 39.2857 29.762C39.2857 24.998 36.9047 22.6171 32.1428 22.6191H8.33331'
              stroke='black'
              strokeWidth='3'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
          돌아가기
        </Link>
        <div className='right-icons'>
          <span className='game-header-icons' onClick={checkShareModal}>
            <svg
              width='35'
              height='35'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth='1'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5'
              />
            </svg>
            공유하기
          </span>
          <span className='game-header-icons'>
            <svg
              width='35'
              height='35'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth='1'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z'
              />
            </svg>
            문의하기
          </span>
          <span className='game-header-icons'>
            <svg width='35' height='35' viewBox='0 0 50 50' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path
                d='M12.1337 17.5626L9.28142 16.0055C8.81293 15.7506 8.22043 15.9229 7.96552 16.3913C7.71061 16.8598 7.88285 17.4523 8.35822 17.7072L11.2036 19.2643C11.6721 19.5192 12.2646 19.3469 12.5195 18.8784C12.7744 18.41 12.6021 17.8175 12.1337 17.5626Z'
                fill='black'
              />
              <path
                d='M18.1343 13.0638L16.5359 10.432C16.2603 9.97044 15.661 9.82576 15.1994 10.1082C14.7378 10.3838 14.5931 10.9832 14.8756 11.4448L16.4739 14.0766C16.7495 14.5382 17.3489 14.6828 17.8105 14.4004C18.2721 14.1179 18.4168 13.5254 18.1343 13.0638Z'
                fill='black'
              />
              <path
                d='M24.5 8C23.9626 8 23.5286 8.43404 23.5286 8.97142V11.9615C23.5286 12.4988 23.9626 12.9329 24.5 12.9329C25.0374 12.9329 25.4714 12.4988 25.4714 11.9615V8.97142C25.4714 8.43404 25.0374 8 24.5 8Z'
                fill='black'
              />
              <path
                d='M33.8007 10.1082C33.3391 9.83262 32.7466 9.9773 32.4641 10.432L30.8658 13.0638C30.5902 13.5254 30.7349 14.1248 31.1896 14.4003C31.6512 14.6828 32.2437 14.5312 32.5261 14.0765L34.1245 11.4448C34.4001 10.9832 34.2554 10.3907 33.8007 10.1082Z'
                fill='black'
              />
              <path
                d='M41.0277 16.3912C40.7728 15.9227 40.1803 15.7436 39.7119 16.0054L36.8596 17.5624C36.3911 17.8173 36.2189 18.403 36.4738 18.8783C36.7287 19.3468 37.3212 19.5259 37.7897 19.2641L40.6419 17.7071C41.1104 17.4522 41.2895 16.8597 41.0277 16.3912Z'
                fill='black'
              />
              <path
                d='M41.9306 41.6689L40.2014 37.301C40.0567 36.929 39.6984 36.6878 39.2988 36.6878H37.2733L35.1927 21.4965C34.8345 18.7407 32.4782 16.667 29.6949 16.667H19.2987C16.5222 16.667 14.1591 18.7407 13.8077 21.4896L11.7271 36.681H9.7016C9.30201 36.681 8.94376 36.9221 8.79908 37.2941L7.06982 41.6689C6.81491 42.3097 7.29028 42.9986 7.97234 42.9986H41.0281C41.7102 42.9986 42.1855 42.3097 41.9306 41.6689ZM15.7368 21.7445C15.9641 19.9533 17.5005 18.6098 19.3055 18.6098H29.7018C31.5068 18.6098 33.0363 19.9602 33.2705 21.7514L35.3167 36.681H13.6906L15.7368 21.7445ZM9.40535 41.0558L10.363 38.6307H38.6375L39.5951 41.0558H9.40535Z'
                fill='black'
              />
              <path d='M23.0464 22.1438V24.1831L23.5218 30.108H25.4646L25.9538 24.1831V22.1438H23.0464Z' fill='black' />
              <path
                d='M24.5 34.1109C25.2991 34.1109 25.9468 33.4631 25.9468 32.6641C25.9468 31.865 25.2991 31.2173 24.5 31.2173C23.701 31.2173 23.0532 31.865 23.0532 32.6641C23.0532 33.4631 23.701 34.1109 24.5 34.1109Z'
                fill='black'
              />
            </svg>
            신고하기
          </span>
        </div>
      </div>
      <AnimatePresence>
        {shareModal && (
          <motion.div
            className='share-popup'
            initial={{ opacity: 0 }}
            animate={shareModal ? { opacity: 1 } : { opacity: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className='share-container'>
              <div className='close-popup-button'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth='2'
                  stroke='currentColor'
                  onClick={() => setShareModal(false)}
                >
                  <path strokeLinecap='round' strokeLinejoin='round' d='M6 18 18 6M6 6l12 12' />
                </svg>
              </div>
              <h2>커뮤니티 공유하기</h2>
              <div className='share-images'>
                <div>
                  <img src={first.filePath} alt='' />
                  <p>{first.fileName}</p>
                </div>
                <div>
                  <img src={second.filePath} alt='' />
                  <p>{second.fileName}</p>
                </div>
              </div>
              <form className='share-form' onSubmit={handleSubmit(shareValid)}>
                <p>제목</p>
                <input
                  type='text'
                  placeholder='ex) 둘 중 어떤 것을 선택해야 할까요?'
                  autoComplete='off'
                  {...register('title', {
                    required: true,
                  })}
                />
                <p>부제목</p>
                <input
                  type='text'
                  placeholder='ex) 선택하기 힘든 박빙 매치네요..여러분들의 의견은 어떤가요?'
                  autoComplete='off'
                  {...register('subTitle', {
                    required: true,
                  })}
                />
                <button type='submit' disabled={loading}>
                  {loading ? '로딩중...' : '등록하기'}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default GameHeader;
