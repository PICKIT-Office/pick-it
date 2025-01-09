import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import {
  browserLocalPersistence,
  deleteUser,
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
  setPersistence,
  signInWithEmailAndPassword,
  User,
} from 'firebase/auth';
import { deleteProfileImg } from './deleteStorage';

//auth 세션불러오기
const auth = getAuth();
//파이어베이스 DB연동
const authRef = collection(db, 'users');

// 파이어베이스 로그인
export const signInPickit = async (userId: string, userPw: string) => {
  await setPersistence(auth, browserLocalPersistence) //로그인 정보들을 브라우저 로컬에 등록
    .then(() => {
      return signInWithEmailAndPassword(auth, userId, userPw);
    });
};

// 계정 삭제(회원탈퇴)
export const deleteMyProfile = async (userId: string) => {
  //현재 접속중인 계정 정보
  const me = auth.currentUser;
  //users테이블의 유저ID 조회
  const findRef = query(authRef, where('userId', '==', userId));
  //docs의 유저 데이터 추출하기
  const getProfile = await getDocs(findRef).then((docRes) => {
    return docRes.docs.find((data) => data.data()['userId'] === userId);
  });

  if (getProfile) {
    //프로필 이미지 삭제
    await deleteProfileImg(getProfile.data()['userImg']);
    //firestore 유저 정보 삭제
    await deleteDoc(doc(db, 'users', getProfile.id)).then(
      () => me && deleteUser(me), //-> firebase Authentic 유저 정보 삭제
    );
  }
};

//사용자 재인증 메소드 (firebase는 사용자가 오래 전에 로그인하면 유저 데이터 업데이트 안 됨)
export const userReAuthtication = async (user: User, email: string, password: string) => {
  //이메일 로그인 방식이기 때문에 EmailAuthProvider 사용
  const authCredential = EmailAuthProvider.credential(email, password);
  //reauthenticateWithCredential: 사용자 재인증 메소드
  const isAuthticSuccess = await reauthenticateWithCredential(user, authCredential)
    .then(() => {
      return true;
    })
    .catch(() => {
      return false;
    });

  return isAuthticSuccess;
};
