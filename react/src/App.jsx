import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';
// CSS
import './App.css'
import './Global.css'
// ContextProvider
import { UserProvider, useUser } from './components/UserProvider';
// Setup
import Setup from './pages/Setup/Setup';
// Routes
import Home from "./pages/Home/Home";
import Class from "./pages/Class/Class";
import Analize from "./pages/Analize/Analize";
import Setting from "./pages/Setting/Setting";
import BottomNav from './components/BottomNav';

const RootRouter = () => {
  const { user, userProfile, loading } = useUser();

  // 1. Firebase 인증 상태 확인 중일 때
  if (loading) {
    return <div className="loading-screen">데이터를 불러오는 중입니다...</div>;
  }

  return (
    <>
    <Routes>
      {!user || !userProfile ? (
        /* 로그인 X */
        <>
          <Route path="/setup" element={<Setup />} />
          <Route path="*" element={<Navigate to="/setup" replace />} />
        </>
      ) : (
        /* 로그인O, 학적 정보 O */
        <>
          <Route path="/home" element={<Home />} />
          <Route path="/class" element={<Class />} />
          <Route path="/analize" element={<Analize />} />
          <Route path="/setting" element={<Setting />} />
          {/* 기본 경로(/), 잘못된 경로(setup, 이외)는 모두 Home으로 리다이렉트 */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/setup" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </>
      )}
    </Routes>
    {user && userProfile && <BottomNav />}
    </>
  );
};

function App() {
  return (
    <UserProvider>
        <RootRouter />
    </UserProvider>
  );
}

export default App;
