/**
 * Root app shell: router, header/footer, and auth-driven nav.
 * Listens for `auth:changed` to refresh login and role flags.
 */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import EquipmentListContainer from "./pages/EquipmentList/container/EquipmentListContainer";
import EquipmentDetailsContainer from "./pages/EquipmentDetails/container/EquipmentDetailsContainer";
import StoreDetailContainer from "./pages/StoreDetail/container/StoreDetailContainer";
import MyBookingsContainer from "./pages/MyBookings/container/MyBookingsContainer";
import LoginContainer from "./pages/Login/container/LoginContainer";
import RegisterContainer from "./pages/Register/container/RegisterContainer";
import MyStoreDashboardContainer from "./pages/MyStore/container/MyStoreDashboardContainer";
import MyStoreSetupContainer from "./pages/MyStore/container/MyStoreSetupContainer";
import AppHeader from "./layout/AppHeader";
import AppFooter from "./layout/AppFooter";
import {
  hydrateAuthRoleIfNeeded,
  isBusinessOwner,
  isCustomer,
  isLoggedIn,
  logout,
} from "./services/api";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [showOwnerNav, setShowOwnerNav] = useState(() => isBusinessOwner());
  const [showCustomerNav, setShowCustomerNav] = useState(() => isCustomer());

  useEffect(() => {
    const update = () => {
      setLoggedIn(isLoggedIn());
      setShowOwnerNav(isBusinessOwner());
      setShowCustomerNav(isCustomer());
    };
    update();
    window.addEventListener("auth:changed", update);
    return () => window.removeEventListener("auth:changed", update);
  }, []);

  useEffect(() => {
    if (loggedIn) void hydrateAuthRoleIfNeeded();
  }, [loggedIn]);

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
  };

  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-canvas font-sans text-slate-900 antialiased">
        <AppHeader
          loggedIn={loggedIn}
          showCustomerNav={showCustomerNav}
          showOwnerNav={showOwnerNav}
          onLogout={handleLogout}
        />
        <div className="w-full min-w-0 flex-1">
          <Routes>
          <Route path="/" element={<EquipmentListContainer />} />
          <Route path="/stores/:storeId" element={<StoreDetailContainer />} />
          <Route path="/equipment/:id" element={<EquipmentDetailsContainer />} />
          <Route path="/my-bookings" element={<MyBookingsContainer />} />
          <Route path="/login" element={<LoginContainer />} />
          <Route path="/register" element={<RegisterContainer />} />
          <Route path="/my-store/setup" element={<MyStoreSetupContainer />} />
          <Route path="/my-store" element={<MyStoreDashboardContainer />} />
          <Route
            path="/add-product"
            element={<Navigate to="/my-store" replace />}
          />
        </Routes>
        </div>
        <AppFooter />
      </div>
    </BrowserRouter>
  );
}

export default App;
