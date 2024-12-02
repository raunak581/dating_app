// 19.203854765732483, 72.86342844336441   poisar

//19.206574670305884, 72.87464086771962

function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in kilometers
    const toRadians = (degrees) => degrees * (Math.PI / 180);

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in kilometers
}

// Example usage
const distance = haversineDistance(19.203854765732483, 72.86342844336441, 19.206574670305884, 72.87464086771962);
console.log(`Distance: ${distance.toFixed(2)} km`);
