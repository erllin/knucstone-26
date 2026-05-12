import useStats from "../../../components/useStats";

import "../Home.css";
import "./CreditStats.css";

// const CreditEntity({title, current, total, colorClass}): (개별)이수학점 엔티티.
/* const CreditEntity({@param}) 
    @title: 이수학점 타이틀(종합, 전필, 전선 같은 것.)
    @current: 실제 이수한 학점
    @total: 학칙상 요구되는 학점
    @colorClass: 컬러
*/
const CreditEntity = ({ title, current, total, colorClass }) => {
  // !가로형 프로그레스 바 타입 << google.ai가 제안함
  const percentage = Math.min((current / total) * 100, 100);

  return (
    <div className="credit-item">
      <span className="cr-title">{title}</span>
      <div className="cr-values">
        <span className="cr-current">{current}</span>
        <span className="cr-slash">/</span>
        <span className="cr-total">{total}</span>
      </div>
      {/* 프로그레스 바 */}
      <div className="cr-progress-bg">
        <div 
          className={`cr-progress-fill ${colorClass}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const CreditStats = () => {
    const { generalStats } = useStats();
  
    return (
        <>          
        {/* 메인>이수학점: 위의 CreditEntity 컴포넌트 참고, 임시로 값 넣음. (추후 JSON에 맞게 처리해야함.) */}
        <section className="credit border-r con-theme">
            <CreditEntity title="종합" current={generalStats.credit.general} total={130} colorClass="bg-main" />
            <CreditEntity title="전필" current={generalStats.credit.mRequire} total={30} colorClass="bg-major" />
            <CreditEntity title="전선" current={generalStats.credit.mElective} total={45} colorClass="bg-major" />
            <CreditEntity title="교양" current={generalStats.credit.liberal} total={35} colorClass="bg-lib" />
            <CreditEntity title="자선" current={generalStats.credit.free} total={20} colorClass="bg-free" />
        </section>
        </>
    );
};

export default CreditStats;