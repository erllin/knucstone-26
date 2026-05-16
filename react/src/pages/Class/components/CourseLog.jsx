import React, { useState, useMemo } from "react";
// icon
import "../../../components/FontAwesome";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import "../Class.css";
import "./CourseLog.css";
// Course Context
import useStats from "../../../components/useStats";
import { useUser } from "../../../components/UserProvider";

// GRADE_MAP: 성적 문자-숫자 맵핑해주는 무언가.
const GRADE_MAP = {
    "A+": 4.5, "A0": 4.0, "B+": 3.5, "B0": 3.0, "C+": 2.5, "C0": 2.0, "D+":1.5, "D0": 1.0, "F": 0.0,
    "P": null, "NP": null
};

// const SemesterEntity: 각각의 학기(요약, 수강이력)에 대한 정보를 제공하는 컴포넌트. CourseLog의 하위 컴포넌트.
const SemesterEntity = ({ sem, onOpenModal }) => {
    const { userCourse } = useUser();
    const { semesterStats } = useStats();

    // 성적 리스트 열림/닫힘 상태 관리      (컴포넌트 내부의 useState여서 외부 State와 이름 같아도 간섭 X)
    const [isOpen, setIsOpen] = useState(false);

    // semesterTitle: 학기 타이틀 표현 변환해줌. (정규: 2-1... || 계절: n회차...)
    const semesterTitle = (sem.termType === 0) ?
        `${parseInt(sem.term/2)+1}-${(sem.term%2)+1}` : `${sem.term+1}회차`;

    // semInfo: useStats에서 계산된 평점, 학점 가져옴.
    const semInfo = useMemo(() => {
        return semesterStats?.find(s => s.id === sem.id);
    }, [semesterStats, sem.id]);

    // 예외 처리
    const defStats = {
        gpa: { general: "0.00", major: "0.00", other: "0.00" },
        credit: { general: 0, mRequire: 0, mElective: 0, liberal: 0, free: 0 }
    }
    const semDisplay = semInfo || defStats;

    // 이수 학점, 평점 관리 (useMemo를 이용하는 것이 렌더링/최적화 면에서 효과적)
    // courseList: 현재 학기에서 수강한 강의들을 필터링해서 모아줌. (taken)
    const courseList = useMemo(() => {
        if (!userCourse) { return []; }
        return userCourse.filter(course => course.taken === sem.taken)
    }, [userCourse, sem.taken]);

    return (
        <div className="sem-item">
            <div className="semit-summary">
                <div className="semit-title">{semesterTitle}</div>
                <div className="semit-sum">
                    {/* 수강이력과 성적에 따라서 개별로 변하게끔 할 계획 (요약부) */}
                    {/* 평점: 종합 (전공 / 전공외) , 이수: 종합 (전필 / 전선 / 교양 / 자선) 와 같이 표현할 계획 */}
                    <span className="semit-gpa">
                        평점: <b>{semDisplay.gpa.general} ({semDisplay.gpa.major}, {semDisplay.gpa.other})</b>
                    </span>
                    <span className="semit-credit">
                        학점: <b>{semDisplay.credit.general} ({semDisplay.credit.mRequire}, {semDisplay.credit.mElective}, {semDisplay.credit.liberal}, {semDisplay.credit.free})</b>
                    </span>
                </div>
                <div className="semit-btn" onClick={() => setIsOpen(!isOpen)}>
                    <FontAwesomeIcon className={`caret-icon ${isOpen ? "rotate-180" : ""}`} icon="caret-down" />
                </div>
            </div>
            {isOpen && (
                <div className="semit-expanded-content">
                    <div className="semit-exp-header">
                        <span>{sem.taken}</span>                        
                        <div className="semit-edit-btn" 
                            onClick={(e) => {
                                e.stopPropagation(); 
                                onOpenModal(sem);}}>
                            <FontAwesomeIcon icon="pen-to-square" />
                        </div>
                    </div>
                    {courseList.length > 0 ? (
                        <table className="course-table">
                            <thead>
                                <tr>
                                    <th>과목번호</th>
                                    <th>과목명</th>
                                    <th>유형</th>
                                    <th>학점</th>
                                    <th>성적</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courseList.map(course => (
                                    <tr key={course.cid}>
                                        <td>{course.cid}</td>
                                        <td>{course.cname}</td>
                                        <td>{course.ctype}</td>
                                        <td>{course.credit}</td>
                                        <td>{course.grade}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="no-course-message">
                            <FontAwesomeIcon className="ncm-i" icon="exclamation-circle" size="2x" />
                            <p>등록된 과목이 없습니다.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// const CourseLog: 본체
/*
    @onOpenModal: 학기/수강이력 추가 등의 팝업을 외부에서 처리할 수 있게 하는 일종의 콜백.
*/
const CourseLog = ({ onOpenModal }) => {

    const { 
        userProfile, 
        userSemester, 
        updateProfile,
        deleteSemester 
    } = useUser();

    // handleAddSemester: 학기 추가 메소드
    const handleAddSemester = async (tType) => {
        if (!userProfile) { return; }

        // 정규학기 여부
        const isRegular = (tType === 0);
        // v ?? x => v가 null undefined면 x 값을, 아니라면 자신의 값을 사용하게 함.
        const curTerm = isRegular ? (userProfile.term ?? -1) : (userProfile.nterm ?? -1);

        // 학기 추가 => CoursePopup 컴포넌트를 띄워, 팝업쪽에서 결정하도록 함. 
        const newSem = {
            id: null,
            termType: tType,
            term: curTerm + 1,
            taken: ""
        };
        onOpenModal(newSem)
    };

    // handleDeleteSemester: 학기 삭제 메소드
    const handleDeleteSemester = async (tType) => {
        if (!userProfile) { return; } 
        
        // 정규학기 여부
        const isRegular = (tType === 0);
        // v ?? x => v가 null undefined면 x 값을, 아니라면 자신의 값을 사용하게 함.
        const curTerm = isRegular ? (userProfile.term ?? -1) : (userProfile.nterm ?? -1);

        if (curTerm < 0) { return; }

        await updateProfile(isRegular ? { term: curTerm - 1 } : {nterm: curTerm - 1 });
        await deleteSemester(tType, curTerm);
    };

    // renderSemesterList: 학기 렌더링 메소드
    const renderSemesterList = (semList, termType) => {
        if (!semList) { return null; }

        // 정렬 후 렌더링.
        return semList
            .filter(sem => sem.termType === termType)
            .sort((x, y) => x.term - y.term)
            .map(sem => (
                <SemesterEntity 
                    key={`${termType}-${sem.term}`} 
                    sem={sem}
                    onOpenModal={onOpenModal}
                />
            ));
    };

    return (
        <>
        {/* 이수이력을 학기별로 분리 배치하는 곳 (실증용) */}
        <section className="cls-history border-r con-theme">
            <div className="ct-sem regular-sem">
                <div className="sem-header">
                    <span className="sem-title">정규학기</span>
                    <div className="sem-btn">
                        <div className="del-sem-btn" onClick={() => handleDeleteSemester(0)}>
                            <FontAwesomeIcon icon="square-minus" />
                        </div>
                        <div className="add-sem-btn" onClick={() => handleAddSemester(0)}>
                            <FontAwesomeIcon icon="square-plus" />
                        </div>
                    </div>
                </div>
                <div className="sem-container">
                    {renderSemesterList(userSemester, 0)}
                </div>
            </div>
            <div className="ct-sem seasonal-sem">
                <div className="sem-header">
                    <span className="sem-title">계절학기</span>
                    <div className="sem-btn">
                        <div className="del-sem-btn" onClick={() => handleDeleteSemester(1)}>
                            <FontAwesomeIcon icon="square-minus" />
                        </div>
                        <div className="add-sem-btn" onClick={() => handleAddSemester(1)}>
                            <FontAwesomeIcon icon="square-plus" />
                        </div>
                    </div>
                </div>
                <div className="sem-container">
                    {renderSemesterList(userSemester, 1)}
                </div>
            </div>
        </section>
        </>
    );
}

export default CourseLog;