/**
 * @author Starr
 */

/* Map of GeoJSON data from MegaCities.geojson */

//function to instantiate the Leaflet map
function createMap(){
    //create the map
    var map = L.map('map', {
    	//set geographic center
        center: [20, 0],
        //set initial zoom level
        zoom: 2
    });


//add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    	//set attribute info (source)
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        //and add it to map
    }).addTo(map);

    //call getData function- will add our MegaCities data to the map
    getData(map);
};

function getData(map){
	//ajax function to get MegaCities data layer loaded into map
	$.ajax("data/MegaCities.GeoJSON", {
		//datatype specified
		dataType: "json",
		//upon success, call the following function
		success: function(response){
			//Let's set options for the geojson markers.  Note the object notation. 
			//Put the styling options into a single variable
			  var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
			
		//we'll create a Leaflet GeoJSON layer and add it to map, taking "response" data as parameter
			L.geoJson(response, {
				//create a layer from original geojson points
				pointToLayer: function(feature, latlng){
					//instead of markers, we want circles, so we return the geojsonMarkerOptions function with circle specs
					return L.circleMarker(latlng, geojsonMarkerOptions);
				}
			//now, we need to add the circle layer to the map
			}).addTo(map);
		}	
	});
}

//way at the bottom- we call the create map function once the doc has loaded.
$(document).ready(createMap);
