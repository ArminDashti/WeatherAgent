import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { CityPage } from "./pages/CityPage";
import { ForecastPage } from "./pages/ForecastPage";
import { MapPage } from "./pages/MapPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<MapPage />} />
        <Route path="forecast" element={<ForecastPage />} />
        <Route path="cities/:slug" element={<CityPage />} />
      </Route>
    </Routes>
  );
}