import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./BottomNav.css";
import "./FontAwesome";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const BottomNav = () => {
    const location = useLocation();
    const curPath = location.pathname;

    const isActive = (path) => (curPath === path ? "active" : "inactive");
    return (
        <nav className="bn-wrapper">
            <div>
                <Link to="/home">
                    <FontAwesomeIcon icon="house" className={isActive("/home")}/>
                </Link>
            </div>
            <div>
                <Link to="/class">
                    <FontAwesomeIcon icon="calendar" className={isActive("/class")}/>
                </Link>
            </div>
            <div>
                <Link to="/analize">
                    <FontAwesomeIcon icon="address-card" className={isActive("/analize")}/>
                </Link>
            </div>
            <div>
                <Link to="/setting">
                    <FontAwesomeIcon icon="gear" className={isActive("/setting")}/>
                </Link>
            </div>
        </nav>
    );
};

export default BottomNav;