// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr>
    <p>${feature.properties.mag} Magnitude, occuring on ${new Date(feature.properties.time)}</p>`);
  }

  function createCircleMarker(feature, latlng){
    let options = {
     radius:markerSize(feature.properties.mag),
     fillColor: chooseColor(feature.geometry.coordinates[2]),
     color: "black",
     weight: 0.5,
     opacity: 0.8,
     fillOpacity: 0.35
    } 
    return L.circleMarker(latlng,options);
 }
  

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: createCircleMarker
  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

// Function to determine marker size
function markerSize(magnitude) {
    return magnitude * 5;
};

// Circles color palette based on depth (feature) data marker: data markers should reflect the magnitude of the earthquake by their size and the depth of the earthquake by color. Earthquakes with higher magnitudes should appear larger, and earthquakes with greater depth should appear darker in color.
function chooseColor(depth) {
    if (depth > 90) return "#ff5f65";
    else if (depth > 70) return "#fca35d";  
    else if (depth > 50) return "#fdb72a";
    else if (depth > 30) return "#f7db11";
    else if (depth > 10) return "#dcf400";
    else return "#a3f600";
};

// Create map legend to provide context for map data 
var legend = L.control({position: 'bottomright'});
 
legend.onAdd = function(myMap) {
    var div = L.DomUtil.create('div', 'info legend');
    div.innerHTML += "<h4 style='text-align: center'> Depth</h4>";
    depth = [-10,10,30,50,70,90];

    // loop through density intervals
    for (let i = 0; i < depth.length; i++) {
        div.innerHTML +=
        '<div style="float: left;padding:5px;color: rgba(0, 0, 0, 0.0);width:20px ;background:' + chooseColor(depth[i] + 1)  + '">.</div><div style="float: left;padding:5px"> '
        + depth[i] + (depth[i + 1] ? ' &ndash; ' + depth[i + 1] + '</div><br>' : '+</div>');
    }

return div;
};


function createMap(earthquakes) {

  // Create the base layers.
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  var baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  
  legend.addTo(myMap);

}
