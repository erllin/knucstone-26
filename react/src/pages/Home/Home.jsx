import React, { useState } from "react";
// icon
import "../../components/FontAwesome";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import "./Home.css";
// UserContext
import { useUser } from "../../components/UserProvider";
import { logout } from "../../firebase";
// components
import ProfilePopup from "./components/ProfilePopup";
import CreditStats from "./components/CreditStats";
import GpaStats from "./components/GpaStats";
import RequirementList from "./components/RequirementList";
// 전공 유형 상수값.
const MAJOR_TYPES = ["미상", "단일전공", "단일부전공", "복합부전공", "복수전공"];

const Home = () => {
    // profileData: 사용자의 기본 학사정보 (JSON)
    /* profileData 키 정보
        .university: 학교명
        .department: 소속학과
        .admission: 입학년도
        .majortype: 전공형태 (0: 없음, 1:단일, 2:단일부, 3:복합부, 4:복수)
        .term: 정규학기수 (-1: 신입학, 0: 1-1, 1: 1-2 ...)
        .nterm: 비정규학기수
    */
    const { user, userProfile, loading } = useUser();
    const [profilePopupOpen, setProfilePopupOpen] = useState(false);

    // switchMajorType: 전공타입(integer)을 문자로 변환해주는 메소드
    const switchMajorType = (value) => {
        return MAJOR_TYPES[value] || "미상";
    };

    const handleLogout = async () => {
      try {
        await logout();
        alert("로그아웃 성공");
      } catch (error) {
        console.error(error);
      }
    }

    if (loading) {
      return <div className="loading">데이터를 불러오는 중입니다.</div>
    }
    if (!user) {
      return <div className="login-required">로그인이 필요합니다.</div>
    }

    const profile = userProfile || {
      university: "학교미상",
      department: "학과미상",
      admission: 2000,
      majortype: 0
    };

  // !google.ai 사용해서 트리 구조도 정리함. 주의요망.
  return (
    <div className="page main-theme">
      {/* 헤더 부분: 로고/제목, 간단한 옵션, 학적 배치됨 */}
      <header className="header">
        <div className="header-top">
          <div className="ct-wrapper">
            {/* 헤더>로고 */}
            <div className="logo">MYCURRI</div>
            {/* 헤더>메뉴:  추후 logo 위치 우측면으로 밀 예정. */}
            <nav className="menu">
              <div className="logout-btn"
                onClick={handleLogout}
                type={{ cursor: 'pointer'}}
              >
                로그아웃</div>
              <div className="opt-btn">설정</div>
            </nav>
          </div>
        </div>
        {/* 헤더>학적: 사용자의 학적을 불러옴. (학교명, 학과, 입학년도, 전공유형) */}
        <div className="profile border-r con-theme">
            {/* 학적>수정버튼: 수정버튼. 누르면 팝업 나타나며, 객체 겹침으로 인해서 Propagation 적용함. ProfilePopup.jsx 참고. */}
            <button className="edit-btn" onClick={(e) => {e.stopPropagation(); setProfilePopupOpen(true)}}>
                <FontAwesomeIcon icon="pen-to-square" />
            </button>
            {/* 이하 학적 JSON에서 가져온 정보 표시됨. */}
            <div className="prof-univ">{profile.university}</div>
            <div className="prof-depart">{profile.department}</div>
            <div className="prof-info">
                <span className="adm-year">{profile.admission}</span>
                <span className="major-type">{switchMajorType(profile.majortype)}</span>
            </div>
        </div>
      </header>

      {/* 메인 부분: 주요 요소의 컴포넌트 배치함. 오버플로-스크롤 처리해, 메인 내부에서 스크롤 되도록 하는게 목표. */}
      <main className="ct border-r sub-theme">
        <div className="ct-wrapper">
          {/* 메인>평점: 임시 값 넣음. */}
          <GpaStats />

          {/* 메인>이수학점: 임시로 값 넣음. */}
          <CreditStats />

          {/* 메인>졸업요건: 이수학점 외 요건들의 상태 모아둘 곳, 버튼 두어서 아래로 확장할 수 있게 할 예정. (=요약/상세히) */}
          <RequirementList />

          <section>
            {/* 추천 과목 섹터 */}
          </section>

        </div>
      </main>

      {/* 이하는 팝업, 서브로 나타나는 친구들을 배치해놓음. */}
      {profilePopupOpen && ( <ProfilePopup onClose={() => setProfilePopupOpen(false)} />)}
    </div>
  );
};

export default Home;