export async function getRoadRoute(coords) {
  if (!coords || coords.length < 2) return null;

  try {
    const coordString = coords.map((c) => `${c[0]},${c[1]}`).join(";");

    const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`;

    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`OSRM Route failed: ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.length) return null;

    // Return the geometry (The LineString following the roads)
    return data.routes[0].geometry;
  } catch (err) {
    console.error("Snap-to-road error:", err.message);
    return null;
  }
}
