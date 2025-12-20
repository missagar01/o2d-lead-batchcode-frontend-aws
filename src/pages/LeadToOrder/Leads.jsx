"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { leadToOrderAPI } from "../../services/leadToOrderAPI"

function Leads() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    receiverName: "",
    scName: "",
    source: "",
    companyName: "",
    phoneNumber: "",
    salespersonName: "",
    location: "",
    email: "",
    state: "",
    address: "",
    nob: "",
    notes: ""
  })
  const [receiverNames, setReceiverNames] = useState([])
  const [scNames, setScNames] = useState([])
  const [leadSources, setLeadSources] = useState([])
  const [companyOptions, setCompanyOptions] = useState([])
  const [companyDetailsMap, setCompanyDetailsMap] = useState({})
  const [nobOptions, setNobOptions] = useState([])
  const [stateOptions, setStateOptions] = useState([])
  const { user } = useAuth()
  const showNotification = (message, type) => {
    // Simple notification - can be enhanced with toast library
    alert(message)
  }
  
  // // Script URL
  // const scriptUrl = "https://script.google.com/macros/s/AKfycbyLTNpTAVKaVuGH_-GrVNxDOgXqbWiBYzdf8PQWWwIFhLiIz_1lT3qEQkl7BS1osfToGQ/exec"

  // Function to format date as dd/mm/yyyy
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const fetchLeadDropdowns = async () => {
    try {
      // Use the centralized API service
      const response = await leadToOrderAPI.getLeadDropdowns();
      
      // Check if response data is HTML (string starting with <)
      if (typeof response.data === 'string') {
        const trimmed = response.data.trim();
        if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
          return; // Don't process HTML responses
        }
      }

      if (response?.data?.success && response?.data?.data) {
        const d = response.data.data;

        // Remove duplicates and filter out empty values to match original behavior
        const unique = (arr) => [...new Set(arr.filter(Boolean))];

        setReceiverNames(unique(d.receiverNames || []));
        setScNames(unique(d.scNames || []));
        setLeadSources(unique(d.leadSources || []));
        setStateOptions(unique(d.states || []));
        setNobOptions(unique(d.nob || []));

        // SAFE VERSION (NO CRASH)
        const companyList = d.companyList || {};

        setCompanyOptions(Object.keys(companyList));
        setCompanyDetailsMap(companyList);
      }
    } catch (error) {
      // Error fetching dropdowns - fallback to empty arrays
      setReceiverNames([]);
      setScNames([]);
      setLeadSources([]);
      setStateOptions([]);
      setNobOptions([]);
    }
  };



  // Fetch dropdown data when component mounts
useEffect(() => {
  fetchLeadDropdowns();
  // Removed Google Sheets fetch - using backend API only
  // fetchDropdownData();
  // fetchCompanyData();
}, []);


  // REMOVED: fetchDropdownData and fetchCompanyData - using backend API instead

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }))

    // Auto-fill related fields if company is selected
if (id === "companyName" && value) {
  const companyDetails = companyDetailsMap[value] || {};

  setFormData(prev => ({
    ...prev,
    companyName: value,
    phoneNumber: companyDetails.phoneNumber || "",
    salespersonName: companyDetails.salesPerson || "",
    location: companyDetails.location || "",
    email: companyDetails.email || ""
  }));
}

  }

  // REMOVED: generateLeadNumber - lead number generation is handled by backend API

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const payload = {
      receiverName: formData.receiverName,
      scName: formData.scName,
      source: formData.source,
      companyName: formData.companyName,
      phoneNumber: formData.phoneNumber,
      salespersonName: formData.salespersonName,
      location: formData.location,
      email: formData.email,
      state: formData.state,
      address: formData.address,
      nob: formData.nob,
      notes: formData.notes,
    };

    // const response = await fetch("http://localhost:5050/api/leads", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(payload),
    // });

     const response = await leadToOrderAPI.createLead(payload);
     const result = response.data;

    if (result.success) {
      const leadNumber = result.data?.leadNo;
      showNotification(
        `Lead created successfully with Lead Number: ${leadNumber}`,
        "success"
      );

      // Reset form
      setFormData({
        receiverName: "",
        scName: "",
        source: "",
        companyName: "",
        phoneNumber: "",
        salespersonName: "",
        location: "",
        email: "",
        state: "",
        address: "",
        nob: "",
        notes: "",
      });
    } else {
      showNotification(
        "Error creating lead: " + (result.message || "Unknown error"),
        "error"
      );
    }
  } catch (error) {
    showNotification("Error submitting form: " + error.message, "error");
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Lead Management
          </h1>
          <p className="text-slate-600 mt-1">Enter the details of the new lead</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">New Lead</h2>
          <p className="text-sm text-slate-500">Fill in the lead information below</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="receiverName" className="block text-sm font-medium text-gray-700">
                  Lead Receiver Name
                </label>
                <select
                  id="receiverName"
                  value={formData.receiverName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select receiver</option>
                  {receiverNames.map((name, index) => (
                    <option key={index} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="scName" className="block text-sm font-medium text-gray-700">
                  SC Name
                </label>
                <select
                  id="scName"
                  value={formData.scName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select SC Name</option>
                  {scNames.map((name, index) => (
                    <option key={index} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="source" className="block text-sm font-medium text-gray-700">
                  Lead Source
                </label>
                <select
                  id="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select source</option>
                  {leadSources.map((source, index) => (
                    <option key={index} value={source}>{source}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <input
                  list="companyOptions"
                  id="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <datalist id="companyOptions">
                  {companyOptions.map((company, index) => (
                    <option key={index} value={company} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phone number will auto-fill"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="salespersonName" className="block text-sm font-medium text-gray-700">
                  Contact Person
                </label>
                <input
                  id="salespersonName"
                  value={formData.salespersonName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Salesperson name will auto-fill"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  id="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Location will auto-fill"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email will auto-fill"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <select
                  id="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select state</option>
                  {stateOptions.map((state, index) => (
                    <option key={index} value={state}>{state}</option>
                  ))}
                </select>
              </div>

             <div className="space-y-2">
  <label htmlFor="nob" className="block text-sm font-medium text-gray-700">
    Nature of Business (NOB)
  </label>
  <input
    list="nob-options"
    id="nob"
    name="nob"
    value={formData.nob}
    onChange={handleChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Select or type nature of business"
  />
  <datalist id="nob-options">
    {nobOptions.map((option, index) => (
      <option key={index} value={option} />
    ))}
  </datalist>
</div>

            </div>

            {/* Address Field */}
            <div className="space-y-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                id="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter complete address"
                rows="2"
              />
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Additional Notes
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter any additional information"
                rows="3"
              />
            </div>
          </div>
          
          <div className="p-6 border-t flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSubmitting ? "Saving..." : "Save Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Leads
