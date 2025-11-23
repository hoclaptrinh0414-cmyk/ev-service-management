import React from "react";
import { Link } from "react-router-dom";
import "./Blog.css";
import MainLayout from "../components/layout/MainLayout";

const blogPosts = [
  {
    id: 1,
    title: "10 Mẹo Bảo Dưỡng Xe Hơi Thiết Yếu Cho Mọi Tài Xế",
    excerpt:
      "Để chiếc xe của bạn luôn bền bỉ và vận hành trơn tru trên mọi nẻo đường, việc bảo dưỡng định kỳ là vô cùng quan trọng. Bài viết này sẽ chia sẻ 10 mẹo bảo dưỡng đơn giản nhưng hiệu quả mà mọi tài xế nên biết, từ kiểm tra dầu nhớt, áp suất lốp cho đến hệ thống phanh và đèn chiếu sáng, giúp bạn tiết kiệm chi phí sửa chữa và đảm bảo an toàn khi lái xe.",
    author: "Admin",
    date: "22 Tháng 11, 2025",
    imageUrl: "https://placehold.co/800x450/007bff/white?text=Car+Maintenance+Tips",
    featured: true,
    category: "Bảo dưỡng",
  },
  {
    id: 2,
    title: "Khi Nào Bạn Nên Thay Lốp Xe? Hướng Dẫn Toàn Diện",
    excerpt:
      "Lốp xe là bộ phận tiếp xúc trực tiếp với mặt đường, đóng vai trò then chốt trong sự an toàn và hiệu suất vận hành. Đừng đợi đến khi lốp mòn hoàn toàn mới thay. Hướng dẫn chi tiết này sẽ giúp bạn nhận biết các dấu hiệu cảnh báo, từ độ sâu gai lốp, các vết nứt, phồng rộp cho đến tuổi thọ của lốp, để bạn có thể đưa ra quyết định thay lốp kịp thời, đảm bảo an toàn cho bản thân và những người xung quanh.",
    author: "Admin",
    date: "20 Tháng 11, 2025",
    imageUrl: "https://placehold.co/400x250/28a745/white?text=Tire+Replacement",
    category: "Lốp xe",
  },
  {
    id: 3,
    title: "Tầm Quan Trọng Của Việc Thay Dầu Nhớt Định Kỳ",
    excerpt:
      "Dầu nhớt được ví như 'máu' của động cơ, giúp bôi trơn, làm mát và làm sạch các bộ phận bên trong. Việc thay dầu nhớt định kỳ không chỉ giúp kéo dài tuổi thọ động cơ mà còn cải thiện hiệu suất nhiên liệu và giảm thiểu khí thải. Bài viết này sẽ giải thích tại sao bạn nên tuân thủ lịch thay dầu nhớt của nhà sản xuất, những loại dầu nhớt phù hợp và cách tự kiểm tra mức dầu tại nhà.",
    author: "Admin",
    date: "18 Tháng 11, 2025",
    imageUrl: "https://placehold.co/400x250/ffc107/black?text=Oil+Change+Importance",
    category: "Bảo dưỡng",
  },
  {
    id: 4,
    title: "Hiểu Về Hệ Thống Phanh Của Xe Bạn",
    excerpt:
      "Hệ thống phanh là tính năng an toàn quan trọng nhất trên xe hơi của bạn. Việc hiểu rõ cách thức hoạt động của hệ thống phanh, các thành phần chính như má phanh, đĩa phanh, dầu phanh và cách nhận biết các dấu hiệu hư hỏng sớm có thể cứu sống bạn. Chúng tôi sẽ phân tích chi tiết các vấn đề thường gặp và khi nào bạn cần đưa xe đi kiểm tra phanh.",
    author: "Admin",
    date: "15 Tháng 11, 2025",
    imageUrl: "https://placehold.co/400x250/dc3545/white?text=Brake+System+Explained",
    category: "An toàn",
  },
  {
    id: 5,
    title: "Mẹo Giữ Gìn Nội Thất Xe Luôn Sạch Đẹp",
    excerpt:
      "Nội thất xe hơi không chỉ là không gian bạn sử dụng hàng ngày mà còn phản ánh phong cách của chủ xe. Giữ gìn nội thất sạch đẹp không chỉ mang lại cảm giác thoải mái mà còn giúp duy trì giá trị của chiếc xe. Bài viết này sẽ cung cấp những mẹo hữu ích để làm sạch và bảo dưỡng các loại vật liệu nội thất khác nhau, từ da, nỉ cho đến nhựa và cao su.",
    author: "Admin",
    date: "10 Tháng 11, 2025",
    imageUrl: "https://placehold.co/400x250/6c757d/white?text=Car+Interior+Care",
    category: "Chăm sóc xe",
  },
  {
    id: 6,
    title: "Công Nghệ Xe Điện: Xu Hướng Tương Lai",
    excerpt:
      "Xe điện đang dần trở thành xu hướng chủ đạo trong ngành công nghiệp ô tô toàn cầu. Với những ưu điểm vượt trội về môi trường, chi phí vận hành và hiệu suất, xe điện hứa hẹn sẽ định hình lại cách chúng ta di chuyển. Khám phá những công nghệ tiên tiến nhất đang được áp dụng trên xe điện, từ pin, động cơ điện cho đến hệ thống sạc và tính năng tự lái.",
    author: "Admin",
    date: "05 Tháng 11, 2025",
    imageUrl: "https://placehold.co/400x250/17a2b8/white?text=EV+Technology",
    category: "Công nghệ",
  },
];

const Blog = () => {
  const featuredPost = blogPosts.find((post) => post.featured);
  const otherPosts = blogPosts.filter((post) => !post.featured);

  return (
    <MainLayout>
      <div className="blog-page">
        {/* Hero Section */}
        <div className="blog-hero text-white text-center py-5 mb-5">
          <div className="container">
            <h1 className="display-3 fw-bold mb-3 animate__animated animate__fadeInDown">
              Blog Tin Tức & Mẹo Vặt
            </h1>
            <p className="lead mb-4 animate__animated animate__fadeInUp">
              Cập nhật những thông tin mới nhất, phân tích chuyên sâu và lời khuyên hữu ích về thế giới ô tô.
            </p>
            <div className="animate__animated animate__fadeInUp animate__delay-1s">
              <Link to="/services" className="btn btn-primary btn-lg me-2">
                Dịch Vụ Của Chúng Tôi <i className="bi bi-arrow-right"></i>
              </Link>
              <Link to="/blog/1" className="btn btn-outline-light btn-lg">
                Đọc Bài Nổi Bật <i className="bi bi-book"></i>
              </Link>
            </div>
          </div>
        </div>

        <div className="container py-4">
          {/* Featured Post Section */}
          {featuredPost && (
            <div className="featured-post-section mb-5 animate__animated animate__fadeIn">
              <h2 className="mb-4 text-center fw-bold">Bài Viết Nổi Bật</h2>
              <div className="card blog-featured-card shadow-lg border-0">
                <div className="row g-0">
                  <div className="col-md-7">
                    <img
                      src={featuredPost.imageUrl}
                      className="img-fluid h-100 object-cover rounded-start"
                      alt={featuredPost.title}
                    />
                  </div>
                  <div className="col-md-5 d-flex flex-column p-4">
                    <div className="card-body d-flex flex-column">
                      <span className="badge bg-primary text-uppercase mb-2 align-self-start">
                        {featuredPost.category}
                      </span>
                      <h3 className="card-title fw-bold mb-3">
                        {featuredPost.title}
                      </h3>
                      <p className="card-text text-muted flex-grow-1">
                        {featuredPost.excerpt}
                      </p>
                      <p className="card-text small text-muted">
                        Bởi <strong>{featuredPost.author}</strong> vào{" "}
                        {featuredPost.date}
                      </p>
                      <Link
                        to={`/blog/${featuredPost.id}`}
                        className="btn btn-dark mt-3 align-self-start"
                      >
                        Đọc thêm <i className="bi bi-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* All Posts Section */}
          <div className="all-posts-section">
            <h2 className="mb-4 text-center fw-bold animate__animated animate__fadeInUp">
              Tất Cả Bài Viết
            </h2>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {otherPosts.map((post) => (
                <div
                  key={post.id}
                  className="col animate__animated animate__fadeInUp"
                >
                  <div className="card h-100 blog-card shadow-sm border-0">
                    <img
                      src={post.imageUrl}
                      className="card-img-top object-cover"
                      alt={post.title}
                    />
                    <div className="card-body d-flex flex-column p-4">
                      <span className="badge bg-secondary text-uppercase mb-2 align-self-start">
                        {post.category}
                      </span>
                      <h5 className="card-title fw-bold">{post.title}</h5>
                      <p className="card-text text-muted flex-grow-1">
                        {post.excerpt}
                      </p>
                      <p className="card-text small text-muted">
                        Bởi <strong>{post.author}</strong> vào {post.date}
                      </p>
                      <Link
                        to={`/blog/${post.id}`}
                        className="btn btn-outline-dark mt-3 align-self-start"
                      >
                        Đọc thêm <i className="bi bi-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Blog;
