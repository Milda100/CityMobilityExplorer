// export async function getRoadRoute(coords: [number, number][]) {
//   if (coords.length < 2) return null;

//   const coordString = coords.map((c) => `${c[0]},${c[1]}`).join(";");

//   const url =
//     `https://router.project-osrm.org/route/v1/driving/${coordString}` +
//     `?overview=full&geometries=geojson`;

//   const res = await fetch(url);
//   const data = await res.json();

//   if (!data.routes?.length) return null;

//   return data.routes[0].geometry;
// }
