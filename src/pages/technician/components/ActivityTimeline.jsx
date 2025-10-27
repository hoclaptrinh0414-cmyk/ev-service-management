import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { cn } from "../../../lib/utils";

const typeMap = {
  update: {
    icon: Activity,
    className: "bg-brand-500/10 text-brand-600 border-brand-200",
    label: "Cap nhat",
  },
  alert: {
    icon: AlertTriangle,
    className: "bg-rose-500/10 text-rose-600 border-rose-200",
    label: "Canh bao",
  },
  completion: {
    icon: CheckCircle2,
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    label: "Hoan tat",
  },
  communication: {
    icon: MessageSquare,
    className: "bg-amber-500/10 text-amber-600 border-amber-200",
    label: "Giao tiep",
  },
};

export const ActivityTimeline = ({
  timeline = [],
  workOrders = [],
  activeWorkOrderId,
  onSelectWorkOrder,
}) => {
  const [filter, setFilter] = useState(activeWorkOrderId || "all");

  const timelineItems = useMemo(() => {
    const base = filter === "all"
      ? timeline
      : timeline.filter((entry) => entry.workOrderId === filter);
    return base.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [timeline, filter]);

  const workOrderOptions = useMemo(
    () =>
      workOrders.map((order) => ({
        value: order.id,
        label: `${order.id} • ${order.vehicle.make} ${order.vehicle.model}`,
      })),
    [workOrders]
  );

  const handleFilterChange = (value) => {
    setFilter(value);
    if (value !== "all") {
      onSelectWorkOrder?.(value);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand-500">
            Nhat ky hoat dong
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            Theo doi toan bo timeline va SLA
          </h2>
          <p className="text-sm text-slate-500">
            Loc theo work order hoac xem tong quan hoat dong gan nhat.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Loc theo work order
          </label>
          <select
            value={filter}
            onChange={(event) => handleFilterChange(event.target.value)}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
          >
            <option value="all">Tat ca timeline</option>
            {workOrderOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card className="border-none bg-white/95 shadow-subtle backdrop-blur">
        <CardContent className="relative p-6">
          <div className="absolute left-9 top-8 bottom-8 hidden w-px bg-gradient-to-b from-brand-200/40 via-brand-200/80 to-brand-200/40 md:block" />
          <div className="space-y-6">
            {timelineItems.map((entry) => {
              const meta = typeMap[entry.type] || typeMap.update;
              const Icon = meta.icon;
              return (
                <motion.div
                  layout
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-5 md:flex-row md:items-start md:gap-6"
                >
                  <div className="relative flex h-full items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-white shadow-md">
                      <Icon className="h-5 w-5 text-brand-500" />
                    </div>
                    <div className="absolute -left-[54px] hidden md:block">
                      <div className="flex flex-col items-end text-right">
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          {entry.workOrderId}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(entry.timestamp).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
                          meta.className
                        )}
                      >
                        {meta.label}
                      </span>
                      <span className="inline-flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="h-4 w-4 text-brand-400" />
                        {new Date(entry.timestamp).toLocaleString("vi-VN")}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        {entry.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600">
                        {entry.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {!timelineItems.length && (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                Chua co nhat ky nao phu hop voi bo loc.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
