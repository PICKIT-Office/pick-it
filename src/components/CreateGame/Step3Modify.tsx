import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { storage } from '../../server/firebase';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { SendData, WorldcupImage } from '../../types/Worldcup';
import { useNavigate } from 'react-router-dom';
import { getReset } from '../../store/worldcup/createWorldcup';
import { AnimatePresence, motion } from 'framer-motion';
import { getCreateWorldCup } from '../../server/createStore';

function Step3Modify(props: { imageList: File[] }) {
  //네비게이터
  const navigate = useNavigate();
  //로컬스토리지 사용자 정보 불러오기
  const user = localStorage.getItem('pickit-user');
  //redux에 저장된 월드컵 생성 정보 셀렉터
  const createWorldcupData = useAppSelector((state) => state.createWorldcupReducers.createWorldcupReducer);
  //redux dispatch 요청 메소드
  const dispatch = useAppDispatch();
  //파일 프리뷰 반환 함수
  const fileURL = (file: File) => {
    return URL.createObjectURL(file) as string;
  };
  //폼 동작을 위한 전용 데이터 객체 및 state 생성
  const initialData = props.imageList.map((data, number) => {
    return {
      index: number,
      imgSrc: fileURL(data),
      name: data.name.slice(0, data.name.indexOf('.')),
      file: data,
    };
  });
  const [inputData, setInputData] = useState(initialData);
  //이미지 이름을 바꿀 때 발생하는 온체인지 핸들러
  const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const newInputs = inputData.map((input) =>
      input.index === index ? { ...input, name: event.target.value } : input,
    );
    setInputData(newInputs);
  };
  //이미지 수정 테이블 페이지 번호
  const [modifyPage, setModifyPage] = useState<number>(0);
  //이미지 업로드 후 반환되는 객체 배열
  const [uploadedImageObject, setUploadedImageObject] = useState<WorldcupImage[]>([]);
  //버튼 클릭시 로딩 동작
  const [loading, setLoading] = useState<boolean>(false);
  //월드컵 생성 완료 되었을 시 생성되는 팝업 상태
  const [popUp, setPopUp] = useState<boolean>(false);
  //최종 게임 생성 버튼 핸들러
  const createGame = async () => {
    setLoading(true);
    const date = Date.now();

    if (user) {
      const userId = JSON.parse(user).UserId as string; //사용자 ID
      //월드컵 게임 이미지 파일 스토리지 업로드 함수
      inputData.forEach((images) => {
        const imageRef = ref(
          //이미지 파일이름: 유저ID / 현재날짜밀리초 /랜덤조합텍스트 + 파일이름
          storage,
          `worldcup-images/${userId}/${date}/${uuid() + images.file.name}`,
        );
        uploadBytes(imageRef, images.file).then((imgPath) => {
          getDownloadURL(imgPath.ref).then((url) => {
            setUploadedImageObject((prev) => [
              ...prev,
              {
                fileIndex: images.index,
                filePath: url,
                fileName: images.name,
              },
            ]); //여러개의 이미지 데이터들을 상태에 저장
          });
        });
      });
    }
  };
  //업로드 이미지 객체 배열의 길이가 입력값 배열과 길이가 같아 지면 addDoc
  useEffect(() => {
    if (uploadedImageObject.length === inputData.length && user) {
      //user여부는 덤
      const userId = JSON.parse(user).UserId as string;
      // //백엔드로 전송할 데이터
      const sendData: SendData = {
        userId: userId, //사용자 ID
        worldcupTitle: createWorldcupData.worldcupTitle, //월드컵 제목
        worldcupDescription: createWorldcupData.worldcupDescription, //월드컵 설명
        tournamentRange: createWorldcupData.tournamentRange, //토너먼트 범위
        category: createWorldcupData.category, //카테고리[],
        worldcupImages: uploadedImageObject, //이미지 인덱스,파일경로,이름[]
      };
      getCreateWorldCup(sendData).then(() => {
        setLoading(false); //로딩 종료
        setPopUp(true); //팝업 생성
      });
    }
  }, [uploadedImageObject]);

  //게임 생성 완료 팝업 확인 클릭 이벤트
  const createGameComplete = () => {
    dispatch(getReset()); //redux초기화
    navigate('/contents'); //월드컵 참여 페이지로 이동
  };
  return (
    <>
      <div className='modify-head'>
        <h3>이미지 이름 수정</h3>
        <button onClick={createGame} disabled={loading}>
          {loading ? '업로드 중...' : '수정 완료 및 월드컵 생성'}
        </button>
      </div>
      <table className='modify-section'>
        <thead>
          <tr>
            <td>순번</td>
            <td>이미지</td>
            <td>이미지 이름</td>
          </tr>
        </thead>
        <tbody>
          {inputData.slice(modifyPage * 4, modifyPage * 4 + 4).map((data, number) => (
            <tr key={number}>
              <td>{data.index + 1}</td>
              <td>
                <img src={data.imgSrc} alt='' />
              </td>
              <td>
                <input type='text' value={data.name} onChange={(event) => handleInputChange(data.index, event)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className='modify-paging'>
        {[...Array(inputData.length / 4)].map((_, index) => (
          <button key={index} onClick={() => setModifyPage(index)} className={modifyPage === index ? 'get-page' : ''}>
            {index + 1}
          </button>
        ))}
      </div>
      <AnimatePresence>
        {popUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={popUp ? { opacity: 1 } : { opacity: 0 }}
            exit={{ opacity: 0 }}
            className='worldcup-create-success-popup'
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
                월드컵이 생성되었습니다!
              </h2>
              <button onClick={createGameComplete}>월드컵 화면으로</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Step3Modify;
