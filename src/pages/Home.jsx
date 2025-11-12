// src/pages/Home.jsx - UPDATED WITH USER MENU AND NOTIFICATIONS
import React from "react";
import { Link } from "react-router-dom";
import GlobalNavbar from "../components/GlobalNavbar";
import FancyButton from "../components/FancyButton";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./Home.css"; // Import CSS file

const Home = () => {
  return (
    <>
      <GlobalNavbar />

      {/* Carousel */}
      <div
        id="carouselExampleAutoplaying"
        className="carousel slide carousel-fade"
        data-bs-ride="carousel"
        data-bs-interval="10000"
      >
        <div className="carousel-inner">
          <div className="carousel-item active" data-bs-interval="10000">
            <img
              src="https://www.reuters.com/resizer/v2/O2JH3CKXTZMY5FRVALTHVZI3WA.jpg?auth=9e3d2c9df7e8afdba0b1fee35f6ef89db69c61827e0820130589ebafb75686d5&width=5588&quality=80"
              className="d-block w-100"
              alt="Tesla Model Y"
            />
          </div>
          <div className="carousel-item" data-bs-interval="10000">
            <img
              src="http://www.shop4tesla.com/cdn/shop/articles/1roadi_42f236a7-c4fe-465f-bc7b-1377b0ce2d66.png?v=1740472787"
              className="d-block w-100"
              alt="Tesla Model Y"
            />
          </div>
          <div className="carousel-item" data-bs-interval="10000">
            <img
              src="https://media-cldnry.s-nbcnews.com/image/upload/t_fit-1500w,f_auto,q_auto:best/rockcms/2025-02/250213-Cybertruck-aa-1045-dd55f3.jpg"
              className="d-block w-100"
              alt="Tesla Cybertruck"
            />
          </div>
        </div>
        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#carouselExampleAutoplaying"
          data-bs-slide="prev"
        >
          <span
            className="carousel-control-prev-icon"
            aria-hidden="true"
          ></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#carouselExampleAutoplaying"
          data-bs-slide="next"
        >
          <span
            className="carousel-control-next-icon"
            aria-hidden="true"
          ></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>
    </>
  );
};

export default Home;
