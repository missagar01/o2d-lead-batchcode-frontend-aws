import api, { API_ENDPOINTS } from '../config/api.js';

export const o2dAPI = {
  // Authentication
  login: (username: string, password: string) =>
    api.post(API_ENDPOINTS.O2D.AUTH.LOGIN, { username, password }),
  getUsers: () => api.get(API_ENDPOINTS.O2D.AUTH.USERS),
  getPermissions: () => api.get(API_ENDPOINTS.O2D.AUTH.PERMISSIONS),

  // Dashboard
  getDashboardSummary: (params?: any) =>
    api.get(API_ENDPOINTS.O2D.DASHBOARD.SUMMARY, { params }),

  // Orders
  getPendingOrders: (params?: any) => api.get(API_ENDPOINTS.O2D.ORDERS.PENDING, { params }),
  getCompletedOrders: (params?: any) => api.get(API_ENDPOINTS.O2D.ORDERS.HISTORY, { params }),

  // Process (Pending Vehicles)
  getProcessTimeline: (params?: any) =>
    api.get(API_ENDPOINTS.O2D.PROCESS.TIMELINE, { params }),

  // Size Master
  getSizeMaster: () => api.get(API_ENDPOINTS.O2D.SIZE_MASTER),

  // Enquiry (sub-route of size-master)
  createEnquiry: (data: any) => api.post(`${API_ENDPOINTS.O2D.SIZE_MASTER}/enquiry`, data),
};

