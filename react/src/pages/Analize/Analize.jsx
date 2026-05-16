import React, { useState, useEffect, useMemo } from "react";
import { useUser } from "../../components/UserProvider"
// CSS
import "../../components/skins/options.css";
import "./Analize.css";

const Analize = () => {

    return (
        <div className="page main-theme">
            <header className="header">
                <div className="header-top">
                    <div className="ct-wrapper">
                        {/* 헤더>로고 */}
                        <div className="logo">MYCURRI</div>
                        {/* 헤더>메뉴:  추후 logo 위치 우측면으로 밀 예정. */}
                        <nav className="menu">
                            분석
                        </nav>
                    </div>
                </div>
            </header>
            <main className="ct">
                <div className="ct-wrapper">
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