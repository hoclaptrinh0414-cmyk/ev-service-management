# EVSC – Technician App – Frontend Integration (React)

Tài liệu này giúp FE (React hoặc mobile) tích hợp **toàn bộ flow Technician** dựa trên:

- API backend (Postman collection: `EVSC - Technician FULL E2E + Checklist`)
- Figma flow:  
  **EVSC Technician Flow – Attendance – Work Order – Checklist – Self-Service**  
  https://www.figma.com/board/NHRaSpKrTAL8nDNPK8V1o5/EVSC-Technician-Flow--Attendance---Work-Order---Checklist---Self-Service-?node-id=0-1&p=f&t=swg8cuk6FNMyCvAT-0
- File hướng dẫn này (`README_FE_Technician_Flow.md`)

Mục tiêu:

> FE chỉ cần: **Figma + Postman collection + README này** là có thể implement full flow cho Technician (Login → Attendance → Work Orders → Checklist → Self-Service) mà không cần hỏi thêm BE.

---

## 0. FE sẽ nhận được những gì?

Khi onboard feature Technician, package gửi cho FE gồm:

1. **Figma board**:  
   EVSC Technician Flow – Attendance – Work Order – Checklist – Self-Service  
   → Tham chiếu UX/UI, routing, luồng màn hình.

2. **Postman Collection (JSON)**:  
   `EVSC - Technician FULL E2E + Checklist.json`  
   - Đã cấu hình đủ:
     - Login Technician
     - Attendance (Check-in / Check-out / Today Shift / History)
     - Work Order lifecycle (Start / Complete)
     - Checklist (8 endpoints)
     - Technician Self-Service (Schedule, Performance, Ratings, Time-off)
   - Dùng **Collection Variables**, không dùng Environment.

3. **File này**: `README_FE_Technician_Flow.md`  
   - Guideline mapping từ API → màn hình React
   - Ví dụ code (service, hook, component) bằng React + Axios.

---

## 1. Thông tin chung

### 1.1. Base URL & Auth

- `baseUrl`: `https://localhost:7077`  
  (hoặc URL DEV/STG/PROD thực tế – BE sẽ cung cấp khi triển khai)
- Toàn bộ API (trừ login) yêu cầu header:

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

### 1.2. Tài khoản test

Dùng chung với Postman:

- `username`: `techtest001`
- `password`: `Tech@123`

### 1.3. Luồng tổng thể một ngày làm việc của Technician

1. Login
2. Dashboard:
   - Xem ca làm hôm nay (Today Shift)
   - Xem Work Orders được assign
3. Attendance:
   - Check-in
4. Work Orders:
   - Chọn 1 Work Order
   - Start Work Order
   - Làm Checklist (complete/skip…)
   - Validate checklist
   - Complete Work Order
5. Attendance:
   - Check-out
6. Self-service:
   - Xem lịch làm việc, performance, ratings
   - Request time-off (nếu cần)

Figma đã mô tả đầy đủ flow; README này tập trung map **API ↔ UI React**.

---

## 2. Quickstart cho React

Giả định FE dùng:

- React 18+
- React Router (v6+)
- Axios làm HTTP client
- Token lưu trong `localStorage` hoặc state management (Redux/Zustand…)

### 2.1. Cấu hình Axios client

**`src/api/client.ts`**

```ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7077';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Gắn token từ localStorage (hoặc từ nơi khác tuỳ FE)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('technician_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 2.2. Auth service cho Technician

**`src/api/technicianAuthService.ts`**

```ts
import { apiClient } from './client';

export interface TechnicianLoginResponse {
  accessToken: string;
  userId: number;
  fullName: string;
  role: string;
}

export async function loginTechnician(username: string, password: string): Promise<TechnicianLoginResponse> {
  const res = await apiClient.post('/api/auth/login', { username, password });
  const body = res.data;
  const data = body.data || body.Data;

  const result: TechnicianLoginResponse = {
    accessToken: data.accessToken,
    userId: data.userId,
    fullName: data.fullName,
    role: data.role,
  };

  // Lưu vào localStorage (FE có thể thay bằng context/store tuỳ ý)
  localStorage.setItem('technician_access_token', result.accessToken);
  localStorage.setItem('technician_user_id', String(result.userId));
  localStorage.setItem('technician_full_name', result.fullName);

  return result;
}
```

### 2.3. Ví dụ màn Login (React)

**`src/pages/TechnicianLoginPage.tsx`**

```tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginTechnician } from '../api/technicianAuthService';

export const TechnicianLoginPage: React.FC = () => {
  const [username, setUsername] = useState('techtest001');
  const [password, setPassword] = useState('Tech@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await loginTechnician(username, password);
      if (result.role !== 'Technician') {
        setError('Tài khoản không phải Technician.');
        return;
      }
      navigate('/technician/dashboard');
    } catch (err: any) {
      setError('Sai tài khoản hoặc mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <h1>Technician Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)} />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
};
```

---

## 3. Dashboard & Attendance

### 3.1. Endpoint liên quan

| Use case                | Method | Path                                         |
|-------------------------|--------|----------------------------------------------|
| Today shift             | GET    | `/api/technicians/attendance/today`          |
| Check-in                | POST   | `/api/technicians/attendance/check-in`       |
| Check-out               | POST   | `/api/technicians/attendance/check-out`      |
| Shift history (My Shifts)| GET   | `/api/technicians/attendance/my-shifts`      |
| My work orders          | GET    | `/api/technicians/my-work-orders`            |

### 3.2. Service layer

**`src/api/technicianAttendanceService.ts`**

```ts
import { apiClient } from './client';

export interface TodayShift {
  shiftId: number;
  shiftDate: string;
  shiftType: string;
  status: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  checkInTime?: string;
  checkOutTime?: string;
  isLate?: boolean;
  lateMinutes?: number;
  isEarlyLeave?: boolean;
}

export async function getTodayShift(): Promise<TodayShift | null> {
  const res = await apiClient.get('/api/technicians/attendance/today');
  const body = res.data;
  return body.data || body.Data || null;
}

export async function checkIn(serviceCenterId: number, shiftType = 'FullDay', notes?: string) {
  const res = await apiClient.post('/api/technicians/attendance/check-in', {
    serviceCenterId,
    shiftType,
    notes: notes || 'Check-in via Technician App',
  });
  return res.data.data || res.data.Data;
}

export async function checkOut(notes?: string, earlyCheckoutReason?: string | null) {
  const res = await apiClient.post('/api/technicians/attendance/check-out', {
    notes: notes || 'Check-out via Technician App',
    earlyCheckoutReason: earlyCheckoutReason ?? null,
  });
  return res.data.data || res.data.Data;
}

export async function getMyShifts() {
  const res = await apiClient.get('/api/technicians/attendance/my-shifts');
  return res.data.data || res.data.Data || [];
}
```

**`src/api/technicianWorkOrderService.ts`**

```ts
import { apiClient } from './client';

export interface TechnicianWorkOrder {
  workOrderId: number;
  workOrderCode: string;
  statusId: number;
  statusName: string;
  customerName: string;
  vehicleName?: string;
}

export async function getMyWorkOrders(): Promise<TechnicianWorkOrder[]> {
  const res = await apiClient.get('/api/technicians/my-work-orders');
  return res.data.data || res.data.Data || [];
}
```

### 3.3. Dashboard React (Today Shift + My Work Orders)

**`src/pages/TechnicianDashboardPage.tsx`**

```tsx
import React, { useEffect, useState } from 'react';
import { getTodayShift, checkIn, checkOut } from '../api/technicianAttendanceService';
import { getMyWorkOrders, TechnicianWorkOrder } from '../api/technicianWorkOrderService';
import { useNavigate } from 'react-router-dom';

export const TechnicianDashboardPage: React.FC = () => {
  const [todayShift, setTodayShift] = useState<any | null>(null);
  const [workOrders, setWorkOrders] = useState<TechnicianWorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [shift, wos] = await Promise.all([
          getTodayShift(),
          getMyWorkOrders(),
        ]);
        setTodayShift(shift);
        setWorkOrders(wos);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCheckIn = async () => {
    const result = await checkIn(1, 'FullDay');
    setTodayShift(result);
  };

  const handleCheckOut = async () => {
    const result = await checkOut();
    setTodayShift(result);
  };

  const navigateToWorkOrder = (wo: TechnicianWorkOrder) => {
    navigate(`/technician/work-orders/${wo.workOrderId}`);
  };

  if (loading) return <p>Đang tải dashboard…</p>;

  return (
    <div>
      <h1>Technician Dashboard</h1>

      {/* Today Shift Card */}
      <section>
        <h2>Ca làm hôm nay</h2>
        {todayShift ? (
          <div>
            <p>Ngày: {todayShift.shiftDate}</p>
            <p>Loại ca: {todayShift.shiftType}</p>
            <p>Trạng thái: {todayShift.status}</p>
            <p>
              Giờ công: {todayShift.scheduledStartTime} - {todayShift.scheduledEndTime}
            </p>
            <p>Check-in: {todayShift.checkInTime || 'Chưa'}</p>
            <p>Check-out: {todayShift.checkOutTime || 'Chưa'}</p>

            {!todayShift.isCheckedIn && (
              <button onClick={handleCheckIn}>Check-in</button>
            )}
            {todayShift.isCheckedIn && !todayShift.isCompleted && (
              <button onClick={handleCheckOut}>Check-out</button>
            )}
          </div>
        ) : (
          <p>Chưa có ca làm hôm nay.</p>
        )}
      </section>

      {/* My Work Orders */}
      <section>
        <h2>Work Orders được assign</h2>
        {workOrders.length === 0 && <p>Không có Work Order nào.</p>}

        <ul>
          {workOrders.map(wo => (
            <li key={wo.workOrderId}>
              <button onClick={() => navigateToWorkOrder(wo)}>
                [{wo.workOrderCode}] - {wo.customerName} ({wo.statusName})
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
```

---

## 4. Work Order & Checklist Flow

### 4.1. Endpoint Work Order

| Use case         | Method | Path                                      |
|------------------|--------|-------------------------------------------|
| Start WO         | POST   | `/api/work-orders/{workOrderId}/start`    |
| Complete WO      | POST   | `/api/work-orders/{workOrderId}/complete` |
| Validate trước complete | GET | `/api/work-orders/{workOrderId}/validate` |
| Bulk complete all items (test/tool) | POST | `/api/work-orders/{workOrderId}/complete-all` |

### 4.2. Endpoint Checklist (8 endpoints)

| Use case                          | Method | Path                                                       |
|-----------------------------------|--------|------------------------------------------------------------|
| Get checklist of WO               | GET    | `/api/work-orders/{workOrderId}/checklist`                 |
| Update item (notes/image/…)       | PUT    | `/api/checklist-items/{itemId}`                           |
| Quick complete item               | PATCH  | `/api/checklist-items/{itemId}/complete`                  |
| Undo complete                     | PATCH  | `/api/checklist-items/{itemId}/uncomplete`                |
| Complete item (full validation)   | POST   | `/api/items/complete`                                     |
| Skip item (optional only)         | POST   | `/api/items/skip`                                         |
| Validate WO completion            | GET    | `/api/work-orders/{workOrderId}/validate`                 |
| Bulk complete all checklist items | POST   | `/api/work-orders/{workOrderId}/complete-all`             |

### 4.3. Service checklist & work order

**`src/api/technicianChecklistService.ts`**

```ts
import { apiClient } from './client';

export interface ChecklistItem {
  itemId: number;
  itemDescription: string;
  isRequired: boolean;
  isCompleted: boolean;
  notes?: string;
  imageUrl?: string | null;
}

export interface ChecklistSummary {
  items: ChecklistItem[];
  totalItems: number;
  completedItems: number;
  progressPercentage: number;
}

export async function getChecklist(workOrderId: number): Promise<ChecklistSummary> {
  const res = await apiClient.get(`/api/work-orders/${workOrderId}/checklist`);
  return res.data.data || res.data.Data;
}

export async function updateChecklistItem(itemId: number, payload: { isCompleted?: boolean | null; notes?: string; imageUrl?: string | null; }) {
  const res = await apiClient.put(`/api/checklist-items/${itemId}`, {
    isCompleted: payload.isCompleted ?? null,
    notes: payload.notes ?? null,
    imageUrl: payload.imageUrl ?? null,
  });
  return res.data.data || res.data.Data;
}

export async function quickCompleteItem(itemId: number, notes: string) {
  const res = await apiClient.patch(`/api/checklist-items/${itemId}/complete`, JSON.stringify(notes), {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data.data || res.data.Data;
}

export async function undoCompleteItem(itemId: number) {
  const res = await apiClient.patch(`/api/checklist-items/${itemId}/uncomplete`);
  return res.data.data || res.data.Data;
}

export async function completeItemFull(itemId: number, workOrderId: number, notes: string, imageUrl?: string | null) {
  const res = await apiClient.post('/api/items/complete', {
    itemId,
    workOrderId,
    notes,
    imageUrl: imageUrl ?? null,
  });
  return res.data.data || res.data.Data;
}

export async function skipOptionalItem(itemId: number, workOrderId: number, skipReason: string) {
  const res = await apiClient.post('/api/items/skip', {
    itemId,
    workOrderId,
    skipReason,
  });
  return res.data.data || res.data.Data;
}

export async function validateWorkOrder(workOrderId: number) {
  const res = await apiClient.get(`/api/work-orders/${workOrderId}/validate`);
  return res.data.data || res.data.Data;
}

export async function startWorkOrder(workOrderId: number) {
  const res = await apiClient.post(`/api/work-orders/${workOrderId}/start`);
  return res.data.data || res.data.Data;
}

export async function completeWorkOrder(workOrderId: number) {
  const res = await apiClient.post(`/api/work-orders/${workOrderId}/complete`);
  return res.data.data || res.data.Data;
}
```

### 4.4. Work Order Detail + Checklist UI (React)

Routing gợi ý:

- `/technician/work-orders/:id`  
  → trang Work Order Detail + tab Checklist.

**`src/pages/WorkOrderDetailPage.tsx`**

```tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getChecklist,
  quickCompleteItem,
  undoCompleteItem,
  validateWorkOrder,
  startWorkOrder,
  completeWorkOrder,
} from '../api/technicianChecklistService';

export const WorkOrderDetailPage: React.FC = () => {
  const { id } = useParams();
  const workOrderId = Number(id);
  const [checklist, setChecklist] = useState<any | null>(null);
  const [validating, setValidating] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadChecklist = async () => {
    const data = await getChecklist(workOrderId);
    setChecklist(data);
  };

  useEffect(() => {
    if (!workOrderId) return;
    loadChecklist();
  }, [workOrderId]);

  const handleStartWorkOrder = async () => {
    await startWorkOrder(workOrderId);
    await loadChecklist();
  };

  const handleToggleItem = async (item: any) => {
    if (!item.isCompleted) {
      await quickCompleteItem(item.itemId, 'Completed via app');
    } else {
      await undoCompleteItem(item.itemId);
    }
    await loadChecklist();
  };

  const handleValidateAndComplete = async () => {
    setValidating(true);
    setMessage(null);
    try {
      const result = await validateWorkOrder(workOrderId);
      if (!result.canComplete) {
        setMessage(
          `Không thể hoàn tất Work Order. Còn ${result.missingCount} hạng mục required: ${result.missingItems.join(', ')}`
        );
        return;
      }
      setValidating(false);
      setCompleting(true);
      await completeWorkOrder(workOrderId);
      setMessage('Work Order đã được hoàn tất.');
      await loadChecklist();
    } finally {
      setValidating(false);
      setCompleting(false);
    }
  };

  if (!checklist) return <p>Đang tải checklist…</p>;

  return (
    <div>
      <h1>Work Order #{workOrderId}</h1>

      <button onClick={handleStartWorkOrder}>Start Work Order</button>

      <h2>Checklist</h2>
      <p>
        Hoàn thành: {checklist.completedItems}/{checklist.totalItems} (
        {checklist.progressPercentage}%)
      </p>

      <ul>
        {checklist.items.map((item: any) => (
          <li key={item.itemId}>
            <label>
              <input
                type="checkbox"
                checked={item.isCompleted}
                onChange={() => handleToggleItem(item)}
              />
              [{item.isRequired ? 'Required' : 'Optional'}] {item.itemDescription}
            </label>
            {item.notes && <div>Ghi chú: {item.notes}</div>}
          </li>
        ))}
      </ul>

      {message && <p>{message}</p>}

      <button
        onClick={handleValidateAndComplete}
        disabled={validating || completing}
      >
        {validating
          ? 'Đang kiểm tra checklist…'
          : completing
          ? 'Đang hoàn tất WO…'
          : 'Hoàn tất Work Order'}
      </button>
    </div>
  );
};
```

Flow đề xuất:

1. User mở **Work Order Detail** từ Dashboard.
2. Bấm **Start Work Order** (nếu chưa InProgress).
3. Check từng item trong Checklist (quick complete / undo).
4. Bấm **Hoàn tất Work Order**:
   - FE gọi `GET /validate`
   - Nếu `canComplete = false` → show danh sách thiếu.
   - Nếu `canComplete = true` → gọi `POST /complete`.

---

## 5. Technician Self-Service

### 5.1. Endpoint Self-Service

| Use case         | Method | Path                                    |
|------------------|--------|-----------------------------------------|
| My Schedule      | GET    | `/api/technicians/my-schedule`         |
| My Performance   | GET    | `/api/technicians/my-performance`      |
| My Ratings       | GET    | `/api/technicians/my-ratings`          |
| Request Time Off | POST   | `/api/technicians/request-time-off`    |

### 5.2. Service layer

**`src/api/technicianSelfService.ts`**

```ts
import { apiClient } from './client';

export async function getMySchedule() {
  const res = await apiClient.get('/api/technicians/my-schedule');
  return res.data.data || res.data.Data || [];
}

export async function getMyPerformance() {
  const res = await apiClient.get('/api/technicians/my-performance');
  return res.data.data || res.data.Data;
}

export async function getMyRatings() {
  const res = await apiClient.get('/api/technicians/my-ratings');
  return res.data.data || res.data.Data || [];
}

export async function requestTimeOff(payload: {
  technicianId: number;
  startDate: string;
  endDate: string;
  reason: string;
  timeOffType: string;
  notes?: string;
}) {
  const res = await apiClient.post('/api/technicians/request-time-off', payload);
  return res.data.data || res.data.Data;
}
```

### 5.3. Ví dụ màn Time-off Request

**`src/pages/TechnicianTimeOffPage.tsx`**

```tsx
import React, { useState } from 'react';
import { requestTimeOff } from '../api/technicianSelfService';

export const TechnicianTimeOffPage: React.FC = () => {
  const technicianId = Number(localStorage.getItem('technician_user_id'));
  const [startDate, setStartDate] = useState('2024-11-01');
  const [endDate, setEndDate] = useState('2024-11-03');
  const [reason, setReason] = useState('Family emergency');
  const [timeOffType, setTimeOffType] = useState('Emergency');
  const [notes, setNotes] = useState('Requested via app');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      await requestTimeOff({
        technicianId,
        startDate,
        endDate,
        reason,
        timeOffType,
        notes,
      });
      setMessage('Đã gửi yêu cầu nghỉ, chờ duyệt.');
    } catch {
      setMessage('Không gửi được yêu cầu nghỉ. Vui lòng thử lại.');
    }
  };

  return (
    <div>
      <h1>Request Time Off</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Từ ngày</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <label>Đến ngày</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <div>
          <label>Lý do</label>
          <input value={reason} onChange={e => setReason(e.target.value)} />
        </div>
        <div>
          <label>Loại nghỉ</label>
          <select value={timeOffType} onChange={e => setTimeOffType(e.target.value)}>
            <option value="Annual">Annual</option>
            <option value="Sick">Sick</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>
        <div>
          <label>Ghi chú</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <button type="submit">Gửi yêu cầu</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};
```

---

## 6. Routing & Mapping với Figma

### 6.1. Routing React (gợi ý)

| Route                                  | Màn hình Figma                          |
|----------------------------------------|-----------------------------------------|
| `/login`                               | Login                                   |
| `/technician/dashboard`                | Dashboard (Today Shift + My WOs)        |
| `/technician/attendance`              | Attendance / Shift history              |
| `/technician/work-orders`             | Work Orders List                        |
| `/technician/work-orders/:id`         | Work Order Detail + Checklist           |
| `/technician/self/schedule`           | Self-Service – Schedule                 |
| `/technician/self/performance`        | Self-Service – Performance              |
| `/technician/self/ratings`            | Self-Service – Ratings                  |
| `/technician/self/time-off`           | Self-Service – Request Time Off         |

Mapping chi tiết Figma → API:

| Figma Screen                    | API chính dùng                                                                                                                                                       |
|---------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Login                           | `POST /api/auth/login`                                                                                                                                              |
| Dashboard                       | `GET /api/technicians/attendance/today` + `GET /api/technicians/my-work-orders`                                                                                     |
| Attendance (Check-in/Check-out) | `POST /api/technicians/attendance/check-in`, `POST /api/technicians/attendance/check-out`, `GET /api/technicians/attendance/my-shifts`                              |
| Work Orders List                | `GET /api/technicians/my-work-orders`                                                                                                                               |
| Work Order Detail               | `POST /api/work-orders/{id}/start`, `POST /api/work-orders/{id}/complete`, `GET /api/work-orders/{id}/validate`                                                     |
| Checklist                       | `GET /api/work-orders/{id}/checklist`, `PUT /api/checklist-items/{id}`, `PATCH /checklist-items/{id}/complete`, `PATCH /checklist-items/{id}/uncomplete`, `POST /api/items/complete`, `POST /api/items/skip` |
| Self-Service – Schedule         | `GET /api/technicians/my-schedule`                                                                                                                                  |
| Self-Service – Performance      | `GET /api/technicians/my-performance`                                                                                                                               |
| Self-Service – Ratings          | `GET /api/technicians/my-ratings`                                                                                                                                   |
| Self-Service – Request Time Off | `POST /api/technicians/request-time-off`                                                                                                                            |

---

## 7. Hướng dẫn sử dụng Postman Collection (cho FE)

Postman collection `EVSC - Technician FULL E2E + Checklist` đã được cấu trúc theo folder:

1. **Setup & Prerequisites**
   - Login Technician
   - Get My Work Orders (chọn sẵn 1 Work Order để test)
2. **Technician - Attendance & Work Lifecycle**
   - Check-in / Today Shift / Start WO / Complete WO / Check-out / History
3. **Checklist APIs - 8 Endpoints**
   - Đủ 8 API checklist với test script và ví dụ body.
4. **Technician Self-Service**
   - Schedule / Performance / Ratings / Time-off
5. **Verification**
   - Final checklist status.

FE có thể:

- Import collection → dùng như “nguồn sự thật” về request/response.
- Mở tab **Tests** để xem script Postman cách BE parse `data/Data` và lưu biến → từ đó map sang FE.

---

## 8. Tóm tắt thực thi cho FE

1. **Nhận package từ BE**:
   - Figma board link
   - Postman collection JSON
   - `README_FE_Technician_Flow.md`

2. **Thiết lập FE**:
   - Tạo `apiClient` (Axios) với `baseUrl` + interceptor Bearer token.
   - Tạo các service: `technicianAuthService`, `technicianAttendanceService`, `technicianWorkOrderService`, `technicianChecklistService`, `technicianSelfService`.

3. **Triển khai flow chính**:
   - Login → lưu `accessToken`, `userId`, `fullName`.
   - Dashboard:
     - Call Today Shift + My Work Orders.
   - Attendance:
     - Check-in → cập nhật Today Shift.
     - Check-out → cập nhật Today Shift + History.
   - Work Order + Checklist:
     - Chọn WO → Start → Checklist (complete/skip) → Validate → Complete WO.
   - Self-Service:
     - Schedule, Performance, Ratings, Time-off.

Với Figma + Postman + file README này, FE có đầy đủ thông tin để implement **end-to-end Technician flow** bằng React.
