import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import {
  Car,
  User,
  Phone,
  Mail,
  ClipboardList,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { cn } from "../../../lib/utils";

const getTaskChipClass = (status) => {
  const map = {
    done: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    "in-progress": "bg-brand-500/10 text-brand-600 border-brand-200",
    pending: "bg-slate-200 text-slate-600 border-slate-200",
  };
  return cn(
    "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium",
    map[status] || "bg-slate-200 text-slate-600 border-slate-200"
  );
};

export const WorkOrderDetail = ({ workOrder }) => {
  if (!workOrder) {
    return (
      <Card className="border-dashed border-slate-200 bg-white/80 p-10 text-center text-sm text-slate-500">
        Vui long chon mot work order tu danh sach ben trai de xem chi tiet.
      </Card>
    );
  }

  const { vehicle, customer, tasks = [], checklist = [] } = workOrder;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand-500">
            Work order #{workOrder.id}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            {vehicle.make} {vehicle.model} - {vehicle.plate}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Cap nhat lan cuoi:{" "}
            {new Date(workOrder.lastUpdated).toLocaleString("vi-VN")}
          </p>
        </div>
        <div className="hidden md:flex">
          <div className="rounded-full bg-brand-500/10 px-4 py-1 text-xs font-medium text-brand-700">
            {workOrder.priority} priority
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Card className="border-none bg-white/90 shadow-subtle backdrop-blur">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-brand-500/10 p-2 text-brand-600">
                <Car className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Thong tin xe
                </p>
                <h3 className="text-lg font-semibold text-slate-900">
                  {vehicle.make} {vehicle.model}
                </h3>
              </div>
            </div>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500">VIN</span>
                <span className="font-semibold text-slate-900">
                  {vehicle.vin}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500">Bien so</span>
                <span className="font-semibold text-slate-900">
                  {vehicle.plate}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500">Nam SX</span>
                <span className="font-semibold text-slate-900">
                  {vehicle.year}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500">Bay</span>
                <span className="font-semibold text-slate-900">
                  {workOrder.serviceBay}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-white/90 shadow-subtle backdrop-blur">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-brand-500/10 p-2 text-brand-600">
                <User className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Khach hang
                </p>
                <h3 className="text-lg font-semibold text-slate-900">
                  {customer.name}
                </h3>
              </div>
            </div>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 font-medium text-slate-500">
                  <Phone className="h-4 w-4 text-brand-400" />
                  Dien thoai
                </span>
                <span className="font-semibold text-slate-900">
                  {customer.phone}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 font-medium text-slate-500">
                  <Mail className="h-4 w-4 text-brand-400" />
                  Email
                </span>
                <span className="font-semibold text-slate-900">
                  {customer.email}
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
                {workOrder.notes}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-brand-600 via-brand-500 to-sky-600 text-white shadow-subtle">
          <CardContent className="flex h-full flex-col justify-between space-y-6 p-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Trang thai hien tai
              </p>
              <h3 className="text-xl font-semibold tracking-wide">
                {workOrder.status}
              </h3>
              <p className="text-sm text-white/80">
                {workOrder.progress}% thuc hien xong. Theo doi va cap nhat
                timeline de giu SLA.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                Eta
              </p>
              <p className="mt-2 text-xl font-semibold">
                {new Date(workOrder.eta).toLocaleString("vi-VN")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none bg-white/95 shadow-subtle backdrop-blur">
        <CardContent className="grid gap-6 p-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-brand-500/10 p-2 text-brand-600">
                <ClipboardList className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Nhiem vu
                </p>
                <h3 className="text-lg font-semibold text-slate-900">
                  Quy trinh ky thuat
                </h3>
              </div>
            </div>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {task.label}
                    </p>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Owner: {task.owner}
                    </p>
                  </div>
                  <span className={getTaskChipClass(task.status)}>
                    {task.status}
                  </span>
                </div>
              ))}
              {!tasks.length && (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
                  Chua co task nao duoc phan cong.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-brand-500/10 p-2 text-brand-600">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Checklist an toan
                </p>
                <h3 className="text-lg font-semibold text-slate-900">
                  Truoc khi ban giao
                </h3>
              </div>
            </div>
            <div className="space-y-3">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm",
                    item.completed
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                  )}
                >
                  <span>{item.item}</span>
                  {item.completed ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      pending
                    </span>
                  )}
                </div>
              ))}
              {!checklist.length && (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
                  Chua co checklist nao duoc tao.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
