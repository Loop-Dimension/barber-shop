import React, { useState, useEffect } from "react";

export default function Progress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Simulate progress (You can replace this with actual logic)
        const interval = setInterval(() => {
            setProgress(prev => (prev >= 100 ? 0 : prev + 5));
        }, 500);

        return () => clearInterval(interval);
    }, []);

    const radius = 49; // Radius of the circle
    const circumference = 2 * Math.PI * radius; // Calculate the circumference
    const offset = circumference - (progress / 100) * circumference; // Calculate offset

    return (
        <div className="progress-wrap cursor-pointer" style={{ width: "120px", height: "120px", position: "relative" }}>
            <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="0 0 102 102">
                {/* Background Circle */}
                <circle cx="50" cy="50" r={radius} stroke="#ddd" strokeWidth="4" fill="none" />
                {/* Animated Progress Circle */}
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="#3498db"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
            </svg>
            {/* Progress Percentage Text */}
            <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "18px",
                fontWeight: "bold",
                color: "#3498db"
            }}>
                {progress}%
            </div>
        </div>
    );
}
