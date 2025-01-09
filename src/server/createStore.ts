import { addDoc, collection } from 'firebase/firestore';
import { db } from './firebase';
import { SendData, WorldcupImage } from '../types/Worldcup';
/*--------------------------- Users -------------------------------*/
// 회원가입 데이터 DB저장. 테이블 이름 = users
export const getAuthenticInfo = (
  keyId: string,
  userId: string,
  userPw: string,
  userNickName: string,
  userImg: string,
) => {
  addDoc(collection(db, 'users'), {
    keyId: keyId,
    userId: userId,
    userPw: userPw,
    userNickName: userNickName,
    userImg: userImg,
    worldcupHistory: [], //월드컵 참여 기록
  });
};
/*--------------------------- Wolrdcup -------------------------------*/
// 월드컵 생성
export const getCreateWorldCup = async (argData: SendData) => {
  //현재시간
  const currentTime = Date.now();
  //addDoc
  await addDoc(collection(db, 'worldcup'), {
    userId: argData.userId,
    worldcupTitle: argData.worldcupTitle,
    worldcupDescription: argData.worldcupDescription,
    tournamentRange: argData.tournamentRange,
    category: argData.category,
    worldcupImages: argData.worldcupImages,
    createAt: currentTime,
    updateAt: currentTime,
    view: 0,
    thumbnail: [0, 1],
  });
};
/*--------------------------- Wolrcup Comment -------------------------------*/
//월드컵 댓글 작성
export const addWorldcupComment = async (gameId: string, userId: string, commentText: string) => {
  await addDoc(collection(db, 'worldcupComment'), {
    gameId: gameId,
    userId: userId,
    commentText: commentText,
    createAt: Date.now(),
  });
};
/*--------------------------- Community -------------------------------*/
//커뮤니티 글 작성
export const getCreateCommunity = async (
  gameId: string,
  userId: string,
  title: string,
  subTitle: string,
  first: WorldcupImage,
  second: WorldcupImage,
) => {
  //현재시간
  const currentTime = Date.now();
  //addDoc
  await addDoc(collection(db, 'community'), {
    gameId: gameId,
    userId: userId,
    communityTitle: title,
    communitySubTitle: subTitle,
    firstImg: first,
    secondImg: second,
    heart: [],
    createAt: currentTime,
    updateAt: currentTime,
  });
};
/*--------------------------- Community Comment -------------------------------*/
