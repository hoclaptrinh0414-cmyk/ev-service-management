import React from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";

const BlogPost = () => {
  const { postId } = useParams();

  return (
    <MainLayout>
      <div className="container py-5">
        <h1 className="fw-bold">Blog Post</h1>
        <p>This is the page for blog post with ID: {postId}</p>
        <p>
          Currently, this is a placeholder. Content for each blog post will be
          added here.
        </p>
      </div>
    </MainLayout>
  );
};

export default BlogPost;
