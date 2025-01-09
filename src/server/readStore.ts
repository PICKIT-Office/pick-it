import {
  collection,
  doc,
  DocumentData,
  documentId,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { ICommiunity } from '../types/Community';
import { ICharts, INotice } from '../types/Banner';
import { MyWorldcupCommentType } from '../types/MyPage';
import { ImageRankData } from '../types/Worldcup';
//파이어베이스 DB연동
const authRef = collection(db, 'users');
const noticeRef = collection(db, 'notice');
const worldcupRef = collection(db, 'worldcup');
const searchRef = collection(db, 'searchWord');
const imageRankRef = collection(db, 'imageRank');
const worldcupCommentRef = collection(db, 'worldcupComment');
const communityRef = collection(db, 'community');
/*--------------------------- Dashboard -------------------------------*/
//인기 월드컵 순위 (상단 랭킹)
export const dashboardPopRank = async () => {
  //view내림차순
  const worldcupQuery = query(worldcupRef, orderBy('view', 'desc'), limit(20));
  //getDocs후 docs객체 할당
  const getData = await getDocs(worldcupQuery).then((res) => {
    return res.docs;
  });
  //클라이언트에 반환시킬 전체 결과값
  const results = getData.map((data) => {
    return { worldcupId: data.id, worldcupTitle: data.data()['worldcupTitle'] };
  });

  return results;
};
//인기 검색어 차트
export const dashboardPopSearch = async () => {
  //단일 문서 내 배열에 검색어를 전부 저장할 거기 때문에 문서 ID값을 직접 입력
  const searchQuery = query(searchRef, where(documentId(), '==', 'jHQEvoE65ejj42d6fBpZ'));
  //getDocs후 docs객체 할당
  const getData = await getDocs(searchQuery).then((res) => {
    return res.docs;
  });
  //클라이언트에 반환시킬 전체 결과값
  const results = getData.map((data) => {
    return data.data()['wordList'];
  });
  return results[0];
};
//인기 카테고리 차트
export const dashboardPopCategory = async () => {
  const searchQuery = query(worldcupRef);
  //getDocs후 docs객체 할당
  const getData = await getDocs(searchQuery).then((res) => {
    return res.docs;
  });
  //클라이언트에 반환시킬 전체 결과값
  const results = getData.map((data) => {
    return data.data()['category'];
  });

  //2중첩 배열이기 때문에 flat()메소드로 평탄화
  return results.flat();
};
//인기 카테고리 월드컵 (하단 슬라이드)
export const dashboardPopWolrdcup = async (categoryCountArray: ICharts[]) => {
  //전역 상태값인 카테고리 배열의 값이 채워지면
  if (categoryCountArray.length > 0) {
    const categoryLoop = categoryCountArray.map(async (data) => {
      //쿼리 - 배열에 해당 값을 찾을 때: array-contains
      const categoryQuery = query(worldcupRef, where('category', 'array-contains', data.name));
      //getDocs후 docs객체 할당
      const getData = await getDocs(categoryQuery).then((res) => {
        return res.docs;
      });
      //클라이언트에 반환시킬 전체 결과값
      const results = getData.map((doc) => {
        return { worldcupId: doc.id, worldcupInfo: doc.data() };
      });

      return results;
    });

    //비동기작업 완료될 때 까지 기다리고 결과값을 반환
    return Promise.all(categoryLoop).then((results) => {
      //반환할 결과값은 2중첩 배열이므로 flat
      const flatResult = results.flat();

      //flat을 한 후 해당 배열의 ID값 중복을 제거
      const uniqueNames = new Set();
      const filterList = flatResult.filter((item) => {
        if (uniqueNames.has(item.worldcupId)) {
          return false; // 중복된 이름이면 제외
        } else {
          uniqueNames.add(item.worldcupId); // 고유한 이름은 추가
          return true;
        }
      });
      //20개까지만 클라이언트에 전송
      return filterList.slice(0, 20);
    });
  } else {
    return null;
  }
};
/*--------------------------- Notice -------------------------------*/
//공지사항 불러오기
export const getNotice = async () => {
  //단일 문서 내 배열에 검색어를 전부 저장할 거기 때문에 문서 ID값을 직접 입력
  const noticeQuery = query(noticeRef);
  const getData = await getDocs(noticeQuery).then((data) => {
    return data.docs;
  });
  const results: INotice[] = getData.map((doc) => {
    return {
      noticeId: doc.id,
      noticeTitle: doc.data()['noticeTitle'],
      noticeDescription: doc.data()['noticeDescription'],
      createAt: doc.data()['createAt'],
    };
  });

  return results;
};

/*--------------------------- Users -------------------------------*/
// users 문서ID 조회
export const getUserDocumentId = async (userId: string) => {
  const findRef = query(authRef, where('userId', '==', userId));
  const findIdDocs = await getDocs(findRef).then((docRes) => {
    return docRes.docs;
  });
  const userDocId = findIdDocs.map((doc) => {
    return doc.id;
  });
  return userDocId[0];
};
//사용자 프로필이미지, 닉네임 조회
export const getUserData = async (userid: string) => {
  // 사용자 컬렉션에 매개변수로 넘겨받은 userid값을 문서 필드값 userId와 비교하여 사용자 조회
  const findRef = query(authRef, where('userId', '==', userid));
  const findIdDocs = await getDocs(findRef);
  const profileImgUrl: any = [];

  if (!findIdDocs.empty) {
    findIdDocs.forEach((doc) => {
      const profileImg = doc.data()['userImg'];
      const nickName = doc.data()['userNickName'];
      profileImgUrl.push(profileImg, nickName);
    });
    return profileImgUrl;
  }
};
//닉네임 중복확인
export const nickNameCheck = async (nickName: string) => {
  const nickNameQuery = query(authRef, where('userNickName', '==', nickName));
  const result = await getDocs(nickNameQuery);
  //중복되지 않으면 닉네임을 반환
  return result.empty ? nickName : 'already-exist';
};

//아이디 중복확인
export const userIdCheck = async (userId: string) => {
  const userIdQuery = query(authRef, where('userId', '==', userId));
  const result = await getDocs(userIdQuery);

  //중복되지 않으면 ID를 반환
  return result.empty ? userId : 'already-exist';
};

// 비밀번호 찾기
export const findPassword = async (userId: string) => {
  const userIdQuery = query(authRef, where('userId', '==', userId));
  const result = await getDocs(userIdQuery);

  return result.empty ? 'empty' : String(result.docs[0].data()['userPw']);
};

//유저 ID를 통해 해당 문서를 불러오는 쿼리
export const getFindUserDocs = async (userId: string) => {
  //users테이블의 유저ID 조회
  const findRef = query(authRef, where('userId', '==', userId));
  //docs값 할당
  const findIdDocs = await getDocs(findRef).then((docRes) => {
    return docRes.docs;
  });
  //promise반환이 완료된 후 최종 반환
  return Promise.all(findIdDocs);
};
/*--------------------------- Wolrdcup -------------------------------*/
//월드컵 리스트 불러오기(최신순)
export const getWorldCupList = async (
  filter: 'pop' | 'new',
  keyword: string | null,
  searchOption: '키워드' | '카테고리',
  {
    pageParam,
  }: {
    pageParam: number;
  },
): Promise<{
  data: ({
    worldcupId: string;
    worldcupInfo: DocumentData;
  } | null)[];
  currentPage: number;
  nextPage: number | null;
}> => {
  const LIMIT = 8; //클라이언트에 불러올 배열 개수

  //filter에 따라 view내림차순 혹은 최신순 정렬
  const worldcupQuery = query(worldcupRef, orderBy(filter === 'new' ? 'createAt' : 'view', 'desc'));

  //getDocs후 docs객체 할당
  const getData = await getDocs(worldcupQuery).then((res) => {
    return res.docs;
  });
  //클라이언트에 반환시킬 전체 결과값
  const results = getData.map((data) => {
    return { worldcupId: data.id, worldcupInfo: data.data() };
  });

  //검색을 했을 경우의 클라이언트 반환 전체 결과값
  const keywordResults = results
    .map((result) => {
      //검색어를 찾을 대상 = 제목, 설명, 카테고리 (모두 영문소문자로 변환시켜 대소문자 구분 없게)
      const searchFor = {
        title: result.worldcupInfo.worldcupTitle,
        description: result.worldcupInfo.worldcupDescription,
        category: result.worldcupInfo.category,
      };
      //검색 필터가 키워드일 경우
      if (searchOption === '키워드') {
        //각각의 대상을 includes메소드를 사용하여 탐색
        if (keyword && searchFor.title.toLowerCase().includes(keyword.toLowerCase())) {
          return {
            worldcupId: result.worldcupId,
            worldcupInfo: result.worldcupInfo,
          };
        } else if (keyword && searchFor.description.toLowerCase().includes(keyword.toLowerCase())) {
          return {
            worldcupId: result.worldcupId,
            worldcupInfo: result.worldcupInfo,
          };
        } else {
          return null;
        }
        //검색 필터가 카테고리일 경우
      } else {
        if (keyword && searchFor.category.find((text: string) => text.toLowerCase().includes(keyword.toLowerCase()))) {
          return {
            worldcupId: result.worldcupId,
            worldcupInfo: result.worldcupInfo,
          };
        } else {
          return null;
        }
      }
    })
    .filter((result) => result !== null);

  //1초의 지연시간을 적용하고 promise값으로 리턴
  return new Promise((resolve) => {
    setTimeout(() => {
      //1. 검색을 하지 않은 기본 페이지 = 전체 데이터
      if (!keyword) {
        resolve({
          data: results.slice(pageParam, pageParam + LIMIT),
          currentPage: pageParam,
          nextPage: pageParam + LIMIT < results.length ? pageParam + LIMIT : null,
        });
      }
      //2. 검색된 결과가 있을 경우
      else if (keywordResults.length > 0) {
        resolve({
          data: keywordResults.slice(pageParam, pageParam + LIMIT),
          currentPage: pageParam,
          nextPage: pageParam + LIMIT < keywordResults.length ? pageParam + LIMIT : null,
        });
      }
      //3. 검색을 했으나 결과가 없을 경우
      else {
        resolve({
          data: [null],
          currentPage: 0,
          nextPage: null,
        });
      }
    }, 200);
  });
};
//내 월드컵, 참여 월드컵 불러오기
export const getMyPlayAmount = async (userId: string) => {
  //내 월드컵 불러오는 쿼리
  const findWorldcupQuery = query(collection(db, 'worldcup'), where('userId', '==', userId));
  // 내 ID가 포함된 이미지 랭킹 불러오기
  const findplayedQuery = query(
    collection(db, 'imageRank'),
    where('userId', 'array-contains', userId), // 배열 컬럼의 where문은 array-contains로 검색할 수 있음
  );

  //내 월드컵 할당
  const myWorldcupAmount = await getDocs(findWorldcupQuery).then((result) => {
    return result.docs.map((data) => {
      return {
        gameId: data.id,
        gameInfo: data.data(),
      };
    });
  });
  // 참여 월드컵 할당
  const playedAmount = await getDocs(findplayedQuery).then((result) => {
    return (
      result.docs
        .map((data) => {
          //map함수를 사용하여 월드컵 ID값만 배열에 저장
          return String(data.data().gameId);
        })
        //filter를 사용하여 배열 내 중복된 월드컵 ID값을 제거
        .filter((value, index, self) => self.indexOf(value) === index)
    );
  });
  return {
    myWorldcup: myWorldcupAmount,
    playedWorldcup: playedAmount,
  };
};
// 내가 참여한 월드컵 ID를 통해 월드컵의 전체 정보 가져오기
export const getPlayedWorldcup = (worldcupId: string[]) => {
  //참여한 월드컵 ID배열 map
  const worldcupArray = worldcupId.map(async (id) => {
    const findWorldcupQuery = query(collection(db, 'worldcup'), where(documentId(), '==', id));
    const worldcupDocs = await getDocs(findWorldcupQuery);

    if (worldcupDocs.empty) {
      return null;
    } else {
      const resultArray = worldcupDocs.docs.map((res2) => {
        return {
          gameId: res2.id,
          gameInfo: res2.data(),
        };
      });
      //데이터는 하나지면 배열 형태로 불러오기 때문애 [0]만 반환
      return resultArray[0];
    }
  });
  //Promise.all()을 사용하여 map배열 내에 있는 모든 promise반환이 완료된 값을 최종 리턴
  return Promise.all(worldcupArray);
};
//유저별 월드컵 참여 기록 가져오기
export const getUserWorldcupHistory = async (userId: string) => {
  //유저 데이터 docs가져오기
  const findIdDocs = await getFindUserDocs(userId);
  //월드컴 참여 기록 배열 컬럼만 추출
  const myWorldcupHisory = findIdDocs.map((doc) => {
    return doc.data()['worldcupHistory'];
  });

  return myWorldcupHisory[0];
};
/*--------------------------- Play Game -------------------------------*/
// 게임화면: 선택 월드컵 데이터 불러오기
export const findSelectWorldcup = async (id: string) => {
  const currentWorldcupRef = doc(worldcupRef, id);
  const findWorldcupData = await getDoc(currentWorldcupRef);
  if (findWorldcupData.exists()) {
    return {
      gameId: id,
      gameInfo: findWorldcupData.data(),
    };
  } else {
    return null;
  }
};
/*--------------------------- ImageRank -------------------------------*/
//이미지 랭킹 데이터 불러오기
export const getImageRankList = async (gameID: string): Promise<ImageRankData[] | null> => {
  //쿼리
  const rankFindQuery = query(imageRankRef, where('gameId', '==', gameID), orderBy('updateAt', 'desc'));
  const imageRankDocs = await getDocs(rankFindQuery);
  //잘못된 파라미터 주소나 월드컵 랭킹이 아예 없는 경우
  if (imageRankDocs.empty) {
    return null;
  } else {
    const result = imageRankDocs.docs.map((data) => {
      return {
        fileName: data.data().fileName,
        filePath: data.data().filePath,
        userId: data.data().userId,
        winRate: data.data().winRate,
        updateAt: data.data().updateAt,
      };
    });
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(result);
      }, 700);
    });
  }
};
/*--------------------------- Wolrcup Comment -------------------------------*/
//월드컵 댓글 불러오기
export const getWorldcupCommentList = async (gameId: string) => {
  //댓글 쿼리
  const commentQuery = query(worldcupCommentRef, where('gameId', '==', gameId));
  //getDocs후 docs객체 할당
  const getData = await getDocs(commentQuery).then((res) => {
    return res.docs;
  });

  const resultData = getData.map((doc) => {
    return {
      commentId: doc.id,
      userId: doc.data()['userId'],
      commentText: doc.data()['commentText'],
      createAt: doc.data()['createAt'],
    };
  });
  return resultData;
};

//댓글 목록의 유저 ID값을 통해 닉네임 및 이미지 불러오기
export const getCommentUser = async (
  commentData: {
    commentId: string;
    userId: string;
    commentText: string;
    createAt: number;
  }[],
) => {
  const commentUserInfo = commentData.map(async (data) => {
    // 사용자 컬렉션에 매개변수로 넘겨받은 userid값을 문서 필드값 userId와 비교하여 사용자 조회
    const findRef = query(authRef, where('userId', '==', data.userId));
    const findIdDocs = await getDocs(findRef);
    if (findIdDocs.empty) {
      return {
        userId: '',
        nickName: '',
        profileImg: '',
      };
    } else {
      //유저 ID와 일치한 유저테이블 탐색
      const isExistUser = findIdDocs.docs.find((doc) => doc.data()['userId'] === data.userId);
      if (isExistUser) {
        return {
          userId: data.userId,
          nickName: isExistUser.data()['userNickName'],
          profileImg: isExistUser.data()['userImg'],
        };
      } else {
        return {
          userId: '',
          nickName: '',
          profileImg: '',
        };
      }
    }
  });

  return Promise.all(commentUserInfo);
};
//내 월드컵 댓글 불러오기
export const getMyWorldcupComment = async (userId: string): Promise<MyWorldcupCommentType[]> => {
  //댓글 쿼리
  const commentQuery = query(worldcupCommentRef, where('userId', '==', userId));
  //getDocs후 docs객체 할당
  const getData = await getDocs(commentQuery).then((res) => {
    return res.docs;
  });

  const resultData = getData.map((doc) => {
    return {
      commentId: doc.id,
      gameId: doc.data()['gameId'],
      userId: doc.data()['userId'],
      commentText: doc.data()['commentText'],
      createAt: doc.data()['createAt'],
    };
  });
  return resultData.sort((a, b) => b.createAt - a.createAt);
};
//내 월드컵 댓글의 월드컵 정보 불러오기
export const getMyWorldcupCommentWorldcup = async (commentData: MyWorldcupCommentType[]) => {
  const commentWolrdcupInfo = commentData.map(async (data) => {
    // 문서 필드값 gameId 비교하여 월드컵 조회
    const findRef = query(worldcupRef, where(documentId(), '==', data.gameId));
    const findIdDocs = await getDocs(findRef);
    const findData = findIdDocs.docs.find((doc) => doc.id === data.gameId);
    if (findData) {
      return {
        gameId: findData.id,
        gameInfo: findData.data(),
      };
    } else {
      return null;
    }
  });

  return Promise.all(commentWolrdcupInfo);
};
/*--------------------------- Community -------------------------------*/
//커뮤니티 리스트 불러오기
export const getCommunityList = async ({ pageParam }: { pageParam: number }) => {
  const LIMIT = 1;
  //최신순 정렬 쿼리
  const communityQuery = query(communityRef, orderBy('createAt', 'desc'));
  //getDocs후 docs객체 할당
  const getData = await getDocs(communityQuery).then((res) => {
    return res.docs;
  });
  //클라이언트에 반환시킬 전체 결과값
  const results = getData.map(async (data) => {
    //유저ID값을 인자로 프로필 이미지와 닉네임을 반환하는 비동기 함수 호출
    const [userProfile, userName] = await getUserData(data.data()['userId']);
    return {
      communityId: data.id,
      gameId: data.data()['gameId'],
      userId: data.data()['userId'],
      userProfile: userProfile,
      userName: userName,
      communityTitle: data.data()['communityTitle'],
      communitySubTitle: data.data()['communitySubTitle'],
      firstImg: data.data()['firstImg'],
      secondImg: data.data()['secondImg'],
      heart: data.data()['heart'],
      createAt: data.data()['createAt'],
      updateAt: data.data()['updateAt'],
    };
  });
  const setResults: ICommiunity[] = await Promise.all(results);

  return {
    data: setResults.slice(pageParam, pageParam + LIMIT),
    currentPage: pageParam,
    nextPage: pageParam + LIMIT < setResults.length ? pageParam + LIMIT : null,
  };
};
/*--------------------------- Community Comment -------------------------------*/
