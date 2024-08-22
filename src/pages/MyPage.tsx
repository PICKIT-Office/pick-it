import React, { useEffect, useState } from "react";
import "../assets/MyPage/myPage.scss";
import { Link, useNavigate } from "react-router-dom";
import { getUserData } from "../server/firebaseAuth";
import { getMyPlayAmount } from "../server/firebaseWorldcup";
import MyWorldcup from "../components/MyPage/MyWorldcup";
import PlayedWorldcup from "../components/MyPage/PlayedWorldcup";
import { MyPageDataType } from "../types/MyPage";

function MyPage() {
  //로컬스토리지에 존재하는 게임 데이터(중간에 나온 게임일 경우 남음)
  const remainData = localStorage.getItem("game-data");
  //로컬스토리지에 존재하는 유저 데이터
  const user = localStorage.getItem("pickit-user");

    //네비게이션
    const navigate = useNavigate();
  
    useEffect(() => {
      if (!user) {
        alert("로그인 후 이용 가능합니다.");
        navigate("/login");
      }
    }, [navigate, user]);
  // 내월드컵/참여/댓글 메뉴 선택 상태
  const [filterMenu, setFilterMenu] = useState<"내 월드컵" | "참여" | "댓글">("내 월드컵");
  // 내 프로필 정보 상태 ["이미지경로", "닉네임"]
  const [myProfile, setMyProfile] = useState<string[]>();
  //내 월드컵, 참여, 댓글 수
  const [myPlayeData, setMyPlayData] = useState<{
    myWorldcup: MyPageDataType[];
    playedWorldcup: MyPageDataType[];
  }>();

  useEffect(() => {
    if (user) {
      //회원 프로필 이미지 및 닉네임 불러오기
      getUserData(String(JSON.parse(user).UserId)).then((res) => setMyProfile(res));
      //내 월드컵, 참여, 댓글 수 불러오기
      getMyPlayAmount(String(JSON.parse(user).UserId)).then((res) => setMyPlayData(res));
    }
  }, []);

  return (
    <div className="mypage-container">
      <aside className="mypage-aside">

        {(myProfile && myPlayeData) &&
          <div className="aside-profile">
            <img src={myProfile[0] === "default" ? "/images/user.png" : myProfile[0]} alt="" />
            <h2>{myProfile[1]}</h2>
            <Link to="">프로필 수정</Link>
            <div className="my-played">
              <div onClick={() => setFilterMenu("내 월드컵")}>
                <h3>{myPlayeData.myWorldcup.length}</h3>
                <p>내 월드컵</p>
              </div>
              <div onClick={() => setFilterMenu("참여")}>
                <h3>{myPlayeData.playedWorldcup.length}</h3>
                <p>참여</p>
              </div>
              <div onClick={() => setFilterMenu("댓글")}>
                <h3>6</h3>
                <p>댓글</p>
              </div>
            </div>
          </div>
        }
        {remainData && (
          <div className="aside-remain-game">
            <h2>아직 끝나지 않은 게임이 있어요!</h2>
            <div className="game-info">
              <div className="img-wrapper">
                <img src={JSON.parse(remainData).GameImage[0].filePath} alt="" />
                <img src={JSON.parse(remainData).GameImage[1].filePath} alt="" />
              </div>
              <div>
                <h3>{JSON.parse(remainData).GameTitle}</h3>
              </div>
            </div>
            <Link to={`/play-game/${JSON.parse(remainData).GameId}`}>
              <button>플레이</button>
            </Link>
          </div>
        )}
      </aside>
      <section className="mypage-section">
        <div className="menu-filter">
          <button
            onClick={() => setFilterMenu("내 월드컵")}
            className={filterMenu === "내 월드컵" ? "selected" : ""}>
            내 월드컵
          </button>
          <button
            onClick={() => setFilterMenu("참여")}
            className={filterMenu === "참여" ? "selected" : ""}>
            참여
          </button>
          <button
            onClick={() => setFilterMenu("댓글")}
            className={filterMenu === "댓글" ? "selected" : ""}>
            댓글
          </button>
        </div>
        {(myPlayeData && filterMenu === "내 월드컵") && <MyWorldcup data={myPlayeData.myWorldcup}/>}
        {(myPlayeData && filterMenu === "참여") && <PlayedWorldcup/>}
      </section>
    </div>
  );
}

export default MyPage;
