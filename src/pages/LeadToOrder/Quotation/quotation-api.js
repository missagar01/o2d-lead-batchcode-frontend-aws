const API_BASE_URL1 = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3006';

export const saveQuotationToBackend = async (quotationData) => {
  try {
    const response = await fetch(`${API_BASE_URL1}/api/lead-to-order/quotations/quotation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quotationData),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};


export const fetchQuotationByNo = async (quotationNo) => {
  const res = await fetch(`${API_BASE_URL1}/api/lead-to-order/quotations/quotation/${quotationNo}`);
  return await res.json();
};


export const uploadPDFToBackend = async (base64Data, quotationNo) => {
  try {
    const formData = new FormData();

    // Convert base64 → Blob → File
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });

    const file = new File([blob], `Quotation_${quotationNo}.pdf`, {
      type: "application/pdf",
    });

    formData.append("pdf", file);

    const res = await fetch(`${API_BASE_URL1}/api/lead-to-order/quotations/upload-pdf`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Upload failed: ${res.status} ${errorText}`);
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await res.json();
    } else {
      // If response is not JSON, return success with URL
      return { success: true, url: res.url };
    }

  } catch (error) {
    return { success: false, error: error.message };
  }
};


// const API_BASE_URL = "http://localhost:5050/api"; // Adjust to your backend UR
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3006';


export const fetchQuotationNumbers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/lead-to-order/quotation-leads/quotation-numbers`);
    
    // Check if response is HTML (error page)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      throw new Error("Backend returned HTML instead of JSON. Check API endpoint.");
    }
    
    const result = await response.json();
    
    if (result.success) {
      return result.quotationNumbers;
    } else {
      throw new Error(result.message || "Failed to fetch quotation numbers");
    }
  } catch (error) {
    throw error;
  }
};

export const fetchQuotationDetails = async (quotationNo) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/lead-to-order/quotation-leads/quotation-details/${quotationNo}`);
    
    // Check if response is HTML (error page)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      throw new Error("Backend returned HTML instead of JSON. Check API endpoint.");
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      return result.data; // Make sure this matches your backend response
    } else {
      throw new Error(result.message || "Failed to fetch quotation details");
    }
  } catch (error) {
    throw error;
  }
};