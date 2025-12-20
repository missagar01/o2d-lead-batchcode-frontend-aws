# Component Structure Guide

## Overview
This unified dashboard uses a modular component structure where each module (BatchCode, Lead-to-Order, O2D) has its own component folder. This allows for easy maintenance and feature updates.

## Folder Structure

```
src/
├── components/
│   ├── batchcode/          # All BatchCode components
│   ├── lead-to-order/      # All Lead-to-Order components  
│   └── o2d/                # All O2D components
├── pages/
│   ├── BatchCode/          # BatchCode pages (use components from components/batchcode/)
│   ├── LeadToOrder/        # Lead-to-Order pages (use components from components/lead-to-order/)
│   └── O2D/                # O2D pages (use components from components/o2d/)
├── config/
│   └── api.js              # Centralized API configuration - ALL components use this
└── context/
    └── AuthContext.tsx     # Global state management for authentication
```

## How to Use

### 1. API Configuration
**ALWAYS** import from the centralized API config:
```javascript
import api, { API_ENDPOINTS } from '../../config/api.js'

// Use API_ENDPOINTS for endpoint URLs
const response = await api.post(API_ENDPOINTS.BATCHCODE.HOT_COIL, data)
```

### 2. Components
- Components are organized by module
- Each component should be self-contained with its own logic
- Components use the centralized API config
- Components use AuthContext for user state

### 3. Pages
- Pages import components from their respective module folders
- Example: `BatchCode/HotCoil.tsx` imports from `components/batchcode/`

### 4. Global State
- Use `AuthContext` for authentication state
- Access via: `const { user, token, isAuthenticated } = useAuth()`

## Benefits
- ✅ Easy to find and update module-specific features
- ✅ Single source of truth for API configuration
- ✅ Consistent authentication across all modules
- ✅ Maintainable and scalable structure




