
// Trail data with 7 different point classes, each with different colors
export const trailData = {
  trail1: {
    name: "Forest Loop Trail",
    color: "#FF6B6B", // Red
    points: [
      { lat: -3.0989414, lon: -59.9763193, imageId: "840083121440177" },
      { lat: -3.0990414, lon: -59.9764193, imageId: "840083121440178" },
      { lat: -3.0991414, lon: -59.9765193, imageId: "840083121440179" },
      // Add more points here - placeholder for ~200 points
    ]
  },
  trail2: {
    name: "River Trail",
    color: "#4ECDC4", // Teal
    points: [
      { lat: -3.0992414, lon: -59.9766193, imageId: "840083121440180" },
      { lat: -3.0993414, lon: -59.9767193, imageId: "840083121440181" },
      { lat: -3.0994414, lon: -59.9768193, imageId: "840083121440182" },
      // Add more points here - placeholder for ~200 points
    ]
  },
  trail3: {
    name: "Mountain Path",
    color: "#45B7D1", // Blue
    points: [
      { lat: -3.0995414, lon: -59.9769193, imageId: "840083121440183" },
      { lat: -3.0996414, lon: -59.9770193, imageId: "840083121440184" },
      { lat: -3.0997414, lon: -59.9771193, imageId: "840083121440185" },
      // Add more points here - placeholder for ~200 points
    ]
  },
  trail4: {
    name: "Canopy Walk",
    color: "#96CEB4", // Green
    points: [
      { lat: -3.0998414, lon: -59.9772193, imageId: "840083121440186" },
      { lat: -3.0999414, lon: -59.9773193, imageId: "840083121440187" },
      { lat: -3.1000414, lon: -59.9774193, imageId: "840083121440188" },
      // Add more points here - placeholder for ~200 points
    ]
  },
  trail5: {
    name: "Wildlife Trail",
    color: "#FFEAA7", // Yellow
    points: [
      { lat: -3.1001414, lon: -59.9775193, imageId: "840083121440189" },
      { lat: -3.1002414, lon: -59.9776193, imageId: "840083121440190" },
      { lat: -3.1003414, lon: -59.9777193, imageId: "840083121440191" },
      // Add more points here - placeholder for ~200 points
    ]
  },
  trail6: {
    name: "Scenic Overlook",
    color: "#DDA0DD", // Plum
    points: [
      { lat: -3.1004414, lon: -59.9778193, imageId: "840083121440192" },
      { lat: -3.1005414, lon: -59.9779193, imageId: "840083121440193" },
      { lat: -3.1006414, lon: -59.9780193, imageId: "840083121440194" },
      // Add more points here - placeholder for ~200 points
    ]
  },
  trail7: {
    name: "Ancient Grove",
    color: "#F0932B", // Orange
    points: [
      { lat: -3.1007414, lon: -59.9781193, imageId: "840083121440195" },
      { lat: -3.1008414, lon: -59.9782193, imageId: "840083121440196" },
      { lat: -3.1009414, lon: -59.9783193, imageId: "840083121440197" },
      // Add more points here - placeholder for ~200 points
    ]
  }
};

// Helper function to get all trails as an array
export const getAllTrails = () => {
  return Object.entries(trailData).map(([key, trail]) => ({
    id: key,
    ...trail
  }));
};

// Helper function to get trail by ID
export const getTrailById = (trailId) => {
  return trailData[trailId];
};
