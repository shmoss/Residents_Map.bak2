/**
 * @author Starr
 */

//Leaflet Quick Start Guide Tutorial:

//this a link to the leaflet stylesheet 
 <link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet/v0.7.7/leaflet.css" />
 
 //this is a link to the leaflet javascript file
 <script src="http://cdn.leafletjs.com/leaflet/v0.7.7/leaflet.js"></script>

//any map created in leaflet should be added to a div in HTMl, so we need to create the div
 <div id="map"></div>
 
 //this defines the size of the map on the display- set this in CSS file
 map { height: 180px; }


//L.map: using a div element, creates a new map object that has a few parameters like center/zoom
//.setView: this is a method of L.map, it sets the geographic center and zoom levels (map options)
//center: map option - states geographic center of map
//zoom: map option - states original zoom level of map
var map = L.map('map').setView([51.505, -0.09], 13);

//L.tileLayer: given a url, this creates a base-map tile layer
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	//attribution:describes the tile layer
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    //maxZoom: maximum zoom level
    maxZoom: 18,
    id: 'your.mapbox.project.id',
    accessToken: 'your.mapbox.public.access.token'
    //add the tile layer to the map(in the div on HTML index)
}).addTo(map);

//L.marker: adds marker to the map, given parameters of geographic coordinates
var marker = L.marker([51.5, -0.09]).addTo(map);

//L.circle: similar to marker, but gives options (color, fillColor, opacity, etc)
var circle = L.circle([51.508, -0.11], 500, {
	//the following are all attributes of the circle object
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5
}).addTo(map);

//L.polygon: similar to above, takes bounding coordinate parameters 
var polygon = L.polygon([
	//these are the bounding coordinates
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);

//bindPopup: when path is clicked, gives popup message
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
//for circle
circle.bindPopup("I am a circle.");
//for polygon
polygon.bindPopup("I am a polygon.");

//L.popup(): this treats popups as an entire layer
var popup = L.popup()
	//set the lat/long of the popup
    .setLatLng([51.5, -0.09])
    //set the content(what popup says)
    .setContent("I am a standalone popup.")
    //upon opening map, the popup will appear
    .openOn(map);

//map.on(): takes two parameters, the event, and the desired result (ex, "click", function)
function onMapClick(e) {
	//command
    alert("You clicked the map at " + e.latlng);
}
//call map.on() function
map.on('click', onMapClick);

//below is another example of map.on()
function onMapClick(e) {
    popup
    	//this is where the user clicked on the map
        .setLatLng(e.latlng)
        //write content
        .setContent("You clicked the map at " + e.latlng.toString())
        //set event to be opening map- upon which popup will appear
        .openOn(map);
}

map.on('click', onMapClick);

//Using GeoJson tutorial

//here, we create a variable that holds a geojson feature
var geojsonFeature = {
    "type": "Feature",
    //these are the feature properties (note the object notation)
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    //each feature requires a member with the name geometry (point, line, polygon etc)
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

// This creates a new GeoJson layer using your feature, and adds it to the map
L.geoJson(geojsonFeature).addTo(map);

//Here, we are assigning multiple GeoJson objects (an array) to a variable
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];

//This allows us to first declare a variable that holds the layer info
var myLayer = L.geoJson().addTo(map);
//.addData method adds the data to the layer
//Now it's easy to add features to myLayer variable which automatically puts it into the layer
myLayer.addData(geojsonFeature);

//Below is the "style" option- we can style multiple objects the same way
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];
//store style values in a variable, 
var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};
//And then apply that style to the entire array of objects and add to the map
L.geoJson(myLines, {
    style: myStyle
}).addTo(map);

// Styling individual objects, based on their properties
//  Declaring states variable, with one of properties being "party"
var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];
//create a GeoJson layer
L.geoJson(states, {
	//style depends on function with feature as parameter
    style: function(feature) {
    	//switch- depending on condition- different reaction
        switch (feature.properties.party) {
        	//Republican gets one style
            case 'Republican': return {color: "#ff0000"};
            //Democrat gets another style
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
//add results with .addTo(map) method
}).addTo(map);

//this is the pointToLayer method
//leaflet default for points is a marker.  
//let's change it to a circle marker

var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};
//create a new layer based on a feature
L.geoJson(someGeojsonFeature, {
	//pointToLayer is a function that takes the feature/location as it's parameters
    pointToLayer: function (feature, latlng) {
    	//returns a layer with new circle styling options defined within geojsonMarkerOptions variable
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(map);

//onEachFeature method
//in this case, function will change each feature and then add it to a layer
function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
    	//give a popup to each layer with content
        layer.bindPopup(feature.properties.popupContent);
    }
}

var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};
//Now we'll create the new layer
L.geoJson(geojsonFeature, {
	//function called on each feature before adding to map
    onEachFeature: onEachFeature
}).addTo(map);

//this is the filter method
//use this to control what and what not to show on the map
//First, create our features class
var someFeatures = [{
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
}, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": false
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];

//here we want to create a new layer
L.geoJson(someFeatures, {
	//but we want a filter, which will be a function
    filter: function(feature, layer) {
    	//the function will return only certain features!  Busch Field omitted since show on map reads "false"
        return feature.properties.show_on_map;
    }
//only some features added to map
}).addTo(map);

