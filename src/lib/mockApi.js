const NETWORK_DELAY = 420;

const workOrders = [
  {
    id: "WO-2401",
    vehicle: {
      make: "Tesla",
      model: "Model 3 Performance",
      vin: "5YJ3E1EA7JF000000",
      plate: "51H-123.45",
      year: 2024,
    },
    customer: {
      name: "Nguyen Van A",
      phone: "+84 912 345 678",
      email: "nva@example.com",
    },
    priority: "High",
    status: "In Progress",
    progress: 68,
    eta: "2025-10-22T16:00:00.000Z",
    serviceBay: "EV-Bay-03",
    technician: {
      name: "Tran Minh Quan",
      avatar: "https://i.pravatar.cc/100?img=12",
      shift: "08:00 - 17:00",
    },
    tasks: [
      { id: "task-1", label: "Diagnostics and log extraction", status: "done", owner: "Quan" },
      { id: "task-2", label: "Battery thermal calibration", status: "in-progress", owner: "Quan" },
      { id: "task-3", label: "Inverter firmware update", status: "pending", owner: "Quan" },
      { id: "task-4", label: "Road test and telemetry", status: "pending", owner: "Tester" },
    ],
    parts: [
      { id: "part-1", name: "Battery coolant EV-LR", quantity: 2, status: "available" },
      { id: "part-2", name: "HV isolator kit", quantity: 1, status: "awaiting" },
      { id: "part-3", name: "Torque seal", quantity: 3, status: "available" },
    ],
    checklist: [
      { id: "chk-1", item: "Lock-out tag applied", completed: true },
      { id: "chk-2", item: "High-voltage isolation", completed: true },
      { id: "chk-3", item: "Thermal camera scan", completed: false },
    ],
    notes: "Khach yeu cau giao xe truoc 16:00 de tham du su kien toi.",
    lastUpdated: "2025-10-21T09:35:00.000Z",
  },
  {
    id: "WO-2402",
    vehicle: {
      make: "VinFast",
      model: "VF8 Plus",
      vin: "VRHFF6S90PD000001",
      plate: "61G-678.90",
      year: 2023,
    },
    customer: {
      name: "Pham Thi B",
      phone: "+84 938 222 111",
      email: "ptb@example.com",
    },
    priority: "Medium",
    status: "Scheduled",
    progress: 25,
    eta: "2025-10-23T10:30:00.000Z",
    serviceBay: "EV-Bay-01",
    technician: {
      name: "Le Hoang",
      avatar: "https://i.pravatar.cc/100?img=33",
      shift: "12:00 - 21:00",
    },
    tasks: [
      { id: "task-1", label: "Chassis inspection", status: "done", owner: "Lan" },
      { id: "task-2", label: "Suspension torque check", status: "pending", owner: "Hoang" },
      { id: "task-3", label: "HV battery health test", status: "pending", owner: "Hoang" },
    ],
    parts: [
      { id: "part-1", name: "Brake fluid DOT4", quantity: 1, status: "available" },
      { id: "part-2", name: "Front stabilizer link", quantity: 2, status: "reserved" },
    ],
    checklist: [
      { id: "chk-1", item: "Parking brake calibration", completed: false },
      { id: "chk-2", item: "TCU software update", completed: false },
    ],
    notes: "Khach muon them kiem tra tieng on cabin.",
    lastUpdated: "2025-10-20T18:12:00.000Z",
  },
  {
    id: "WO-2403",
    vehicle: {
      make: "BYD",
      model: "Seal AWD",
      vin: "LGXCE2CA4P2000002",
      plate: "63K-456.12",
      year: 2024,
    },
    customer: {
      name: "Dang Van C",
      phone: "+84 901 555 333",
      email: "dvc@example.com",
    },
    priority: "Low",
    status: "Completed",
    progress: 100,
    eta: "2025-10-19T15:00:00.000Z",
    serviceBay: "EV-Bay-05",
    technician: {
      name: "Bui Huu Tai",
      avatar: "https://i.pravatar.cc/100?img=18",
      shift: "08:00 - 17:00",
    },
    tasks: [
      { id: "task-1", label: "HV battery conditioning", status: "done", owner: "Tai" },
      { id: "task-2", label: "Thermal management flush", status: "done", owner: "Tai" },
      { id: "task-3", label: "Autopilot calibration", status: "done", owner: "Tai" },
    ],
    parts: [
      { id: "part-1", name: "Coolant hose set", quantity: 1, status: "consumed" },
      { id: "part-2", name: "Cabin filter HEPA", quantity: 1, status: "consumed" },
    ],
    checklist: [
      { id: "chk-1", item: "Maintenance log updated", completed: true },
      { id: "chk-2", item: "Final safety check", completed: true },
    ],
    notes: "Khach danh gia 5 sao, de nghi noi soi khoang pin moi 6 thang.",
    lastUpdated: "2025-10-19T15:30:00.000Z",
  },
];

const timelineEntries = [
  {
    id: "tl-1",
    workOrderId: "WO-2401",
    type: "update",
    title: "Da hoan tat chan doan",
    description: "Trich xuat log hieu nang, phat hien cell pin so 12 vuot nguong 8 do C.",
    timestamp: "2025-10-21T09:15:00.000Z",
  },
  {
    id: "tl-2",
    workOrderId: "WO-2401",
    type: "alert",
    title: "Thieu phu tung",
    description: "HV isolator kit chua nhap kho. Da gui yeu cau xu ly gap cho bo phan kho.",
    timestamp: "2025-10-21T09:25:00.000Z",
  },
  {
    id: "tl-3",
    workOrderId: "WO-2402",
    type: "communication",
    title: "Lien he khach hang",
    description: "Da thong bao ve ke hoach cac lop cach am moi de giam tieng on cabin.",
    timestamp: "2025-10-20T18:45:00.000Z",
  },
  {
    id: "tl-4",
    workOrderId: "WO-2403",
    type: "completion",
    title: "Ban giao xe",
    description: "Lai thu dat chuan, khach hang ky xac nhan hoan tat dich vu.",
    timestamp: "2025-10-19T15:10:00.000Z",
  },
];

const buildResponse = (data, init = {}) =>
  new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
  });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const upsertTimeline = (entry) => {
  const index = timelineEntries.findIndex((item) => item.id === entry.id);
  if (index >= 0) {
    timelineEntries[index] = { ...timelineEntries[index], ...entry };
    return timelineEntries[index];
  }
  const created = { ...entry, id: entry.id || `tl-${Date.now()}` };
  timelineEntries.unshift(created);
  return created;
};

const tryParseJson = async (request) => {
  try {
    const text = await request.clone().text();
    return text ? JSON.parse(text) : {};
  } catch (error) {
    return {};
  }
};

export const setupMockApi = () => {
  if (typeof window === "undefined" || window.__technicianMockApi) {
    return;
  }

  const originalFetch = window.fetch ? window.fetch.bind(window) : null;

  window.fetch = async (input, init = {}) => {
    const request = typeof input === "string" ? new Request(input, init) : input;
    const method = (request.method || "GET").toUpperCase();
    const url = new URL(request.url, window.location.origin);
    const segments = url.pathname.split("/").filter(Boolean);

    const isWorkOrders =
      segments[0] === "api" && segments[1] === "workorders";

    if (isWorkOrders && segments.length === 2) {
      if (method === "GET") {
        await delay(NETWORK_DELAY);
        return buildResponse(workOrders);
      }
    }

    if (isWorkOrders && segments.length >= 3) {
      const workOrderId = segments[2];
      const index = workOrders.findIndex((order) => order.id === workOrderId);

      if (index === -1) {
        return buildResponse({ message: "Work order not found" }, { status: 404 });
      }

      const isTimelineEndpoint = segments.length === 4 && segments[3] === "timeline";

      if (isTimelineEndpoint && method === "POST") {
        await delay(NETWORK_DELAY);
        const payload = await tryParseJson(request);
        const entry = upsertTimeline({
          ...payload,
          workOrderId,
          timestamp: payload.timestamp || new Date().toISOString(),
        });
        return buildResponse(entry);
      }

      if (!isTimelineEndpoint && method === "PATCH") {
        await delay(NETWORK_DELAY);
        const updates = await tryParseJson(request);
        workOrders[index] = {
          ...workOrders[index],
          ...updates,
          lastUpdated: new Date().toISOString(),
        };
        return buildResponse(workOrders[index]);
      }
    }

    if (url.pathname === "/api/timeline" && method === "GET") {
      await delay(NETWORK_DELAY);
      return buildResponse(timelineEntries);
    }

    return originalFetch ? originalFetch(input, init) : buildResponse({}, { status: 500 });
  };

  window.__technicianMockApi = true;
};
