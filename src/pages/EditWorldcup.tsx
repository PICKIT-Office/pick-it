import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DocumentData } from 'firebase/firestore';
import '../assets/MyPage/editWorldcup.scss';
import { AnimatePresence, motion } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import EditGameInfo from '../components/MyPage/EditWorldcup/EditGameInfo';
import { WorldcupImage } from '../types/Worldcup';
import { findSelectWorldcup } from '../server/readStore';
import { checkIsUpdateImage, updateImageRank, updateWorldcupImages, uploadWorldcupImages } from '../server/updateStore';
import { deleteMyWorldcup } from '../server/deleteStore';

function EditWorldcup() {
  // 동적 라우팅으로 전송받은 월드컵 아이디 값 조회
  const { id: gameId } = useParams();
  //네비게이션
  const navigate = useNavigate();
  //로컬스토리지에 존재하는 유저 데이터
  const user = localStorage.getItem('pickit-user');
  const parseUser = user ? JSON.parse(user) : null;
  // 해당 ID의 월드컵 전체정보를 불러오는 상태
  const [gameData, setGameData] = useState<{
    gameId: string;
    gameInfo: DocumentData;
  } | null>(null);
  //이미지 목록만 저장하는 상태
  const [inputData, setInputData] = useState<
    {
      fileIndex: number;
      filePath: string;
      fileName: string;
      previewImg: File | null;
    }[]
  >();
  //라운드 범위를 저장하는 상태
  const [range, setRange] = useState<number>();
  // 데이터 불러오기 로딩 동작
  const [isLoading, setIsLoading] = useState<boolean>(true);
  //이번트 핸들러 로딩 동작
  const [updateLoading, setUpdateLoding] = useState<boolean>(false);
  //필드 추가 및 삭제의 파일인덱스를 식별하기 위한 숫자 카운트 상태
  const [fieldCounter, setFieldCounter] = useState<number>(0);
  //유저 체크
  useEffect(() => {
    if (!user) {
      alert('로그인 후 이용 가능합니다.');
      navigate('/login');
    }
  }, [navigate, user]);
  //데이터 불러오기
  useEffect(() => {
    if (gameId) {
      findSelectWorldcup(gameId)
        .then((result) => {
          setGameData(result); //전체 데이터 저장
          setInputData(result?.gameInfo.worldcupImages); //이미지 목록 데이터만 저장
          setRange(result?.gameInfo.tournamentRange); //라운드 범위만 저장
        })
        .then(() => setIsLoading(false));
    }
  }, [gameId]);

  //이미지 목록 이름 텍스트 변경 온체인지 핸들러
  const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    if (inputData) {
      const newInputs = inputData.map((input) =>
        //체인지를 준 텍스트의 인덱스와 배열 인덱스가 동일한 데이터의 fileName업데이트
        input.fileIndex === index ? { ...input, fileName: event.target.value } : input,
      );
      setInputData(newInputs);
      setFieldCounter((prev) => prev + 1);
    }
  };

  //필드 삭제/추가 할 시 현재 남은 이미지 개수에 따라 라운드 범위 지정
  useEffect(() => {
    if (inputData) {
      const rounds = inputData.length;
      //   if (rounds > 32 && rounds <= 64) {
      //     setRange(64);
      //   }
      //   else if (rounds > 16 && rounds <= 32) {
      //     setRange(32);
      //   }
      if (rounds > 8 && rounds <= 16) {
        setRange(16);
      } else if (rounds <= 8) {
        setRange(8);
      } else {
        setRange(16);
      }
    }
  }, [inputData]);
  //필드 삭제 이벤트 핸들러
  const fieldDelete = async (index: number) => {
    if (inputData) {
      const updateData = [...inputData];
      updateData.splice(index, 1);
      setInputData(updateData);
    }
  };
  //필드 추가 클릭 이벤트
  const addField = () => {
    if (inputData && gameData) {
      const updateData = [...inputData];
      updateData.push({
        fileIndex: Date.now() + fieldCounter,
        filePath: 'none',
        fileName: '',
        previewImg: null,
      });
      setInputData(updateData);
    }
  };

  //이미지 변경 온체인지 이벤트 핸들러
  const setOnChangeFile = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    if (inputData) {
      const newInputs = inputData.map((input) => {
        //체인지를 준 파일의 인덱스와 배열 인덱스가 동일한 데이터의 프리뷰이미지 업데이트, 취소하면 null
        return input.fileIndex === index
          ? {
              ...input,
              previewImg: event.target.files ? event.target.files[0] : null,
            }
          : input;
      });
      setInputData(newInputs);
    }
  };

  //변경사항 저장하기 핸들러
  const updateSaveHandler = async () => {
    setUpdateLoding(true);
    if (gameData && inputData) {
      if (inputData.length === range) {
        const newSettingData = inputData.map((data) => {
          return {
            fileIndex: data.fileIndex,
            filePath: data.filePath === 'none' ? null : data.filePath,
            fileName: data.fileName,
            previewImg: data.previewImg ? data.previewImg : null,
          };
        });
        const isEmptyField = newSettingData.find((data) => data.filePath === null && data.previewImg === null);
        if (isEmptyField) {
          alert('비어있는 이미지가 존재합니다. 이미지를 업로드 해주세요.');
          setUpdateLoding(false);
          return;
        }
        //핸들러 이벤트 시작
        else {
          //1. 변경할 요소가 있는지 확인
          await checkIsUpdateImage(gameData.gameInfo.worldcupImages, newSettingData).then((willUpdate) =>
            //2. 변경할 요소가 없으면 리턴, 있으면 월드컵 스토리지 업로드 메소드 호출
            willUpdate
              ? uploadWorldcupImages(
                  parseUser.UserId,
                  newSettingData,
                  //3. 스토리지 업로드 후 변경된 배열을 통해 이미지 랭킹 변경 및 기존 이미지 스토리지에서 제거
                )
                  .then((sortData) => updateImageRank(gameData.gameId, sortData))
                  .then((sortData) =>
                    updateWorldcupImages(gameData.gameId, gameData.gameInfo.worldcupImages, sortData, range),
                  )
                  .then(() => navigate('/mypage'))
              : setUpdateLoding(false),
          );
        }
      } else {
        alert('이미지 개수와 라운드를 맞춰주세요.');
        setUpdateLoding(false);
        return;
      }
    }
  };
  //게임 정보 수정 팝업
  const [editPopup, setEditPopup] = useState<'edit' | 'delete' | null>(null);

  //월드컵 삭제 버튼 클릭
  const deleteWolrdcupHandler = async () => {
    setUpdateLoding(true);
    if (gameData) {
      await deleteMyWorldcup(gameData.gameId, gameData.gameInfo.worldcupImages).then(() => navigate('/mypage'));
    }
  };
  return !isLoading && gameData && inputData && range ? (
    gameData.gameInfo.userId === parseUser.UserId ? (
      <>
        <div className='edit-worldcup-container'>
          <section className='update-section'>
            <h1>
              월드컵 이미지 수정
              <button onClick={() => setEditPopup('delete')}>월드컵 삭제하기</button>
            </h1>
            <table>
              <thead>
                <tr>
                  <td>순번</td>
                  <td>이미지</td>
                  <td>이름</td>
                  <td>필드 삭제</td>
                </tr>
              </thead>
              <tbody>
                {inputData
                  .sort((indexA, indexB) => indexA.fileIndex - indexB.fileIndex)
                  .map((items, number) => (
                    <tr key={number}>
                      <td>{number + 1}</td>
                      <td>
                        <label>
                          <div className='img-wrapper'>
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
                            <img
                              src={
                                items.previewImg
                                  ? (URL.createObjectURL(items.previewImg) as string)
                                  : items.filePath === 'none'
                                  ? '/images/none.png'
                                  : items.filePath
                              }
                              alt=''
                            />
                          </div>

                          <input
                            type='file'
                            accept='image/*'
                            onChange={(event) => setOnChangeFile(items.fileIndex, event)}
                          />
                        </label>
                      </td>
                      <td>
                        <input
                          type='text'
                          value={items.fileName}
                          onChange={(event) => handleInputChange(items.fileIndex, event)}
                        />
                      </td>
                      <td>
                        <button onClick={() => fieldDelete(number)}>삭제</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <button
              className='add-field-button'
              onClick={() => {
                setFieldCounter((prev) => prev + 1);
                addField();
              }}
            >
              필드 추가
            </button>
          </section>
          <aside>
            <div className='wrapper'>
              <div className='info-name'>
                <h1 className='aside-title'>
                  게임 정보 수정
                  <button onClick={() => setEditPopup('edit')}>수정</button>
                </h1>
                <div className='thunbnail'>
                  <div>
                    <img
                      src={
                        gameData.gameInfo.worldcupImages.sort(
                          //파일인덱스 오름차순 정렬
                          (a: WorldcupImage, b: WorldcupImage) => a.fileIndex - b.fileIndex,
                        )[gameData.gameInfo.thumbnail[0]].filePath //썸네일 인덱스에 지정된 파일경로
                      }
                      alt=''
                    />
                    <img
                      src={
                        gameData.gameInfo.worldcupImages.sort(
                          //파일인덱스 오름차순 정렬
                          (a: WorldcupImage, b: WorldcupImage) => a.fileIndex - b.fileIndex,
                        )[gameData.gameInfo.thumbnail[1]].filePath //썸네일 인덱스에 지정된 파일경로
                      }
                      alt=''
                    />
                  </div>
                  <p>{gameData.gameInfo.worldcupTitle}</p>
                  <p className='desc'>{gameData.gameInfo.worldcupDescription}</p>
                </div>
                <div className='categories'>
                  {gameData.gameInfo.category.map((item: string, n: number) => (
                    <span key={n}>#{item}</span>
                  ))}
                </div>
              </div>
              <div className='update-check'>
                <h1>
                  {inputData.length} / {range}
                </h1>
                <h2>이미지 / 라운드</h2>
                <p>* 이미지 개수는 라운드와 동일해야 합니다.</p>
                <button onClick={() => updateSaveHandler()} disabled={updateLoading}>
                  {updateLoading ? '로딩중...' : '변경내용 저장하기'}
                </button>
              </div>
            </div>
          </aside>
        </div>
        <AnimatePresence>
          {editPopup !== null && (
            <motion.div
              className='edit-info-popup'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className='edit-popup-container'>
                <IoClose onClick={() => setEditPopup(null)} />
                {editPopup === 'edit' && <EditGameInfo gameData={gameData} />}
                {editPopup === 'delete' && (
                  <div className='delete-section'>
                    <h1>월드컵 삭제</h1>
                    <p>
                      월드컵을 삭제하시면 관련된 정보 및 댓글이 전부 삭제됩니다. <br />
                      <br />
                      월드컵을 삭제하시겠습니까?
                    </p>
                    <button onClick={deleteWolrdcupHandler}>
                      {' '}
                      {updateLoading ? '로딩중...' : '네. 삭제하겠습니다.'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    ) : (
      <div className='before-game-message'>
        <h2>잘못된 접근입니다.</h2>
      </div>
    )
  ) : (
    <div className='before-game-message'>
      <h2>데이터를 불러오는 중입니다...</h2>
      <div className='loading-spiner'>
        <hr />
        <div />
      </div>
    </div>
  );
}
export default EditWorldcup;
