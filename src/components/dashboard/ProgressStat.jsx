// Thanh ngang có màu -> Tỷ lệ % hoàn thành


import React from "react";

const ProgressStat = ({ label, value = 70, color = "#000" }) => {
  return (
    <div>
      <div className="d-flex justify-content-between mb-1">
        <small className="text-muted">{label}</small>
        <small className="fw-semibold">{value}%</small>
      </div>
      <div className="progress" style={{ height: 6 }}>
        <div
          className="progress-bar"
          role="progressbar"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

export default ProgressStat;
