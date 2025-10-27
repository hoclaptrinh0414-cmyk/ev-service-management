import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { User, Shield, Clock, Wrench, Bell, Save } from "lucide-react";

const defaultProfile = {
  name: "",
  role: "EV Senior Technician",
  shift: "08:00 - 17:00",
  phone: "",
  email: "",
  skills: ["High voltage", "Battery diagnostics", "Thermal management"],
  notifications: {
    sla: true,
    parts: true,
    handover: false,
  },
};

export const ProfileSettings = ({ technician, onUpdateProfile }) => {
  const [profile, setProfile] = useState(defaultProfile);

  useEffect(() => {
    if (!technician) return;
    setProfile((prev) => ({
      ...prev,
      name: technician.name || prev.name,
      phone: technician.phone || prev.phone,
      email: technician.email || prev.email,
      shift: technician.shift || prev.shift,
    }));
  }, [technician]);

  const handleChange = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggle = (key) => {
    setProfile((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  const handleSave = () => {
    onUpdateProfile?.(profile);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand-500">
            Ho so ky thuat vien
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            Ca nhan hoa workspace va ca lam viec
          </h2>
          <p className="text-sm text-slate-500">
            Cap nhat thong tin de dong bo voi ca lam, he thong phan cong va luong thong bao.
          </p>
        </div>
      </div>

      <Card className="border-none bg-white/95 shadow-subtle backdrop-blur">
        <CardContent className="grid gap-6 p-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-brand-500/10 p-2 text-brand-600">
                  <User className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Thong tin ca nhan
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Ho ten va lien he
                  </h3>
                </div>
              </div>
              <label className="block space-y-2 text-sm text-slate-600">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Ho ten
                </span>
                <input
                  value={profile.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  placeholder="Nhap ho ten"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </label>
              <label className="block space-y-2 text-sm text-slate-600">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  So dien thoai
                </span>
                <input
                  value={profile.phone}
                  onChange={(event) => handleChange("phone", event.target.value)}
                  placeholder="Nhap so dien thoai"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </label>
              <label className="block space-y-2 text-sm text-slate-600">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Email cong viec
                </span>
                <input
                  value={profile.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  placeholder="Nhap email cong ty"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </label>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-brand-500/10 p-2 text-brand-600">
                  <Clock className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Ca lam viec
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Lich lam viec trong tuan
                  </h3>
                </div>
              </div>
              <input
                value={profile.shift}
                onChange={(event) => handleChange("shift", event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
              <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-4 text-sm text-brand-700">
                Ghi chu ca lam de phan bo hang muc dung ky nang, han che overtime va luu y HSE.
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-brand-500/10 p-2 text-brand-600">
                  <Wrench className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Ky nang ky thuat
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Nang luc chinh
                  </h3>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <motion.span
                    key={skill}
                    layout
                    className="rounded-full bg-white px-4 py-1 text-xs font-semibold text-brand-600 shadow-sm"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
              <div className="rounded-xl border border-dashed border-slate-200 p-4 text-xs text-slate-500">
                Lien he quan ly de cap nhat them ky nang hoac chung chi moi.
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-brand-500/10 p-2 text-brand-600">
                  <Bell className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Thong bao
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Tinh nang tu dong
                  </h3>
                </div>
              </div>
              {Object.entries(profile.notifications).map(([key, value]) => (
                <label
                  key={key}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600"
                >
                  <span className="font-medium text-slate-700">
                    {key === "sla" && "Canh bao SLA"}
                    {key === "parts" && "Trang thai phu tung"}
                    {key === "handover" && "Nhac lich ban giao"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggle(key)}
                    className={`flex h-6 w-11 items-center rounded-full transition ${
                      value ? "bg-brand-500" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`h-5 w-5 rounded-full bg-white shadow transition ${
                        value ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </label>
              ))}
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-brand-500/10 p-2 text-brand-600">
                  <Shield className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    An toan va truy cap
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Nghi dinh EV Service Center
                  </h3>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                Tuan thu PPE va lock-out/tag-out truoc khi tiep can he thong high voltage va chassis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600"
        >
          <Save className="h-4 w-4" />
          Luu cau hinh
        </Button>
      </div>
    </div>
  );
};
