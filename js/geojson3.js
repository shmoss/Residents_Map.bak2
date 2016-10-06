/**starr
 * @author Starr
 */

/* Map of GeoJSON data from MegaCities.geojson */
var statesData
var worldCountries
var GE_Countries = L.geoJson(GE_Countries)
var GE_Cities = L.geoJson(GE_Cities)
var map = L.map('map', {
        //set geographic center
        center: [41.4, -110],
        //set initial zoom level
        zoom: 4,
        maxZoom: 8,
        minZoom: 2
    });
var attribute;
var attributes;
var index;
var response;
var popupContent;
var IndexCounter = 0; //tracks attribute being mapped
var geoJsonLayers = {};




//add OSM base tilelayer
    L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    	//set attribute info (source)
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        //and add it to map

    }).addTo(map);
    // L.geoJson(worldCountries).addTo(map);
    console.log(GE_Countries)

    //call getData function- will add our MegaCities data to the map
    getResidentsData(map);
    //getWorldData(map)
    getFellowsData(map)
    getResidentsFellowsData(map)

    getFacultyData(map)
   
    console.log(GE_Countries)
    console.log(GE_Cities)
    console.log
    



map.on('zoomend', function () {
    console.log("level")
    zoomLevel = map.getZoom()
    console.log(zoomLevel)
    if (map.getZoom() <7) {
        map.removeLayer(GE_Cities);
    }
}); 

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
    var popupContent = '<h3>' + "Names: " + properties.info_firstName + " " + properties.info_lastName + '</h3>';
    //add formatted attribute to panel content 
    
    popupContent += "<p><b>Date of Graduation:</b> " + properties.info_date + "</p>" + "<p><b>Number of Installs:</b> " + properties.GE_Count + "</p>";


    //replace the layer popup
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-radius)
    });
};

//convert geojson markers to circle markers
function pointToLayer(feature, latlng, attributes, color){
    attribute = attributes[23];
    //console.log(attribute)
	

  	//console.log(attributes)
    //create marker style
    var options = {
        fillColor: color,
        color: "#666600",
        weight: 1.6,
        opacity: .7,
        fillOpacity: .5
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
function createPropSymbols(data, map, attribute, layername, color) {
	var layer = L.geoJson(data, {
		//create a layer from original geojson points
		pointToLayer: function(feature, latlng){
			//instead of markers, we want circles, so we return the geojsonMarkerOptions function with circle specs
			return pointToLayer(feature, latlng, attributes, color);
			}
		//now, we need to add the circle layer to the map		
	}).addTo(map);
    geoJsonLayers[layername] = layer;
    console.log(layer)
    return layer

}

function processData(data){
    //empty array to hold attributes
    attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("info") > -1){
            attributes.push(attribute);
        };
    };
    console.log(attributes)
    return attributes;
};


function getResidentsData(map){
	//ajax function to get MegaCities data layer loaded into map
	$.ajax("data/residents.GeoJSON", {
		//datatype specified
		dataType: "json",
		//upon success, call the following function
		success: function(response){
            console.log("successful")
            attributes = processData(response); 
			 //call function to create proportional symbols
            createPropSymbols(response, map, attributes, "residents", "blue");
			
			console.log(attributes)
            return response

		}	
	});
}

function getFellowsData(map){
    //ajax function to get MegaCities data layer loaded into map
    $.ajax("data/fellows.GeoJSON", {
        //datatype specified
        dataType: "json",
        //upon success, call the following function
        success: function(response){
            console.log("successful")
            attributes = processData(response); 
             //call function to create proportional symbols
            createPropSymbols(response, map, attributes, "fellows", "green");
            console.log(geoJsonLayers.fellows._layers.features)
            console.log(response)
            return response

        }   
    });
}

function getResidentsFellowsData(map){
    //ajax function to get MegaCities data layer loaded into map
    $.ajax("data/residents_fellows.GeoJSON", {
        //datatype specified
        dataType: "json",
        //upon success, call the following function
        success: function(response){
            attributes = processData(response)
            createPropSymbols(response, map, attributes, "residentsFellows", "yellow");
            console.log(response)
            return response

        }   
    });
}

function getFacultyData(map){
    //ajax function to get MegaCities data layer loaded into map
    $.ajax("data/faculty.GeoJSON", {
        //datatype specified
        dataType: "json",
        //upon success, call the following function
        success: function(response){
            attributes = processData(response)
            createPropSymbols(response, map, attributes, "faculty", "orange");
            console.log(response)
            return response

        }   
    });
}
console.log("this is a test")
//function to determine whether or not to show raw or normalized attribute
function selectValues(map) {   
        //create "raw" and "normalized" buttons
        $('#panel').append('<button class="Cities" style="-moz-box-shadow: 0px 10px 14px -7px #383838; -webkit-box-shadow: 0px 10px 14px -7px #383838; box-shadow: 0px 10px 14px -7px #383838; background-color:#FFF; -moz-border-radius:8px; -webkit-border-radius:8px; border-radius:8px; display:inline-block; cursor:pointer; color:#000000; font-family:avenir; font-size:14px; font-weight:bold; padding:8px 14px; text-decoration:none;">Show US Cities</button>');
        $('#panel').append('<button class="Countries" style="-moz-box-shadow: 0px 10px 14px -7px #383838; -webkit-box-shadow: 0px 10px 14px -7px #383838; box-shadow: 0px 10px 14px -7px #383838; background-color:#FFF; -moz-border-radius:8px; -webkit-border-radius:8px; border-radius:8px; display:inline-block; cursor:pointer; color:#000000; font-family:avenir; font-size:14px; font-weight:bold; padding:8px 14px; text-decoration:none;">Show Global</button>');
        
     //If normalized button hit, call function
    $(".Cities").click(function(){
        console.log("cities")
        // var index = $('.range-slider').val();
        //  normalized = true
        //  raw = false
        // //create true false statement
        // if (normalized == true) {
        // //if true, update based on normalized attributes
        //     updatePropSymbols(map, attributes[index], rawAttributes[index]);
        // };
       
     map.setView(new L.LatLng(41.4, -110), 4)

     console.log("this is a test")
     if (map.hasLayer(geoJsonLayers.countries)){
        console.log("map has countries")
        map.removeLayer(geoJsonLayers.countries)
        map.addLayer(geoJsonLayers.cities)
        map.removeLayer(geoJsonLayers.usa)
     }
     console.log(GE_Cities)
     
    });
   
    $(".Countries").click(function(){
        // var index = $('.range-slider').val();
        // //re-set statement
        // normalized = false
        // raw = true
        // if (raw == true) {
        //     //take off previous layer
        //     map.removeLayer(attributes);
        //     //call update prop symbols based on normalized data
        //     updatePropSymbols(map, rawAttributes[index], attributes[index]);        
        // };
    map.setView(new L.LatLng(41.4, -0), 2)
    if (map.hasLayer(geoJsonLayers.cities)){
        map.removeLayer(geoJsonLayers.cities)
        map.addLayer(geoJsonLayers.countries)
        map.addLayer(geoJsonLayers.usa)
};
});
}

selectValues(map)    
//way at the bottom- we call the create map function once the doc has loaded.
//$(document).ready(createMap);
function readZoom() {
    console.log("readZoom function")
     if (map.getZoom() <7) {
        console.log("hello");
    }
}

readZoom()

//create slider, arrows
// function createSequenceControls(map, attributes){
//   //add slider, arrows
//   var SequenceControl=L.Control.extend({
//     options: {
//       position: 'bottomleft'
//     },
//     onAdd: function(map){
//       //create sequence-control-container div element
//       var container=L.DomUtil.create('div','sequence-control-container');

//       $(container).append('<input class="range-slider" type="range">');
//       $(container).append('<button class="skip" id="reverse"> Reverse</button>');
//       $(container).append('<button class="skip" id="forward">Skip</button>');
//       //prevent interaction with basemap when using slider, arrows
//       $(container).on('mousedown dblclick', function(e){
//         L.DomEvent.stopPropagation(e);
//       });

//       return container;
//     }
//   });
//   map.addControl(new SequenceControl());


 

// createSequenceControls(map, attributes);

//create the sequence controls to control temporal indexing
function createSequenceControls(map){
    console.log("adding sequence control")
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function(map){
            // create the sequence control container and give it class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            //create range input element
            $(container).append('<input class="range-slider" type="range">');
    
            //add skip buttons
            $(container).append('<button class="skip" id="reverse" title="Reverse">Reverse</button>');
            $(container).append('<button class="skip" id="forward" title="Forward">Skip</button>');
    
            //kill any mouse event listeners on the map
            $(container).on('mousedown dblclick', function(e){
                L.DomEvent.stopPropagation(e);
            });         
            return container;
        }

    })   

map.addControl(new SequenceControl())

$('.range-slider').attr({
    //set max, min-- 1990 thru 2014-- at one step increments
    max: 2016,
    min: 1971,
    value:0,
    step:1
  });
//add forward, backward arrows with icons

$('#reverse').html('<img src="img/left2.png"">');
$('#forward').html('<img src="img/right2.png">');
 $('.skip').click(function(){
    var index=$('.range-slider').val();
    //if forward clicked, increasing increments by 1
    if ($(this).attr('id')=='forward'){
      index++;
      index=index> 2016 ? 1971 : index;
      //else if reverse clicked, decreasing increments by 1
    } else if ($(this).attr('id')=='reverse'){
      index--;
      index=index < 1971 ? 2016 : index;
      console.log(index)
      if (index == 2013) {
        year = 2013
        console.log(year)
        console.log("hellsyea")
        console.log(geoJsonLayers)
        filterByYear(geoJsonLayers.fellows, year)
        map.removeLayer(geoJsonLayers.residents)
        
        map.removeLayer(geoJsonLayers.residentsFellows)
        map.removeLayer(geoJsonLayers.faculty)
        
        //filterByYear(geoJsonLayers.fellows)
      } 

    };
//add slider
    $('.range-slider').val(index);
//should updatePropSymbols with interaction
    // if (index = 2015) {
    //     console.log(hellsyea)
    //   } 

    });



}     

createSequenceControls(map)


//     // Initialize a new plugin instance for all
//     // e.g. $('input[type="range"]') elements.
//     $('input[type="range"]').rangeslider();

//     // Destroy all plugin instances created from the
//     // e.g. $('input[type="range"]') elements.
//     $('input[type="range"]').rangeslider('destroy');

//     // Update all rangeslider instances for all
//     // e.g. $('input[type="range"]') elements.
//     // Usefull if you changed some attributes e.g. `min` or `max` etc.
//     $('input[type="range"]').rangeslider('update', true);

// $('input[type="range"]').rangeslider({

//     // Feature detection the default is `true`.
//     // Set this to `false` if you want to use
//     // the polyfill also in Browsers which support
//     // the native <input type="range"> element.
//     polyfill: true,

//     // Default CSS classes
//     rangeClass: 'rangeslider',
//     disabledClass: 'rangeslider--disabled',
//     horizontalClass: 'rangeslider--horizontal',
//     verticalClass: 'rangeslider--vertical',
//     fillClass: 'rangeslider__fill',
//     handleClass: 'rangeslider__handle',

//     // Callback function
//     onInit: function() {},

//     // Callback function
//     onSlide: function(position, value) {},

//     // Callback function
//     onSlideEnd: function(position, value) {}
// });

// onInit()
// onSlide()
// onSlideEnd()


// var $element = $('input[type="range"]');
// var $handle;

// $element
//   .rangeslider({
//     polyfill: false,
//     onInit: function() {
//       $handle = $('.rangeslider__handle', this.$range);
//       updateHandle($handle[0], this.value);
//     }
//   })
//   .on('input', function() {
//     updateHandle($handle[0], this.value);
//   });

// function updateHandle(el, val) {
//   el.textContent = val;
// }

function filterByYear(data, year) {
  console.log(data._layers.features.properties.info_date[5]) 
  console.log(year) 
  f = data.filter(function(d) { 
    return d.layers_.properties.info_date == year;
    console.log(f)
  });
  
  return f;
}
