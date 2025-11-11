# Google OAuth Setup Guide

## 🔴 Lỗi hiện tại: "The given origin is not allowed for the given client ID"

Lỗi này xảy ra vì `http://localhost:3000` chưa được thêm vào danh sách Authorized JavaScript origins trong Google Cloud Console.

---

## ✅ Cách sửa lỗi:

### **Bước 1: Truy cập Google Cloud Console**

1. Đi tới: https://console.cloud.google.com
2. Chọn project của bạn (hoặc tạo project mới)

### **Bước 2: Cấu hình OAuth Consent Screen**

1. Vào **APIs & Services** → **OAuth consent screen**
2. Chọn **External** (nếu testing) hoặc **Internal**
3. Điền thông tin:
   - App name: `EV Service Management`
   - User support email: Email của bạn
   - Developer contact information: Email của bạn
4. Click **Save and Continue**

### **Bước 3: Tạo OAuth 2.0 Credentials**

1. Vào **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Chọn **Web application**
4. Điền thông tin:
   - **Name**: `EV Service Web Client`
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     http://localhost:3001
     ```
   - **Authorized redirect URIs**: (có thể bỏ trống cho implicit flow)
     ```
     http://localhost:3000
     http://localhost:3000/auth/callback
     ```
5. Click **CREATE**

### **Bước 4: Copy Client ID**

1. Sau khi tạo xong, copy **Client ID**
2. Update vào file `.env` ở root folder:
   ```env
   REACT_APP_GOOGLE_CLIENT_ID=402182573159-gf1i4nu0f1qorshklgsdnem03rc6h07f.apps.googleusercontent.com
   ```
3. Hoặc thay đổi trực tiếp trong `src/index.js`:
   ```javascript
   const DEFAULT_GOOGLE_CLIENT_ID = "YOUR_NEW_CLIENT_ID_HERE";
   ```

### **Bước 5: Restart Development Server**

```bash
# Stop server (Ctrl+C)
npm start
```

---

## 🔧 Backend Configuration

Backend cũng cần có cùng Google Client ID để verify token:

### **ASP.NET Core Backend** (`appsettings.json`):

```json
{
  "Authentication": {
    "Google": {
      "ClientId": "402182573159-gf1i4nu0f1qorshklgsdnem03rc6h07f.apps.googleusercontent.com",
      "ClientSecret": "YOUR_CLIENT_SECRET_HERE"
    }
  }
}
```

### **Environment Variables** (recommended):

```bash
# Windows PowerShell
$env:Authentication__Google__ClientId="YOUR_CLIENT_ID"
$env:Authentication__Google__ClientSecret="YOUR_CLIENT_SECRET"

# Linux/Mac
export Authentication__Google__ClientId="YOUR_CLIENT_ID"
export Authentication__Google__ClientSecret="YOUR_CLIENT_SECRET"
```

---

## 🧪 Testing Google Login

### **1. Check Frontend Configuration**

Mở Console trong browser (F12):
```javascript
// Should see:
[Google OAuth] Đang dùng Google Client ID mặc định...
```

### **2. Click Google Login Button**

Nếu cấu hình đúng:
- ✅ Popup Google login hiện ra
- ✅ Chọn tài khoản Google
- ✅ Token được gửi về backend
- ✅ Backend verify và trả về JWT token

Nếu vẫn lỗi:
- ❌ "The given origin is not allowed" → Check Authorized JavaScript origins
- ❌ "Token Google không hợp lệ" → Check backend Google ClientId configuration

### **3. Backend Token Validation**

Backend sẽ gọi Google API để verify token:
```
POST https://oauth2.googleapis.com/tokeninfo?id_token=YOUR_TOKEN
```

Nếu ClientId không khớp → Backend trả về "Token Google không hợp lệ"

---

## 🔍 Debug Checklist

- [ ] Google Cloud Console project đã tạo
- [ ] OAuth consent screen đã cấu hình
- [ ] OAuth Client ID đã tạo (Web application)
- [ ] `http://localhost:3000` đã thêm vào Authorized JavaScript origins
- [ ] Client ID đã copy vào frontend (`.env` hoặc `index.js`)
- [ ] Client ID đã copy vào backend (`appsettings.json`)
- [ ] Development server đã restart (frontend & backend)

---

## 📝 Alternative: Tắt Google Login tạm thời

Nếu chưa cấu hình Google OAuth, bạn có thể tắt tạm thời:

### **Option 1: Comment out trong Login page**

File `src/pages/auth/Login.jsx`:
```jsx
{/* Tạm thời tắt Google Login */}
{/* <GoogleLoginButton
  onSuccess={handleSocialLoginSuccess}
  onError={handleSocialLoginError}
/> */}
```

### **Option 2: Hide Google Login Button**

File `src/components/GoogleLoginButton.jsx`:
```jsx
// Add at top of component
const ENABLE_GOOGLE_LOGIN = false; // Set to true khi đã config

// In return statement
if (!ENABLE_GOOGLE_LOGIN) {
  return null; // Don't render anything
}
```

---

## 🎯 Production Deployment

Khi deploy lên production:

1. Thêm production domain vào Authorized JavaScript origins:
   ```
   https://your-domain.com
   ```

2. Update `.env.production`:
   ```env
   REACT_APP_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID
   REACT_APP_API_URL=https://your-backend-api.com/api
   ```

3. Rebuild frontend:
   ```bash
   npm run build
   ```

---

## 📚 Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [React OAuth2 Google Package](https://www.npmjs.com/package/@react-oauth/google)
- [Google Cloud Console](https://console.cloud.google.com)
