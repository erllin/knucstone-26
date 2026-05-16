import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../components/UserProvider";

import "./Setup.css"

function Setup() {
  const navigate = useNavigate();
  const { user, userProfile, loginWithGoogle, updateProfile } = useUser();

  // 초기값
  const [formData, setFormData] = useState({
    university: "",
    department: "",
    admission: new Date().getFullYear(),
    majortype: 1,
  });

  // 프로필이 있는 유저가 접근 -> 홈으로 (App 쪽에도 정의되어 있음; 혹시 몰라서)
  useEffect(() => {
    if (user && userProfile?.university) {
      localStorage.setItem('userVisited', 'true');
      navigate("/home");
    }
  }, [user, userProfile, navigate]);

  const handleComplete = async () => {
    if (!formData.university || !formData.department) {
      alert("모든 정보를 입력해주세요.");
      return;
    }
    
    // DB->프로필 저장    (setupComplete: 일종의 플래그)
    await updateProfile({
      ...formData,
      setupCompleted: true,
    });

    // 방문 기록 저장 및 이동
    localStorage.setItem('userVisited', 'true');
    navigate("/home");
  };

  return (
    <div className="setup-wrapper page">
      <div className="setup-container framework con-theme border-r">
        {!user ? (
          /* 구글 로그인 (Auth, 등록) */
          <div className="login-step">
            <h1 className="section-title">환영합니다!</h1>
            <p className="setup-muted-text">
              서비스 이용을 위해 로그인이 필요합니다.
            </p>
            <button className="setup-btn" onClick={loginWithGoogle}>
              구글로 로그인하기
            </button>
          </div>
        ) : (
          /* 학사 정보 입력 (기존 정보가 없는 사람일시) */
          <div className="form-step">
            <div className="form-header">
              <h1 className="section-title">학사 정보 설정</h1>
              <p className="setup-muted-text">
                {user.displayName}님의 학적 정보를 입력해주세요.
              </p>
            </div>
            
            <div className="fr-title border-r">
              <select 
                type="text"
                className="setup-input"
                placeholder="대학교명" 
                value={formData.university}
                onChange={e => setFormData({...formData, university: e.target.value})} 
              >
                <option value="강원대학교">강원대학교</option>
              </select>
            </div>

            <div className="fr-title border-r">
              <select
                type="text"
                className="setup-input"
                placeholder="학과명" 
                value={formData.department}
                onChange={e => setFormData({...formData, department: e.target.value})} 
              >
                <option value="컴퓨터공학과">컴퓨터공학과</option>
              </select>
            </div>
            <div className="setup-row">
              <div className="fr-title border-r fr-title-select">
                <select 
                  value={formData.admission}
                  onChange={e => setFormData({...formData, admission: Number(e.target.value)})}
                >
                  <option value="2026">2026학번</option>
                </select>
              </div>
              <div className="fr-title border-r fr-title-select">
                <select 
                  value={formData.majortype}
                  onChange={e => setFormData({...formData, majortype: Number(e.target.value)})}
                >
                  <option value={1}>단일전공</option>
                  <option value={2}>단일부전공</option>
                  <option value={3}>복합부전공</option>
                  <option value={4}>복수전공</option>
                </select>
              </div>
            </div>
            <button className="setup-btn primary" onClick={handleComplete}>
              설정 완료 및 시작하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Setup;