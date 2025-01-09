import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { WorldcupImage } from '../types/Worldcup';
import { deleteWorldcupImg } from './deleteStorage';
/*--------------------------- Users -------------------------------*/
/*--------------------------- Wolrdcup -------------------------------*/
//회원 탈퇴로 인한 월드컵 삭제
export const deleteWorldcup = async (userId: string) => {
  //내 월드컵 불러오는 쿼리
  const findWorldcupQuery = query(collection(db, 'worldcup'), where('userId', '==', userId));
  //유저가 작성한 월드컵들의 ID, 이미지배열 추출
  const findWorldcupId = await getDocs(findWorldcupQuery).then((res) => {
    return res.docs.map((res2) => {
      return {
        docId: res2.id,
        worldcupImages: res2.data()['worldcupImages'],
      };
    });
  });

  //추출된 데이터를 가진 월드컵 삭제
  findWorldcupId.forEach(async (worldcupData: { docId: string; worldcupImages: WorldcupImage[] }) => {
    await deleteWorldcupImg(worldcupData.worldcupImages); //해당 월드컵 데이터에 있는 스토리지 이미지들 삭제
    await deleteImageRank(worldcupData.docId); //월드컵의 이미지 랭킹 데이터 삭제
    await deleteDoc(doc(db, 'worldcup', worldcupData.docId)); //월드컵 삭제
  });
};
//월드컵 수정페이지 월드컵 삭제
export const deleteMyWorldcup = async (gameId: string, imgArray: WorldcupImage[]) => {
  //이미지 랭킹 불러오는 쿼리
  const imgRankQuery = query(collection(db, 'imageRank'), where('gameId', '==', gameId));
  //1. 이미지 랭킹 삭제
  const findImgRank = await getDocs(imgRankQuery);
  if (!findImgRank.empty) {
    findImgRank.docs.forEach(async (data) => {
      const imgRankRef = doc(db, 'imageRank', data.id); //이미지랭킹 DB
      await deleteDoc(imgRankRef); //데이터베이스 삭제
    });
  }
  //2. 월드컵 삭제
  const worldcupRef = doc(db, 'worldcup', gameId); //월드컵 DB
  await deleteDoc(worldcupRef); //데이터베이스 삭제
  //3. 이미지 스토리지 삭제
  await deleteWorldcupImg(imgArray); //스토리지 삭제
};
/*--------------------------- ImageRank -------------------------------*/
//월드컵의 모든 이미지 랭킹 데이터 삭제
export const deleteImageRank = async (gamdId: string) => {
  //해당 월드컵의 이미지 랭킹 조회 쿼리
  const findImgRankQuery = query(collection(db, 'imageRank'), where('gamdId', '==', gamdId));
  //이미지 랭킹 배열을 루프시켜 데이터 삭제
  await getDocs(findImgRankQuery).then((res) => {
    res.docs.forEach((data) => {
      deleteDoc(doc(db, 'imageRank', data.id));
    });
  });
};
/*--------------------------- Wolrcup Comment -------------------------------*/
//월드컵 댓글 삭제
export const deleteWorldcupComment = async (commentId: string) => {
  const commentRef = doc(db, 'worldcupComment', commentId);
  await deleteDoc(commentRef);
};
/*--------------------------- Community -------------------------------*/
/*--------------------------- Community Comment -------------------------------*/
