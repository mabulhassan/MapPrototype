


let streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 4,
	accessToken: accessToken
});





// Geocode pickup and delivery addresses
var pickup = "Raleigh, NC";
var delivery = "Miami, Florida";
var pickupEncoded = encodeURIComponent(pickup);
var deliveryEncoded = encodeURIComponent(delivery);
var pickupCoords=[]; 
var deliveryCoords=[]; 
var geocodingUrl = `https://api.geoapify.com/v1/geocode/autocomplete?text=${pickupEncoded}&apiKey=${API_KEY}`;
fetch(geocodingUrl)
  .then(response => response.json())
  .then(data => {
    var requestOptions = {
      method: 'GET',
    };
    pickupCoords= [data.features[0].geometry.coordinates[1], data.features[0].geometry.coordinates[0]];
  
    var deliveryGeocodingUrl = `https://api.geoapify.com/v1/geocode/autocomplete?text=${deliveryEncoded}&apiKey=${API_KEY}`;
    fetch(deliveryGeocodingUrl)
      .then(response => response.json())
      .then(data => {
        deliveryCoords = [data.features[0].geometry.coordinates[1], data.features[0].geometry.coordinates[0]];


        // Calculate the route using Geoapify Routing API
     
const turnByTurnMarkerStyle = {
  radius: 5,
  fillColor: "#fff",
  color: "#555",
  weight: 4,
  opacity: 1,
  fillOpacity: 1
}
// Create the map object with center, zoom level and default layer.
let map = L.map('mapid', {
	zoom: 0,
	layers: [streets]
}).setView(pickupCoords, 12);
const deliveryCoordsMarker = L.marker(deliveryCoords).addTo(map).bindPopup("destination address, description, capacity goes here");
  const pickupCoordsMarker = L.marker(pickupCoords).addTo(map).bindPopup("capacity, description goes here");

var routingUrl=`https://api.geoapify.com/v1/routing?waypoints=${pickupCoords.join(',')}|${deliveryCoords.join(',')}&mode=drive&apiKey=${API_KEY}`
fetch(routingUrl).then(res => res.json()).then(result => {

  // Note! GeoJSON uses [longitude, latutude] format for coordinates
  L.geoJSON(result, {
    style: (feature) => {
      return {
        color: "rgba(20, 137, 255, 0.7)",
        weight: 5
      };
    }
  }).bindPopup((layer) => {
    return `${layer.feature.properties.distance} ${layer.feature.properties.distance_units}, ${layer.feature.properties.time}`
  }).addTo(map);

  // collect all transition positions
  const turnByTurns = [];
  result.features.forEach(feature => feature.properties.legs.forEach((leg, legIndex) => leg.steps.forEach(step => {
    const pointFeature = {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": feature.geometry.coordinates[legIndex][step.from_index]
      },
      "properties": {
        "instruction": step.instruction.text
      }
    }
    turnByTurns.push(pointFeature);
  })));

  L.geoJSON({
    type: "FeatureCollection",
    features: turnByTurns
  }, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, turnByTurnMarkerStyle);
    }
  }).bindPopup((layer) => {
    return `${layer.feature.properties.instruction}`
  }).addTo(map);

  

}, error => console.log(err));



      });
      
    });

  