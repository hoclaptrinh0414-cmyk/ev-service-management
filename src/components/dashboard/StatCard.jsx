import React from "react";

const StatCard = ({
  title,
  value,
  trend,
  trendType = "positive",
  icon,
  children,
}) => {
  const trendClass = trendType === "negative" ? "text-danger" : "text-success";
  return (
    <div className="card stat-card">
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <h3 className="mb-2">{title}</h3>
          <div className="value">{value}</div>
          {trend && (
            <div
              className={`status ${trendType === "negative" ? "negative" : ""}`}
            >
              {trend}
            </div>
          )}
        </div>
        {icon && (
          <div className="ms-3" style={{ fontSize: 28 }}>
            <i className={icon}></i>
          </div>
        )}
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
};

export default StatCard;
