import React from "react";
import useStats from "../../../components/useStats";

import "./StatLog.css";
import "../Class.css";

const StatLog = () => {
    const { generalStats } = useStats();

    return (
        <div className="cls-sum border-r con-theme stat-ct">
            <h3>전체 성적 통계</h3>
            <div className="stat-grid">
                <div className="stat-card">
                    <h4>평점 요약</h4>
                    <p>전체: <strong>{generalStats.gpa.general}</strong></p>
                    <p>전공: {generalStats.gpa.major} / 전공외: {generalStats.gpa.other}</p>
                </div>
                <div className="stat-card">
                    <h4>이수 학점</h4>
                    <p>총 합계: <b>{generalStats.credit.general}</b></p>
                    <p>전필: {generalStats.credit.mRequire} | 전선: {generalStats.credit.mElective}</p>
                    <p>교양: {generalStats.credit.liberal} | 자선: {generalStats.credit.free}</p>
                </div>
            </div>
        </div>
    );
}

export default StatLog;