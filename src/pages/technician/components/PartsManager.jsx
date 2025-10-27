import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Package, Plus, RefreshCcw } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";

const statusPalette = {
  available: {
    label: "San sang",
    className: "border-emerald-300 bg-emerald-50 text-emerald-700",
  },
  reserved: {
    label: "Da giu",
    className: "border-amber-300 bg-amber-50 text-amber-700",
  },
  awaiting: {
    label: "Dang doi",
    className: "border-rose-300 bg-rose-50 text-rose-700",
  },
  consumed: {
    label: "Da su dung",
    className: "border-slate-300 bg-slate-100 text-slate-600",
  },
};

const statusOptions = Object.keys(statusPalette);

export const PartsManager = ({ workOrder, onUpdateParts }) => {
  const [draftParts, setDraftParts] = useState(workOrder?.parts || []);
  const [newPart, setNewPart] = useState({
    name: "",
    quantity: 1,
    status: "awaiting",
  });
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setDraftParts(workOrder?.parts || []);
  }, [workOrder?.id, workOrder?.parts]);

  const awaitingParts = useMemo(
    () => draftParts.filter((part) => part.status === "awaiting").length,
    [draftParts]
  );

  const handleChangeStatus = (partId, status) => {
    setDraftParts((prev) =>
      prev.map((part) =>
        part.id === partId ? { ...part, status, lastUpdated: new Date().toISOString() } : part
      )
    );
  };

  const handleQuantityChange = (partId, delta) => {
    setDraftParts((prev) =>
      prev.map((part) =>
        part.id === partId
          ? { ...part, quantity: Math.max(1, part.quantity + delta) }
          : part
      )
    );
  };

  const handleSync = async () => {
    if (!onUpdateParts || syncing) return;
    setSyncing(true);
    try {
      await onUpdateParts(draftParts);
    } finally {
      setSyncing(false);
    }
  };

  const handleAddPart = () => {
    if (!newPart.name.trim()) return;
    const part = {
      id: `part-${Date.now()}`,
      ...newPart,
      quantity: Number(newPart.quantity) || 1,
      lastUpdated: new Date().toISOString(),
    };
    setDraftParts((prev) => [part, ...prev]);
    setNewPart({
      name: "",
      quantity: 1,
      status: "awaiting",
    });
  };

  if (!workOrder) {
    return (
      <Card className="border-dashed border-slate-200 bg-white/80 p-10 text-center text-sm text-slate-500">
        Vui long chon work order truoc khi quan ly phu tung.
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand-500">
            Quan ly phu tung
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            Dong bo voi kho va HSE checklist
          </h2>
        </div>
        <div className="rounded-full bg-slate-100 px-5 py-2 text-xs font-semibold text-slate-600">
          {awaitingParts} item dang cho nhap kho
        </div>
      </div>

      <Card className="border-none bg-white/95 shadow-subtle backdrop-blur">
        <CardContent className="space-y-6 p-6">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-brand-500/10 p-2 text-brand-600">
                  <Package className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Them phu tung
                  </p>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Ghi nhan nhanh
                  </h3>
                </div>
              </div>
              <div className="flex flex-1 flex-wrap items-center gap-3">
                <input
                  type="text"
                  value={newPart.name}
                  onChange={(event) =>
                    setNewPart((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Ten phu tung"
                  className="min-w-[200px] flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
                <input
                  type="number"
                  min={1}
                  value={newPart.quantity}
                  onChange={(event) =>
                    setNewPart((prev) => ({
                      ...prev,
                      quantity: Number(event.target.value),
                    }))
                  }
                  className="w-24 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
                <select
                  value={newPart.status}
                  onChange={(event) =>
                    setNewPart((prev) => ({ ...prev, status: event.target.value }))
                  }
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {statusPalette[status].label}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handleAddPart}
                  className="flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600"
                >
                  <Plus className="h-4 w-4" />
                  Them
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {draftParts.map((part) => (
              <motion.div
                layout
                key={part.id}
                className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {part.name}
                    </p>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Cap nhat:{" "}
                      {part.lastUpdated
                        ? new Date(part.lastUpdated).toLocaleString("vi-VN")
                        : "Chua co"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(part.id, -1)}
                        className="text-sm font-semibold text-slate-500 hover:text-brand-500"
                      >
                        -
                      </button>
                      <span className="text-sm font-semibold text-slate-900">
                        {part.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(part.id, 1)}
                        className="text-sm font-semibold text-slate-500 hover:text-brand-500"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex gap-2">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleChangeStatus(part.id, status)}
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs font-semibold transition",
                            part.status === status
                              ? statusPalette[status].className
                              : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                          )}
                        >
                          {statusPalette[status].label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {!draftParts.length && (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                Chua co phu tung nao duoc gan cho work order nay.
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSync}
              disabled={syncing || !draftParts.length}
              className="flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-slate-800"
            >
              <RefreshCcw className={cn("h-4 w-4", syncing && "animate-spin")} />
              {syncing ? "Dang dong bo..." : "Dong bo ton kho"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
