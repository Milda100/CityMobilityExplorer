import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { transportStops } from '../data/transportStops';
import { createTransportMarker } from '../map/createTransportMarker';

function Map() {
  return (
    <MapContainer center={[52.3676, 4.9041]} zoom={13} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {transportStops.map((stop) => (
        <Marker
          key={stop.id}
          position={stop.position}
          icon={createTransportMarker(stop.type)}
          >
            <Popup>
              <strong>{stop.name}</strong>
              <br />
              {stop.type.toUpperCase()}
              <br/>
              {/* Additional info can go here arrival time etc*/}
            </Popup>
        </Marker>
      ))}
      {/* <Marker position={[52.3676, 4.9041]}>
        <Popup>
          Hello, Amsterdam!
        </Popup>
      </Marker> */}
    </MapContainer>
  );
}

export default Map;
