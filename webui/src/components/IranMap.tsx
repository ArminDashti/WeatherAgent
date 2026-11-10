import { useEffect, useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import type { CitySummary } from "../lib/api";
import { temp } from "../lib/format";

const IRAN_CENTER: [number, number] = [32.4, 53.7];
const IRAN_BOUNDS = L.latLngBounds([24.5, 43.5], [40.0, 64.0]);

function FitIran() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(IRAN_BOUNDS, { padding: [24, 24] });
  }, [map]);
  return null;
}

function markerIcon(city: CitySummary) {
  const html = `<button type="button" class="wa-marker" aria-label="${city.name_en} ${temp(city.temp_c)} ${city.label_en}">
    <span>${temp(city.temp_c)}</span>
  </button>`;
  return L.divIcon({
    className: "",
    html,
    iconSize: [48, 28],
    iconAnchor: [24, 14],
  });
}

export function IranMap({ cities }: { cities: CitySummary[] }) {
  const navigate = useNavigate();
  const icons = useMemo(() => cities.map((c) => ({ city: c, icon: markerIcon(c) })), [cities]);

  return (
    <MapContainer
      center={IRAN_CENTER}
      zoom={5}
      className="h-full w-full rounded-none"
      scrollWheelZoom
      maxBounds={IRAN_BOUNDS.pad(0.2)}
      minZoom={4}
      maxZoom={10}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <FitIran />
      {icons.map(({ city, icon }) => (
        <Marker
          key={city.slug}
          position={[city.lat, city.lon]}
          icon={icon}
          eventHandlers={{
            click: () => navigate(`/cities/${city.slug}`),
          }}
        />
      ))}
    </MapContainer>
  );
}