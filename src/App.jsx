import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense,React } from "react";
import "./index.css";
import ProtectedRoute from "./Common/ProtectedRouted";

// Lazy loaded pages
const HomePages = lazy(() => import("./pages/HomePage"));
const AboutPages = lazy(() => import("./pages/AboutPages"));
const OrderPages = lazy(() => import("./pages/OrderPages"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const HelpPage = lazy(() => import("./pages/HelpPage"));
const TermsandConditions = lazy(() => import("./policy/TermsandConditions"));
const Disclaimer = lazy(() => import("./policy/Disclaimer"));
const PrivacyPolicy = lazy(() => import("./policy/PrivacypolicyPage"));

// USER extra pages
const ViewOrderPage = lazy(() => import("./pages/ViewOrderPage"));
const PaymentStatementPage = lazy(() => import("./pages/PaymentStatementPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage")); 
// STAFF
const StaffLayout = lazy(() => import("./Staff/StaffLayout"));
const StaffOrdersPage = lazy(() => import("./staff/pages/StaffOrdersPage"));
const StaffPaymentsPage = lazy(() => import("./staff/pages/Staffpaymentpage"));
const StafStock = lazy(()=>(import("./staff/pages/StaffStockIn")))

// ADMIN
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const AdminDashboard = lazy(()=>import("./admin/AdminDashboard"))
const AddProductPage = lazy(() => import("./admin/AdminProducts"));
const CreateOrderPage = lazy(() => import("./admin/AdminOrders"));
const Payment = lazy(() => import("./admin/AdminPayments"));
const AdminSettings = lazy(() => import("./admin/AdminSettings"));
const AdminUsers = lazy(() => import("./admin/AdminUsers"));
const AdminRequests = lazy(()=>import("./admin/AdminRequests"))





function App() {
  return (
    <Router>
      <Suspense fallback={<div className="p-10">Loading...</div>}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute allowRoles={["USER", "ADMIN", "STAFF"]}>
                <HomePages/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowRoles={["USER", "STAFF"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/about" element={<AboutPages />} />

          {/* ✅ USER Protected */}
          <Route
            path="/order"
            element={
              <ProtectedRoute allowRoles={["USER"]}>
                <OrderPages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/view-order"
            element={
              <ProtectedRoute allowRoles={["USER"]}>
                <ViewOrderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute allowRoles={["USER"]}>
                <PaymentStatementPage />
              </ProtectedRoute>
            }
          />

          <Route path="/help" element={<HelpPage />} />
          <Route path="/termsandcondition" element={<TermsandConditions />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* ✅ STAFF Protected (STAFF + ADMIN) */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowRoles={["STAFF", "ADMIN"]}>
                <StaffLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StaffOrdersPage />} />
            <Route path="payments" element={<StaffPaymentsPage />} />
            <Route path="/staff/stock-in" element={<StafStock/>}  />
           </Route>

          {/* ✅ ADMIN Protected */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowRoles={["ADMIN"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="add-user" element={<AdminUsers />} />
            <Route path="add-product" element={<AddProductPage />} />
            <Route path="create-order" element={<CreateOrderPage />} />
            <Route path="payments" element={<Payment />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="requests" element={<AdminRequests />} />
          </Route>

          <Route path="*" element={<div className="p-10">404 Not Found</div>} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
