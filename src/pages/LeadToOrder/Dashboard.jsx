import DashboardMetrics from "./dashboard/DashboardMetrics"
import DashboardCharts from "./dashboard/DashboardCharts"
import PendingTasks from "./dashboard/PendingTasks"
import RecentActivities from "./dashboard/RecentActivities"

function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="container mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700 bg-clip-text text-transparent">
            Leads To Order System
          </h1>
          {/* <p className="text-slate-600 mt-2 text-sm sm:text-base">Monitor your sales pipeline and track conversions in real-time</p> */}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:gap-6">
          <DashboardMetrics />

          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-slate-200">
            <div className="p-4 sm:p-5 lg:p-6">
              <DashboardCharts />
            </div>
          </div>

          {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-slate-200 p-4 sm:p-5 lg:p-6">
              <PendingTasks />
            </div>
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-slate-200 p-4 sm:p-5 lg:p-6">
              <RecentActivities />
            </div>
          </div> */}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
