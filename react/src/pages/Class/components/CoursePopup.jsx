import React, { useState, useEffect, useCallback, useRef } from "react";
// context
import { useUser } from "../../../components/UserProvider";
// firebase
import { db } from "../../../firebase";
import { writeBatch, doc, collection, query, where, getDocs, getDoc } from "firebase/firestore";
// css
import "../Class.css"
import "./CoursePopup.css"

// 전역 값
const courseCache = {};

const grades = ["A+", "A0", "B+", "B0", "C+", "C0", "D+", "D0", "F", "P", "NP"];
const ctypes = ["전필", "전선", "교양", "자선"];
const termWeight = { "1": 1, "S": 2, "2": 3, "W": 4 };

// const CourseEntity: 개별 수강 이력에 대한 엔티티.
/*
    @course: 선택된 강의
    @index: 
*/
const CourseEntity = React.memo(({ course, index, onUpdate, onDelete, grades }) => {
    const [localCid, setLocalCid] = useState(course.cid);

    // course.cid가 변경되는 경우 동기화 수행.
    useEffect(() => {
        setLocalCid(course.cid);
    }, [course.cid]);

    // 검색 업데이트 트리거
    const handleTrigger = useCallback(() => {
        // 값이 바뀌었을 때만 업데이트 실행
        if (localCid !== course.cid) {
            onUpdate(index, "cid", localCid);
        }
    }, [localCid, course.cid, index, onUpdate]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // 엔터 시 줄바꿈 등 방지
            e.currentTarget.blur();
        }
    }, []);

    return (
        <div className='course-row'>
            <div className="col-cid">
                <input className="dark-input" value={localCid} 
                    onChange={(e) => setLocalCid(e.target.value)} 
                    onKeyDown={handleKeyDown}
                    onBlur={handleTrigger}
                    placeholder="코드" 
                />
            </div>
            <div className="col-name">
                <input className="dark-input" 
                    value={course.cname} readOnly={course.fromDB} 
                    onChange={(e) => onUpdate(index, "cname", e.target.value)} 
                    placeholder="강의명" 
                />
            </div>
            <div className="col-credit">
                <input type="number" className="dark-input" style={{ textAlign: 'center' }}
                    value={course.credit} readOnly={course.fromDB}
                    onChange={(e) => onUpdate(index, "credit", Number(e.target.value))}
                />
            </div>
            <div className="col-grade">
                <select className="dark-select" value={course.grade} 
                    onChange={(e) => onUpdate(index, "grade", e.target.value)}>
                    {grades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
            </div>
            <div className="col-del">
                <button className="del-btn" onClick={() => onDelete(index)} title="delete">
                    ×
                </button>
            </div>
        </div>
    );
});

// const CoursePopup: 팝업 본체
/*
    @targetSem: 선택된 학기
*/
const CoursePopup = ({ targetSem, onClose }) => {
    const { user, userCourse, userSemester } = useUser();

    const [activeTaken, setActiveTaken] = useState(targetSem?.taken || "");
    const [inputYear, setInputYear] = useState(targetSem?.taken?.split('-')[0] || new Date().getFullYear());
    const [inputTerm, setInputTerm] = useState(targetSem?.taken?.split('-')[1] || (targetSem.termType === 0 ? "1" : "S"));
    const [localCourses, setLocalCourses] = useState([]);
    // handleUpdateRow 락
    const isUpdating = useRef(false);

    // 기존 데이터를 가져오는 기능.
    useEffect(() => {
    if (targetSem?.taken) {
            const filtered = userCourse.filter(cs => cs.taken === targetSem.taken);
            // 실행 시점을 아주 미세하게 늦춰 렌더링 충돌 방지
            const timer = setTimeout(() => {
                setLocalCourses(filtered);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, []);

    // CourseEntity 부분에서 강의코드 입력방법 변경 가능 (현재는 Enter 입력)
    const fetchCourseInfo = useCallback(async (cid) => {
        // 예외 케이스
        const trimCid = cid.trim();
        if (!trimCid) { return null; }
        // 서버 읽기 전에 웹 캐시부터 확인
        if (courseCache[trimCid]) {
            return courseCache[trimCid];
        }
        // !탐색부
        try {
            const courseDocRef = doc(db, "courses", trimCid);
            const docSnap = await getDoc(courseDocRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const res = { 
                    cid: docSnap.id,
                    cname: data.name,
                    ctype: data.metadata.category,
                    credit: data.metadata.credits
                };
                courseCache[trimCid] = res;
                return res;
            } else {
                console.log("해당 과목 정보가 DB에 존재하지 않습니다.");
                return null;
            }
        } catch (error) {
            console.error("과목 조회 에러: ", error);
            return null;
        }
    }, []);

    // const handleUpdateRow: 개별 수강이력 업데이트 처리자 (cid 자동 검색 포함)
    const handleUpdateRow = useCallback(async (index, field, value) => {
        // 락
        if (isUpdating.current) { return; }        
        // 동기 처리 (async 계열을 사용하지 않는 요소들)
        if (field !== "cid") {
            setLocalCourses(prev => {
                const next = [...prev];
                next[index] = { ...next[index], [field]: value };
                return next;
            });
            return;
        }
        // !cid 변경하는 경우 초기화 수행. (비동기 검색 준비)
        const trimCid = value.trim();
        try {
            if (!trimCid) {
                setLocalCourses(prev => {
                    const next = [...prev];
                    next[index] = { ...next[index], cid: "", cname: "", credit: 0 };
                    return next;
                });
                return;
            }
            // !중복 체크 
            const isDup = localCourses.some((cs, idx) => idx !== index && cs.cid === trimCid);
            if (isDup) {
                alert('학기 내 중복된 과목 코드입니다!');
                return;
            }
            // !재수강 판단
            const isRetake = userCourse.find(cs => cs.cid === trimCid && cs.taken !== activeTaken);
            let retakeFl = false;
            if (isRetake) {
                if (window.confirm(`[${isRetake.cname}] 수강 기록이 존재합니다. 재수강 등록하시겠습니까?`)) {
                    retakeFl = true;
                } else {
                    // 취소 시 init으로 돌림
                    setLocalCourses(prev => {
                        const next = [...prev];
                        next[index] = {...next[index], cid: "", cname: "", retake: false };
                        return next;
                    });
                    return;
                }
            }
            // !비동기 처리 (fetchCourseInfo: DB 탐색)
            const found = await fetchCourseInfo(trimCid);
            setLocalCourses(prev => {
                const next = [...prev];
                // 자동 검색 부분 (!!isRetake 확인할 것)
                if (found) {
                    next[index] = { ...next[index], ...found, retake: retakeFl, fromDB: true };
                } else {
                    // 자율 입력 허용. (검색실패)
                    next[index] = { ...next[index], cid: trimCid, retake: retakeFl, fromDB: false };
                }
                return next;
            }); 
        } catch (error) {
            console.error("갱신오류: " , error);
        } finally {
            isUpdating.current = false;
        }
    }, [fetchCourseInfo, activeTaken, userCourse, localCourses]);

    // const handleAddRow: 수강이력 추가 기능
    const handleAddRow = () => {
        if (!activeTaken) {
            alert("학기 입력을 먼저 완료해주세요."); 
            return;
        }
        setLocalCourses([...localCourses, { 
            cid: "", cname: "", ctype: "자선", credit: 3, grade: "A+", 
            taken: activeTaken, retake: false 
        }]);
    };
    // const handleDeleteRow: 수강이력 삭제 기능
    const handleDeleteRow = (index) => {
        setLocalCourses(prev => prev.filter((_, i) => i !== index));
    };

    // const handleApplyTaken: 학기키(taken) 변경 버튼 핸들러
    const handleApplyTaken = () => {
        const newTaken = `${inputYear}-${inputTerm}`;
        const newSortKey = parseInt(inputYear) * 100 + termWeight[inputTerm];

        if (newTaken === activeTaken) return;
        // !중복 체크
        const isDup = userSemester.some(sem => sem.taken === newTaken && sem.id !== targetSem.id);
        if (isDup) {
            alert(`이미 [${newTaken}] 학기 정보가 존재합니다.`);
            return;
        }
        // !시간 순서 체크
        const isInvalid = userSemester.some(sem => {
            if (sem.id === targetSem.id || sem.termType !== targetSem.termType) {
                return false;
            }
            if (targetSem.term > sem.term && newSortKey <= sem.sortKey) {
                return true;
            }
            if (targetSem.term < sem.term && newSortKey >= sem.sortKey) {
                return true;
            }

            return false;
        })
        if (isInvalid) {
            alert('학기 순서가 올바르지 않습니다.');
            return;
        }
        
        if (window.confirm(`학기를 [${newTaken}]으로 변경하시겠습니까?`)) {
            setActiveTaken(newTaken);
        }
    };

    // 실제 저장 (+ 유효성 검사)
    const handleSave = async () => {
        // 예외
        if (!activeTaken) return alert("학기 적용을 먼저 완료해주세요.");
        if (!user) return;
        // !유효성 검사 (순회식)
        for (let i = 0; i < localCourses.length; i++) {
            const { cid, cname, credit } = localCourses[i];
            if (!cid?.trim() || !cname?.trim() || !credit) {
                return alert(`${i + 1}번째 과목의 정보를 모두 입력해주세요.`);
            }
        }

        try {
            const batch = writeBatch(db);
            const uid = user.uid;
            // sortKey 생성
            const takenSplit = activeTaken.split('-');
            const sortKey = parseInt(takenSplit[0]) * 100 + termWeight[takenSplit[1]];
            // 학기 정보 처리 부분
            let curSemId = targetSem.id;
            // 신규학기 여부에 따른 분기 (T: 신규학기 / F: 기존학기)
            if (!curSemId) {
                const semRef = doc(collection(db, "users", uid, "userSemester"));
                curSemId = semRef.id;
                batch.set(semRef, {
                    id: curSemId,
                    termType: targetSem.termType,
                    term: targetSem.term,
                    taken: activeTaken,
                    sortKey: sortKey
                });

                const isRegular = (targetSem.termType === 0);
                const profileRef = doc(db, "users", uid);
                batch.update(profileRef, isRegular ? {term: targetSem.term } : { nterm: targetSem.term });

            } else if (activeTaken !== targetSem.taken) {
                const semRef = doc(db, "users", uid, "userSemester", curSemId);
                batch.update(semRef, { taken: activeTaken, sortKey: sortKey });
            }

            // 기존 과목 삭제
            const oldCoursesQuery = query(
                collection(db, "users", uid, "userCourse"), 
                where("taken", "==", targetSem.taken)
            );
            const oldSnap = await getDocs(oldCoursesQuery);
            oldSnap.forEach(d => batch.delete(d.ref));

            // 새로운 과목 리스트 추가
            localCourses.forEach(course => {
                const newCourseRef = doc(collection(db, "users", uid, "userCourse"));
                batch.set(newCourseRef, { ...course, id: newCourseRef.id, taken: activeTaken });
            });

            await batch.commit();
            onClose();

        } catch (error) {
            console.error("저장 실패:", error);
            alert("저장 중 오류가 발생했습니다.");
        }
    };
    

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="cp-container border-r" onClick={e => e.stopPropagation()}>
                <header className="cp-header">
                    <h3>수강이력 편집</h3>
                    {!activeTaken && <p className="warning-text">연도와 학기를 설정하고 '적용'을 눌러주세요.</p>}
                    
                    <div className="taken-selector">
                        <div className="selector-group">
                            <input 
                                type="number" 
                                className="dark-input input-year" 
                                value={inputYear} 
                                onChange={e => setInputYear(e.target.value)} 
                            />
                            <span>년</span>
                            <select 
                                className="dark-select select-term" 
                                value={inputTerm} 
                                onChange={e => setInputTerm(e.target.value)}
                            >
                                {targetSem.termType === 0 ? (
                                    <><option value="1">1학기</option>
                                    <option value="2">2학기</option></>
                                ) : (
                                    <><option value="S">여름</option>
                                    <option value="W">겨울</option></>
                                )}
                            </select>
                            <button className="apply-btn" onClick={handleApplyTaken}>적용</button>
                        </div>
                        <div className="active-badge">
                            <b>{activeTaken || "미지정"}</b>
                        </div>
                    </div>
                </header>

                <div className="modal-body">
                    <div className="table-header">
                        <span className="col-cid">과목코드</span>
                        <span className="col-name">과목명</span>
                        <span className="col-credit">학점</span>
                        <span className="col-grade">성적</span>
                        <span className="col-del"></span>
                    </div>      
                    {localCourses.map((course, idx) => (
                        <CourseEntity 
                            key={course.cid || idx} // cid가 없을 땐 idx를 키로 활용
                            index={idx} 
                            course={course} 
                            onUpdate={handleUpdateRow} 
                            onDelete={handleDeleteRow}
                            grades={grades}
                            ctypes={ctypes}
                        />
                    ))}
                    <button className="add-btn" onClick={handleAddRow}>
                        + 과목 추가
                    </button>
                </div>

                <footer className="modal-footer">
                    <button className="save-btn" onClick={handleSave}>저장</button>
                    <button className="cancel-btn" onClick={onClose}>취소</button>
                </footer>
            </div>
        </div>
    );
};

export default CoursePopup;