export async function calculateDistance(
  address1: string,
  address2: string
): Promise<number> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      address1 + ', South Africa'
    )}&format=json&limit=1`
  );

  const data = await response.json();
  if (data && data[0]) {
    const lat1 = parseFloat(data[0].lat);
    const lon1 = parseFloat(data[0].lon);

    const response2 = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        address2 + ', South Africa'
      )}&format=json&limit=1`
    );

    const data2 = await response2.json();
    if (data2 && data2[0]) {
      const lat2 = parseFloat(data2[0].lat);
      const lon2 = parseFloat(data2[0].lon);

      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      return Math.round(distance * 100) / 100;
    }
  }

  return 50;
}
