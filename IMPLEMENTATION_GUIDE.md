# Implementation Guide - Unified Dashboard

## ✅ Completed Structure

### 1. Component Organization
```
src/components/
├── batchcode/          # All BatchCode components
│   ├── AdminLayout.jsx
│   └── HotCoilComponent.jsx (example)
├── lead-to-order/      # All Lead-to-Order components
└── o2d/                # All O2D components
```

### 2. Centralized API Configuration
- **File**: `src/config/api.js`
- **Usage**: All components import from this file
- **Endpoints**: All API endpoints defined in `API_ENDPOINTS` object
- **Authentication**: Automatically handled via interceptors

### 3. Global State Management
- **AuthContext**: `src/context/AuthContext.tsx`
- **Provides**: `user`, `token`, `isAuthenticated`, `login`, `logout`
- **Usage**: `const { user, token } = useAuth()`

### 4. Page Structure
```
src/pages/
├── BatchCode/          # Pages use components from components/batchcode/
├── LeadToOrder/        # Pages use components from components/lead-to-order/
└── O2D/                # Pages use components from components/o2d/
```

## 📋 Next Steps - Copying Components

### For BatchCode Module:
1. Copy components from `frontend/BatchCode-frontend-aws/src/components/` to `src/components/batchcode/`
2. Copy pages from `frontend/BatchCode-frontend-aws/src/pages/` logic to `src/components/batchcode/`
3. Update all API calls to use `import api, { API_ENDPOINTS } from '../../config/api.js'`
4. Replace `import api from '../Api/api'` with centralized API
5. Replace `useAuth()` from old AuthContext with `useAuth()` from `../../context/AuthContext`

### For Lead-to-Order Module:
1. Copy components from `frontend/lead-to-order-frontend/src/components/` to `src/components/lead-to-order/`
2. Copy pages logic to `src/components/lead-to-order/`
3. Update API calls:
   - Replace `import.meta.env.VITE_API_URL` with `API_ENDPOINTS.LEAD_TO_ORDER.*`
   - Use `api.get()`, `api.post()`, etc. from centralized config
4. Update AuthContext usage to use unified `useAuth()`

### For O2D Module:
1. Copy components from `frontend/O2D-frontend/components/` to `src/components/o2d/`
2. Convert Next.js components to React (remove Next.js specific imports)
3. Update API calls:
   - Replace `API_BASE_URL` with `API_ENDPOINTS.O2D.*`
   - Use centralized `api` instance
4. Update AuthContext usage

## 🔧 Component Update Pattern

### Before (Old):
```javascript
import api from '../Api/api'
import { useAuth } from '../AuthContext/AuthContext'

const response = await api.post('/hot-coil', data)
```

### After (New):
```javascript
import api, { API_ENDPOINTS } from '../../config/api.js'
import { useAuth } from '../../context/AuthContext'

const response = await api.post(API_ENDPOINTS.BATCHCODE.HOT_COIL, data)
```

## 📝 Page Update Pattern

### Before:
```javascript
// Page contains all logic
export default function HotCoil() {
  // All component logic here
}
```

### After:
```javascript
// Page imports component from component folder
import HotCoilComponent from '../../components/batchcode/HotCoilComponent'
import AdminLayout from '../../components/batchcode/AdminLayout'

export default function HotCoil() {
  return (
    <AdminLayout>
      <HotCoilComponent />
    </AdminLayout>
  )
}
```

## ✅ Checklist for Each Component

- [ ] Component copied to correct module folder
- [ ] API imports updated to use centralized config
- [ ] AuthContext updated to use unified context
- [ ] All API calls use `API_ENDPOINTS` constants
- [ ] Component is responsive (test on mobile/tablet/desktop)
- [ ] Error handling implemented
- [ ] Loading states implemented

## 🎯 Benefits of This Structure

1. **Easy Maintenance**: Each module's components are in one place
2. **Single Source of Truth**: All API URLs in one file
3. **Consistent Auth**: One authentication system for all modules
4. **Scalable**: Easy to add new modules or features
5. **Production Ready**: Proper error handling, loading states, responsive design

## 🚀 Running the Application

1. Install dependencies:
   ```bash
   cd frontend/MainDashbaod
   npm install
   ```

2. Create `.env` file:
   ```
   VITE_API_BASE_URL=http://localhost:3005
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 📱 Responsive Design

All components should be responsive:
- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

Use Tailwind responsive classes:
- `sm:` for small screens (640px+)
- `md:` for medium screens (768px+)
- `lg:` for large screens (1024px+)
- `xl:` for extra large screens (1280px+)




