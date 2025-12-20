"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Flame, FlaskConical, Cog, RefreshCw, Cylinder, PaintBucket, Amphora, Loader2 } from "lucide-react"
import { batchcodeAPI } from "../../services/batchcodeAPI"

export default function BatchCodeDashboard() {
  const [stats, setStats] = useState({
    pendingHotCoil: 0,
    pendingQC: 0,
    pendingSMS: 0,
    totalProcessed: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userRole, setUserRole] = useState("")

  useEffect(() => {
    // Get user role from session storage
    const role = sessionStorage.getItem("role") || ""
    setUserRole(role)
    fetchDashboardStats(role)
  }, [])

  const fetchDashboardStats = async (role = "") => {
    try {
      setLoading(true)
      setError(null)
      
      // For users, only show their own data - skip if not admin
      const isAdmin = role === "admin" || role === "superadmin"
      
      // Use admin overview API
      const response = await batchcodeAPI.getAdminOverview()
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to fetch dashboard data")
      }

      const apiData = response.data.data
      const counts = response.data.meta?.counts || {}

      // Extract data arrays
      const hotCoilData = apiData.hot_coil || []
      const reCoilData = apiData.re_coiler || []
      const smsData = apiData.sms_register || []
      const qcLabData = apiData.qc_lab_samples || []

      // Calculate pending Hot Coil (Hot Coil entries without ReCoil entries)
      // Match hot_coiler_short_code from re_coiler with unique_code from hot_coil
      const processedHotCoilCodes = new Set(
        reCoilData.map(entry => String(entry.hot_coiler_short_code || '')).filter(Boolean)
      )
      let pendingHotCoil = hotCoilData.filter(record => {
        const code = String(record.unique_code || '')
        return code && !processedHotCoilCodes.has(code)
      })

      // Calculate pending SMS (SMS Register entries without QC Lab entries)
      // The backend links SMS Register and QC Lab entries
      // We need to match SMS Register entries with QC Lab entries
      // Since sms_batch_code in QC Lab might be in different format than unique_code in SMS Register,
      // we'll create a set of all QC Lab sms_batch_codes and check if SMS entries match
      const processedSMSCodes = new Set(
        qcLabData.map(entry => {
          const code = entry.sms_batch_code || ''
          return String(code).toUpperCase().trim()
        }).filter(Boolean)
      )
      
      // For each SMS Register entry, check if it has a corresponding QC Lab entry
      // The matching might be based on unique_code, sms_short_code, or other fields
      let pendingSMS = smsData.filter(record => {
        const smsCode = String(record.unique_code || record.sms_short_code || '').toUpperCase().trim()
        
        // Direct match check
        if (processedSMSCodes.has(smsCode)) {
          return false // Has QC entry, not pending
        }
        
        // Check if any QC entry's sms_batch_code might reference this SMS
        // This handles cases where formats differ (e.g., "S-2901" vs "2901")
        const hasRelatedQC = qcLabData.some(qcEntry => {
          const qcCode = String(qcEntry.sms_batch_code || '').toUpperCase().trim()
          if (!qcCode) return false
          
          // Check if codes match (handling format differences)
          // Remove "S-" prefix if present for comparison
          const qcCodeNormalized = qcCode.replace(/^S-?/i, '')
          const smsCodeNormalized = smsCode.replace(/^S-?/i, '')
          
          return qcCodeNormalized === smsCodeNormalized || 
                 qcCode === smsCode ||
                 qcCode.includes(smsCode) ||
                 smsCode.includes(qcCodeNormalized)
        })
        
        return !hasRelatedQC // No matching QC entry found, so it's pending
      })

      // Pending QC is same as pending SMS (SMS entries without QC tests)
      let pendingQC = pendingSMS

      // Filter by user role if not admin
      if (!isAdmin) {
        const username = sessionStorage.getItem("username") || ""
        pendingHotCoil = pendingHotCoil.filter(item => 
          item.created_by === username || 
          item.shift_incharge === username ||
          item.operator_name === username ||
          item.mill_incharge === username ||
          item.quality_supervisor === username ||
          item.shift_supervisor === username
        )
        pendingSMS = pendingSMS.filter(item => 
          item.shift_incharge === username ||
          item.created_by === username ||
          item.sms_head === username
        )
        pendingQC = pendingQC.filter(item => 
          item.shift_incharge === username ||
          item.created_by === username ||
          item.sms_head === username
        )
      }

      // Calculate total processed (sum of all counts from meta)
      const totalProcessed = Object.values(counts).reduce((sum, count) => sum + (count || 0), 0)

      setStats({
        pendingHotCoil: pendingHotCoil.length,
        pendingQC: pendingQC.length,
        pendingSMS: pendingSMS.length,
        totalProcessed
      })
    } catch (err) {
      console.error("Error fetching dashboard stats:", err)
      setError(err.message || "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const menuItems = [
    {
      href: "/batchcode/hot-coil",
      label: "Hot Coil",
      icon: Flame,
      color: "from-red-500 to-red-600",
      description: "Process hot coil entries",
      count: stats.pendingHotCoil
    },
    {
      href: "/batchcode/laddel",
      label: "Laddle Checklist",
      icon: PaintBucket,
      color: "from-orange-500 to-orange-600",
      description: "Manage laddle checklist"
    },
    {
      href: "/batchcode/tundis",
      label: "Tundish Checklist",
      icon: Amphora,
      color: "from-purple-500 to-purple-600",
      description: "Manage tundish checklist"
    },
    {
      href: "/batchcode/sms-register",
      label: "SMS Register",
      icon: Cog,
      color: "from-blue-500 to-blue-600",
      description: "Register SMS batch codes",
      count: stats.pendingSMS
    },
    {
      href: "/batchcode/qc-lab",
      label: "Lab Test",
      icon: FlaskConical,
      color: "from-green-500 to-green-600",
      description: "Quality control lab tests",
      count: stats.pendingQC
    },
    {
      href: "/batchcode/recoiler",
      label: "Recoil",
      icon: RefreshCw,
      color: "from-indigo-500 to-indigo-600",
      description: "Recoil processing"
    },
    {
      href: "/batchcode/pipe-mill",
      label: "Pipe Mill",
      icon: Cylinder,
      color: "from-teal-500 to-teal-600",
      description: "Pipe mill operations"
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-gray-50">
        <div className="flex flex-col items-center space-y-4 p-8 bg-white rounded-lg shadow-xl">
          <div className="relative flex h-16 w-16">
            <span className="absolute inline-flex h-full w-full animate-spin rounded-full border-4 border-red-500 border-t-transparent opacity-75"></span>
            <span className="absolute inline-flex h-full w-full animate-spin rounded-full border-4 border-red-300 border-t-transparent opacity-50 delay-150"></span>
            <Loader2 className="h-8 w-8 text-red-600 absolute inset-0 m-auto animate-pulse" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800">Loading BatchCode Dashboard...</h3>
            <p className="text-sm text-gray-500">Please wait while we fetch the latest information.</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
          <span className="text-sm">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700 bg-clip-text text-transparent">
            SRMPL Batch Code Dashboard
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Manage and track all batch code processes
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-l-slate-600 bg-gradient-to-br from-slate-50/80 via-white to-slate-50/50 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wide">Pending Hot Coil</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2">{stats.pendingHotCoil}</p>
            </div>
            <Flame className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-l-indigo-600 bg-gradient-to-br from-indigo-50/80 via-white to-indigo-50/50 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-semibold text-indigo-700 uppercase tracking-wide">Pending SMS</p>
              <p className="text-2xl sm:text-3xl font-bold text-indigo-800 mt-2">{stats.pendingSMS}</p>
            </div>
            <Cog className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-l-teal-600 bg-gradient-to-br from-teal-50/80 via-white to-teal-50/50 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-semibold text-teal-700 uppercase tracking-wide">Pending QC</p>
              <p className="text-2xl sm:text-3xl font-bold text-teal-800 mt-2">{stats.pendingQC}</p>
            </div>
            <FlaskConical className="h-7 w-7 sm:h-8 sm:w-8 text-teal-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-l-violet-600 bg-gradient-to-br from-violet-50/80 via-white to-violet-50/50 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-semibold text-violet-700 uppercase tracking-wide">Total Processed</p>
              <p className="text-2xl sm:text-3xl font-bold text-violet-800 mt-2">{stats.totalProcessed}</p>
            </div>
            <RefreshCw className="h-7 w-7 sm:h-8 sm:w-8 text-violet-600" />
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              to={item.href}
              className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-slate-200 hover:border-slate-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${item.color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {item.count}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                  {item.label}
                </h3>
                <p className="text-sm text-gray-600">
                  {item.description}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
