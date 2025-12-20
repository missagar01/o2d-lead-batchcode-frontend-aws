import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import AppLayout from "./layout/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Login from "./pages/Login";
import Home from "./pages/Dashboard/Home";
import Calendar from "./pages/Calendar";
import Blank from "./pages/Blank";
import UserProfiles from "./pages/UserProfiles";

// BatchCode pages
import BatchCodeDashboard from "./pages/BatchCode/Dashboard";
import HotCoil from "./pages/BatchCode/HotCoil";
import QCLab from "./pages/BatchCode/QC-Lab";
import SMSRegister from "./pages/BatchCode/SMSRegister";
import Recoiler from "./pages/BatchCode/Recoiler";
import PipeMill from "./pages/BatchCode/PipeMill";
import Laddel from "./pages/BatchCode/Laddel";
import Tundis from "./pages/BatchCode/Tundis";

// Lead-to-Order pages
import LeadToOrderDashboard from "./pages/LeadToOrder/Dashboard";
import Leads from "./pages/LeadToOrder/Leads";
import FollowUp from "./pages/LeadToOrder/FollowUp";
import NewFollowUp from "./pages/LeadToOrder/NewFollowUp";
import CallTracker from "./pages/LeadToOrder/CallTracker";
  import NewCallTracker from "./pages/LeadToOrder/NewCallTracker";
  import Quotation from "./pages/LeadToOrder/Quotation/Quotation";

  // O2D pages
import { DashboardView as O2DDashboard } from "./pages/O2D/dashboard-view";
import { GateEntryView as O2DGateEntry } from "./pages/O2D/gate-entry-view";
import { FirstWeightView as O2DFirstWeight } from "./pages/O2D/first-weight-view";
import { LoadVehicleView as O2DLoadVehicle } from "./pages/O2D/load-vehicle-view";
import { SecondWeightView as O2DSecondWeight } from "./pages/O2D/second-weight-view";
import { GenerateInvoiceView as O2DGenerateInvoice } from "./pages/O2D/generate-invoice-view";
import { GateOutView as O2DGateOut } from "./pages/O2D/gate-out-view";
import { PaymentView as O2DPayment } from "./pages/O2D/payment-view";
import { OrdersView as O2DOrders } from "./pages/O2D/order-view";
import { ComplaintDetailsView as O2DComplaintDetails } from "./pages/O2D/complaint-details-view";
import { PartyFeedbackView as O2DPartyFeedback } from "./pages/O2D/party-feedback-view";
import { PermissionsView as O2DPermissions } from "./pages/O2D/permissions-view";
// Removed O2D Register as per user request
// import { RegisterView as O2DRegister } from "./pages/O2D/register-view";

export default function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Public routes - Login page */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          
          {/* Root route - redirect based on auth status */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Main Dashboard - O2D Dashboard by default */}
            <Route path="/dashboard" element={<Home />} />
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* BatchCode Routes */}
            <Route path="/batchcode/dashboard" element={<BatchCodeDashboard />} />
            <Route path="/batchcode/hot-coil" element={<HotCoil />} />
            <Route path="/batchcode/qc-lab" element={<QCLab />} />
            <Route path="/batchcode/sms-register" element={<SMSRegister />} />
            <Route path="/batchcode/recoiler" element={<Recoiler />} />
            <Route path="/batchcode/pipe-mill" element={<PipeMill />} />
            <Route path="/batchcode/laddel" element={<Laddel />} />
            <Route path="/batchcode/tundis" element={<Tundis />} />

            {/* Lead-to-Order Routes */}
            <Route path="/lead-to-order/dashboard" element={<LeadToOrderDashboard />} />
            <Route path="/lead-to-order/leads" element={<Leads />} />
            <Route path="/lead-to-order/follow-up" element={<FollowUp />} />
            <Route path="/lead-to-order/follow-up/new" element={<NewFollowUp />} />
            <Route path="/lead-to-order/call-tracker" element={<CallTracker />} />
            <Route path="/lead-to-order/call-tracker/new" element={<NewCallTracker />} />
            <Route path="/lead-to-order/quotation" element={<Quotation />} />

            {/* O2D Routes */}
            <Route path="/o2d/dashboard" element={<O2DDashboard />} />
            <Route path="/o2d/gate-entry" element={<O2DGateEntry />} />
            <Route path="/o2d/first-weight" element={<O2DFirstWeight />} />
            <Route path="/o2d/load-vehicle" element={<O2DLoadVehicle />} />
            <Route path="/o2d/second-weight" element={<O2DSecondWeight />} />
            <Route path="/o2d/generate-invoice" element={<O2DGenerateInvoice />} />
            <Route path="/o2d/gate-out" element={<O2DGateOut />} />
            <Route path="/o2d/payment" element={<O2DPayment />} />
            <Route path="/o2d/orders" element={<O2DOrders />} />
            <Route path="/o2d/complaint-details" element={<O2DComplaintDetails />} />
            <Route path="/o2d/party-feedback" element={<O2DPartyFeedback />} />
            <Route path="/o2d/permissions" element={<O2DPermissions />} />
            {/* Removed O2D Register route as per user request */}
            {/* <Route path="/o2d/register" element={<O2DRegister />} /> */}
          </Route>

          {/* Catch all - redirect to login if not authenticated, otherwise home */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </>
  );
}




