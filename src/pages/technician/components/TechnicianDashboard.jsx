import React from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  MapPin,
  CalendarDays,
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";

const statusColors = {
  "In Progress": "bg-brand-100 text-brand-700 border-brand-200",
  Scheduled: "bg-sky-100 text-sky-600 border-sky-200",
  Completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Delayed: "bg-rose-100 text-rose-700 border-rose-200",
};

const priorityBadge = {
  High: "bg-rose-500/10 text-rose-600 border border-rose-200",
  Medium: "bg-amber-500/10 text-amber-600 border border-amber-200",
  Low: "bg-emerald-500/10 text-emerald-600 border border-emerald-200",
};

const formatEta = (iso) => {
  if (!iso) return "N/A";
  const date = new Date(iso);
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
};

const calcMetrics = (workOrders = []) => {
  const active = workOrders.filter((item) => item.status !== "Completed");
  const dueSoon = active.filter((item) => {
    const eta = new Date(item.eta).getTime();
    const now = Date.now();
    const diffHours = (eta - now) / (1000 * 60 * 60);
    return diffHours <= 8 && diffHours > 0;
  });
  const completedToday = workOrders.filter((item) => {
    if (item.status !== "Completed") return false;
    const updated = new Date(item.lastUpdated);
    const now = new Date();
    return (
      updated.getDate() === now.getDate() &&
      updated.getMonth() === now.getMonth() &&
      updated.getFullYear() === now.getFullYear()
    );
  });

  const averageProgress =
    workOrders.reduce((sum, item) => sum + (item.progress || 0), 0) /
      (workOrders.length || 1);

  return {
    total: workOrders.length,
    active: active.length,
    dueSoon: dueSoon.length,
    completedToday: completedToday.length,
    averageProgress: Math.round(averageProgress),
  };
};

export const TechnicianDashboard = ({
  workOrders = [],
  selectedOrderId,
  onSelectOrder,
}) => {
  const metrics = calcMetrics(workOrders);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
            Technician Workspace
          </p>
          <h1 className="mt-2 flex items-center gap-2 text-3xl font-bold text-slate-900">
            <LayoutDashboard className="h-8 w-8 text-brand-500" />
            Tong quan cong viec
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Giam sat phan cong, tien do, nhat ky hoat dong va thong bao quan
            trong.
          </p>
        </div>
      </div>

      <motion.div
        layout
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        transition={{ duration: 0.35, ease: "easeInOut" }}
      >
        {[
          {
            title: "Work orders dang thuc thi",
            value: metrics.active,
            sub: `Tong ${metrics.total} cong viec`,
            icon: Clock,
            accent: "from-brand-500/80 to-brand-500/20",
          },
          {
            title: "Sap den han SLA",
            value: metrics.dueSoon,
            sub: "Trong 8 gio tiep theo",
            icon: AlertTriangle,
            accent: "from-amber-500/70 to-amber-500/20",
          },
          {
            title: "Trong ngay",
            value: metrics.completedToday,
            sub: "Da hoan tat hom nay",
            icon: CheckCircle2,
            accent: "from-emerald-500/80 to-emerald-500/20",
          },
          {
            title: "Tien do trung binh",
            value: `${metrics.averageProgress}%`,
            sub: "Cua tat ca work orders",
            icon: LayoutDashboard,
            accent: "from-sky-500/80 to-sky-500/20",
          },
        ].map(({ title, value, sub, icon: Icon, accent }) => (
          <motion.div
            key={title}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="group relative overflow-hidden border-none bg-white/90 shadow-subtle backdrop-blur">
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                  accent
                )}
              />
              <CardContent className="relative space-y-3 p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">
                    {title}
                  </span>
                  <Icon className="h-5 w-5 text-brand-500 transition-all duration-300 group-hover:scale-110" />
                </div>
                <div className="text-3xl font-semibold text-slate-900">
                  {value}
                </div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  {sub}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-none bg-white/95 shadow-subtle backdrop-blur lg:col-span-2">
          <CardContent className="space-y-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Hang doi cong viec
                </h2>
                <p className="text-sm text-slate-500">
                  Chon work order de xem chi tiet, cap nhat tien do va nhat ky.
                </p>
              </div>
              <span className="rounded-full bg-brand-50 px-4 py-1 text-xs font-medium text-brand-600">
                Cap nhat real-time tu mock API
              </span>
            </div>
            <div className="space-y-4">
              {workOrders.map((order) => (
                <motion.div
                  key={order.id}
                  layout
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "rounded-2xl border border-slate-100 bg-gradient-to-r from-white via-white to-slate-50/50 p-5 shadow-md transition-all hover:shadow-xl",
                    selectedOrderId === order.id && "ring-2 ring-brand-400"
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {order.vehicle.make} {order.vehicle.model}
                        </h3>
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-medium",
                            priorityBadge[order.priority] ||
                              "bg-slate-100 text-slate-600"
                          )}
                        >
                          {order.priority} priority
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-brand-400" />
                          {order.serviceBay}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-4 w-4 text-brand-400" />
                          ETA {formatEta(order.eta)}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold",
                            statusColors[order.status] ||
                              "border-slate-200 text-slate-600"
                          )}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-500">
                          Tien do
                        </p>
                        <p className="text-2xl font-semibold text-slate-900">
                          {order.progress}%
                        </p>
                      </div>
                      <Button
                        onClick={() => onSelectOrder?.(order.id)}
                        className="group/button h-11 rounded-full bg-brand-500 px-6 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600"
                      >
                        Chi tiet
                        <ChevronRight className="ml-2 h-4 w-4 transition-all group-hover/button:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 transition-all"
                      style={{ width: `${order.progress}%` }}
                    />
                  </div>
                </motion.div>
              ))}
              {!workOrders.length && (
                <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-500">
                  Chua co work order trong mock API.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-brand-600 via-brand-500 to-sky-600 text-white shadow-subtle lg:col-span-1">
          <CardContent className="flex h-full flex-col justify-between p-6">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
                Cham soc khach hang
              </p>
              <h2 className="text-2xl font-semibold leading-tight">
                Nghien cuu ky lich su dich vu va ghi nhan chu dong.
              </h2>
              <p className="text-sm text-white/80">
                Binh thuong hoa quy trinh tiep nhan, bao cao, ban giao, giam
                thoi gian cho trong service center EV.
              </p>
            </div>
            <div className="mt-10 space-y-4">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/70">
                SLA trong tam tay
              </p>
              <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                <p className="text-sm text-white/80">
                  Theo doi SLA theo thoi gian thuc, du doan rui ro cham tien do
                  va thong bao tu dong.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
