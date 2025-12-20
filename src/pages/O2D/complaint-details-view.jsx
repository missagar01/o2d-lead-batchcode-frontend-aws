"use client"
import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Plus, Check, X, Loader2 } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { o2dAPI } from "../../services/o2dAPI"

export function ComplaintDetailsView() {
  const { user, isAuthenticated } = useAuth()
  const [pendingComplaints, setPendingComplaints] = useState([])
  const [completeComplaints, setCompleteComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("pending")
  const [selectedComplaints, setSelectedComplaints] = useState(new Set())
  const [showAddForm, setShowAddForm] = useState(false)
  const [isMarkingComplete, setIsMarkingComplete] = useState(false)
  const [formData, setFormData] = useState({
    complaintDate: "",
    customerName: "",
    contactNo: "",
    itemName: "",
    sizeSection: "",
    qty: "",
    loadingIncharge: "",
    complaintAttendPerson: "",
    complaintDetails: "",
    actionTaken: "",
    remarks: "",
    status: "Open"
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchComplaintData()
  }, [])

  const generateComplaintNumber = (allComplaints) => {
    // Find the highest complaint number
    let maxNumber = 0;
    
    allComplaints.forEach(complaint => {
      if (complaint.complaintNo && complaint.complaintNo.startsWith('CN-')) {
        const numberPart = complaint.complaintNo.substring(3); // Remove "CN-" prefix
        const number = parseInt(numberPart, 10);
        if (!isNaN(number) && number > maxNumber) {
          maxNumber = number;
        }
      }
    });
    
    // Generate next complaint number
    const nextNumber = maxNumber + 1;
    return `CN-${String(nextNumber).padStart(3, '0')}`;
  }

  const fetchComplaintData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await o2dAPI.getComplaints()
      
      if (response.data && response.data.success) {
        const complaints = response.data.data || []
        
        // Format dates
        const processedData = complaints.map((complaint, index) => {
          let formattedComplaintDate = "";
          if (complaint.complaintDate) {
            const date = new Date(complaint.complaintDate);
            if (!isNaN(date.getTime())) {
              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const year = date.getFullYear();
              formattedComplaintDate = `${day}/${month}/${year}`;
            } else {
              formattedComplaintDate = complaint.complaintDate.toString();
            }
          }

          let formattedTimestamp = "";
          if (complaint.createdAt || complaint.timestamp) {
            const date = new Date(complaint.createdAt || complaint.timestamp);
            if (!isNaN(date.getTime())) {
              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const year = date.getFullYear();
              formattedTimestamp = `${day}/${month}/${year}`;
            }
          }
          
          return {
            id: complaint.id || complaint._id || index,
            timestamp: formattedTimestamp,
            complaintNo: complaint.complaintNo || complaint.complaint_no || "",
            complaintDate: formattedComplaintDate,
            customerName: complaint.customerName || complaint.customer_name || "",
            contactNo: complaint.contactNo || complaint.contact_no || "",
            itemName: complaint.itemName || complaint.item_name || "",
            sizeSection: complaint.sizeSection || complaint.size_section || "",
            qty: complaint.qty || complaint.quantity || "",
            loadingIncharge: complaint.loadingIncharge || complaint.loading_incharge || "",
            complaintAttendPerson: complaint.complaintAttendPerson || complaint.complaint_attend_person || "",
            complaintDetails: complaint.complaintDetails || complaint.complaint_details || "",
            actionTaken: complaint.actionTaken || complaint.action_taken || "",
            remarks: complaint.remarks || "",
            status: complaint.status || "Open"
          }
        })
        
        // Separate pending and complete complaints based on status
        const pending = processedData.filter(complaint => 
          complaint.status.toLowerCase() === "open" || complaint.status.toLowerCase() === "pending"
        )
        const complete = processedData.filter(complaint => 
          complaint.status.toLowerCase() === "closed" || complaint.status.toLowerCase() === "resolved"
        )
        
        setPendingComplaints(pending)
        setCompleteComplaints(complete)
      } else {
        setError(response.data?.message || "Failed to fetch data")
      }
    } catch (err) {
      console.error("Error fetching complaints:", err)
      setError("Error fetching data: " + (err.response?.data?.message || err.message || "Unknown error"))
      // Set empty arrays on error
      setPendingComplaints([])
      setCompleteComplaints([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Generate complaint number
      const allComplaints = [...pendingComplaints, ...completeComplaints]
      const complaintNo = generateComplaintNumber(allComplaints)

      // Prepare complaint data for backend API
      const complaintData = {
        complaintNo,
        complaintDate: formData.complaintDate,
        customerName: formData.customerName,
        contactNo: formData.contactNo,
        itemName: formData.itemName,
        sizeSection: formData.sizeSection,
        qty: formData.qty,
        loadingIncharge: formData.loadingIncharge,
        complaintAttendPerson: formData.complaintAttendPerson,
        complaintDetails: formData.complaintDetails,
        actionTaken: formData.actionTaken,
        remarks: formData.remarks,
        status: formData.status
      }

      const response = await o2dAPI.createComplaint(complaintData)

      if (response.data && response.data.success) {
        // Reset form and close modal
        setFormData({
          complaintDate: "",
          customerName: "",
          contactNo: "",
          itemName: "",
          sizeSection: "",
          qty: "",
          loadingIncharge: "",
          complaintAttendPerson: "",
          complaintDetails: "",
          actionTaken: "",
          remarks: "",
          status: "Open"
        })
        setShowAddForm(false)
        // Refresh data
        await fetchComplaintData()
        alert("Complaint submitted successfully!")
      } else {
        alert("Error submitting complaint: " + (response.data?.message || "Unknown error"))
      }
    } catch (error) {
      console.error("Error submitting complaint:", error)
      alert("Error submitting complaint: " + (error.response?.data?.message || error.message || "Unknown error"))
    } finally {
      setSubmitting(false)
    }
  }

  const handleCheckboxChange = (complaintId) => {
    const newSelected = new Set(selectedComplaints)
    if (newSelected.has(complaintId)) {
      newSelected.delete(complaintId)
    } else {
      newSelected.add(complaintId)
    }
    setSelectedComplaints(newSelected)
  }

  const handleSubmitSelected = async () => {
    if (selectedComplaints.size > 0) {
      try {
        setIsMarkingComplete(true)
        
        // Update status to "Closed" for selected complaints using backend API
        const updatePromises = []
        for (const complaintId of selectedComplaints) {
          const complaint = pendingComplaints.find(c => c.id === complaintId)
          if (complaint) {
            // Update complaint status via API
            const updateData = {
              status: "Closed",
              actionTaken: complaint.actionTaken || "",
              remarks: complaint.remarks || ""
            }
            
            // Use PUT or PATCH endpoint if available, otherwise use update endpoint
            updatePromises.push(
              o2dAPI.updateComplaint(complaintId, updateData).catch(err => {
                console.error(`Error updating complaint ${complaintId}:`, err)
                return null
              })
            )
          }
        }
        
        // Wait for all updates to complete
        await Promise.allSettled(updatePromises)
        
        // Refresh data
        await fetchComplaintData()
        setSelectedComplaints(new Set())
        alert("Complaints marked as complete successfully!")
      } catch (error) {
        console.error("Error updating complaints:", error)
        alert("Error updating complaints: " + (error.response?.data?.message || error.message || "Unknown error"))
      } finally {
        setIsMarkingComplete(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-gray-50">
        <div className="flex flex-col items-center space-y-4 p-8 bg-white rounded-lg shadow-xl">
          <div className="relative flex h-16 w-16">
            <span className="absolute inline-flex h-full w-full animate-spin rounded-full border-4 border-blue-500 border-t-transparent opacity-75"></span>
            <span className="absolute inline-flex h-full w-full animate-spin rounded-full border-4 border-blue-300 border-t-transparent opacity-50 delay-150"></span>
            <Loader2 className="h-8 w-8 text-blue-600 absolute inset-0 m-auto animate-pulse" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800">Loading Complaint Data...</h3>
            <p className="text-sm text-gray-500">Please wait while we fetch the latest information.</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Complaint Details</h2>
          <p className="text-gray-600">Manage customer complaints</p>
        </div>
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">Error Loading Data</h3>
          </div>
          <div className="px-6 py-8">
            <div className="text-center">
              <p className="text-red-500 mb-4">Error: {error}</p>
              <button 
                onClick={fetchComplaintData}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Complaint Details</h2>
          <p className="text-gray-600">Manage customer complaints</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Complaint
        </Button>
      </div>

      {/* Add Complaint Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Add New Complaint</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Complaint No. *
                  </label>
                  <input
                    type="text"
                    name="complaintNo"
                    value={formData.complaintNo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div> */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Complaint Date *
                  </label>
                  <input
                    type="date"
                    name="complaintDate"
                    value={formData.complaintDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact No.
                  </label>
                  <input
                    type="text"
                    name="contactNo"
                    value={formData.contactNo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size Section
                  </label>
                  <input
                    type="text"
                    name="sizeSection"
                    value={formData.sizeSection}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="text"
                    name="qty"
                    value={formData.qty}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loading Incharge
                  </label>
                  <input
                    type="text"
                    name="loadingIncharge"
                    value={formData.loadingIncharge}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Complaint Attend Person
                  </label>
                  <input
                    type="text"
                    name="complaintAttendPerson"
                    value={formData.complaintAttendPerson}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complaint Details *
                </label>
                <textarea
                  name="complaintDetails"
                  value={formData.complaintDetails}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action Taken
                </label>
                <textarea
                  name="actionTaken"
                  value={formData.actionTaken}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Submit Complaint
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("pending")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "pending"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Pending ({pendingComplaints.length})
            </button>
            <button
              onClick={() => setActiveTab("complete")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "complete"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Complete ({completeComplaints.length})
            </button>
          </nav>
        </div>

        {/* Pending Tab Content */}
        {activeTab === "pending" && (
          <div className="bg-white rounded-lg shadow border">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Pending Complaints</h3>
                <p className="text-gray-600 text-sm">Complaints awaiting resolution</p>
              </div>
             {selectedComplaints.size > 0 && (
  <Button 
    onClick={handleSubmitSelected} 
    className="flex items-center gap-2"
    disabled={isMarkingComplete}
  >
    {isMarkingComplete ? (
      <>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        Processing...
      </>
    ) : (
      <>
        <Check className="h-4 w-4" />
        Mark as Complete ({selectedComplaints.size})
      </>
    )}
  </Button>
)}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Select
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Complaint No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Complaint Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pendingComplaints.length > 0 ? (
                    pendingComplaints.map((complaint) => (
                      <tr key={complaint.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedComplaints.has(complaint.id)}
                            onChange={() => handleCheckboxChange(complaint.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900">
                          {complaint.complaintNo}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{complaint.complaintDate}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{complaint.customerName}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{complaint.contactNo}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{complaint.itemName}</td>
                        <td className="px-4 py-4 text-sm text-gray-900 max-w-xs">
                          <div className="truncate" title={complaint.complaintDetails}>
                            {complaint.complaintDetails}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                            {complaint.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                        No pending complaints found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Complete Tab Content */}
        {activeTab === "complete" && (
          <div className="bg-white rounded-lg shadow border">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Complete Complaints</h3>
              <p className="text-gray-600 text-sm">Resolved complaints</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Complaint No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Complaint Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action Taken
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {completeComplaints.length > 0 ? (
                    completeComplaints.map((complaint) => (
                      <tr key={complaint.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900">
                          {complaint.complaintNo}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{complaint.complaintDate}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{complaint.customerName}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{complaint.contactNo}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{complaint.itemName}</td>
                        <td className="px-4 py-4 text-sm text-gray-900 max-w-xs">
                          <div className="truncate" title={complaint.complaintDetails}>
                            {complaint.complaintDetails}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 max-w-xs">
                          <div className="truncate" title={complaint.actionTaken}>
                            {complaint.actionTaken}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            {complaint.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                        No complete complaints found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}