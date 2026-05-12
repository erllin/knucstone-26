import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../components/UserProvider";

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

    // 2. 방문 기록 저장 및 이동
    localStorage.setItem('userVisited', 'true');
    navigate("/home");
  };

  return (
    <div className="setup-container">
      {!user ? (
        <div className="login-step">
          <h1>환영합니다!</h1>
          <p>서비스 이용을 위해 로그인이 필요합니다.</p>
          <button onClick={loginWithGoogle}>구글로 로그인하기</button>
        </div>
      ) : (
        <div className="form-step">
          <h1>학사 정보 설정</h1>
          <p>{user.displayName}님의 학적 정보를 입력해주세요.</p>
          
          <input 
            placeholder="대학교명" 
            onChange={e => setFormData({...formData, university: e.target.value})} 
          />
          <input 
            placeholder="학과명" 
            onChange={e => setFormData({...formData, department: e.target.value})} 
          />
          <select onChange={e => setFormData({...formData, admission: Number(e.target.value)})}>
            <option value="2026">2026학번</option>
            <option value="2023">2023학번</option>
            {/* ... 임시용 :) */}
          </select>

          <button onClick={handleComplete}>설정 완료 및 시작하기</button>
        </div>
      )}
    </div>
  );
}

export default Setup;