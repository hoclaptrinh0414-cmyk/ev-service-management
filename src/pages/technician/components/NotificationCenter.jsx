import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  AlertTriangle,
  PackageSearch,
  CheckCircle2,
  Rocket,
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";

const typeStyle = {
  sla: {
    icon: AlertTriangle,
    accent: "bg-rose-500/10 text-rose-600 border-rose-200",
  },
  parts: {
    icon: PackageSearch,
    accent: "bg-amber-500/10 text-amber-600 border-amber-200",
  },
  success: {
    icon: CheckCircle2,
    accent: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  },
  update: {
    icon: Rocket,
    accent: "bg-brand-500/10 text-brand-600 border-brand-200",
  },
};

export const NotificationCenter = ({
  workOrders = [],
  timeline = [],
  onSelectWorkOrder,
}) => {
  const notifications = useMemo(() => {
    const list = [];

    workOrders.forEach((order) => {
      const etaDiff =
        (new Date(order.eta).getTime() - Date.now()) / (1000 * 60 * 60);
      if (order.priority === "High" && order.status !== "Completed") {
        list.push({
          id: `${order.id}-sla`,
          type: "sla",
          title: `SLA High priority: ${order.id}`,
          message: `${order.vehicle.make} ${order.vehicle.model} can hoan tat som. ETA ${new Date(
            order.eta
          ).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}.`,
          workOrderId: order.id,
        });
      }
      const awaitingParts = order.parts?.filter(
        (part) => part.status === "awaiting"
      );
      if (awaitingParts?.length) {
        list.push({
          id: `${order.id}-parts`,
          type: "parts",
          title: `Thieu phu tung (${awaitingParts.length})`,
          message: `Can theo doi: ${awaitingParts
            .map((part) => part.name)
            .join(", ")}`,
          workOrderId: order.id,
        });
      }
      if (etaDiff < 0 && order.status !== "Completed") {
        list.push({
          id: `${order.id}-delay`,
          type: "sla",
          title: `Cham SLA ${order.id}`,
          message: "Cap nhat tien do hoac thong bao khach hang ngay.",
          workOrderId: order.id,
        });
      }
      if (order.status === "Completed") {
        list.push({
          id: `${order.id}-completed`,
          type: "success",
          title: `Hoan tat ${order.id}`,
          message: `Da ghi nhan hoan tat luc ${new Date(
            order.lastUpdated
          ).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}.`,
          workOrderId: order.id,
        });
      }
    });

    timeline.slice(0, 5).forEach((entry) => {
      list.push({
        id: entry.id,
        type: "update",
        title: entry.title,
        message: entry.description,
        workOrderId: entry.workOrderId,
      });
    });

    return list;
  }, [workOrders, timeline]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand-500">
            Notification Center
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            Tong hop canh bao va ho tro tac nghiep
          </h2>
        </div>
      </div>

      <Card className="border-none bg-white/95 shadow-subtle backdrop-blur">
        <CardContent className="space-y-4 p-6">
          {notifications.map((item) => {
            const meta = typeStyle[item.type] || typeStyle.update;
            const Icon = meta.icon;
            return (
              <motion.div
                key={item.id}
                layout
                className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border text-brand-500",
                        meta.accent
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <p className="text-sm text-slate-600">{item.message}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => onSelectWorkOrder?.(item.workOrderId)}
                    className="rounded-full bg-brand-500 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600"
                  >
                    Xu ly ngay
                  </Button>
                </div>
              </motion.div>
            );
          })}
          {!notifications.length && (
            <div className="flex items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 p-10 text-sm text-slate-500">
              <Bell className="h-5 w-5" />
              Hien tai khong co thong bao nao.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
