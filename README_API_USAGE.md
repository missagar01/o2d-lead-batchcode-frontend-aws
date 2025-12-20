# API Usage Guide

## Centralized API Configuration

All components MUST use the centralized API configuration from `src/config/api.js`.

## Import Statement

```javascript
import api, { API_ENDPOINTS } from '../../config/api.js'
```

## Available Endpoints

### Authentication
```javascript
API_ENDPOINTS.AUTH.LOGIN      // '/api/auth/login'
API_ENDPOINTS.AUTH.LOGOUT     // '/api/auth/logout'
```

### BatchCode
```javascript
API_ENDPOINTS.BATCHCODE.HOT_COIL      // '/api/batchcode/hot-coil'
API_ENDPOINTS.BATCHCODE.QC_LAB        // '/api/batchcode/qc-lab-samples'
API_ENDPOINTS.BATCHCODE.SMS_REGISTER  // '/api/batchcode/sms-register'
API_ENDPOINTS.BATCHCODE.RECOILER      // '/api/batchcode/re-coiler'
API_ENDPOINTS.BATCHCODE.PIPE_MILL    // '/api/batchcode/pipe-mill'
API_ENDPOINTS.BATCHCODE.LADDLE       // '/api/batchcode/laddle-checklist'
API_ENDPOINTS.BATCHCODE.TUNDISH     // '/api/batchcode/tundish'
```

### Lead-to-Order
```javascript
API_ENDPOINTS.LEAD_TO_ORDER.LEADS         // '/api/lead-to-order/leads'
API_ENDPOINTS.LEAD_TO_ORDER.FOLLOW_UP     // '/api/lead-to-order/follow-up'
API_ENDPOINTS.LEAD_TO_ORDER.CALL_TRACKER  // '/api/lead-to-order/call-tracker'
API_ENDPOINTS.LEAD_TO_ORDER.QUOTATION     // '/api/lead-to-order/quotation'
API_ENDPOINTS.LEAD_TO_ORDER.DASHBOARD     // '/api/lead-to-order/dashboard'
```

### O2D
```javascript
API_ENDPOINTS.O2D.DASHBOARD        // '/api/o2d/dashboard/summary'
API_ENDPOINTS.O2D.GATE_ENTRY       // '/api/o2d/gate-entry'
API_ENDPOINTS.O2D.FIRST_WEIGHT     // '/api/o2d/first-weight'
API_ENDPOINTS.O2D.LOAD_VEHICLE     // '/api/o2d/load-vehicle'
API_ENDPOINTS.O2D.SECOND_WEIGHT    // '/api/o2d/second-weight'
API_ENDPOINTS.O2D.INVOICE          // '/api/o2d/invoice'
API_ENDPOINTS.O2D.GATE_OUT         // '/api/o2d/gate-out'
API_ENDPOINTS.O2D.PAYMENT          // '/api/o2d/payment'
API_ENDPOINTS.O2D.ORDERS           // '/api/o2d/orders'
```

## Usage Examples

### GET Request
```javascript
const fetchData = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.BATCHCODE.HOT_COIL)
    if (response.data?.success) {
      setData(response.data.data)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### POST Request
```javascript
const submitData = async (formData) => {
  try {
    const response = await api.post(API_ENDPOINTS.BATCHCODE.HOT_COIL, formData)
    if (response.data?.success) {
      // Handle success
    }
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### PUT Request
```javascript
const updateData = async (id, formData) => {
  try {
    const response = await api.put(`${API_ENDPOINTS.BATCHCODE.HOT_COIL}/${id}`, formData)
    if (response.data?.success) {
      // Handle success
    }
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### DELETE Request
```javascript
const deleteData = async (id) => {
  try {
    const response = await api.delete(`${API_ENDPOINTS.BATCHCODE.HOT_COIL}/${id}`)
    if (response.data?.success) {
      // Handle success
    }
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### FormData Upload
```javascript
const uploadFile = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const response = await api.post(API_ENDPOINTS.BATCHCODE.QC_LAB, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    if (response.data?.success) {
      // Handle success
    }
  } catch (error) {
    console.error('Error:', error)
  }
}
```

## Important Notes

1. **Always use API_ENDPOINTS** - Never hardcode API URLs
2. **Token is automatically added** - The API interceptor handles authentication
3. **Error handling** - 401 errors automatically redirect to login
4. **Base URL** - Configured via `VITE_API_BASE_URL` environment variable

## Environment Variables

Create a `.env` file in the root:
```
VITE_API_BASE_URL=http://localhost:3005
```




