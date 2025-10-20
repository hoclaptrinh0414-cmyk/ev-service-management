import React from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from './ui/breadcrumb';
import { Link } from 'react-router-dom';

const AdminBreadcrumb = ({ items }) => {
  if (!items || !items.length) return null;
  return (
    <Breadcrumb>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <BreadcrumbItem key={item.path || idx}>
            {idx > 0 && <BreadcrumbSeparator />}
            {isLast ? (
              <BreadcrumbPage>{item.label}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild>
                <Link to={item.path}>{item.label}</Link>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
};

export default AdminBreadcrumb;

