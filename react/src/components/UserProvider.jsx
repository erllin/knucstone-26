import React, { useState, useEffect, useContext, useCallback, useMemo, createContext } from "react";
import { auth, db, loginWithGoogle, logout } from "../firebase";
import { doc, setDoc, deleteDoc, getDoc, getDocs,
        query, where, collection, onSnapshot, writeBatch,
        documentId, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const UserContext = createContext();
// 교과목 검색 기록을 재사용하기 위한 캐시.
const courseCache = {}

export const UserProvider = ({ children }) => {
    // Firebase 로그인(인증, Auth) 관련 후크
    const [user, setUser] = useState(null);
    // 사용자의 정보를 담는 후크 (userProfile: 학적, userCourse: 수강이력, userSemester: 이수학기정보)
    const [userProfile, setUserProfile] = useState(null);
    const [userCourse, setUserCourse] = useState([]);
    const [userSemester, setUserSemester] = useState([]);
    // 트랙(프레임워크) 데이터
    const [tracks, setTracks] = useState([]);
    // 로딩 상태 관리
    const [loading, setLoading] = useState(true);
    
    // 트랙 로드
    useEffect(() => {
        const fetchTracks = async () => {
            try {
                const q = query(collection(db, "tracks"), orderBy(documentId()));
                const snap = await getDocs(q);
                setTracks(snap.docs.map(doc => ({
                    track_no: Number(doc.id),
                    ...doc.data()
                })).sort((a, b) => a.track_no - b.track_no));
            } catch (err) {
                console.error("트랙 로드 실패: ", err);
            }
        };
        fetchTracks();
    }, [])

    // 기본 데이터 로드
    useEffect(() => {
        let unsubProfile = null;
        let unsubCourse = null; 
        let unsubSemester = null;
        // const unsubscribeAuth: 유저 인증과 데이터 관측하는 부분 (실시간-동기)
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);

            // 이전 구독상태를 보유한 경우 해제처리.
            // !확실한 메모리 해제를 위해 코드를 변경함.
            if (unsubProfile) { unsubProfile(); unsubProfile = null; }
            if (unsubCourse) { unsubCourse(); unsubCourse = null; }
            if (unsubSemester) { unsubSemester(); unsubSemester = null; }
            
            // 로그인 상태 분기 (로그인 / 로그아웃)
            if (currentUser) {
                // 사용자의 계정 uid.
                const uid = currentUser.uid;

                // 사용자의 정보를 관측하도록 함. (순서대로 학적, 수강이력, 학기정보)
                // onSnapshot(doc(db, "COLLECTION", UID)) -> db 저장소의 COLLECTION 부분에 변동이 감지되면 다시 가져옴(fetch).
                unsubProfile = onSnapshot(doc(db, "users", uid), (sn) => {
                    if(sn.exists()) {
                        setUserProfile(sn.data());
                    }
                });
                unsubCourse = onSnapshot(collection(db, "users", uid, "userCourse"), (sn) => {
                    setUserCourse(sn.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                });
                unsubSemester = onSnapshot(collection(db, "users", uid, "userSemester"), (sn) => {
                    setUserSemester(sn.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                })

                setLoading(false);
                // 중복제거
            } else {
                // useState 초기화
                setUserProfile(null);
                setUserCourse([]);
                setUserSemester([]);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubProfile) { unsubProfile(); }
            if (unsubCourse) { unsubCourse(); }
            if (unsubSemester) { unsubSemester(); }
        };
    }, []);

    // updateProfile: 학사정보 업데이트 메소드 (UID 기반 업데이트)
    const updateProfile = useCallback(async (data) => {
        if (!user) { return; }
        await setDoc(doc(db, "users", user.uid), data, {merge: true});
    }, [user]);

    // !중복 수강 처리를 고려해서, 코드를 재작성해야할 것 같음.
    // addCourse: 수강 이력 추가/수정 메소드 (String(cs.cid)가 도큐먼트의 고유 ID)
    const addCourse = useCallback(async (cs) => {
        if (!user) { return; }
        await setDoc(doc(db, "users", user.uid, "userCourse", String(cs.cid)), cs);
    }, [user]);

    // deleteCourse: 낱개 수강 이력 삭제 메소드
    const deleteCourse = useCallback(async (cid) => {
        if (!user) { return; }
        try {
            await deleteDoc(doc(db, "users", user.uid, "userCourse", String(cid)));
        } catch (error) {
            console.error("과목 삭제 실패: ", error);
        }
    }, [user]);

    // addSemester: 학기 추가 메소드 (taken값 변동 가능성이 있으므로, 랜덤 ID 적용함.)
    const addSemester = useCallback(async (sem) => {
        if (!user) { return; }

        // 중복된 taken 값이 존재하는지 체크하는 부분
        const isDup = userSemester.some(s => s.taken === sem.taken);
        if (isDup) {
            console.error("학기 추가 실패: 중복된 학기가 존재합니다.");
            return;
        }

        const semesterRef = doc(collection(db, "users", user.uid, "userSemester"));
        await setDoc(semesterRef, { ...sem, id: semesterRef.id });
    }, [user, userSemester]);

    // updateSemesterTaken: 학기 업데이트 메소드 (taken값을 수정하는 업데이트)
    const updateSemesterTaken = useCallback(async (semId, taken) => {
        if (!user) { return; }
        if (userSemester.some(sem => sem.taken === taken)) {
            console.error("학기 변경 실패: 이미 존재하는 학기입니다.");
            return;
        }

        const uid = user.uid;
        const tSem = userSemester.find(sem => sem.id === semId);
        if (!tSem) { return; }
        const takenOld = tSem.taken;

        const semesterRef = doc(db, "users", uid, "userSemester", semId);
        await setDoc(semesterRef, { taken: taken }, { merge: true });

        // 하위 수강이력의 taken값 또한 업데이트 됨.
        const batch = writeBatch(db);
        const q = query(
            collection(db, "users", uid, "userCourse"),
            where("taken", "==", takenOld)
        );
        const snap = await getDocs(q);
        snap.forEach(doc => {
            batch.update(doc.ref, { taken: taken });
        });

        await batch.commit();
    }, [user, userSemester]);

    // deleteSemester: 학기 삭제 메소드 (순차적으로 제거하는 메소드, 하위 수강이력또한 삭제됨)
    const deleteSemester = useCallback(async (tType, tNum) => {
        if (!user) { return; }

        // 삭제할 학기
        const tSem = userSemester.find(sem => sem.termType === tType && sem.term === tNum)
        if (!tSem) {
            console.error("학기 삭제 실패: 해당 학기는 존재하지 않습니다.")
        }
        if (!window.confirm(`학기를 삭제하면, 학기에 소속된 모든 이력이 삭제됩니다.\n삭제하시겠습니까?`)) {
            return;
        }

        try {
            const uid = user.uid;
            const batch = writeBatch(db);

            const semesterRef = doc(db, "users", uid, "userSemester", tSem.id);
            batch.delete(semesterRef);

            // 쿼리 q 결과값으로 나타난 모든 수강이력 삭제. (연쇄삭제)
            const q = query(
                collection(db, "users", uid, "userCourse"),
                where("taken", "==", tSem.taken)
            );
            const snap = await getDocs(q);
            snap.forEach(doc => batch.delete(doc.ref));

            // commit
            await batch.commit();
        } catch (error) {
            console.error("학기 삭제 실패: 삭제 중 오류가 발생하였습니다. ", error);
        }
    }, [user, userSemester]);

    // fetchCourseInfo: 목표 교과목번호(cid)의 정보를 DB로부터 가져오는 메소드
    /* 
        @cid: 대상 교과목번호

        +) 위에 courseCache를 두어 불러온 이력이 있는 교과목번호를 서버로부터 다시 읽어오지 않도록 하였음.
    */
   const fetchCourseInfo = useCallback(async (cid) => {
        const trimCid = cid.trim();
        if (!trimCid) { return null; }
        // 캐시 부분에서 확인
        if (courseCache[trimCid]) {
            return courseCache[trimCid];
        }
        // +) 트랙 데이터에서 탐색을 시도해보는 것도 괜찮을 것 같다고 생각함. (학점을 트랙쪽에도 두는 경우..)
        // DB 쪽 탐색
        const docSnap = await getDoc(doc(db, "courses", trimCid));
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
            console.log("해당 과목 정보가 DB에 존재하지 않습니다.")
            return null;
        }
   }, [])

    const val = useMemo(() => ({
        user, userProfile, userCourse, userSemester, loading, tracks,
        loginWithGoogle, logout, updateProfile, addCourse, deleteCourse,
        addSemester, updateSemesterTaken, deleteSemester,
        fetchCourseInfo
    }), [
        user, userProfile, userCourse, userSemester, loading, tracks,
        updateProfile, addCourse, deleteCourse,
        addSemester, updateSemesterTaken, deleteSemester,
        fetchCourseInfo
    ])

    return (
        <UserContext.Provider value={val}>
            {!loading && children}
        </UserContext.Provider>
    )
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("UserProvider 사용 컴포넌트는 UserProvider 내부에 위치해야 함.");
    }

    return context;
};