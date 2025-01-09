import { MyPageDataType, MyWorldcupCommentType } from '../../types/MyPage';
import { compareTime } from '../../Utils/compareTime';
import { WorldcupImage } from '../../types/Worldcup';
import { useNavigate } from 'react-router-dom';

function MyComment(prop: { commentData: MyWorldcupCommentType[]; commentWolrdcup: (MyPageDataType | null)[] }) {
  //네비게이터
  const navigate = useNavigate();
  //댓글 데이터와 월드컵 데이터 융합하여 UI에 마운트
  const mergedData = prop.commentData.map((data) => {
    const findWolrdcup = prop.commentWolrdcup.find((wolrdcup) => wolrdcup?.gameId === data.gameId)?.gameInfo;
    if (findWolrdcup) {
      const sortImages = findWolrdcup.worldcupImages.sort(
        (a: WorldcupImage, b: WorldcupImage) => a.fileIndex - b.fileIndex,
      );
      return {
        commentId: data.commentId,
        gameId: data.gameId,
        thumbail_left: sortImages[findWolrdcup.thumbnail[0]].filePath,
        thumbail_right: sortImages[findWolrdcup.thumbnail[1]].filePath,
        worldcupTitle: findWolrdcup.worldcupTitle,
        commentText: data.commentText,
        createAt: data.createAt,
      };
    }
  });
  return mergedData.length === 0 ? (
    <div className='mypage-no-data'>작성하신 댓글이 없습니다.</div>
  ) : (
    <div className='mypage-worldcup-container'>
      <div className='mypage-comment-container'>
        {mergedData.map(
          (data) =>
            data && (
              <div
                className='comment-row'
                key={data.commentId}
                onClick={() => navigate(`../game-review/${data.gameId}`)}
              >
                <div className='worldcup-info'>
                  <div className='img-wrapper'>
                    <img src={data.thumbail_left} alt='' />
                    <img src={data.thumbail_right} alt='' />
                  </div>
                  {data.worldcupTitle}
                </div>
                <p>"{data.commentText}"</p>
                <span>{compareTime(data.createAt)}에 작성되었습니다.</span>
              </div>
            ),
        )}
      </div>
    </div>
  );
}
export default MyComment;
