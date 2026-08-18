import { Route, Routes } from "react-router";

import AppLayout from "./components/AppLayout/AppLayout";
import AboutAQI from "./pages/AboutAQI/AboutAQI";
import Dashboard from "./pages/Dashboard/Dashboard";
import History from "./pages/History/History";
import Map from "./pages/Map/Map";
import Settings from "./pages/Settings/Settings";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/map" element={<Map />} />
        <Route path="/about-aqi" element={<AboutAQI />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
