import React, { useState } from "react";
// CSS
import "../../components/skins/options.css";
import "./Analize.css";

const FrameworkViewer = () => {
    // 예시 데이터 (실제로는 API나 부모 컴포넌트에서 가져옵니다)
    const tracks = [
        {
            track_no: 1,
            track_name: "웹 풀스택 개발",
            subjects: [
                { id: "CS101", name: "React 기초" },
                { id: "CS102", name: "Node.js 심화" }
            ],
            completion_goal: "현대적인 웹 어플리케이션 개발 역량 강화",
            target_occupations: ["프론트엔드 개발자", "백엔드 개발자", "풀스택 엔지니어"]
        },
        {
            track_no: 2,
            track_name: "데이터 분석",
            subjects: [
                { id: "DA201", name: "파이썬 통계" },
                { id: "DA202", name: "머신러닝 실무" }
            ],
            completion_goal: "데이터 기반 의사결정 및 모델링 능력 배양",
            target_occupations: ["데이터 분석가", "데이터 사이언티스트"]
        },
        {
            track_no: 3,
            track_name: "인공지능 및 빅데이터 분야",
            target_occupations: ["데이터 과학자", "빅데이터 분석가", "인공지능 전문가 등"],
            completion_goal: "데이터 수집 및 관리, 데이터 시각화, 빅데이터 분석 기술, 인공지능 및 머신러닝 관련 지식 및 응용 능력을 높일 수 있는 교과목을 이수한다.",
            subjects: [
                { level: 1, type: "전선", year: 1, semester: 2, id: "48400005", name: "인공지능수학" },
                { level: 1, type: "전선", year: 2, semester: 2, id: "48400016", name: "데이터분석프로그래밍" },
                { level: 1, type: "전선", year: 2, semester: 2, id: "48400022", name: "인공지능" },
                { level: 2, type: "전선", year: 3, semester: 1, id: "48400028", name: "컴퓨터그래픽스" },
                { level: 2, type: "전선", year: 3, semester: 1, id: "48400030", name: "기계학습" },
                { level: 2, type: "전선", year: 3, semester: 2, id: "48400039", name: "디지털영상처리" },
                { level: 2, type: "전선", year: 3, semester: 2, id: "48400038", name: "데이터베이스" },
                { level: 2, type: "전선", year: 3, semester: 2, id: "48400042", name: "컴퓨터애니메이션" },
                { level: 2, type: "전선", year: 3, semester: 2, id: "48400046", name: "인간컴퓨터상호작용" },
                { level: 3, type: "전선", year: 4, semester: 1, id: "48400048", name: "데이터베이스프로그래밍" },
                { level: 3, type: "전선", year: 4, semester: 1, id: "48400050", name: "컴퓨터비전" },
                { level: 3, type: "전선", year: 4, semester: 2, id: "48400060", name: "분산및병렬프로그래밍" },
                { level: 3, type: "전선", year: 4, semester: 2, id: "48400061", name: "자연어처리" }
            ]
    }
    ];

    const [selectedTrack, setSelectedTrack] = useState(tracks[0]);

    return (
        <div className="framework con-theme border-r">
            <h2>프레임워크</h2>
            <div className="fr-title border-r">
                <div className="fr-title-select">
                    {/* 트랙 선택 박스 */}
                    <select 
                        onChange={(e) => setSelectedTrack(tracks.find(t => t.track_no === Number(e.target.value)))}
                        value={selectedTrack.track_no}
                    >
                        {tracks.map(track => (
                            <option key={track.track_no} value={track.track_no}>
                                {track.track_name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 프레임워크 소속 교과목 리스트 */}
            <div className="fr-cslist border-r">
                <div className="subject-grid">
                    {selectedTrack.subjects.map((subject) => (
                        <div key={subject.id} className="subject-item">
                            <span className="sub-id">{subject.id}</span>
                            <span className="sub-name">{subject.name}</span>
                            <span className="sub-info">({subject.year}학년 {subject.semester}학기)</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 프레임워크 이수 목표 */}
            <div className="fr-goal border-r">
                <b>이수 목표</b>
                <p>{selectedTrack.completion_goal}</p>
            </div>

            {/* 프레임워크 진로 분야 */}
            <div className="fr-job border-r">
                <b>관련 직업</b>
                <div className="job-list">
                    {selectedTrack.target_occupations.map((job, index) => (
                        <span key={index} className="job-tag">{job}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};


const Analize = () => {

    return (
        <div className="page main-theme">
            <header className="header">
                <div className="header-top">
                    <div className="ct-wrapper">
                        {/* 헤더>로고 */}
                        <div className="logo">분석하기</div>
                        {/* 헤더>메뉴:  추후 logo 위치 우측면으로 밀 예정. */}
                        <nav className="menu">
                            <div className="edit-profile">나이트모드</div>
                            <div className="night-mode">설정</div>
                        </nav>
                    </div>
                </div>
            </header>
            <main className="ct">
                <div className="ct-wrapper">
                    {/* 프레임워크 확인하는 곳 */}
                    <FrameworkViewer />
                    {/* 다음학기 추천과목 제안 */}
                    <div className="analize-course con-theme border-r">
                        <h2 className="section-title">분석</h2>
                        
                        <div className="analize-content">
                            {/* 분석 요약 영역 */}
                            <div className="analize-summary">
                                <div className="summary-item">
                                    <span className="label">현재 이수율</span>
                                    <span className="value">65%</span>
                                </div>
                                <div className="summary-item">
                                    <span className="label">핵심 역량 달성</span>
                                    <span className="value">중급</span>
                                </div>
                            </div>

                            {/* 추천 과목 및 분석 실행 영역 */}
                            <div className="suggestion-container">
                                <div className="suggestion-header">
                                    <h5> 다음 학기 추천 교과목</h5>
                                    {/* 분석 실행 버튼 */}
                                    <button className="btn-analyze" onClick={() => alert('분석을 시작합니다.')}>
                                        AI 맞춤 분석 실행
                                    </button>
                                </div>
                                
                                <div className="suggestion-list">
                                    <div className="suggest-item">
                                        <span className="tag-rec">추천</span>
                                        <div className="suggest-info">
                                            <span className="name">기계학습</span>
                                            <span className="reason">인공지능 트랙 핵심 교과목</span>
                                        </div>
                                    </div>
                                    <div className="suggest-item">
                                        <span className="tag-rec">추천</span>
                                        <div className="suggest-info">
                                            <span className="name">데이터베이스</span>
                                            <span className="reason">데이터 분석 기초 역량 강화</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Analize;