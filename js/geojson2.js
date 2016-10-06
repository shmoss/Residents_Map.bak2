/**
 * @author Starr
 */

/* Map of GeoJSON data from MegaCities.geojson */
var statesData
var world
var map;
var attribute;
var attributes;
var index;
var response;
var popupContent;
var IndexCounter = 0; //tracks attribute being mapped

//function to instantiate the Leaflet map
function createMap(){
    //create the map
    map = L.map('map', {
        //set geographic center
        center: [41.4, -110],
        //set initial zoom level
        zoom: 4,
        maxZoom: 8,
        minZoom: 4
    });


//add OSM base tilelayer
    L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
        //set attribute info (source)
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        //and add it to map

    }).addTo(map);
    L.geoJson(world).addTo(map);
    console.log(world)

    //call getData function- will add our MegaCities data to the map
    getData(map);
    getWorldData(map)
};

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 50;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

//Create popups with attribute information, based on raw and normalized attributes
function createPopup(properties, attribute, layer, radius){
    //add city to popup content string
    var popupContent = "<p><b>City:</b> " + properties.GE_City + "</p>";
    //add formatted attribute to panel content 
    
    popupContent += "<p><b>Number of Installs:</b> " + properties.GE_Count + "</p>";

    //replace the layer popup
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-radius)
    });
};

//convert geojson markers to circle markers
function pointToLayer(feature, latlng, attributes){
    attribute = attributes[1];
    //console.log(attribute)
    

    console.log(attributes)
    //create marker style
    var options = {
        fillColor: "#ff0",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

     //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);
    
    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    createPopup(feature.properties, attribute, layer, options.radius);

    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },
        click: function(){
            $("#panel").html(popupContent);
        }
    });


    return layer;
};

//we'll create a Leaflet GeoJSON layer and add it to map, taking "response" data as parameter
function createPropSymbols(data, map, attributes) {
    L.geoJson(data, {
        //create a layer from original geojson points
        pointToLayer: function(feature, latlng){
            //instead of markers, we want circles, so we return the geojsonMarkerOptions function with circle specs
            return pointToLayer(feature, latlng, attributes);
            }
        //now, we need to add the circle layer to the map       
    }).addTo(map);

}

function processData(data){
    //empty array to hold attributes
    attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("GE") > -1){
            attributes.push(attribute);
        };
    };
    console.log(attributes)
    return attributes;
};

function getData(map){
    //ajax function to get MegaCities data layer loaded into map
    $.ajax("data/Cities_US4.GeoJSON", {
        //datatype specified
        dataType: "json",
        //upon success, call the following function
        success: function(response){
            attributes = processData(response); 
             //call function to create proportional symbols
            createPropSymbols(response, map, attributes);
            
            console.log(attributes)
            return response

        }   
    });
}

function getWorldData(map){
    //ajax function to get MegaCities data layer loaded into map
    $.ajax("data/World.GeoJSON", {
        //datatype specified
        dataType: "json",
        //upon success, call the following function
        success: function(response){
           
            
            console.log(response)
            return response

        }   
    });
}

//way at the bottom- we call the create map function once the doc has loaded.
// $(document).ready(createMap);

//     Status API Training Shop Blog About 

//     © 2016 GitHub, Inc. Terms Privacy Security Contact Help 

