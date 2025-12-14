import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function Map() {
  return (
    <MapContainer center={[52.3676, 4.9041]} zoom={13} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[52.3676, 4.9041]}>
        <Popup>
          Hello, Amsterdam!
        </Popup>
      </Marker>
    </MapContainer>
  );
}

export default Map;
