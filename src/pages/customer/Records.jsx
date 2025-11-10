// src/pages/customer/Records.jsx
import React, { useEffect, useState } from "react";
import { Modal, Button, Form, ListGroup, Spinner } from "react-bootstrap";
import vehicleService from "../../services/vehicleService";
import workOrderService from "../../services/workOrderService";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Particles from "../../components/Particles";

const Records = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  const [showRateModal, setShowRateModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [rating, setRating] = useState({ overallRating: 0, feedback: "" });
  const [loadingRate, setLoadingRate] = useState(false);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailServices, setDetailServices] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Load vehicles
  useEffect(() => {
    const loadVehicles = async () => {
      setLoadingVehicles(true);
      try {
        const res = await vehicleService.getMyVehicles();
        const vehicleArray = Array.isArray(res?.data?.vehicles)
          ? res.data.vehicles
          : Array.isArray(res?.data)
          ? res.data
          : [];

        setVehicles(vehicleArray);
        if (vehicleArray.length > 0) {
          setSelectedVehicle(vehicleArray[0]);
        } else {
          toast.info("No vehicles registered");
        }
      } catch (err) {
        console.error("Load vehicles error:", err);
        toast.error("Failed to load vehicles");
      } finally {
        setLoadingVehicles(false);
      }
    };
    loadVehicles();
  }, []);

  // Load history when vehicleId changes
  useEffect(() => {
    if (!selectedVehicle?.vehicleId) return;

    const loadHistory = async () => {
      setLoading(true);
      setHistory([]);

      try {
        const res = await vehicleService.getVehicleHistory(selectedVehicle.vehicleId);
        const items = res?.data?.items || res?.data || [];
        const rawData = Array.isArray(items) ? items : [];

        const enrichedData = rawData.map((record, idx) => ({
          ...record,
          workOrderId: record.workOrderId,
          displayServices: record.workOrderId ? "View Details" : "N/A",
          canRate: !!record.workOrderId,
          status: record.status || "Completed",
          totalCost: record.totalCost || 0,
          maintenanceDate: record.maintenanceDate || record.completedAt,
          uniqueKey: `${record.workOrderId || "unknown"}-${idx}`,
        }));

        setHistory(enrichedData);
      } catch (err) {
        console.error("Load history error:", err);
        toast.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [selectedVehicle?.vehicleId]);

  // View work order details
  const handleViewDetails = async (record) => {
    if (!record.workOrderId) {
      toast.error("No work order ID");
      return;
    }

    setShowDetailModal(true);
    setLoadingDetail(true);
    setDetailServices([]);

    try {
      const detailRes = await workOrderService.getWorkOrderDetails(record.workOrderId);
      const services = Array.isArray(detailRes?.data?.services) ? detailRes.data.services : [];
      setDetailServices(services);
    } catch (err) {
      console.error("View details error:", err);
      toast.error("Failed to load services");
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Open rate modal
  const handleOpenRateModal = async (record) => {
    if (!record.workOrderId) {
      toast.error("Không thể đánh giá: Thiếu ID công việc");
      return;
    }

    try {
      const canRateRes = await workOrderService.canRateWorkOrder(record.workOrderId);
      const { canRate, reason } = canRateRes?.data || {};

      if (!canRate) {
        toast.warning(reason || "Không thể đánh giá vì chưa thực hiện dịch vụ này");
        return;
      }

      // Load service names
      const detailRes = await workOrderService.getWorkOrderDetails(record.workOrderId);
      const serviceNames = detailRes?.data?.services?.map((s) => s.serviceName).join(", ") || "Dịch vụ";

      // Set selected record with full info
      setSelectedRecord({
        ...record,
        displayServices: serviceNames,
      });
      setRating({ overallRating: 0, feedback: "" });
      setShowRateModal(true);
    } catch (err) {
      console.error("Rate open error:", err);
      toast.error("Không thể kiểm tra trạng thái đánh giá");
    }
  };

  // Submit rating
  const handleSubmit = async () => {
    if (rating.overallRating === 0)
      return toast.warning("Please select a rating");
    if (!selectedRecord?.workOrderId) return toast.error("Invalid work order");

    try {
      await workOrderService.submitRating(selectedRecord.workOrderId, {
        overallRating: rating.overallRating,
        serviceQuality: rating.overallRating,
        staffProfessionalism: rating.overallRating,
        facilityQuality: rating.overallRating,
        waitingTime: rating.overallRating,
        priceValue: rating.overallRating,
        communicationQuality: rating.overallRating,
        positiveFeedback: rating.feedback,
        negativeFeedback: "",
        wouldRecommend: rating.overallRating >= 4,
        wouldReturn: rating.overallRating >= 4,
      });

      toast.success("Thank you!");
      setShowRateModal(false);
      setHistory((prev) =>
        prev.map((h) =>
          h.workOrderId === selectedRecord.workOrderId
            ? { ...h, canRate: false }
            : h
        )
      );
    } catch (err) {
      console.error("Submit rating error:", err);
      toast.error("Failed to submit rating");
    }
  };

  return (
    <>
      <div className="records-particles-background">
        <Particles
          particleColors={["#000000", "#000000"]}
          particleCount={550}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      <div className="records-page">
        <div className="records-sidebar">
          <h5 className="fw-bold mb-3 text-center">MANAGE RECORDS</h5>
          <div className="vehicle-list mt-4">
            <h6 style={{ fontWeight: 700, marginBottom: "8px" }}>
              My Vehicles
            </h6>
            {loadingVehicles ? (
              <div className="text-center p-4">
                <Spinner animation="border" size="sm" /> Loading...
              </div>
            ) : vehicles.length === 0 ? (
              <div className="text-center text-muted p-4">
                <i className="bi bi-car-front" style={{ fontSize: "2rem", opacity: 0.5 }}></i>
                <p className="mt-2">No vehicles found</p>
              </div>
            ) : (
              vehicles.map((v) => (
                <div
                  key={v.vehicleId}
                  className={`vehicle-item ${selectedVehicle?.vehicleId === v.vehicleId ? "active" : ""}`}
                  onClick={() => {
                    setSelectedVehicle(v);
                    setHistory([]);
                  }}
                >
                  <strong>{v.licensePlate || "Unknown"}</strong>
                  <br />
                  <small className="text-muted">ID: {v.vehicleId}</small>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="records-content">
          <div className="content-section">
            <h1 className="section-title">Maintenance Records</h1>

            {loading ? (
              <div className="text-center p-5">
                <Spinner animation="border" /> Loading...
              </div>
            ) : history.length === 0 ? (
              <div className="text-center text-muted p-5">
                <i className="bi bi-inbox" style={{ fontSize: "3.5rem", opacity: 0.5 }}></i>
                <p className="mt-3 fw-bold">No maintenance history found</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th>#</th>
                      <th>DATE</th>
                      <th>SERVICE</th>
                      <th>STATUS</th>
                      <th>COST</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item, index) => (
                      <tr key={item.uniqueKey}>
                        <td>{index + 1}</td>
                        <td>{item.maintenanceDate ? new Date(item.maintenanceDate).toLocaleDateString() : "N/A"}</td>
                        <td
                          className="service-cell text-primary fw-bold"
                          style={{
                            cursor: item.canRate ? "pointer" : "not-allowed",
                            textDecoration: item.canRate ? "underline" : "none",
                            opacity: item.canRate ? 1 : 0.5,
                          }}
                          onClick={() => item.canRate && handleViewDetails(item)}
                        >
                          {item.displayServices}
                        </td>
                        <td>
                          <span className={`badge ${item.status === "Completed" ? "bg-success" : "bg-warning"} px-3 py-2`}>
                            {item.status}
                          </span>
                        </td>
                        <td>{item.totalCost ? `${item.totalCost.toLocaleString()} VND` : "N/A"}</td>
                        <td>
                          <button
                            className="btn btn-dark btn-sm rate-btn px-3"
                            onClick={() => handleOpenRateModal(item)}
                            disabled={!item.canRate}
                            style={{ opacity: item.canRate ? 1 : 0.5 }}
                          >
                            {item.canRate ? "Rate" : "Not be Rated"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Details */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">Services Used</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {loadingDetail ? (
            <div className="text-center p-4">
              <Spinner animation="border" size="sm" /> Loading...
            </div>
          ) : detailServices.length === 0 ? (
            <p className="text-center text-muted p-3 mb-0">No services found.</p>
          ) : (
            <ListGroup variant="flush">
              {detailServices.map((svc, i) => (
                <ListGroup.Item key={i} className="px-4 py-2 d-flex justify-content-between">
                  <span>
                    <i className="bi bi-wrench text-primary me-2"></i>
                    <strong>{svc.serviceName}</strong>
                  </span>
                  {svc.price && <small className="text-muted">{svc.price.toLocaleString()} VND</small>}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowDetailModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Rate */}
      <Modal show={showRateModal} onHide={() => setShowRateModal(false)} centered size="md">
        <Modal.Header closeButton>
          <Modal.Title className="w-100 text-center">Rate Your Service</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {loadingRate ? (
            <p><Spinner animation="border" size="sm" /> Loading...</p>
          ) : (
            <>
              <div className="mb-4">
                <Form.Label className="fw-bold d-block">Overall Rating</Form.Label>
                <div className="d-flex justify-content-center gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={`bi bi-star-fill star-icon ${rating.overallRating >= star ? "active" : ""}`}
                      onClick={() => setRating({ ...rating, overallRating: star })}
                      style={{ fontSize: "2.2rem", cursor: "pointer" }}
                    />
                  ))}
                </div>
              </div>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Feedback (optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={rating.feedback}
                  onChange={(e) => setRating({ ...rating, feedback: e.target.value })}
                  placeholder="Share your experience..."
                  style={{ resize: "vertical", minHeight: "120px" }}
                />
                <small className="text-muted d-block mt-1">{rating.feedback.length} characters</small>
              </Form.Group>

              <div className="d-flex justify-content-end mt-4">
                <Button variant="dark" onClick={handleSubmit} disabled={rating.overallRating === 0}>Submit Rating</Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>

      <style>{`
        .records-particles-background { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 0; pointer-events: none; background: #ffffff; }
        .records-page { display: grid; grid-template-columns: 320px 1fr; gap: 40px; padding: 100px 50px; min-height: 100vh; position: relative; z-index: 1; }
        .records-sidebar { background: rgba(255, 255, 255, 0.9); padding: 25px; border-radius: 15px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); }
        .vehicle-item { padding: 12px 16px; border-radius: 25px; cursor: pointer; transition: all 0.3s ease; font-weight: 600; margin-bottom: 10px; background: rgba(0, 0, 0, 0.05); }
        .vehicle-item:hover { background: rgba(0, 0, 0, 0.12); transform: translateY(-1px); }
        .vehicle-item.active { background: #000; color: #fff; }
        .records-content { background: rgba(255, 255, 255, 0.9); border-radius: 15px; padding: 40px; box-shadow: 0 4px 25px rgba(0, 0, 0, 0.1); }
        .section-title { text-align: center; font-size: 2.2rem; font-weight: 800; margin-bottom: 30px; }
        .table-responsive { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; min-width: 700px; }
        th, td { text-align: center; vertical-align: middle; padding: 16px 10px; font-size: 1.05rem; font-weight: 600; border-bottom: 1px solid #ddd; }
        th { font-weight: 800; font-size: 1.15rem; text-transform: uppercase; }
        .service-cell { white-space: normal !important; word-wrap: break-word; max-width: 250px; line-height: 1.4; }
        .badge { font-size: 0.95rem; padding: 7px 14px; border-radius: 20px; }
        .rate-btn { border-radius: 25px; padding: 6px 14px; font-weight: 600; }
        .rate-btn:disabled { opacity: 0.5; cursor: not-allowed; background: #666; }
        .star-icon { color: #ccc; transition: color 0.2s; }
        .star-icon.active { color: gold; }
        @media (max-width: 992px) { .records-page { grid-template-columns: 1fr; padding: 60px 20px; } .records-content { padding: 25px; } }
      `}</style>
    </>
  );
};

export default Records;
