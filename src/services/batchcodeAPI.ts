import api, { API_ENDPOINTS } from '../config/api.js';

export const batchcodeAPI = {
  // Hot Coil
  submitHotCoil: (formData: FormData) => api.post(API_ENDPOINTS.BATCHCODE.HOT_COIL, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getHotCoilHistory: () => api.get(API_ENDPOINTS.BATCHCODE.HOT_COIL),
  getHotCoilByUniqueCode: (uniqueCode: string) => 
    api.get(`${API_ENDPOINTS.BATCHCODE.HOT_COIL}/${uniqueCode}`),

  // QC Lab
  submitQCLabTest: (formData: FormData) => api.post(API_ENDPOINTS.BATCHCODE.QC_LAB, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getQCLabHistory: () => api.get(API_ENDPOINTS.BATCHCODE.QC_LAB),
  getQCLabTestByUniqueCode: (uniqueCode: string) => 
    api.get(`${API_ENDPOINTS.BATCHCODE.QC_LAB}/${uniqueCode}`),

  // SMS Register
  submitSMSRegister: (formData: FormData) => api.post(API_ENDPOINTS.BATCHCODE.SMS_REGISTER, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getSMSRegisterHistory: () => api.get(API_ENDPOINTS.BATCHCODE.SMS_REGISTER),

  // Recoiler
  submitReCoil: (data: any) => api.post(API_ENDPOINTS.BATCHCODE.RECOILER, data),
  getReCoilHistory: () => api.get(API_ENDPOINTS.BATCHCODE.RECOILER),
  getReCoilByUniqueCode: (uniqueCode: string) => 
    api.get(`${API_ENDPOINTS.BATCHCODE.RECOILER}/${uniqueCode}`),

  // Pipe Mill
  submitPipeMill: (formData: FormData) => api.post(API_ENDPOINTS.BATCHCODE.PIPE_MILL, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getPipeMillHistory: () => api.get(API_ENDPOINTS.BATCHCODE.PIPE_MILL),
  getPipeMillByUniqueCode: (uniqueCode: string) => 
    api.get(`${API_ENDPOINTS.BATCHCODE.PIPE_MILL}/${uniqueCode}`),

  // Laddle Checklist
  submitLaddleChecklist: (data: any) => api.post(API_ENDPOINTS.BATCHCODE.LADDLE, data),
  getLaddleChecklists: () => api.get(API_ENDPOINTS.BATCHCODE.LADDLE),
  getLaddleChecklistByUniqueCode: (uniqueCode: string) => 
    api.get(`${API_ENDPOINTS.BATCHCODE.LADDLE}/${uniqueCode}`),

  // Tundish Checklist
  submitTundishChecklist: (data: any) => api.post(API_ENDPOINTS.BATCHCODE.TUNDISH, data),
  getTundishChecklists: () => api.get(API_ENDPOINTS.BATCHCODE.TUNDISH),
  getTundishChecklistByUniqueCode: (uniqueCode: string) => 
    api.get(`${API_ENDPOINTS.BATCHCODE.TUNDISH}/${uniqueCode}`),

  // Admin Overview - Get all batchcode data for dashboard
  getAdminOverview: (uniqueCode?: string) => {
    const url = uniqueCode 
      ? `${API_ENDPOINTS.BATCHCODE.ADMIN_OVERVIEW}/${uniqueCode}`
      : API_ENDPOINTS.BATCHCODE.ADMIN_OVERVIEW;
    return api.get(url);
  },
};
