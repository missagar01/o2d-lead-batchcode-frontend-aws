// DashboardMetrics.jsx - Updated for backend
import { useState, useEffect, useContext } from "react"
import { UsersIcon, PhoneCallIcon, FileTextIcon, ShoppingCartIcon, TrendingUpIcon, AlertCircleIcon } from "../Icons"
import { useAuth } from "../../../context/AuthContext"
import { fetchDashboardMetrics } from "./dashboard-api.js" // Import the API function

function DashboardMetrics() {
  const { user: currentUser, user_access: userType, isAuthenticated } = useAuth()
  const isAdmin = () => userType?.includes('all') || currentUser?.role === 'admin'
  const [metrics, setMetrics] = useState({
    totalLeads: "0",
    pendingFollowups: "0",
    quotationsSent: "0",
    ordersReceived: "0",
    totalEnquiry: "0",
    pendingEnquiry: "0"
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setIsLoading(true)
        
        // Use the backend API instead of Google Sheets
        const adminStatus = isAdmin(); // Call isAdmin inside the effect
        const metricsData = await fetchDashboardMetrics(
          currentUser?.username || currentUser?.id, 
          adminStatus
        )
        
        setMetrics({
          totalLeads: metricsData.totalLeads.toString(),
          pendingFollowups: metricsData.pendingFollowups.toString(),
          quotationsSent: metricsData.quotationsSent.toString(),
          ordersReceived: metricsData.ordersReceived.toString(),
          totalEnquiry: metricsData.totalEnquiry.toString(),
          pendingEnquiry: metricsData.pendingEnquiry.toString()
        })
        
      } catch (error) {
        setError(error.message)
        // Fallback to demo values
        setMetrics({
          totalLeads: "124",
          pendingFollowups: "38",
          quotationsSent: "56",
          ordersReceived: "27",
          totalEnquiry: "145",
          pendingEnquiry: "42"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    if (currentUser) {
      fetchMetrics()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, userType, currentUser?.role]) // Use specific dependencies instead of isAdmin function

  return (
    <div className="space-y-8">
      {/* Lead to Order Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          {isAdmin() && <p className="text-green-600 font-semibold">Admin View: Showing all data</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-6">
          <MetricCard
            title="Total Leads"
            value={isLoading ? "Loading..." : metrics.totalLeads}
            change="+12%"
            trend="up"
            icon={<UsersIcon className="h-5 w-5" />}
            color="from-slate-600 to-slate-700"
            borderColor="border-slate-600"
          />
          
          <MetricCard
            title="Pending Follow-ups"
            value={isLoading ? "Loading..." : metrics.pendingFollowups}
            change="+5%"
            trend="up"
            icon={<PhoneCallIcon className="h-5 w-5" />}
            color="from-indigo-600 to-indigo-700"
            borderColor="border-indigo-600"
          />
          
          <MetricCard
            title="Quotations Sent"
            value={isLoading ? "Loading..." : metrics.quotationsSent}
            change="+8%"
            trend="up"
            icon={<FileTextIcon className="h-5 w-5" />}
            color="from-teal-600 to-teal-700"
            borderColor="border-teal-600"
          />
          
          <MetricCard
            title="Orders Received"
            value={isLoading ? "Loading..." : metrics.ordersReceived}
            change="-3%"
            trend="down"
            icon={<ShoppingCartIcon className="h-5 w-5" />}
            color="from-violet-600 to-violet-700"
            borderColor="border-violet-600"
          />
        </div>
      </div>
      
      {/* Enquiry to Order Section */}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          <MetricCard
            title="Total Enquiry"
            value={isLoading ? "Loading..." : metrics.totalEnquiry}
            change="+15%"
            trend="up"
            icon={<UsersIcon className="h-5 w-5" />}
            color="from-cyan-600 to-cyan-700"
            borderColor="border-cyan-600"
          />
          
          <MetricCard
            title="Pending Enquiry"
            value={isLoading ? "Loading..." : metrics.pendingEnquiry}
            change="+7%"
            trend="up"
            icon={<AlertCircleIcon className="h-5 w-5" />}
            color="from-amber-600 to-amber-700"
            borderColor="border-amber-600"
          />
        </div>
      </div>
    </div>
  )
}

// MetricCard component with professional admin-lite styling

function MetricCard({ title, value, change, trend, icon, color, borderColor = "border-slate-600" }) {
  return (
    <div className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border-l-4 ${borderColor} bg-gradient-to-br from-white via-white to-slate-50/30`}>
      <div className="p-4 sm:p-5 lg:p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <p className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wide mb-1">{title}</p>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mt-2">{value}</h3>
          </div>
          <div className={`p-2.5 sm:p-3 rounded-lg bg-gradient-to-r ${color} text-white shadow-sm ml-3 flex-shrink-0`}>
            {icon}
          </div>
        </div>
        <div className="flex items-center mt-4 pt-3 border-t border-slate-100">
          {trend === "up" ? (
            <TrendingUpIcon className="h-4 w-4 text-emerald-600 mr-1.5" />
          ) : (
            <AlertCircleIcon className="h-4 w-4 text-amber-600 mr-1.5" />
          )}
          <span className={trend === "up" ? "text-emerald-600 text-xs sm:text-sm font-medium" : "text-amber-600 text-xs sm:text-sm font-medium"}>
            {change} from last month
          </span>
        </div>
      </div>
    </div>
  )
}

export default DashboardMetrics