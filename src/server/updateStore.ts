import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { getFindUserDocs, getUserDocumentId } from './readStore';
import { deleteProfileImg, deleteRemainImg } from './deleteStorage';
import { getAuth, updatePassword } from 'firebase/auth';
import { UpdateWorldcupImages, WorldcupImage } from '../types/Worldcup';
import { uploadNewWorldcupImages } from './uploadStorage';
import { userReAuthtication } from './authentication';
//auth 세션불러오기
const auth = getAuth();
//파이어베이스 DB연동
const imageRankRef = collection(db, 'imageRank');
/*--------------------------- Search -------------------------------*/
//검색어 입력하면 DB에 추가
export const addSearchWordList = async (text: string) => {
  //단일 문서 내 배열에 검색어를 전부 저장할 거기 때문에 문서 ID값을 직접 입력
  const wordRef = doc(db, 'searchWord', 'jHQEvoE65ejj42d6fBpZ');
  await updateDoc(wordRef, {
    //firebase 배열 push:
    wordList: arrayUnion(text + `_${Date.now()}`),
  });
};
/*--------------------------- Users -------------------------------*/
//프로필 이미지 변경
export const setMyProfileImage = async (userId: string, imgPath: string) => {
  //유저 데이터 docs가져오기
  const findIdDocs = await getFindUserDocs(userId);
  //해당 유저 데이터의 문서 전체 불러오기
  const findUser = findIdDocs.find((data) => data.data()['userId'] === userId);
  if (findUser) {
    //기존 프로필 이미지 스토리지에 제거
    await deleteProfileImg(findUser.data()['userImg']);
    //업데이트 쿼리
    const userRef = doc(db, 'users', findUser.id); //문서 ID
    await updateDoc(userRef, {
      userImg: imgPath === 'default' ? 'default' : imgPath,
    });
  }
};
// 닉네임 변경
export const setMyNickName = async (userId: string, nickName: string) => {
  if (nickName === 'already-exist') {
    return 'fail';
  } else {
    //유저 데이터 docs가져오기
    const findIdDocs = await getFindUserDocs(userId);
    //해당 유저 데이터의 문서 전체 불러오기
    const findUser = findIdDocs.find((data) => data.data()['userId'] === userId);
    if (findUser) {
      //업데이트 쿼리
      const userRef = doc(db, 'users', findUser.id); //문서 ID
      await updateDoc(userRef, {
        userNickName: nickName,
      });
    }
    return 'success';
  }
};
//비밀번호 변경
export const setMyPassword = async (
  argData: {
    currentPw: string;
    userId: string;
    changePw?: string;
  },
  editType: '비밀번호변경' | '회원탈퇴',
) => {
  //유저 데이터 docs가져오기
  const findIdDocs = await getFindUserDocs(argData.userId);
  //해당 유저 데이터의 비밀번호와 현재 비밀번호 입력이 일치하는지
  const findPassword = findIdDocs.find((data) => data.data()['userPw'] === argData.currentPw);
  //비밀번호가 일치하면
  if (findPassword) {
    //현재 접속 중인 유저 로그인 정보
    const me = auth.currentUser;
    if (me) {
      //firebase 어센틱의 업데이트를 위해선 사용자 재인증 필요
      const reAutentic = await userReAuthtication(me, `${argData.userId}@pick.it`, argData.currentPw);
      //재인증이 성공되었다면
      if (reAutentic) {
        //비밀번호 변경
        if (editType === '비밀번호변경' && argData.changePw) {
          const userRef = doc(db, 'users', findPassword.id); //문서 ID
          //firebase updatePassword매소드
          await updatePassword(me, argData.changePw);
          //firestore 유저 테이블 업데이트
          await updateDoc(userRef, {
            userPw: argData.changePw,
          });
        }
        return true;
      }
      //재인증 실패
      else {
        return false;
      }
    }
    //접속 중인 유저 정보가 없다면
    else {
      return false;
    }
  }
  //비밀번호가 일치하지 않으면
  else {
    alert('현재 비밀번호가 일치하지 않습니다.');
    return false;
  }
};
/*--------------------------- Wolrdcup -------------------------------*/
//월드컵 수정 1(이미지 배열의 수정 요소가 있는지 확인)
export const checkIsUpdateImage = async (currentData: WorldcupImage[], newData: UpdateWorldcupImages[]) => {
  console.log('1. 수정요소 확인');
  //배열 요소를 올바르게 정렬
  const sortCurrentData = currentData.map((currentItem) => {
    return {
      fileIndex: currentItem.fileIndex,
      fileName: currentItem.fileName,
      filePath: currentItem.filePath,
      previewImg: 'empty', //기본 이미지 데이터는 없는 값
    };
  });
  const sortNewData = newData.map((newItem) => {
    return {
      fileIndex: newItem.fileIndex,
      fileName: newItem.fileName,
      filePath: newItem.filePath,
      previewImg: newItem.previewImg ? 'exist' : 'empty', //수정할 이미지 요소의 유무
    };
  });

  //두 배열을 문자열 형태로 바꾸고 비교연산자 사용하여 수정 유무 확인
  if (JSON.stringify(sortCurrentData) === JSON.stringify(sortNewData)) {
    alert('수정할 요소가 없습니다.');
    return false;
  } else {
    return true;
  }
};
//월드컵 수정 2(수정 이미지 스토리지 업로드 후 변경된 배열을 반환)
export const uploadWorldcupImages = async (userId: string, newData: UpdateWorldcupImages[]) => {
  console.log('2. 수정이미지 스토리지 업로드');
  //현재 시간을 표시하는 폴더 안에 업로드
  const currenTime = Date.now();
  // 비동기 배열을 반환하고 Promise.all로 비동기 동작이 전부 완료된 값을 할당한다
  const sortData = await Promise.all(
    newData.map(async (newItem) => {
      const getUploadStorage = await uploadNewWorldcupImages(userId, newItem.previewImg, currenTime);
      return {
        fileIndex: newItem.fileIndex,
        fileName: newItem.fileName,
        filePath: getUploadStorage ? getUploadStorage : newItem.filePath,
      };
    }),
  );

  return sortData;
};
//월드컵 이미지 수정. 변경된 데이터 덮어쓰기
export const updateWorldcupImages = async (
  gameId: string,
  currentData: WorldcupImage[],
  newData: {
    fileIndex: number;
    fileName: string;
    filePath: string | null;
  }[],
  range: number,
) => {
  console.log('4. 월드컵 이미지 데이터 덮어쓰기');
  //파일인덱스 내림차순으로 재정렬
  const setCurrentData = currentData
    .map((data) => {
      return {
        fileIndex: data.fileIndex,
        fileName: data.fileName,
        filePath: data.filePath,
      };
    })
    .sort((a, b) => b.fileIndex - a.fileIndex);
  const setNewData = newData.sort((a, b) => b.fileIndex - a.fileIndex);

  //반복문 사용하여 기존 이미지와 새로 덮을 이미지의 주소가 같은 값의 인덱스를 추출
  const findSameArray = setNewData
    .map((newItem) => {
      //find메소드를 사용하여 같은 값은 값의 인덱스를 찾음
      const isRemainImage = setCurrentData.find((currentItem) => currentItem.filePath === newItem.filePath);
      //파일 인덱스값 반환
      return isRemainImage?.fileIndex;
      //undefined로 반환된 값은 제거
    })
    .filter((item) => item !== undefined);

  //기존 데이터를 map하여 방금 추출한 인덱스값과 비교. 같은 값이 있는 루프는 null을 반환하고, 다른 값(변경되어 더미가 된 이미지)은 반환
  const willDeleteArray = setCurrentData
    .map((data) => {
      if (findSameArray.length > 0) {
        const sameData = findSameArray.find((index) => index === data.fileIndex);
        return sameData ? null : data.filePath;
      } else {
        return null;
      }
    })
    .filter((item) => item !== null);

  //최종적으로 삭제할 이미지들을 스토리지 삭제 함수에 전달
  await deleteRemainImg(willDeleteArray);

  //월드컵 이미지 배열 새로 덮어쓰기
  await updateDoc(doc(db, 'worldcup', gameId), {
    worldcupImages: newData,
    tournamentRange: range,
    thumbnail: [0, 1],
  });
};
//월드컵 기본 정보 수정
export const editWorldcupInformation = async (argData: {
  gameId: string;
  title: string;
  description: string;
  category: string[];
  thumbnail: number[];
}) => {
  //업데이트 쿼리
  const worldcupRef = doc(db, 'worldcup', argData.gameId); //문서 ID
  await updateDoc(worldcupRef, {
    worldcupTitle: argData.title,
    worldcupDescription: argData.description,
    category: argData.category,
    thumbnail: argData.thumbnail,
  });
};
/*--------------------------- ImageRank -------------------------------*/
//단일 월드컵에 대한 이미지 랭킹. 각 이미지의 우승 횟수를 업데이트
export const getCreateRankAndUpdateView = async (payloadData: {
  gameId: string;
  userId: string | null;
  fileIndex: number;
  fileName: string;
  filePath: string;
}) => {
  //해당 게임 아이디를 가진 데이터 업데이트
  const updateRef = doc(db, 'worldcup', payloadData.gameId);
  //단일 이미지 랭킹 존재 여부를 확인
  const rankFindQuery = query(
    imageRankRef,
    where('findKey', '==', payloadData.gameId + '-' + String(payloadData.fileIndex)), //아이디와 파일인덱스 식별키가 동일한 데이터 추출
  );
  const imageRankFinder = await getDocs(rankFindQuery);
  //해당 아이디를 가진 데이터가 존재하지 않으면 addDoc, 존재하면 updateDoc
  if (imageRankFinder.empty) {
    await addDoc(collection(db, 'imageRank'), {
      findKey: payloadData.gameId + '-' + String(payloadData.fileIndex), //아이디와 파일인덱스 식별
      gameId: payloadData.gameId,
      userId: payloadData.userId ? [payloadData.userId] : '', //비회원일경우 비어있는값
      fileIndex: payloadData.fileIndex,
      fileName: payloadData.fileName,
      filePath: payloadData.filePath,
      winRate: 1,
      updateAt: Date.now(),
    });
  } else {
    //이미지 랭킹 데이터의 ID값 불러오기
    const findId = imageRankFinder.docs.find(
      (data) => data.data().findKey === payloadData.gameId + '-' + String(payloadData.fileIndex),
    )?.id;
    //undefined가 아니면
    if (findId) {
      const updateImageRankRef = doc(db, 'imageRank', findId);
      //이미지 랭킹 우승 횟수 업데이트
      await updateDoc(updateImageRankRef, {
        //비회원일경우 비어있는값. (arrayUnion은 기존 배열에 새로 추가. 배열 내에 동일한 id가 있다면 추가되지 않음)
        userId: arrayUnion(payloadData.userId ? payloadData.userId : ''),
        winRate: increment(1), //우승 횟수 1 증가
        updateAt: Date.now(),
      });
    }
  }
  //로그인 중일 경우 해당 회원의 월드컵 참여 기록 업데이트
  if (payloadData.userId) {
    //firebaseAuth.ts 함수: 해당 유저의 문서 ID를 불러옴
    const myDocId = await getUserDocumentId(payloadData.userId);
    //해당 문서 ID를 가진 테이블 매칭 후 업데이트
    const authRef = doc(db, 'users', myDocId);
    await updateDoc(authRef, {
      //worldcupHistory배열 컬럼 추가. { 게임아이디, 참여일 }
      worldcupHistory: arrayUnion({
        gameId: payloadData.gameId,
        playedAt: Date.now(),
      }),
    });
  }
  //조회 수 업데이트
  await updateDoc(updateRef, {
    view: increment(1), //조회수 1 증가
  });
};

//월드컵 수정에 따른 이미지 랭킹 업데이트
export const updateImageRank = async (
  gamdId: string,
  argData: {
    fileIndex: number;
    fileName: string;
    filePath: string | null;
  }[],
) => {
  console.log('3. 이미지 랭킹 업데이트');
  //반복문 시작
  argData.forEach(async (data) => {
    //이미지 랭킹 불러오는 쿼리 -> 검색키 == 월드컵아이디 + 인덱스
    const imgRankQuery = query(collection(db, 'imageRank'), where('findKey', '==', `${gamdId}-${data.fileIndex}`));
    //getDocs
    const isImgRankExist = await getDocs(imgRankQuery);
    // 존재하지 않으면 아무 동작없음 && filepath가 null타입이 있기 때문에 필터링
    if (!isImgRankExist.empty && data.filePath) {
      //문서 ID를 불러오기 위한 find
      const findImgRank = isImgRankExist.docs.find((doc) => doc.data()['findKey'] === `${gamdId}-${data.fileIndex}`);
      if (findImgRank) {
        const imgRankRef = doc(db, 'imageRank', findImgRank.id); //문서 ID
        //이미지의 이름을 변경하지 않았으면 이미지 경로만 수정
        if (findImgRank.data()['fileName'] === data.fileName) {
          await updateDoc(imgRankRef, {
            filePath: data.filePath,
          });
          //이미지의 이름을 변경했으면 해당 월드컵이미지 랭킹 기록은 삭제
        } else {
          await deleteDoc(imgRankRef);
        }
      }
    }
  });
  return argData;
};
/*--------------------------- Community -------------------------------*/
//커뮤니티 좋아요 클릭
export const getHeartClick = async (userId: string, communityId: string, isExist: boolean) => {
  //커뮤니티ID로 데이터 찾기
  const updateHeartRef = doc(db, 'community', communityId);

  //arrayUnion으로 중복된 값은 추가되지 않게 배열 업데이트
  //arrayRemove으로 해당 userId를 배열에 제거
  await updateDoc(updateHeartRef, {
    heart: isExist ? arrayRemove(userId) : arrayUnion(userId),
  });
};
/*--------------------------- Community Comment -------------------------------*/
