// Nhãn nhỏ có mũi tên -> % tăng/giảm



import React from "react";

const TrendBadge = ({ value = "+5%", type = "up" }) => {
  const isUp = type !== "down";
  const color = isUp ? "#198754" : "#dc3545";
  const icon = isUp ? "bi bi-arrow-up-right" : "bi bi-arrow-down-right";
  return (
    <span
      className="badge rounded-pill"
      style={{ backgroundColor: color + "20", color, fontWeight: 600 }}
    >
      <i className={`${icon} me-1`}></i>
      {value}
    </span>
  );
};

export default TrendBadge;
