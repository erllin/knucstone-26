import React, { useState } from 'react';

import "../../../components/FontAwesome";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import "../Home.css"
import "./RequirementList.css"

const RequirementList = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // 로컬 스토리지와 연동될 초기 데이터 상태
  const [requirements, setRequirements] = useState([
    { id: 1, title: '요건 I', detail: '전공 자격증 1개 이상 이수', isDone: true },
    { id: 2, title: '요건 II', detail: '토익 800점 이상 또는 오픽 IH', isDone: false },
    { id: 3, title: '요건 III', detail: '캡스톤 디자인 졸업 논문 통과', isDone: false },
  ]);

  // 스위치 토글 함수
  const toggleRequirement = (id) => {
    setRequirements(requirements.map(req => 
      req.id === id ? { ...req, isDone: !req.isDone } : req
    ));
  };

  return (
    <section className="reqm-container con-theme border-r">
        <div className="reqm-header" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <div className="reqm-tags">
                {requirements.map(req => (
                <div key={req.id} className={`reqm-tag ${req.isDone ? 'done' : 'pending'}`}>
                    <span className="tag-title">{req.title}</span>
                    <FontAwesomeIcon icon={req.isDone ? "check-circle" : "times-circle"} className="tag-icon" />
                </div>
                ))}
            </div>

            {/* 확장 버튼 */}
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="reqm-toggle-btn"
                style={{ marginLeft: '15px', flexShrink: 0 }}
            >
                <FontAwesomeIcon icon="caret-down" className={`caret-icon ${isOpen ? 'rotate' : ''}`} />
            </button>
      </div>

      {/* 리스트 및 상세 내용 */}
      {isOpen && (
        <div className="reqm-expanded-list">
          {requirements.map((req, idx) => (
            <div key={req.id} className="reqm-list-item">
              <div className="reqm-item-info">
                <div className="reqm-item-top">
                  <span className="reqm-item-title">{req.title}</span>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={req.isDone} 
                      onChange={() => toggleRequirement(req.id)} 
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
                <p className="reqm-item-detail">- {req.detail}</p>
              </div>
              {idx !== requirements.length - 1 && <hr className="reqm-divider" />}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default RequirementList;