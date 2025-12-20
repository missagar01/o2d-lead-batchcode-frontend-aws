// services/dashboard-api.js
import api, { API_ENDPOINTS } from '../../../config/api.js';

// Fallback data for metrics
const fallbackMetrics = {
  totalLeads: 124,
  pendingFollowups: 38,
  quotationsSent: 56,
  ordersReceived: 27,
  totalEnquiry: 145,
  pendingEnquiry: 42
};

// Fetch dashboard metrics
export const fetchDashboardMetrics = async (userId, isAdmin) => {
  try {
    const response = await api.get(API_ENDPOINTS.LEAD_TO_ORDER.DASHBOARD.METRICS, {
      params: {
        userId: userId,
        isAdmin: isAdmin
      }
    });
    
    // Check if response data is HTML (string starting with <)
    if (typeof response.data === 'string') {
      const trimmed = response.data.trim();
      if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
        return fallbackMetrics;
      }
    }
    
    // Check if response has valid data structure
    if (response?.data?.success && response?.data?.data) {
      return response.data.data;
    } else {
      return fallbackMetrics;
    }
  } catch (error) {
    // Check if error is due to HTML response (backend returning error page)
    if (error.response) {
      const contentType = error.response.headers?.['content-type'] || '';
      if (contentType.includes('text/html')) {
        return fallbackMetrics;
      }
      
      // For 401, let the interceptor handle it (don't redirect here to prevent loops)
      if (error.response.status === 401) {
        return fallbackMetrics;
      }
    }
    
    // For network errors or other issues, use fallback data
    return fallbackMetrics;
  }
};

// Fallback data for charts
const fallbackCharts = {
  overview: [
    { month: "Jan", leads: 45, enquiries: 30, orders: 12 },
    { month: "Feb", leads: 52, enquiries: 35, orders: 15 },
    { month: "Mar", leads: 48, enquiries: 32, orders: 14 },
    { month: "Apr", leads: 70, enquiries: 45, orders: 20 },
    { month: "May", leads: 65, enquiries: 40, orders: 18 },
    { month: "Jun", leads: 58, enquiries: 38, orders: 16 },
  ],
  conversion: [
    { name: "Leads", value: 124, color: "#4f46e5" },
    { name: "Enquiries", value: 82, color: "#8b5cf6" },
    { name: "Quotations", value: 56, color: "#d946ef" },
    { name: "Orders", value: 27, color: "#ec4899" },
  ],
  sources: [
    { name: "Indiamart", value: 45, color: "#06b6d4" },
    { name: "Justdial", value: 28, color: "#0ea5e9" },
    { name: "Social Media", value: 20, color: "#3b82f6" },
    { name: "Website", value: 15, color: "#6366f1" },
    { name: "Referrals", value: 12, color: "#8b5cf6" },
  ]
};

// Fetch dashboard charts data
export const fetchDashboardCharts = async (userId, isAdmin) => {
  try {
    const response = await api.get(API_ENDPOINTS.LEAD_TO_ORDER.DASHBOARD.CHARTS, {
      params: {
        userId: userId,
        isAdmin: isAdmin
      }
    });
    
    // Check if response data is HTML (string starting with <)
    if (typeof response.data === 'string') {
      const trimmed = response.data.trim();
      if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
        return fallbackCharts;
      }
    }
    
    // Check if response has valid data structure
    if (response?.data?.success && response?.data?.data) {
      return response.data.data;
    } else {
      return fallbackCharts;
    }
  } catch (error) {
    // Check if error is due to HTML response (backend returning error page)
    if (error.response) {
      const contentType = error.response.headers?.['content-type'] || '';
      if (contentType.includes('text/html')) {
        return fallbackCharts;
      }
      
      // For 401, let the interceptor handle it (don't redirect here to prevent loops)
      if (error.response.status === 401) {
        return fallbackCharts;
      }
    }
    
    // For network errors or other issues, use fallback data
    return fallbackCharts;
  }
};