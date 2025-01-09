import React, { useEffect, useRef, useState } from 'react';
import { compareTime } from '../../Utils/compareTime';
import { getCommentUser, getWorldcupCommentList } from '../../server/readStore';
import { addWorldcupComment } from '../../server/createStore';
import { deleteWorldcupComment } from '../../server/deleteStore';

function Comments(props: { gameId: string; userId: string }) {
  //useEffect 트리거
  const [refetch, setRefetch] = useState<boolean>(true);
  //댓글 목록 저장 상태
  const [commentArray, setCommentArray] = useState<
    {
      commentId: string;
      userId: string;
      commentText: string;
      createAt: number;
    }[]
  >([]);
  //유저 닉네임 및 프로필 이미지 저장 상태
  const [commentUser, setCommentUser] = useState<
    {
      userId: string;
      nickName: string;
      profileImg: string;
    }[]
  >([]);
  //댓글 불러오기
  useEffect(() => {
    getWorldcupCommentList(props.gameId).then((result) => {
      setCommentArray(result);
      //불러온 댓글의 유저 ID를 조회하여 닉네임과 프로필 이미지 불러오기
      getCommentUser(result).then((res) => setCommentUser(res));
    });
  }, [refetch]);
  //댓글 작성칸 ref
  const commentRef = useRef<HTMLInputElement>(null);
  //댓글 작성창 초기 상태
  const [commentText, setCommentText] = useState<string>('');
  //댓글 작성 온체인지
  const commentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCommentText(event.target.value);
  };
  //댓글 등록 로딩
  const [commentLoading, setCommentLoading] = useState<boolean>(false);
  //댓글 작성 핸들러
  const commentHandler = async (event: React.FormEvent) => {
    event.preventDefault();
    setCommentLoading(true);
    if (commentText.length === 0) {
      commentRef.current && commentRef.current.focus();
    } else {
      await addWorldcupComment(props.gameId, props.userId, commentText);
      if (commentRef.current) commentRef.current.value = '';
    }
    setCommentLoading(false);
    setRefetch((prev) => !prev);
  };

  //댓글 각 행의 유저 정보를 조회
  const findUserProfile = (userId: string) => {
    if (userId !== '') {
      const isExist = commentUser.find((user) => user.userId === userId);
      if (isExist) {
        return {
          nickName: isExist.nickName,
          profileImg: isExist.profileImg === 'default' ? '/images/user.png' : isExist.profileImg,
        };
      }
    } else {
      return {
        nickName: '익명',
        profileImg: '/images/user.png',
      };
    }
  };
  //댓글 정렬
  const [isDesc, setIsDesc] = useState<boolean>(true);
  //댓글 페이지네이션(더보기)
  const [commentLimit, setCommentLimit] = useState<number>(5);

  //댓글 삭제 아이콘 클릭
  const deleteComment = async (commentId: string) => {
    await deleteWorldcupComment(commentId);
    setRefetch((prev) => !prev);
  };
  return (
    <div className='game-comment-container'>
      <h1>댓글 ({commentArray.length}개)</h1>
      <table className='comment-list'>
        <thead>
          <tr>
            <td colSpan={4}>
              <button onClick={() => setIsDesc((prev) => !prev)}>
                날짜
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth='2'
                  stroke='currentColor'
                  className={isDesc ? '' : 'rotate'}
                >
                  <path strokeLinecap='round' strokeLinejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' />
                </svg>
              </button>
            </td>
          </tr>
        </thead>
        <tbody>
          {commentArray
            .sort((a, b) => (isDesc ? b.createAt - a.createAt : a.createAt - b.createAt))
            .slice(0, commentLimit)
            .map((data) => (
              <tr key={data.commentId}>
                <td>
                  <img src={findUserProfile(data.userId)?.profileImg} alt='' />
                </td>
                <td>{findUserProfile(data.userId)?.nickName}</td>
                <td>
                  <div>
                    {data.commentText}
                    {props.userId === data.userId && (
                      <span className='delete-comment'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                          strokeWidth='1.5'
                          onClick={() => deleteComment(data.commentId)}
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0'
                          />
                        </svg>
                      </span>
                    )}
                  </div>
                </td>
                <td>{compareTime(data.createAt)}</td>
              </tr>
            ))}
        </tbody>
      </table>
      {commentArray.length > commentLimit && (
        <div className='more-comments'>
          <button onClick={() => setCommentLimit((prev) => prev + 5)}>댓글 더보기</button>
        </div>
      )}
      <form className='comment-input' onSubmit={(event) => commentHandler(event)}>
        <input
          ref={commentRef}
          type='text'
          placeholder='댓글을 작성해주세요...'
          name='commentText'
          autoComplete='off'
          onChange={commentChange}
        />
        <button type='submit' disabled={commentLoading}>
          등록
        </button>
      </form>
    </div>
  );
}

export default Comments;
