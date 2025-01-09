import { DocumentData } from 'firebase/firestore';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef, useState } from 'react';
import { WorldcupImage } from '../../../types/Worldcup';
import { IoClose } from 'react-icons/io5';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { editWorldcupInformation } from '../../../server/updateStore';

function EditGameInfo(prop: {
  gameData: {
    gameId: string;
    gameInfo: DocumentData;
  };
}) {
  //네비게이터
  const navigate = useNavigate();
  //props게임정보
  const gameInfo = prop.gameData.gameInfo;
  //핸들러 로딩 동작
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  //이미지 배열을 오름차순 정렬
  const gameImages = gameInfo.worldcupImages.sort((a: WorldcupImage, b: WorldcupImage) => a.fileIndex - b.fileIndex);
  //월드컵 제목, 월드컵 설명 텍스트 저장 상태
  const [title, setTitle] = useState<string>(gameInfo.worldcupTitle);
  const [description, setDescription] = useState<string>(gameInfo.worldcupDescription);
  //카테고리 배열 저장 상태
  const [categoryArray, setCategoryArray] = useState<string[]>(gameInfo.category);
  //이미지 썸네일 2개 저장 상태
  const [thumbnailImages, setThumbnailImages] = useState<number[]>(gameInfo.thumbnail);
  //값이 비어있을 경우 자동 focus를 위한 ref
  const textRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  //썸네일 수정 팝업
  const [thumbnailPopup, setThumbnailPopup] = useState<'좌측' | '우측' | null>(null);
  //변경할 썸네일 클릭 이벤트
  const newThumbnail = (thumbnailIndex: number) => {
    const setArray = [...thumbnailImages];
    if (thumbnailPopup === '좌측') {
      setArray[0] = thumbnailIndex;
    } else if (thumbnailPopup === '우측') {
      setArray[1] = thumbnailIndex;
    }
    setThumbnailImages(setArray);
    setThumbnailPopup(null);
  };
  //리액트 훅 폼
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<{ category: string }>({ mode: 'onSubmit' });
  //에러 문구 상태
  const [errorMessage1, setErrorMessage1] = useState<string>();
  const [errorMessage2, setErrorMessage2] = useState<string>();
  //변경할 제목 텍스트 온체인지 이벤트 상태 할당
  const titleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };
  //변경할 설명 텍스트 온체인지 이벤트 상태 할당
  const descriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value);
  };
  //월드컵 제목, 설명 유효성 검사
  const onValid = async () => {
    setUpdateLoading(true);
    if (title.length === 0) {
      textRef.current && textRef.current.focus();
      setUpdateLoading(false);
      return;
    } else if (description.length === 0) {
      textareaRef.current && textareaRef.current.focus();
      setUpdateLoading(false);
      return;
    }

    if (title.length < 6 || title.length > 25) {
      setErrorMessage1('월드컵 제목은 6글자 이상, 25글자 이하입니다.');
      setUpdateLoading(false);
      return;
    } else if (description.length > 50) {
      setErrorMessage2('월드컵 설명은 50글자 이하입니다.');
      setUpdateLoading(false);
      return;
    }

    if (categoryArray.length === 0) {
      alert('카테고리를 추가하세요.');
      setUpdateLoading(false);
      return;
    }
    setErrorMessage1(undefined);
    setErrorMessage2(undefined);
    updateInfoHandler();
  };
  //카테고리 폼 엔터 입력 핸들러
  const categoryHandler = (text: { category: string }) => {
    if (categoryArray.length >= 3) {
      alert('카테고리는 최대 4개까지 가능합니다.');
      return;
    }
    setCategoryArray([...categoryArray, text.category]);
    reset();
  };
  //유효성 검사를 마친 백엔드 전송 핸들러
  const updateInfoHandler = async () => {
    const sendData = {
      gameId: prop.gameData.gameId,
      title: title,
      description: description,
      category: categoryArray,
      thumbnail: thumbnailImages,
    };
    await editWorldcupInformation(sendData).then(() => navigate('/mypage'));
  };
  return (
    <>
      <div className='edit-section'>
        <h1>썸네일</h1>
        <div className='img-wrapper'>
          <img src={gameImages[thumbnailImages[0]].filePath} alt='' />
          <img src={gameImages[thumbnailImages[1]].filePath} alt='' />
          <div className='click-img-wrapper'>
            <div onClick={() => setThumbnailPopup('좌측')}>
              <svg viewBox='0 0 80 80' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  fillRule='evenodd'
                  clipRule='evenodd'
                  d='M75 70C75 72.76 72.76 75 70 75H57.08L38.66 56.3375L60 34.9975L75 49.9975V70ZM10 75C7.24 75 5 72.76 5 70V67.6525L24.8625 49.8625L50.0025 75H10ZM20 10C25.5225 10 30 14.4775 30 20C30 25.5225 25.5225 30 20 30C14.4775 30 10 25.5225 10 20C10 14.4775 14.4775 10 20 10ZM70 0H10C4.4775 0 0 4.4775 0 10V70C0 75.5225 4.4775 80 10 80H70C75.5225 80 80 75.5225 80 70V10C80 4.4775 75.5225 0 70 0ZM20 25C22.76 25 25 22.76 25 20C25 17.24 22.76 15 20 15C17.24 15 15 17.24 15 20C15 22.76 17.24 25 20 25Z'
                />
              </svg>
              변경하기
            </div>
            <div onClick={() => setThumbnailPopup('우측')}>
              <svg viewBox='0 0 80 80' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  fillRule='evenodd'
                  clipRule='evenodd'
                  d='M75 70C75 72.76 72.76 75 70 75H57.08L38.66 56.3375L60 34.9975L75 49.9975V70ZM10 75C7.24 75 5 72.76 5 70V67.6525L24.8625 49.8625L50.0025 75H10ZM20 10C25.5225 10 30 14.4775 30 20C30 25.5225 25.5225 30 20 30C14.4775 30 10 25.5225 10 20C10 14.4775 14.4775 10 20 10ZM70 0H10C4.4775 0 0 4.4775 0 10V70C0 75.5225 4.4775 80 10 80H70C75.5225 80 80 75.5225 80 70V10C80 4.4775 75.5225 0 70 0ZM20 25C22.76 25 25 22.76 25 20C25 17.24 22.76 15 20 15C17.24 15 15 17.24 15 20C15 22.76 17.24 25 20 25Z'
                />
              </svg>
              변경하기
            </div>
          </div>
        </div>
        <h1>월드컵 제목</h1>
        <input type='text' ref={textRef} value={title} onChange={titleChange} />
        {errorMessage1 && <p>{errorMessage1}</p>}
        <h1>월드컵 설명</h1>
        <textarea ref={textareaRef} value={description} onChange={descriptionChange} />
        {errorMessage2 && <p>{errorMessage2}</p>}
        <h1>카테고리</h1>
        <form className='category-input' onSubmit={handleSubmit(categoryHandler)}>
          <input
            type='text'
            placeholder='4글자 이하로 입력 (Enter 키)'
            autoComplete='off'
            {...register('category', {
              required: true,
              validate: {
                max: (value: string) => value.length < 5 || '카테고리는 최대 4글자로 설정해주세요.',
              },
            })}
          />
          <div>
            {categoryArray.map((text: string, i: number) => (
              <span key={i}>
                {text}
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth='2'
                  stroke='#000'
                  onClick={() => {
                    setCategoryArray((items) => items.filter((_, index) => index !== i)); //Array[number]값에 있는 인덱스를 제거
                  }}
                >
                  <path strokeLinecap='round' strokeLinejoin='round' d='M6 18 18 6M6 6l12 12' />
                </svg>
              </span>
            ))}
          </div>
        </form>
        {errors.category && <p>{errors.category.message}</p>}
        <button className='save-button' onClick={onValid} disabled={updateLoading}>
          {updateLoading ? '로딩중...' : '변경내용 저장하기'}
        </button>
      </div>
      <AnimatePresence>
        {thumbnailPopup && (
          <motion.div
            className={(gameImages.length > 8 && 'scroll-hide') + ' edit-thumbnail-popup'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className='thumbnail-container'>
              <IoClose onClick={() => setThumbnailPopup(null)} />
              <h1>사진을 선택해주세요 ( {thumbnailPopup} )</h1>
              <div className='img-wrapper'>
                {gameImages.map((img: WorldcupImage, index: number) => (
                  <img src={img.filePath} alt='' key={img.fileIndex} onClick={() => newThumbnail(index)} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
export default EditGameInfo;
