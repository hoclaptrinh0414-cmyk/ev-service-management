# Quick Start Guide - Admin Portal Development

## 🚀 Getting Started in 5 Minutes

### 1. Navigate to Project
```bash
cd d:\SWP301\ev-service-management
```

### 2. Install Dependencies (if needed)
```bash
npm install
```

### 3. Start Development Server
```bash
npm start
```

### 4. Access Admin Portal
```
URL: http://localhost:3000/admin
```

---

## 📁 Where to Find Things

### Layout Components
```
src/components/layout/
├── Layout.jsx    - Main wrapper (use this for admin routes)
├── Sidebar.jsx   - Left navigation
└── Header.jsx    - Top bar with breadcrumbs
```

### Admin Pages (Redesigned)
```
src/pages/admin/
├── ProfessionalDashboard.jsx  ✅ Modern dashboard
├── Vehicles.jsx               ✅ Vehicle management
├── Finance.jsx                ✅ Financial reports
└── Settings.jsx               ✅ User settings
```

### UI Components (shadcn)
```
src/components/ui/
└── card.jsx      - Card, CardHeader, CardTitle, CardContent, CardFooter
```

### Utilities
```
src/lib/
└── utils.js      - cn() function for merging Tailwind classes
```

---

## 🎯 Common Tasks

### Creating a New Admin Page

1. **Create the file:**
```bash
src/pages/admin/MyNewPage.jsx
```

2. **Basic template:**
```jsx
import React from 'react';
import { Card, CardContent } from '../../components/ui/card';

const MyNewPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Page Title</h1>
        <p className="text-sm text-gray-600 mt-1">Description here</p>
      </div>

      {/* Content */}
      <Card className="border-gray-200">
        <CardContent className="p-6">
          Your content here
        </CardContent>
      </Card>
    </div>
  );
};

export default MyNewPage;
```

3. **Add to routing (App.js):**
```javascript
// Import
import MyNewPage from "./pages/admin/MyNewPage";

// Add route inside admin Route
<Route path="mypage" element={<MyNewPage />} />
```

4. **Add to sidebar navigation (Sidebar.jsx):**
```javascript
// Add to NAV_ITEMS array
{
  title: 'My Page',
  href: '/admin/mypage',
  icon: IconName  // Import from lucide-react
}
```

---

## 🎨 Quick Reference - Common Components

### Stat Card with Trend
```jsx
<Card className="hover:shadow-lg transition-all border-gray-200">
  <CardContent className="p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className="text-sm font-semibold text-emerald-600">+12.5%</span>
    </div>
    <h3 className="text-3xl font-bold text-gray-900">1,247</h3>
    <p className="text-sm text-gray-600">Total Items</p>
  </CardContent>
</Card>
```

### Status Badge
```jsx
<span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
  Active
</span>
```

### Primary Button
```jsx
<button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30">
  <Plus className="w-5 h-5" />
  Add New
</button>
```

### Search Input
```jsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
  <input
    type="text"
    placeholder="Search..."
    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
  />
</div>
```

### Data Table
```jsx
<table className="w-full">
  <thead>
    <tr className="border-b border-gray-200 bg-gray-50">
      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">
        Column Name
      </th>
    </tr>
  </thead>
  <tbody className="divide-y divide-gray-100">
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="py-4 px-6 text-sm text-gray-900">
        Cell Content
      </td>
    </tr>
  </tbody>
</table>
```

---

## 🎨 Color Shortcuts

### Background Colors
```jsx
bg-white           // Card backgrounds
bg-gray-50         // Page background, card hover
bg-gray-900        // Dark backgrounds
bg-blue-600        // Primary actions
bg-emerald-50      // Success backgrounds
bg-red-50          // Error backgrounds
```

### Text Colors
```jsx
text-gray-900      // Headings, primary text
text-gray-600      // Secondary text
text-blue-600      // Links, primary actions
text-emerald-600   // Success messages
text-red-600       // Error messages
```

### Gradients
```jsx
bg-gradient-to-br from-blue-500 to-blue-600      // Primary
bg-gradient-to-br from-emerald-500 to-emerald-600 // Success
bg-gradient-to-br from-purple-500 to-pink-500    // Accent
```

---

## 📐 Spacing Quick Guide

### Container Padding
```jsx
p-6          // Standard (24px)
md:p-10      // Desktop (40px)
```

### Gaps
```jsx
gap-4        // Small (16px)
gap-6        // Medium (24px)
space-y-6    // Vertical spacing (24px)
```

### Rounded Corners
```jsx
rounded-xl   // Standard (12px)
rounded-2xl  // Large (16px)
rounded-full // Pills, avatars
```

---

## 🔍 Debugging Tips

### Check Current Route
```javascript
import { useLocation } from 'react-router-dom';
const location = useLocation();
console.log('Current path:', location.pathname);
```

### Verify API Call
```javascript
console.log('API Request:', params);
console.log('API Response:', response);
```

### Inspect Props
```javascript
console.log('Component props:', props);
```

---

## 🛠️ Common Issues & Solutions

### Issue: Sidebar not showing
**Solution:** Check if Layout component is wrapping the route in App.js

### Issue: Icons not displaying
**Solution:** Import from lucide-react: `import { IconName } from 'lucide-react'`

### Issue: Tailwind classes not working
**Solution:** Make sure class names are complete strings, not dynamic

### Issue: API returning 404
**Solution:** Check API base URL in `src/services/api.js`

### Issue: Cards not styled
**Solution:** Import Card components: `import { Card, CardContent } from '../../components/ui/card'`

---

## 📚 Useful Resources

### Icons (Lucide React)
```
https://lucide.dev/icons
```

### Tailwind CSS
```
https://tailwindcss.com/docs
```

### Shadcn UI
```
https://ui.shadcn.com/docs/components
```

### React Router
```
https://reactrouter.com/en/main
```

---

## 🎯 Best Practices

### 1. Consistent Spacing
```jsx
✅ Always use: space-y-6, gap-6, p-6
❌ Avoid: space-y-5, gap-7, p-5
```

### 2. Color Usage
```jsx
✅ Use semantic colors: bg-emerald-50 for success
❌ Avoid: bg-green-100 (not part of design system)
```

### 3. Component Structure
```jsx
✅ Order: Header → Stats → Content → Actions
❌ Avoid: Random component placement
```

### 4. Responsive Design
```jsx
✅ Use: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
❌ Avoid: Fixed widths without breakpoints
```

### 5. Loading States
```jsx
✅ Show skeleton screens or spinners
❌ Avoid: Blank screen while loading
```

---

## 🚀 Quick Commands

### Run Tests
```bash
npm test
```

### Build for Production
```bash
npm run build
```

### Check for Linting Errors
```bash
npm run lint
```

### Format Code
```bash
npm run format
```

---

## 📞 Need Help?

### Documentation Files
- `ADMIN_REDESIGN_DOCUMENTATION.md` - Complete redesign overview
- `DESIGN_SYSTEM_GUIDE.md` - Design system specifications
- `API_USAGE.md` - API integration guide (in src/services/)

### Team Contacts
- Frontend Lead: [Your Name]
- Backend Lead: [Your Name]
- UI/UX Designer: [Your Name]

---

**Quick Start Version**: 1.0.0  
**Last Updated**: November 11, 2025  
**Keep this handy for rapid development! 🚀**
