"use client"

import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { leadToOrderAPI } from "../../services/leadToOrderAPI"

function NewFollowUp({ leadId: propLeadId, leadNo: propLeadNo, onClose }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const urlLeadId = searchParams.get("leadId")
  const urlLeadNo = searchParams.get("leadNo")
  const leadId = propLeadId || urlLeadId
  const leadNo = propLeadNo || urlLeadNo
  const { user } = useAuth()
  const showNotification = (message, type) => {
    // Simple notification - can be enhanced with toast library
    alert(message)
  }
  const [customerFeedbackOptions, setCustomerFeedbackOptions] = useState([])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [enquiryStatus, setEnquiryStatus] = useState("")
  const [items, setItems] = useState([{ id: "1", name: "", quantity: "" }])
  const [formData, setFormData] = useState({
    leadNo: "",
    nextAction: "",
    nextCallDate: "",
    nextCallTime: "",
    customerFeedback: "",
    enquiryApproach: "", // Add this new field
  })

  const [leadStatus, setLeadStatus] = useState("")

  // New state for dropdown options
  const [enquiryStates, setEnquiryStates] = useState([])
  const [salesTypes, setSalesTypes] = useState([])
  const [productCategories, setProductCategories] = useState([]) // New state for product categories
  const [nobOptions, setNobOptions] = useState([])
  const [enquiryApproachOptions, setEnquiryApproachOptions] = useState([])


  // Function to fetch dropdown data from backend
  const fetchDropdownData = async () => {
    try {
      const response = await leadToOrderAPI.getFollowUpDropdowns();
      const result = response?.data;

      // Check if response is HTML
      if (typeof result === 'string' && (result.trim().startsWith('<!DOCTYPE') || result.trim().startsWith('<html'))) {
        console.warn("Backend returned HTML instead of JSON for followup dropdowns. Using empty data.");
        setCustomerFeedbackOptions([]);
        setEnquiryApproachOptions([]);
        setProductCategories([]);
      } else if (result?.success) {
        setCustomerFeedbackOptions(result.data?.customerSay || []);
        setEnquiryApproachOptions(result.data?.enquiryApproach || []);
        setProductCategories(result.data?.productCategories || []);
      } else {
        setCustomerFeedbackOptions([]);
        setEnquiryApproachOptions([]);
        setProductCategories([]);
      }
    } catch (error) {
      console.error("Error fetching dropdown values:", error);
      // fallback
      setCustomerFeedbackOptions([]);
      setEnquiryApproachOptions([]);
      setProductCategories([]);
    }
  };


  useEffect(() => {
    // Fetch dropdown data when component mounts
    fetchDropdownData()

    // Prepopulate lead number if available
    if (leadNo) {
      setFormData((prevData) => ({
        ...prevData,
        leadNo: leadNo,
      }))
    }
  }, [leadNo])

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }))
  }

  const calculateTotalQuantity = () => {
    return items.reduce((total, item) => {
      const quantity = parseInt(item.quantity) || 0
      return total + quantity
    }, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const itemsJson = items.map(it => ({
        name: it.name,
        quantity: it.quantity
      }));

      const payload = {
        leadNo: formData.leadNo,
        customer_say: document.getElementById("customerFeedback").value,
        lead_status: leadStatus,
        enquiry_received_status: enquiryStatus,
        enquiry_received_date:
          enquiryStatus === "yes"
            ? document.getElementById("enquiryDate").value
            : null,
        enquiry_approach:
          enquiryStatus === "yes" ? formData.enquiryApproach : null,
        project_value:
          enquiryStatus === "yes"
            ? document.getElementById("enquiryValue").value
            : null,
        item_qty: enquiryStatus === "yes" ? itemsJson : [],
        total_qty:
          enquiryStatus === "yes" ? calculateTotalQuantity() : 0,

        next_action:
          enquiryStatus === "expected"
            ? document.getElementById("nextAction").value
            : null,
        next_call_date:
          enquiryStatus === "expected"
            ? document.getElementById("nextCallDate").value
            : null,
        next_call_time:
          enquiryStatus === "expected"
            ? document.getElementById("nextCallTime").value
            : null
      };

      const response = await leadToOrderAPI.submitFollowUp(payload);
      const result = response?.data;

      // Check if response is HTML
      if (typeof result === 'string' && (result.trim().startsWith('<!DOCTYPE') || result.trim().startsWith('<html'))) {
        showNotification("Error: Backend returned invalid response", "error");
        return;
      }

      if (result?.success) {
        showNotification("Follow-up submitted successfully", "success");
        if (onClose) {
          onClose()
          // Refresh the page data
          window.location.reload()
        } else {
          navigate("/follow-up");
        }
      } else {
        showNotification("Error: " + (result?.message || "Unknown error"), "error");
      }
    } catch (error) {
      showNotification("Error submitting: " + error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };


  // Function to format date as dd/mm/yyyy
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const addItem = () => {
    // Define maximum number of items allowed
    const MAX_ITEMS = 300

    // Only add a new item if we haven't reached the maximum
    if (items.length < MAX_ITEMS) {
      const newId = (items.length + 1).toString()
      setItems([...items, { id: newId, name: "", quantity: "" }])
    }
  }

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id, field, value) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 md:bg-white sm:rounded-lg">
      {!onClose && (
        <div className="p-4 sm:p-6 border-b bg-white">
          <h2 className="text-xl font-bold text-slate-800">Lead Follow-Up</h2>
          <p className="text-sm text-slate-500">
            Record details of the follow-up call
            {leadId && <span className="font-medium text-emerald-600"> for Lead #{leadId}</span>}
          </p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto pb-24 sm:pb-6">
          <div className="space-y-1.5">
            <label htmlFor="enquiryNo" className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
              Lead No.
            </label>
            <input
              id="enquiryNo"
              className="w-full px-4 py-3 bg-white sm:bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-slate-700 shadow-sm"
              placeholder="LD-001"
              value={formData.leadNo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="customerFeedback" className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
              What did the customer say?
            </label>
            <input
              list="customer-feedback-options"
              id="customerFeedback"
              className="w-full px-4 py-3 bg-white sm:bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-slate-700 shadow-sm"
              placeholder="Select or type customer feedback"
              required
            />
            <datalist id="customer-feedback-options">
              {customerFeedbackOptions.map((feedback, index) => (
                <option key={index} value={feedback} />
              ))}
            </datalist>
          </div>

          <div className="space-y-3 p-4 bg-white sm:bg-slate-50 border border-slate-200 rounded-2xl">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Lead Status</label>
            <div className="flex flex-wrap gap-3">
              {[
                { id: "hot", label: "Hot", value: "Hot", color: "red" },
                { id: "warm", label: "Warm", value: "Warm", color: "amber" },
                { id: "cold", label: "Cold", value: "Cold", color: "blue" }
              ].map((opt) => (
                <label key={opt.id} className="flex-1 min-w-[80px] cursor-pointer">
                  <input
                    type="radio"
                    id={opt.id}
                    name="leadStatus"
                    value={opt.id}
                    checked={leadStatus === opt.value}
                    onChange={() => setLeadStatus(opt.value)}
                    className="sr-only peer"
                  />
                  <div className={`text-center py-2.5 rounded-xl border-2 transition-all font-bold text-sm ${leadStatus === opt.value
                      ? `bg-${opt.color}-50 border-${opt.color}-500 text-${opt.color}-700 shadow-sm`
                      : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                    }`}>
                    {opt.label}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3 p-4 bg-white sm:bg-slate-50 border border-slate-200 rounded-2xl">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Enquiry Received Status</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "yes", label: "Yes", value: "yes" },
                { id: "expected", label: "Expected", value: "expected" },
                { id: "not-interested", label: "Not Interested", value: "not-interested" }
              ].map((opt) => (
                <label key={opt.id} className="cursor-pointer">
                  <input
                    type="radio"
                    id={opt.id}
                    name="enquiryStatus"
                    value={opt.id}
                    checked={enquiryStatus === opt.value}
                    onChange={() => setEnquiryStatus(opt.value)}
                    className="sr-only peer"
                  />
                  <div className={`text-center py-3 rounded-xl border-2 transition-all font-bold text-sm ${enquiryStatus === opt.value
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm"
                      : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                    }`}>
                    {opt.label}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {enquiryStatus === "expected" && (
            <div className="space-y-4 p-4 bg-amber-50/50 border border-amber-100 rounded-2xl animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-1.5">
                <label htmlFor="nextAction" className="block text-xs font-black uppercase tracking-widest text-amber-600 ml-1">
                  Next Action
                </label>
                <input
                  id="nextAction"
                  className="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium text-slate-700 shadow-sm"
                  placeholder="Enter next action"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="nextCallDate" className="block text-xs font-black uppercase tracking-widest text-amber-600 ml-1">
                    Next Call Date
                  </label>
                  <input
                    id="nextCallDate"
                    type="date"
                    className="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium text-slate-700 shadow-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="nextCallTime" className="block text-xs font-black uppercase tracking-widest text-amber-600 ml-1">
                    Next Call Time
                  </label>
                  <input
                    id="nextCallTime"
                    type="time"
                    className="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium text-slate-700 shadow-sm"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {enquiryStatus === "yes" && (
            <div className="space-y-6 p-4 sm:p-6 bg-blue-50/50 border border-blue-100 rounded-2xl animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
                <h3 className="text-lg font-black text-blue-900 uppercase tracking-tight">Enquiry Details</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="enquiryDate" className="block text-xs font-black uppercase tracking-widest text-blue-600 ml-1">
                    Received Date
                  </label>
                  <input
                    id="enquiryDate"
                    type="date"
                    className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-700 shadow-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="enquiryApproach" className="block text-xs font-black uppercase tracking-widest text-blue-600 ml-1">
                    Enquiry Approach
                  </label>
                  <select
                    id="enquiryApproach"
                    className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700 shadow-sm"
                    value={formData.enquiryApproach}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select approach</option>
                    {enquiryApproachOptions.map((approach, index) => (
                      <option key={index} value={approach}>
                        {approach}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="enquiryValue" className="block text-xs font-black uppercase tracking-widest text-blue-600 ml-1">
                    Approximate Value (₹)
                  </label>
                  <input
                    id="enquiryValue"
                    type="number"
                    className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-black text-slate-700 shadow-sm"
                    placeholder="Enter approximate value"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-blue-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest">Selected Items</h4>
                  <button
                    type="button"
                    onClick={addItem}
                    className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
                    disabled={items.length >= 300}
                  >
                    + Add Item
                  </button>
                </div>

                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="relative p-4 bg-white border border-blue-100 rounded-xl shadow-sm space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Item #{index + 1}</span>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Category</label>
                          <input
                            list={`item-options-${item.id}`}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                            value={item.name}
                            onChange={(e) => updateItem(item.id, "name", e.target.value)}
                            required
                            placeholder="Select/Type item"
                          />
                          <datalist id={`item-options-${item.id}`}>
                            {productCategories.map((category, index) => (
                              <option key={index} value={category} />
                            ))}
                          </datalist>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity</label>
                          <input
                            type="number"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 sm:relative p-4 bg-white border-t flex gap-3 z-50">
          <button
            type="button"
            onClick={() => {
              if (onClose) {
                onClose()
              } else {
                navigate(-1)
              }
            }}
            className="flex-1 py-3.5 px-6 border-2 border-slate-100 text-slate-600 font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-[2] py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-200 disabled:opacity-50 transition-all text-xs flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Processing...
              </span>
            ) : "Submit Follow-up"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default NewFollowUp