import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './firebase';
import { v4 as uuid } from 'uuid';

//프로필 이미지 파일 스토리지 업로드 함수
export const uploadProfile = async (userId: string, profileImg?: File) => {
  if (profileImg) {
    const imageRef = ref(
      //이미지 파일이름: 유저ID + 랜덤조합텍스트 + 파일이름
      storage,
      `profile-img/${userId + uuid() + profileImg.name}`,
    );
    const imgSnap = await uploadBytes(imageRef, profileImg); //파이어 스토리지에 이미지 업로드
    const imgpath = await getDownloadURL(imgSnap.ref); //생성된 이미지 파일 링크를 변수에 저장

    return imgpath;
  } else {
    //프로필 이미지가 없을 경우(default)
    return 'default';
  }
};

//월드컵 이미지 수정 파일 스토리지 업로드 함수
export const uploadNewWorldcupImages = async (userId: string, profileImg: File | null, date: number) => {
  if (profileImg) {
    const imageRef = ref(
      //이미지 파일이름: 유저ID / 현재날짜밀리초 /랜덤조합텍스트 + 파일이름
      storage,
      `worldcup-images/${userId}/${date}/${uuid() + profileImg.name}`,
    );
    const imgSnap = await uploadBytes(imageRef, profileImg); //파이어 스토리지에 이미지 업로드
    const imgpath = await getDownloadURL(imgSnap.ref); //생성된 이미지 파일 링크를 변수에 저장

    return imgpath;
  } else {
    return null;
  }
};
