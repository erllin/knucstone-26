import React, { useState, useEffect, useCallback, useContext, useMemo, createContext } from "react";

const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
    // courseHistory: 사용자의 전체 수강 이력 리스트(JSON)
    /* courseHistory = [...courseData]        => courseData: 낱개 수강 이력
       courseData
        .cid: 강의 고유번호
        .cname: 강의명
        .ctype: 강의유형 (교양, 전필, 전선...)      => 학과 전공과목 리스트랑 비교해서 관리해야할 듯...
        .credit: 학점
        .grade: 성적 (A+, A0 ...)
        .taken: 이수한 회차 (키값!)
        .retake: 재수강 여부
    */
   const [courseHistory, setCourseHistory] = useState(() => {
        const courseData = localStorage.getItem('courseHistory');
        return courseData ? JSON.parse(courseData) : [];
   });

   // semesterInfo: 사용자가 이수한 학기에 대한 정보(JSON)
   /* semesterInfo [semester_1, semester_2 ...]
        .termType: 학기 유형 (0: 정규, 1: 계절)
        .term: 학기 수 (학사정보 학기수와 연계; term & nterm)
        .taken: 이수한 회차 (예시: 2020-1, 2021-1, 2022-S, 2023-W...)      => 수강이력과의 키값으로 쓰는 것이 좋을 것 같음.
   */
   const [semesterInfo, setSemesterInfo] = useState(() => {
        const semData = localStorage.getItem('semesterInfo');
        return semData ? JSON.parse(semData) : [];
   });

   // useCallback을 써서 처리하는 것이 좋다고 함. (렌더링 측면에서)
   // useCallback(callback, [...])의 '[...]'는 의존성 배열, [...] 내부 값에 변동이 있으면, 메소드가 재생성됨.
   //                                   []처럼 비어있으면, 메소드를 단순 재사용하게 되어있음.
   // useEffect는 상태를 감지해, 상태가 변할 때마다 자동으로 동작하는 방식.
   // 그래서, localStorage.setItem을 useEffect로 관리하면 보다 깔끔하고, 관리가 쉬워지는 측면이 있음.

   // useEffect 관리자 (courseHistory, semesterInfo 에 대해.)
   // localStorage.setItem을 관리함. (문제 생기면 useEffect 빼버리고, 각각의 메소드에 알맞게 setItem 넣어주면 됨.)
   useEffect(() => {
     localStorage.setItem('courseHistory', JSON.stringify(courseHistory));
   }, [courseHistory])
   useEffect(() => {
     localStorage.setItem('semesterInfo', JSON.stringify(semesterInfo));
   }, [semesterInfo])

   // updateCourseHistory: 수강이력 업데이트
   const updateCourseHistory = useCallback((data) => {
        setCourseHistory(data);
   }, []);

   /* 코드 (기존)
   // addCourse: 수강이력 추가
   const addCourse = useCallback((course) => {
        setCourseHistory(prev => {
            const updatedData = [...prev, course];
            localStorage.setItem('courseHistory', JSON.stringify(updatedData));
            return updatedData;
        });
   }, []);
   */

   const addCourse = useCallback((course) => {
        setCourseHistory(prev => [...prev, course]);
   }, []);

   // updateSemesterInfo: 이수학기 업데이트
   const updateSemesterInfo = useCallback((data) => {
        localStorage.setItem('semesterInfo', JSON.stringify(data));
        setSemesterInfo(data);
   }, []);

   // addSemester: 이수학기 추가
   const addSemester = useCallback((semester) => {
        setSemesterInfo(prev => [...prev, semester]);
   }, []);

   // deleteSemester: 이수 학기 삭제 (관련 수강이력도 연쇄삭제됨!)
   // tType: 학기 유형, tNum: 회차
   const deleteSemester = useCallback((tType, tNum) => {
        // 수강 이력 연쇄 삭제를 위해...
        const target = semesterInfo.find(sem => 
            sem.termType === tType && sem.term === tNum
        );
        // 에러 처리
        if (!target)
            return;

        // 학기 삭제 부분        
        setSemesterInfo(prevSem =>
            prevSem.filter(sem => !(sem.termType === tType && sem.term === tNum))
          );
        // 수강 이력 연쇄 삭제 부분
        setCourseHistory(prevCs =>
            prevCs.filter(cs => cs.taken !== target.taken)
          );
   }, [semesterInfo]);

   // useMemo를 사용해서 값들을 묶어 최적화가 가능하다고 함.
   const val = useMemo(() => ({
        courseHistory,
        semesterInfo,
        updateCourseHistory,
        addCourse,
        updateSemesterInfo,
        addSemester,
        deleteSemester
   }), [courseHistory, semesterInfo, updateCourseHistory, addCourse, updateSemesterInfo, addSemester, deleteSemester]);

   return (
        <CourseContext.Provider value={val}>
            {children}
        </CourseContext.Provider>
   );
};

export function useCourse() {
    const context = useContext(CourseContext);
    if (!context) {
        throw new Error("CourseProvider 내부에 useCourse가 위치할 것.");
    }

    return context;
}