import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";

import AppLayout from "./components/AppLayout/AppLayout";

const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const History = lazy(() => import("./pages/History/History"));
const Map = lazy(() => import("./pages/Map/Map"));
const AboutAQI = lazy(() => import("./pages/AboutAQI/AboutAQI"));
const Settings = lazy(() => import("./pages/Settings/Settings"));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/map" element={<Map />} />
          <Route path="/about-aqi" element={<AboutAQI />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
