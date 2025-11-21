# 🧪 API Testing Guide - Admin Panel

## 🎯 Quick Test Checklist

### Before Testing
- [ ] Backend server is running
- [ ] Database is populated with test data
- [ ] You are logged in as Admin
- [ ] Browser console is open (F12)

---

## 1. 👥 Technician Management Testing

### Access Page:
```
http://localhost:3000/admin/technicians
```

### Test Cases:

#### ✅ Test 1: Load All Technicians
**Expected:**
- List of technicians displays
- Shows: fullName, department, employeeCode
- Avatar images load
- Status indicators show (Available/Busy)

**Check Console For:**
```
GET /api/technicians?IsActive=true&SortBy=FullName&SortDirection=asc&PageNumber=1&PageSize=20
```

**Verify Response Fields:**
- `userId`
- `fullName`
- `email`
- `phoneNumber`
- `employeeCode`
- `department`
- `currentWorkload`
- `isAvailable`
- `topSkills`
- `averageRating`
- `isActive`

---

#### ✅ Test 2: Search Technicians
**Steps:**
1. Type in search box: "Alice"
2. Wait for results

**Expected:**
- Filtered results show
- Only matching technicians display

**Check Console For:**
```
GET /api/technicians?SearchTerm=Alice&...
```

---

#### ✅ Test 3: Filter Available Only
**Steps:**
1. Check "Show Available Only" checkbox

**Expected:**
- Only available technicians show
- Status indicators all show "Available"

**Check Console For:**
```
GET /api/technicians?IsActive=true&...
```

---

#### ✅ Test 4: View Technician Details
**Steps:**
1. Click eye icon on any technician card

**Expected:**
- Modal opens
- Shows technician details
- All fields populated

**Check Console For:**
```
GET /api/technicians/{userId}
```

---

#### ✅ Test 5: View Schedule
**Steps:**
1. Click calendar icon

**Expected:**
- Modal opens with schedule
- Shows appointments/work orders

**Check Console For:**
```
GET /api/technicians/{userId}/schedule
```

---

#### ✅ Test 6: View Performance
**Steps:**
1. Click graph icon

**Expected:**
- Modal shows performance metrics
- Displays: completed jobs, rating, completion time, quality score

**Check Console For:**
```
GET /api/technicians/{userId}/performance
```

---

#### ✅ Test 7: View Skills
**Steps:**
1. Click award icon

**Expected:**
- Modal shows skills list
- Each skill has name and level
- Verified skills show checkmark

**Check Console For:**
```
GET /api/technicians/{userId}/skills
```

---

#### ✅ Test 8: View Workload Balance
**Steps:**
1. Click "Workload Balance" button in header

**Expected:**
- Modal shows all technicians
- Bar chart of workload
- Shows active jobs count

**Check Console For:**
```
GET /api/technicians/workload-balance/1
```

---

## 2. 💰 Financial Reports Testing

### Access Page:
```
http://localhost:3000/admin/finance
```

### Test Cases:

#### ✅ Test 1: Load Today's Revenue
**Expected:**
- Summary cards show data
- "Today's Revenue" card populated
- Shows amount in VND format
- Trend indicator shows percentage

**Check Console For:**
```
GET /api/financial-reports/revenue/today
```

**Verify Response Fields:**
- `date`
- `totalRevenue`
- `paymentCount`
- `averagePaymentAmount`
- `collectionRate`
- `paymentMethodBreakdown[]`

---

#### ✅ Test 2: Load This Month's Revenue
**Expected:**
- "This Month's Profit" card shows data
- Profit margin percentage displays

**Check Console For:**
```
GET /api/financial-reports/revenue/this-month
```

---

#### ✅ Test 3: Revenue Report with Date Range
**Expected:**
- Revenue tab shows data table
- Rows for each day in range
- Shows: date, service center, revenue, transactions, avg value

**Check Console For:**
```
GET /api/financial-reports/revenue?StartDate=2025-11-01&EndDate=2025-11-21&GroupBy=Daily&IncludePaymentMethodBreakdown=true
```

---

#### ✅ Test 4: Change Date Range
**Steps:**
1. Select new "From" date
2. Select new "To" date
3. Wait for reload

**Expected:**
- All data refreshes
- New date range applied to all reports

**Check Console For:**
- Multiple API calls with new dates

---

#### ✅ Test 5: Payment Gateway Comparison
**Expected:**
- Payments tab shows gateway data
- Shows: payment method, transaction count, total amount

**Check Console For:**
```
GET /api/financial-reports/payments/gateway-comparison?startDate=...&endDate=...
```

---

#### ✅ Test 6: Outstanding Invoices
**Expected:**
- Invoices tab shows outstanding invoices
- Each row shows: code, customer, amount, status, due date

**Check Console For:**
```
GET /api/financial-reports/invoices?Status=Outstanding&IncludeAgingAnalysis=true&IncludeDiscountAnalysis=true&IncludeTaxSummary=true
```

---

#### ✅ Test 7: Popular Services
**Expected:**
- Services tab shows service cards
- Ranked #1, #2, #3, etc.
- Shows booking count and revenue
- Progress bar indicates popularity

**Check Console For:**
```
GET /api/financial-reports/popular-services?dateFrom=...&dateTo=...&limit=10
```

---

## 3. 🔍 Error Handling Testing

### Test Case: Network Error
**Steps:**
1. Stop backend server
2. Refresh page

**Expected:**
- Error message displays
- "Retry" button appears
- No crash

---

### Test Case: Empty Data
**Steps:**
1. Set date range with no data
2. Check all tabs

**Expected:**
- "No data available" message shows
- No errors in console
- UI remains stable

---

### Test Case: Invalid Date Range
**Steps:**
1. Set "To" date before "From" date

**Expected:**
- API returns error
- Error message displays
- User can correct

---

## 4. 📊 Data Validation

### Technician Data:
```javascript
// Check in console
console.log(technicians[0]);

// Should have:
{
  userId: 2057,
  fullName: "Alice Nguyễn",
  email: "alice.nguyen@evservice.vn",
  phoneNumber: "+84345678901",
  employeeCode: "EMP-25-0003",
  department: "Customer Support",
  currentWorkload: 0,
  isAvailable: true,
  topSkills: "Brake System Repair, Software Update, Battery Replacement",
  averageRating: 4.09,
  isActive: true
}
```

---

### Financial Data:
```javascript
// Check in console
console.log(todayRevenue);

// Should have:
{
  date: "2025-11-21T00:00:00+07:00",
  totalRevenue: 9700000,
  paymentCount: 9,
  averagePaymentAmount: 1077777.78,
  collectionRate: 0,
  paymentMethodBreakdown: [...]
}
```

---

## 5. 🎯 Performance Testing

### Load Time:
- [ ] Page loads in < 3 seconds
- [ ] API calls complete in < 2 seconds
- [ ] No unnecessary re-renders

### Network Tab:
- [ ] Check number of requests
- [ ] Verify no duplicate calls
- [ ] Check response sizes

### Console:
- [ ] No errors
- [ ] No warnings
- [ ] API calls logged correctly

---

## 6. 🐛 Common Issues & Solutions

### Issue 1: "Failed to load technicians"
**Cause:** Backend not running or wrong URL  
**Solution:** 
1. Check backend is running
2. Verify `.env` has correct `REACT_APP_API_BASE_URL`
3. Check network tab for actual URL called

---

### Issue 2: Empty data displays
**Cause:** Database has no data  
**Solution:**
1. Check database has test data
2. Verify API returns data in Swagger/Postman
3. Check response format matches expected

---

### Issue 3: "userId is undefined"
**Cause:** API response uses different field name  
**Solution:**
1. Check actual API response in network tab
2. Update field mapping in code
3. Use fallback: `userId || id`

---

### Issue 4: Currency not formatting
**Cause:** Amount is string instead of number  
**Solution:**
1. Parse to number: `parseFloat(amount)`
2. Check API returns number type
3. Add null check: `amount || 0`

---

### Issue 5: Date shows "Invalid Date"
**Cause:** Date format mismatch  
**Solution:**
1. Check date format from API
2. Use `new Date(dateString)`
3. Add validation before formatting

---

## 7. ✅ Success Criteria

### Technician Management:
- ✅ All technicians load correctly
- ✅ Search works
- ✅ Filters work
- ✅ Details modal shows correct data
- ✅ All fields display properly
- ✅ No console errors

### Financial Reports:
- ✅ Today's revenue displays
- ✅ Month summary shows
- ✅ Date range filtering works
- ✅ All tabs load data
- ✅ Currency formats correctly
- ✅ Charts/tables populate
- ✅ No console errors

### Overall:
- ✅ Fast load times
- ✅ Smooth interactions
- ✅ Proper error handling
- ✅ Good user feedback
- ✅ Mobile responsive
- ✅ No memory leaks

---

## 8. 📝 Test Report Template

```markdown
## Test Report - [Date]

### Tested By: [Your Name]
### Environment: Development/Staging/Production
### Browser: Chrome/Firefox/Safari

### Technician Management
- [ ] Load all technicians: PASS/FAIL
- [ ] Search: PASS/FAIL
- [ ] Filters: PASS/FAIL
- [ ] View details: PASS/FAIL
- [ ] View schedule: PASS/FAIL
- [ ] View performance: PASS/FAIL
- [ ] View skills: PASS/FAIL
- [ ] Workload balance: PASS/FAIL

### Financial Reports
- [ ] Today's revenue: PASS/FAIL
- [ ] Month summary: PASS/FAIL
- [ ] Revenue report: PASS/FAIL
- [ ] Date range filter: PASS/FAIL
- [ ] Payment gateway: PASS/FAIL
- [ ] Outstanding invoices: PASS/FAIL
- [ ] Popular services: PASS/FAIL

### Issues Found:
1. [Issue description]
   - Severity: High/Medium/Low
   - Steps to reproduce:
   - Expected:
   - Actual:

### Screenshots:
[Attach screenshots of issues]

### Overall Status: PASS/FAIL
```

---

## 9. 🚀 Quick Commands

### Start Backend:
```bash
cd backend
dotnet run
```

### Start Frontend:
```bash
cd ev-service-management
npm start
```

### Check API:
```bash
# Open Swagger
https://unprepared-kade-nonpossibly.ngrok-free.dev/swagger
```

### Clear Cache:
```bash
# In browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## 10. 📞 Support

### If Tests Fail:
1. Check `API_INTEGRATION_SUMMARY.md` for implementation details
2. Review `ADMIN_API_INTEGRATION_GUIDE.md` for API documentation
3. Check browser console for errors
4. Verify backend is running and accessible
5. Test API directly in Swagger/Postman

### Need Help?
- Check documentation files in project root
- Review code comments in service files
- Test API endpoints in Swagger UI
- Check network tab for actual requests/responses

---

**Happy Testing! 🎉**
