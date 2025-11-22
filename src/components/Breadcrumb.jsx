// đường dẫn trang 


import React from 'react';
import { Link } from 'react-router-dom';

const Crumb = ({ to, children, last }) => (
  <span className="page-trail__segment">
    {!last && <></>}
    {last ? (
      <span className="page-trail__current">{children}</span>
    ) : (
      <Link to={to} className="page-trail__link">
        {children}
      </Link>
    )}
  </span>
);

const AdminBreadcrumb = ({ items = [] }) => {
  if (!items.length) return null;
  return (
    <nav className="page-trail" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <Crumb key={item.path || index} to={item.path} last={index === items.length - 1}>
          {item.label}
        </Crumb>
      ))}
    </nav>
  );
};

export default AdminBreadcrumb;

