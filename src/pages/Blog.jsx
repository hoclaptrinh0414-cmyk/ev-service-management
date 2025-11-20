import React from "react";
import "./Blog.css";

const Blog = () => {
  return (
    <div className="blog-page container py-5">
      <div className="text-center mb-4">
        <h1 className="fw-bold">Blog</h1>
        <p className="text-muted">
          Tin tức và mẹo chăm sóc xe sẽ sớm được cập nhật tại đây.
        </p>
      </div>

      <div className="blog-placeholder card shadow-sm">
        <div className="card-body text-center">
          <p className="mb-3">
            Nội dung đang được biên soạn. Vui lòng quay lại sau.
          </p>
          <a className="btn btn-primary" href="/services">
            Quay về dịch vụ
          </a>
        </div>
      </div>
    </div>
  );
};

export default Blog;
