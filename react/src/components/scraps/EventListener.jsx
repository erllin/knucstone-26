import React, { useSyncExternalStore } from "react";

// function useLoadProfile(): 이벤트 리스너. 학적 갱신 발생하면, 로컬 스토리지에서 학적을 불러옴.
function useLoadProfile() {
    const profileData = useSyncExternalStore(
        (callback) => {
            window.addEventListener("profileUpdate", callback);
            return () => window.removeEventListener("profileUpdate", callback);
        },
        () => {
            return localStorage.getItem('userProfile');
        }
    );
    // 혹시 몰라서, false값 만듦
    return profileData ? JSON.parse(profileData) : {
        university: "",
        department: "",
        admission: 9999,
        majortype: 0,
        class: 0,
        semester: 0
    };
};

export default useLoadProfile;