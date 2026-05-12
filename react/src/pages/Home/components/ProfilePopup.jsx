import React from "react";
import { useForm } from "react-hook-form";
// Context
import { useUser } from "../../../components/UserProvider";
// Icon
import "../../../components/FontAwesome";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import "../Home.css";
import "./ProfilePopup.css";

// 폼 에러메세지, 규약
const VALIDATION_RULES = {
  university: { required: "대학명을 입력해주세요." },
  department: { required: "학과를 입력해주세요." },
  admission: { 
    required: "입학년도를 입력해주세요.",
    min: { value: new Date().getFullYear() - 20, message: "연도를 확인해주세요." },
    max: { value: new Date().getFullYear(), message: "범위가 초과되었어요."},
    valueAsNumber: true 
  }
};

const ProfilePopup = ({ onClose }) => {
    const { userProfile, updateProfile } = useUser();

    // 폼 설정
    const { 
        register, 
        handleSubmit, 
        formState: { errors } 
    } = useForm({
        // 기존 DB 값 불러오기
        defaultValues: userProfile || {
            university: "",
            department: "",
            admission: new Date().getFullYear(),
            majortype: 1
        }
    });

    // 저장 처리
    const onSubmit = async (data) => {
        try {
            // Firestore에 데이터 업데이트
            await updateProfile(data);
            onClose();
        } catch (error) {
            console.error("프로필 저장 중 오류 발생:", error);
            alert("저장에 실패했습니다. 다시 시도해주세요.");
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content main-theme border-r" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>프로필 수정</h3>
                    <button className="close-btn" onClick={onClose}>
                        <FontAwesomeIcon icon="xmark" />
                    </button>
                </div>

                <form className="modal-form" onSubmit={handleSubmit(onSubmit)}>
                    <label>대학명</label>
                    <input 
                        {...register("university", VALIDATION_RULES.university)} 
                        className={errors.university ? "input-error" : ""}
                    />
                    {errors.university && <span className="error-msg">{errors.university.message}</span>}

                    <label>전공학과</label>
                    <input 
                        {...register("department", VALIDATION_RULES.department)}
                        className={errors.department ? "input-error" : ""} 
                    />
                    {errors.department && <span className="error-msg">{errors.department.message}</span>}

                    <div className="form-row">
                        <div>
                            <label>입학년도</label>
                            <input 
                                type="number"
                                {...register("admission", VALIDATION_RULES.admission)}
                                className={errors.admission ? "input-error" : ""}
                            />
                            {errors.admission && <span className="error-msg">{errors.admission.message}</span>}
                        </div>
                        <div>
                            <label>전공유형</label>
                            <select {...register("majortype", { valueAsNumber: true })}>
                                <option value={1}>단일전공</option>
                                <option value={2}>단일부전공</option>
                                <option value={3}>복합부전공</option>
                                <option value={4}>복수전공</option>
                            </select>
                        </div>
                    </div>
                    
                    <button type="submit" className="save-btn">저장하기</button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePopup;