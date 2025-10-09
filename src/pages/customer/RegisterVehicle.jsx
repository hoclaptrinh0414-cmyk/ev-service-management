import React, { useState } from "react";

function RegisterVehicle() {
  const [form, setForm] = useState({ plate: "", model: "", color: "" });
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    // TODO: Hook up to API when ready
    setTimeout(() => {
      alert(`Đăng ký xe thành công: ${form.plate}`);
      setSubmitting(false);
    }, 600);
  };

  return (
    <div className="container py-4">
      <h3 className="mb-3">Đăng ký phương tiện</h3>
      <form onSubmit={onSubmit} className="card p-3">
        <div className="mb-3">
          <label className="form-label">Biển số</label>
          <input
            name="plate"
            className="form-control"
            placeholder="VD: 30A-123.45"
            value={form.plate}
            onChange={onChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Mẫu xe</label>
          <input
            name="model"
            className="form-control"
            placeholder="VD: VinFast VF 8"
            value={form.model}
            onChange={onChange}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Màu sắc</label>
          <input
            name="color"
            className="form-control"
            placeholder="VD: Trắng"
            value={form.color}
            onChange={onChange}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Đang gửi..." : "Đăng ký"}
        </button>
      </form>
    </div>
  );
}

export default RegisterVehicle;
