import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GaugeCircle, ListChecks, MessageSquare, Save } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";

const taskStatusOptions = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In progress" },
  { value: "done", label: "Done" },
];

export const ProgressUpdater = ({
  workOrder,
  onUpdateWorkOrder,
  onAddTimelineEntry,
}) => {
  const [progress, setProgress] = useState(workOrder?.progress || 0);
  const [tasksState, setTasksState] = useState(workOrder?.tasks || []);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setProgress(workOrder?.progress || 0);
    setTasksState(workOrder?.tasks || []);
    setNote("");
  }, [workOrder?.id, workOrder?.progress, workOrder?.tasks]);

  const completedTasks = useMemo(
    () => tasksState.filter((task) => task.status === "done").length,
    [tasksState]
  );

  const handleTaskStatusChange = (taskId, nextStatus) => {
    setTasksState((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: nextStatus } : task
      )
    );
  };

  const handleSaveProgress = async () => {
    if (!workOrder || saving) return;
    setSaving(true);
    try {
      await onUpdateWorkOrder?.({
        tasks: tasksState,
        progress,
        status: progress >= 100 ? "Completed" : workOrder.status,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogTimeline = async () => {
    if (!workOrder || !note.trim()) return;
    const payload = {
      title: `Cap nhat tien do ${progress}%`,
      description: note.trim(),
      type: progress >= 100 ? "completion" : "update",
    };
    await onAddTimelineEntry?.(payload);
    setNote("");
  };

  if (!workOrder) {
    return (
      <Card className="border-dashed border-slate-200 bg-white/80 p-10 text-center text-sm text-slate-500">
        Chua chon work order. Hay quay lai dashboard de chon mot cong viec.
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand-500">
            Cap nhat tien do
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            Dieu chinh cong viec va log timeline
          </h2>
        </div>
        <div className="rounded-full bg-brand-500/10 px-5 py-2 text-xs font-semibold text-brand-600">
          {completedTasks}/{tasksState.length} task hoan tat
        </div>
      </div>

      <Card className="border-none bg-white/95 shadow-subtle backdrop-blur">
        <CardContent className="grid gap-6 p-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-brand-500/10 p-2 text-brand-600">
                  <GaugeCircle className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Muc do hoan tat
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {progress}% progress
                  </h3>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <input
                  type="range"
                  value={progress}
                  min={0}
                  max={100}
                  onChange={(event) => setProgress(Number(event.target.value))}
                  className="h-2 w-full cursor-pointer rounded-full bg-slate-200 accent-brand-500"
                />
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-dashed border-brand-300 bg-brand-50/50 p-4 text-sm text-brand-700">
              Meo: Ghi nhan nhung hanh dong quan trong vao timeline de tro lai
              de brief cho quan ly va khach hang.
            </div>
            <Button
              onClick={handleSaveProgress}
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600"
            >
              <Save className="h-4 w-4" />
              {saving ? "Dang luu..." : "Luu cap nhat"}
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-brand-500/10 p-2 text-brand-600">
                  <ListChecks className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Task ky thuat
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Cap nhat trang thai
                  </h3>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {tasksState.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {task.label}
                        </p>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          Owner: {task.owner}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {taskStatusOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              handleTaskStatusChange(task.id, option.value)
                            }
                            className={cn(
                              "rounded-full border px-3 py-1 text-xs font-semibold transition",
                              task.status === option.value
                                ? "border-brand-400 bg-brand-500/10 text-brand-600"
                                : "border-transparent bg-white text-slate-500 hover:border-slate-200"
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-brand-500/10 p-2 text-brand-600">
                  <MessageSquare className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Nhat ky hoat dong
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Them ghi chu
                  </h3>
                </div>
              </div>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={4}
                placeholder="Mo ta nhanh: cong viec da cap nhat, van de gap phai, rui ro SLA..."
                className="mt-4 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
              <div className="mt-3 flex justify-end">
                <Button
                  onClick={handleLogTimeline}
                  disabled={!note.trim()}
                  className="rounded-full bg-slate-900 px-6 text-sm font-semibold text-white shadow-md hover:bg-slate-800"
                >
                  Luu vao timeline
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
