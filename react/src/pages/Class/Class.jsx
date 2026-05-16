import React, { useState } from "react";
// context
import { useUser } from "../../components/UserProvider";
// icon
import "../../components/FontAwesome";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import "./Class.css"
// components
import CourseLog from "./components/CourseLog";
import CoursePopup from "./components/CoursePopup";
import StatLog from "./components/StatLog";

const Class = () => {
    // userCourse: 사용자의 수강 이력 리스트(JSON)
    /* userCourse = [...courseData]        => courseData: 낱개 수강 이력
       courseData
        .cid: 강의 고유번호
        .cname: 강의명
        .ctype: 강의유형 (교양, 전필, 전선...)      => 학과 전공과목 리스트랑 비교해서 관리해야할 듯...
        .credit: 학점
        .grade: 성적 (A+, A0 ...)
        .termType: 학기 타입(0: 정규, 1: 비정규)   => 수강이력 관리에서 어느 파트에 넣는지에 따라 결정됨.
        .term: 어느 학기에 수강한 과목인지          => 수강이력 관리에서 어느 파트에 넣는지에 따라 결정됨.
        .retake: 재수강 여부
    */

    const { loading, user } = useUser();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [targetSem, setTargetSem] = useState(null);


    if (loading) return (
        <div className="loading">이력을 불러오는 중...</div>
    );
    if (!user) return (
        <div className="login-msg">로그인이 필요합니다.</div>
    );

    const handleOpenModal = (sem) => {
        setTargetSem(sem);
        setIsModalOpen(true);
    }

    // header, main-theme 등 일부 css는 Home.css에 위치함. 추후 분리예정.
    return (
        <div className="page main-theme">
            <header className="header">
                <div className="header-top">
                    <div className="ct-wrapper">
                        {/* 헤더>로고 */}
                        <div className="logo">MYCURRI</div>
                        {/* 헤더>메뉴:  추후 logo 위치 우측면으로 밀 예정. */}
                        <nav className="menu">
                            수강이력
                        </nav>
                    </div>
                </div>
            </header>
            <main className="ct">
                <div className="ct-wrapper">
                    <StatLog />

                    <CourseLog onOpenModal={handleOpenModal}/>
                    
                    {isModalOpen && (
                        <CoursePopup
                            key={targetSem?.id || "new"}
                            targetSem={targetSem}
                            onClose={() => setIsModalOpen(false)}
                        />
                    )}
                </div>
            </main>
        </div>
    )
}

export default Class;