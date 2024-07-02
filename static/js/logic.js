// Initialize the map
let map = L.map('map', {
    center: [40, -120], // Center on Western US
    zoom: 5
}); 

// Add the tile layer on the bottom right corner
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.mapbox.com/">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> <a href="https://www.openstreetmap.org/fixthemap"><b>Improve this map</b></a>'
}).addTo(map);

// Function to determine marker size based on magnitude
function markerSize(magnitude) {
    var size = Math.max(magnitude * 4, 5)
    return size
}

// Function to determine marker color based on depth
function markerColor(depth) {
    var color = 
        depth > 90 ? '#FF0000' :  // Red
        depth > 70 ? '#FF6900' :  // Dark Orange
        depth > 50 ? '#FFA500' :  // Orange
        depth > 30 ? '#FFD300' :  // Yellow
        depth > 10 ? '#ADFF2F' :  // Yellow Green
                     '#98EE00';   // Light Green
    return color
}

// Function to create popup content
function popupContent(feature) {
    var popup = `
        <strong>Magnitude:</strong> ${feature.properties.mag}<br>
        <strong>Depth:</strong> ${feature.geometry.coordinates[2]} km<br>
        <strong>Location:</strong> ${feature.properties.place}<br>
        <strong>Time:</strong> ${new Date(feature.properties.time).toLocaleString()}
    `
    return popup
}

// Fetch the earthquake data
let dataUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
d3.json(dataUrl).then(function(data) {
    // Create a GeoJSON layer with the retrieved data
    L.geoJSON(data, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: markerSize(feature.properties.mag),
                fillColor: markerColor(feature.geometry.coordinates[2]),
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        },
        onEachFeature: function(feature, layer) {
            layer.bindPopup(popupContent(feature));
        }
    }).addTo(map);

    // Create a legend
    let legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {
        let div = L.DomUtil.create('div', 'info legend');
        let depths = [-10, 10, 30, 50, 70, 90];
        depths.forEach((depth, index) => {
            let label = depth + (depths[index + 1] ? '&ndash;' + depths[index + 1] : '+');
            div.innerHTML += `<i style="background:${markerColor(depth + 1)}"></i> ${label}<br>`;
          });
        return div;
    };
    legend.addTo(map);
});