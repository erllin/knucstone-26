import React from "react";
import useStats from "../../../components/useStats";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

import "./StatLog.css";
import "../Class.css";

// 차트 각 조각 색상 (다크 테마 톤앤매너)
const COLORS = ["#3b82f6", "#60a5fa", "#10b981", "#34d399", "#f59e0b", "#fbbf24", "#a855f7", "#6b7280"];

const StatLog = () => {
    const { generalStats } = useStats();

    // Recharts용 데이터 포맷 가공
    const rawChartData = [
        { name: "전필", value: generalStats.credit.mRequire },
        { name: "전선", value: generalStats.credit.mElective },
        { name: "기교", value: generalStats.credit.lBasic },
        { name: "균교", value: generalStats.credit.lBalance },
        { name: "글로컬", value: generalStats.credit.lGlocal },
        { name: "G-Share", value: generalStats.credit.lGShare },
        { name: "자선/기타", value: generalStats.credit.free },
    ];

    // 이수 학점이 0인 항목 필터링
    const chartData = rawChartData.filter(item => item.value > 0);

    return (
        <div className="border-r con-theme stat-ct">
            {/* 1. 제목을 맨 위 중앙으로 배치 */}
            <h3 className="stat-main-title">전체 성적 통계</h3>
            
            <div className="stat-grid">
                {/* 2. [좌측] 세부 이수 학점 분포 차트 (크게 배치) */}
                <div className="stat-chart-card">
                    <h4>세부 이수 학점 분포</h4>
                    {chartData.length > 0 ? (
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="40%" // 차트 중심을 살짝 왼쪽으로 밀어 우측 범례 공간 확보
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={75}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value) => [`${value}학점`]}
                                        contentStyle={{ 
                                            backgroundColor: "var(--inner-bg)", 
                                            borderColor: "var(--border-color)", 
                                            borderRadius: "8px", 
                                            color: "var(--text-bright)" 
                                        }}
                                    />
                                    {/* 범례를 우측 세로 정렬로 배치하여 넓어진 화면 활용 */}
                                    <Legend 
                                        layout="vertical" 
                                        align="right" 
                                        verticalAlign="middle"
                                        iconType="circle" 
                                        wrapperStyle={{ fontSize: "0.85rem", color: "var(--text-muted)" }} 
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="no-data">이수 학점 데이터가 없습니다.</div>
                    )}
                </div>

                {/* 3. [우측] 평점 및 학점 요약 텍스트 존 */}
                <div className="stat-text-zone">
                    <div className="stat-card">
                        <h4>평점 요약</h4>
                        <p>전체: <strong>{generalStats.gpa.general}</strong></p>
                        <p>전공: {generalStats.gpa.major} / 전공외: {generalStats.gpa.other}</p>
                    </div>
                    <div className="stat-card">
                        <h4>이수 학점</h4>
                        <p>총 합계: <b>{generalStats.credit.general}학점</b></p>
                        <p>전필: {generalStats.credit.mRequire} | 전선: {generalStats.credit.mElective}</p>
                        <p>교양: {generalStats.credit.liberal} | 자선: {generalStats.credit.free}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StatLog;