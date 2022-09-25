// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2022-08-16&endtime=" +
  "2022-09-23&maxlongitude=-68.62148437&minlongitude=-163.83799062&maxlatitude=58.74894534&minlatitude=20.16517337";

var colors = ["#b7f34d", "#e1f34d", "#f3db4d", "#f3da4d", "#f0a76b", "#f06b6b"];

// Perform a GET request to the query URL
d3.json(queryUrl).then(function (earthquake) {
  // Once we get a response, send the data.features object to the createFeatures function
  d3.json("static/js/PB2002_steps.json").then(function (faultLine) {
    createFeatures(earthquake.features, faultLine.features);
  });
});

function createFeatures(earthquakeData, faultLineData) {
  var earthquakes = [];
  var faultLines = [];
  initLegend();

  var data = earthquakeData.map(function (item) {
    var coordinates = item.geometry.coordinates;
    var count = item.properties.mag;
    return { location: [coordinates[1], coordinates[0]], count: count };
  });

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4
  });

  // Sending our earthquakes layer to the createMap function
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });


  for (var i = 0; i < data.length; i++) {
    var color = "";
    if (data[i].count >= 0 && data[i].count <= 1) {
      color = colors[0];
    } else if (data[i].count > 1 && data[i].count <= 2) {
      color = colors[1];
    } else if (data[i].count > 2 && data[i].count <= 3) {
      color = colors[2];
    } else if (data[i].count > 3 && data[i].count <= 4) {
      color = colors[3];
    } else if (data[i].count > 4 && data[i].count <= 5) {
      color = colors[4];
    } else if (data[i].count > 5) {
      color = colors[5];
    }
    // Add circles to map
    earthquakes.push(L.circle(data[i].location, {
      stroke: false,
      fillOpacity: 0.85,
      color: 'transparent',
      fillColor: color,
      // Adjust radius
      radius: data[i].count * 12000
    }).bindPopup("<h3>Earthquakes: " + data[i].count + "</h3>"));
  }

  for (var j = 0; j < faultLineData.length; j++) {
    faultLines.push(L.polyline(faultLineData[j].geometry.coordinates, {
      color: "#ed9c00",
      weight: 1
    }));
  }

  // Create two separate layer groups: one for cities and one for states
  var Earthquakes = L.layerGroup(earthquakes);
  var FaultLines = L.layerGroup(faultLines);

  // Create a baseMaps object
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create an overlay object
  var overlayMaps = {
    "Earthquakes": Earthquakes,
    "FaultLines": FaultLines
  };

  // Pass our map layers into our layer control
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  function initLegend() {
    var level = {
      0: "0 - 1",
      1: "1 - 2",
      2: "2 - 3",
      3: "3 - 4",
      4: "4 - 5",
      5: "5 +",
    }
    var legend = colors;
    var legendDom = document.getElementsByClassName('legend')[0];
    var insertDom = document.createElement('ul');
    var str = ``;
    for (var i = 0; i < legend.length; i++) {
      str += `<li><i style="background: ${legend[i]}"></i><span>${level[i]}</span></li>`;
    }
    insertDom.innerHTML = str;
    legendDom.appendChild(insertDom);
  }

}
