import { BrowserRouter, Routes, Route } from "react-router-dom";
import EquipmentListContainer from "./pages/EquipmentList/container/EquipmentListContainer";
import EquipmentDetailsContainer from "./pages/EquipmentDetails/container/EquipmentDetailsContainer";
import BookingsContainer from "./pages/Bookings/container/BookingsContainer";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EquipmentListContainer />} />
        <Route path="/equipment/:id" element={<EquipmentDetailsContainer />} />
        <Route path="/bookings" element={<BookingsContainer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;