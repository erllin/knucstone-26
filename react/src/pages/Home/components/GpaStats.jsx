import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import useStats from "../../../components/useStats";

import "../Home.css";
import "./GpaStats.css"
import "../../../components/FontAwesome";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// const GpaEntity({title, score, total, colorClass}): (개별)평점 엔티티.
/* const GpaEntity
    @title: 평점 타이틀 (종합, 전공, 전공외.)
    @score: 기록 평점
    @maximum: 최대 학점 (4.5가 일반적이긴 하나, 일부 학교는 다른 체계일수도.)
    @colorClass: 컬러
*/
const GpaEntity = ({ title, score, maximum = 4.5, colorClass }) => {
  // 프로그레스 바를 위한 연산-2
  const scoreToNum = Number(score) || 0;
  const percentage = Math.min((scoreToNum / maximum) * 100, 100);

  return (
    <div className="gpa-item">
      <span className="gpa-title">{title}</span>
      
      <div className="gpa-values">
        <span className="gpa-score">{scoreToNum.toFixed(2)}</span>
        <span className="gpa-total-score">/ {maximum}</span>
      </div>
      {/* 프로그레스바-2 */}
      <div className="gpa-progress-bg">
        <div 
          className={`gpa-progress-fill ${colorClass}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const GpaStats = () => {
    // 리스트 열림/닫힘 상태 관리
    const { generalStats, semesterStats } = useStats();
    const [isOpen, setIsOpen] = useState(false);

    // 정규 학기만(filter), 최대 최신 5학기 표현됨.
    const displayData = React.useMemo(() => {
        if (!semesterStats) { return []; }
        return semesterStats
            .filter(sem => sem.termType === 0)
            .slice(-5)
            .map(sem => ({
                ...sem,
                general: Number(sem.gpa.major),
                major: Number(sem.gpa.major),
                other: Number(sem.gpa.other)
            }));
    }, [semesterStats]);

    // 성적 데이터가 있는지?
    const hasData = displayData.length > 0;

    const termDivider = (term) => {
        if (term >= 0) {
            return `${parseInt(term/2)+1}-${(term%2)+1}`;
        }
        return 'unknown';
    };


    return (
        <>
        {/* 성적: 전체 성적, 상세 성적으로 나뉨 (추후 JSON에 맞게 처리해야함.) */}
        <section className="gpa border-r con-theme">
            {/* 전체 성적: 항상 보여야 하는 곳. */}
            <div className="gpa-summary">
                <GpaEntity title="종합 평점" score={generalStats.gpa.general} colorClass="bg-total" />
                <GpaEntity title="전공 평점" score={generalStats.gpa.major} colorClass="bg-major" />
                <GpaEntity title="전공외 평점" score={generalStats.gpa.other} colorClass="bg-else" />
            </div>

            {/* 상세 성적: 버튼을 눌러서 확장해 볼 수 있는 곳.  */}
            <div className="gpa-expanded-content">
                <button 
                    onClick={() => setIsOpen(!isOpen)} 
                    className={`gpa-toggle-btn ${isOpen ? "active" : ""}`}
                >
                    <FontAwesomeIcon className={`caret-icon ${isOpen ? "rotate-180" : ""}`} icon="caret-down" />
                </button>

                {isOpen && (
                <div className="semester-table-wrapper">
                    {/* !성적 그래프, google.ai로 생성함. */}
                    {/* 데이터 없을 때 예외 처리할 곳 */}
                    {!hasData ? (
                        <div className="no-data-message">
                            <FontAwesomeIcon icon="exclamation-circle" size="2x" />
                            <p>등록된 학기별 성적 데이터가 없습니다.</p>
                        </div>
                    ) : (
                    <>
                    <div className="chart-container">
                        <h4 className="chart-title">성적 추이</h4>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={displayData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="term" tickFormatter={termDivider} stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} />
                                <YAxis domain={[0, 4.5]} stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} />
                                <Tooltip 
                                    labelFormatter={termDivider}
                                    contentStyle={{ backgroundColor: '#222', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Legend verticalAlign="top" height={36}/>

                                <Line type="monotone" dataKey="general" name="종합" 
                                    stroke="#f1c40f" strokeWidth={3} dot={{ r: 5 }} 
                                    activeDot={{ r: 8 }} 
                                />
                                <Line type="monotone" dataKey="major" name="전공"  
                                    stroke="#74b9ff" strokeWidth={2} 
                                />
                                <Line type="monotone" dataKey="other" name="전공외" 
                                    stroke="#fab1a0" strokeWidth={2} strokeDasharray="5 5" 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    {/* 성적 테이블 */}
                    <table className="semester-table">
                        <thead>
                            <tr>
                            <th>학기</th>
                            <th>종합</th>
                            <th>전공</th>
                            <th>전공외</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayData.map((data) => (
                            <tr key={data.id}>
                                <td className="term-name">{termDivider(data.term)}</td>
                                <td className="score-cell">{data.general.toFixed(2)}</td>
                                <td className="score-cell">{data.major.toFixed(2)}</td>
                                <td className="score-cell">{data.general.toFixed(2)}</td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                    </>
                        
                    )}
                </div>
                )}
            </div>
        </section>
        </>
    );
};

export default GpaStats;