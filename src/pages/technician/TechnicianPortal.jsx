import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  ClipboardList,
  TrendingUp,
  Package,
  History,
  Bell,
  UserCog,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { cn } from "../../lib/utils";
import { setupMockApi } from "../../lib/mockApi";
import {
  TechnicianDashboard,
  WorkOrderDetail,
  ProgressUpdater,
  PartsManager,
  ActivityTimeline,
  NotificationCenter,
  ProfileSettings,
} from "./components";

const sections = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "details", label: "Chi tiet cong viec", icon: ClipboardList },
  { id: "progress", label: "Cap nhat tien do", icon: TrendingUp },
  { id: "parts", label: "Quan ly phu tung", icon: Package },
  { id: "timeline", label: "Nhat ky hoat dong", icon: History },
  { id: "notifications", label: "Thong bao", icon: Bell },
  { id: "profile", label: "Ho so ca nhan", icon: UserCog },
];

const sectionVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

export const TechnicianPortal = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [workOrders, setWorkOrders] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setupMockApi();
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [workOrdersRes, timelineRes] = await Promise.all([
          fetch("/api/workorders"),
          fetch("/api/timeline"),
        ]);
        if (!workOrdersRes.ok || !timelineRes.ok) {
          throw new Error("Mock API khong phan hoi");
        }
        const workOrdersData = await workOrdersRes.json();
        const timelineData = await timelineRes.json();
        setWorkOrders(workOrdersData);
        setTimeline(timelineData);
        setSelectedOrderId((prev) => prev || workOrdersData[0]?.id || null);
      } catch (apiError) {
        setError(apiError.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const selectedOrder = useMemo(
    () => workOrders.find((order) => order.id === selectedOrderId) || null,
    [workOrders, selectedOrderId]
  );

  const awaitingParts = selectedOrder?.parts?.filter(
    (part) => part.status === "awaiting"
  ).length;

  const notificationsCount = useMemo(() => {
    const highPriority = workOrders.filter(
      (order) => order.priority === "High" && order.status !== "Completed"
    ).length;
    return highPriority + Math.max(0, awaitingParts || 0);
  }, [workOrders, awaitingParts]);

  const handleSelectOrder = (orderId) => {
    setSelectedOrderId(orderId);
    if (activeSection === "dashboard") {
      setActiveSection("details");
    }
  };

  const handleUpdateWorkOrder = async (payload) => {
    if (!selectedOrder) return;
    const response = await fetch(`/api/workorders/${selectedOrder.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Khong the cap nhat work order");
    }
    const updated = await response.json();
    setWorkOrders((prev) =>
      prev.map((order) => (order.id === updated.id ? updated : order))
    );
  };

  const handleAddTimelineEntry = async (entry) => {
    if (!selectedOrder) return;
    const response = await fetch(
      `/api/workorders/${selectedOrder.id}/timeline`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entry),
      }
    );
    if (!response.ok) {
      throw new Error("Khong the tao timeline");
    }
    const created = await response.json();
    setTimeline((prev) => [created, ...prev]);
  };

  const handlePartsUpdate = async (parts) => {
    await handleUpdateWorkOrder({ parts });
  };

  const handleProfileUpdate = async (profile) => {
    if (!selectedOrder) return;
    const updatedTechnician = {
      ...selectedOrder.technician,
      ...profile,
    };
    await handleUpdateWorkOrder({ technician: updatedTechnician });
  };

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <TechnicianDashboard
            workOrders={workOrders}
            selectedOrderId={selectedOrderId}
            onSelectOrder={handleSelectOrder}
          />
        );
      case "details":
        return <WorkOrderDetail workOrder={selectedOrder} />;
      case "progress":
        return (
          <ProgressUpdater
            workOrder={selectedOrder}
            onUpdateWorkOrder={handleUpdateWorkOrder}
            onAddTimelineEntry={handleAddTimelineEntry}
          />
        );
      case "parts":
        return (
          <PartsManager
            workOrder={selectedOrder}
            onUpdateParts={handlePartsUpdate}
          />
        );
      case "timeline":
        return (
          <ActivityTimeline
            timeline={timeline}
            workOrders={workOrders}
            activeWorkOrderId={selectedOrderId}
            onSelectWorkOrder={handleSelectOrder}
          />
        );
      case "notifications":
        return (
          <NotificationCenter
            workOrders={workOrders}
            timeline={timeline}
            onSelectWorkOrder={handleSelectOrder}
          />
        );
      case "profile":
        return (
          <ProfileSettings
            technician={selectedOrder?.technician}
            onUpdateProfile={handleProfileUpdate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200">
      <aside className="hidden w-72 flex-shrink-0 flex-col border-r border-slate-200/80 bg-white/90 shadow-xl backdrop-blur xl:flex">
        <div className="px-6 pb-4 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-sky-500 text-lg font-bold text-white shadow-md">
              EV
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">
                Service Center
              </p>
              <h2 className="text-lg font-semibold text-slate-900">
                Technician Console
              </h2>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/60 p-4 text-xs text-brand-600">
            Mock endpoints: <span className="font-medium">/api/workorders</span>{" "}
            & <span className="font-medium">/api/timeline</span>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            const badge =
              section.id === "notifications"
                ? notificationsCount
                : section.id === "timeline"
                ? timeline.length
                : section.id === "parts"
                ? awaitingParts
                : 0;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium transition",
                  isActive
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      isActive ? "text-white" : "text-brand-500"
                    )}
                  />
                  {section.label}
                </span>
                {badge ? (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-brand-500/10 text-brand-600"
                    )}
                  >
                    {badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-slate-200/60 p-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-xs text-slate-500">
            <p className="font-semibold text-slate-600">
              Tips for technicians
            </p>
            <p className="mt-2">
              Cap nhat timeline sau moi diem quan trong de dong bo voi quan ly
              va khach hang.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1">
        <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col px-6 py-8 xl:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">
                EV Service Center
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                Ky thuat vien Service Center
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Card className="border-none bg-white/90 shadow-subtle backdrop-blur">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="rounded-full bg-brand-500/10 p-2 text-brand-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      SLA monitoring
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {workOrders.filter((order) => order.status !== "Completed")
                        .length}{" "}
                      active
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Button
                onClick={() => setActiveSection("progress")}
                className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600"
              >
                Cap nhat tien do
              </Button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-gradient-to-r from-brand-500/10 via-white to-transparent p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Work order dang chon
              </p>
              <h3 className="text-lg font-semibold text-slate-900">
                {selectedOrder
                  ? `${selectedOrder.id} • ${selectedOrder.vehicle.make} ${selectedOrder.vehicle.model}`
                  : "Chua chon work order"}
              </h3>
              {selectedOrder && (
                <p className="text-xs text-slate-500">
                  Tien do {selectedOrder.progress}% • ETA{" "}
                  {new Date(selectedOrder.eta).toLocaleString("vi-VN")}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setActiveSection("details")}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs font-medium",
                  activeSection === "details"
                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-600"
                )}
              >
                Chi tiet
              </Button>
              <Button
                onClick={() => setActiveSection("timeline")}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs font-medium",
                  activeSection === "timeline"
                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-600"
                )}
              >
                Timeline
              </Button>
            </div>
          </div>

          <div className="mt-8 flex-1">
            {loading ? (
              <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/60">
                <div className="flex items-center gap-3 text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
                  Dang tai mock data tu /api/workorders ...
                </div>
              </div>
            ) : error ? (
              <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-rose-200 bg-rose-50/70 text-rose-600">
                {error}
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  variants={sectionVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  {renderSection()}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TechnicianPortal;
