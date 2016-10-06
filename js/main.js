
//function to instantiate the Leaflet map
console.log("initiate map")
// I want these to be global variables. 
var map;
var attribute;
var rawAttribute;
var attributes;
var rawAttributes;
var index;
var response;
var popupContent;
var normalized = true;
var raw;
var IndexCounter = 0; //tracks attribute being mapped

//function to create map
function createMap(){
    //create the map
    map = L.map('map', {
    	//set geographic center
        center: [41.4, -90],
        //set initial zoom level
        zoom: 6,
    });


//add OSM base tilelayer
    L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
	subdomains: 'abcd',
	maxZoom: 8,
	minZoom: 6
}).addTo(map);

getData(map);
return map;
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
function createPopup(properties, attribute, rawAttribute, layer, radius){
    //add city to popup content string
    var popupContent = "<p><b>City:</b> " + properties.City + "</p>";
    //add formatted attribute to panel content 
    var year = attribute.split("_")[1];
    popupContent += "<p><b>Homicide rate in " + year + ":</b> " + properties[attribute] + " homicides per 100,000 people</p>" + "<p><b>Total homicides in " + year + ":</b> " + properties[rawAttribute];

    //replace the layer popup
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-radius)
    });
};

//convert geojson markers to circle markers
function pointToLayer(feature, latlng, attributes, rawAttributes){
    //Determine which attribute to visualize with proportional symbols
    attribute = attributes[0];
    rawAttribute=rawAttributes[0];
    
    //create marker style
    var options = {
        fillColor: "#ff7900",
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

    //create popup content 
    createPopup(feature.properties, attribute, rawAttribute, layer, options.radius);
    //add event listener, popup initiated on mouseover of feature
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

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
    return popupContent;
};

//Add circles for point features to the map
function createPropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
    	//creates layer based on lat/long
        pointToLayer: function(feature, latlng){
        	return pointToLayer(feature, latlng, attributes, rawAttributes);
        }
        //and adds it to map
    }).addTo(map);
};

//function to update proportional symbols based on attributes
function updatePropSymbols(map, attribute, rawAttribute){
    map.eachLayer(function(layer){
      //if layer and properties present:
        if (layer.feature && layer.feature.properties[attribute]){
            //get feature properties
            var props = layer.feature.properties;
            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);
			if(IndexCounter > 0) {
			}
            //call popup function to add new information as symbols are updated
           if (normalized == true) {
          createPopup(props, attribute, rawAttribute, layer, radius);
          } else {
          	createPopup(props, rawAttribute, attribute, layer, radius);
          }        
        };
	});
	//also want our legend to update, so call the function
	updateLegend(map, attribute);
};

//create the sequence controls to control temporal indexing
function createSequenceControls(map, attributes, rawAttributes){
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
    });
//add the control to map
 map.addControl(new SequenceControl());
	//range slider based on 7 years
    $('.range-slider').attr({
        max: 6,
        min: 0,
        value: 0,
        step: 1
    });
    
    var dataArray = [attributes, rawAttributes];
	//add images to buttons
	$('#reverse').html('<img src = "img/backward.png">');
	$('#forward').html('<img src = "img/forward.png">');
    //buttons, upon being clicked, call function
    $('.skip').click(function(){
        var index = $('.range-slider').val();
        
        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 6 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 6 : index;
        };

        //update slider
        $('.range-slider').val(index);       
        //if normalized is true(see function further down), update prop symbols based on normalized attributes
         if (normalized) {
        	updatePropSymbols(map, attributes[index], rawAttributes[index]);
        	console.log("true")
        } else {
        	//update symbols based on raw attributes
        	updatePropSymbols(map, rawAttributes[index], attributes[index])        	
        }       	        
    });

    //input listener for slider
    $('.range-slider').on('input', function(){
        //get the new index value
        var index = $(this).val();
        
         //pass new attribute to update symbols
           if (normalized) {
        		updatePropSymbols(map, attributes[index], rawAttributes[index]);
        		console.log("true")
        } else {
        		//update symbols based on raw attributes
        		updatePropSymbols(map, rawAttributes[index], attributes[index])       	
        }
	});         
};

//This function wil put the normalized data into an array
function processData(data){
    //empty array to hold attributes
    attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("Prop") > -1){
            attributes.push(attribute);
        };
    };
    return attributes;
};

//This function will put the raw data into an array (same process as normalized data above)
function processRawData(data){
    //empty array to hold attributes
    rawAttributes = [];
    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var rawAttribute in properties){
        //only take attributes with population values
        if (rawAttribute.indexOf("Raw") > -1){
            rawAttributes.push(rawAttribute);
        };
    };

    return rawAttributes;   
};
	
//Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/PropRaw2001_2013.geojson", {
        dataType: "json",
        success: function(response){
        	
        	 //create an attributes array for normalized data
            attributes = processData(response);
             //create an attributes array for raw data
			rawAttributes = processRawData(response);
            
            //call function to create proportional symbols
            createPropSymbols(response, map, attributes);
            
			//call function to create legend
            createLegend(map, attributes);
            //set initial true/false values for listener event
            normalized = true;
            raw = false;
            //call selectValues function to determine whether to show raw or normalized data
            selectValues(response, map, attributes, rawAttributes);
            //createRawSymbols
            createSequenceControls(map, attributes, rawAttributes);
            return response
        }		
	});
};

//function to determine whether or not to show raw or normalized attribute
function selectValues(response, map, attributes, rawAttributes) {	
		//create "raw" and "normalized" buttons
	    $('#panel').append('<button class="Normalized" style="-moz-box-shadow: 0px 10px 14px -7px #383838; -webkit-box-shadow: 0px 10px 14px -7px #383838; box-shadow: 0px 10px 14px -7px #383838; background-color:#FFF; -moz-border-radius:8px; -webkit-border-radius:8px; border-radius:8px; display:inline-block; cursor:pointer; color:#000000; font-family:avenir; font-size:14px; font-weight:bold; padding:8px 14px; text-decoration:none;">Show normalized data</button>');
    	$('#panel').append('<button class="Raw" style="-moz-box-shadow: 0px 10px 14px -7px #383838; -webkit-box-shadow: 0px 10px 14px -7px #383838; box-shadow: 0px 10px 14px -7px #383838; background-color:#FFF; -moz-border-radius:8px; -webkit-border-radius:8px; border-radius:8px; display:inline-block; cursor:pointer; color:#000000; font-family:avenir; font-size:14px; font-weight:bold; padding:8px 14px; text-decoration:none;">Show raw data</button>');
    	
	 //If normalized button hit, call function
    $(".Normalized").click(function(){
    	var index = $('.range-slider').val();
    	 normalized = true
    	 raw = false
 		//create true false statement
    	if (normalized == true) {
		//if true, update based on normalized attributes
    		updatePropSymbols(map, attributes[index], rawAttributes[index]);
    	};
	});
    $(".Raw").click(function(){
    	var index = $('.range-slider').val();
    	//re-set statement
    	normalized = false
    	raw = true
    	if (raw == true) {
    		//take off previous layer
    		map.removeLayer(attributes);
    		//call update prop symbols based on normalized data
    		updatePropSymbols(map, rawAttributes[index], attributes[index]);		
    	};
	});
};

//create the legend
function createLegend(map, attributes){
	var legendControl = L.Control.extend({
		options: {
			position: 'bottomright'
		},
		onAdd: function(map){
			//create the container with a class name
			var container = L.DomUtil.create('div', 'legend-control-container');

			//create temporal legend
			$(container).append('<div id = "temporal-legend">');

			//create attribute legend storage 
			var svg = '<svg id = "attribute-legend" width = "5000px" height = "500px">';

			//create an circle names for loop
			var circles = {
				max: 20,
				mean: 40,
				min: 60
			};

			//loop to add each circle and text to svg string
			for (var circle in circles){
				//set styling
				svg +='<circle class = "legend-circle" id = "' + circle + '" fill = "#ff7900" fill-opacity = "0.75" stroke = "#165056" cx = "140"/>';

				//set text here
				svg += '<text id = "' + circle + '-text" x="185" y="2' + circles[circle] + '"></text>';
				console.log(circles[circle]);
			};

			//close svg string
			svg += "</svg>";

			//add attribute legend svg to container
			$(container).append(svg);

			return container;
		}
	});
	//add the legendControl to map
	map.addControl(new legendControl);
	//call function to update the legend to first attribute
	updateLegend(map, attributes[0]);
};
  
//update legend function
function updateLegend(map, attribute) {
	//get years by splitting attribute junk "_"
	var year = attribute.split("_")[1];
	//Create temoral content
   	var content = "Homicides in " + year;

	//update legend content
	$('#temporal-legend').html(content);

	//get the min, max, and mean values as an object
	var circleValues = getCircleValues(map, attribute);

	for (var key in circleValues) {
		//get the radius
		var radius = calcPropRadius(circleValues[key]);

		//assign the cy and r attributes (calculates circle footprint)
		$('#'+key).attr({
			cy: 260-radius,
			r: radius
		});
		//add legend text
		$('#'+key+'-text').text(Math.round(circleValues[key]*100)/100 + " Homicides");
	};
};
//get circle values in this function to pass to legend
function getCircleValues(map, attribute){
	//start with min at highest possible and max at lowest possible number
	console.log(attribute)
	var min = Infinity,
		max = -Infinity;
	//for each layer,
	map.eachLayer(function(layer){
		//get the attribute value
		if (layer.feature){
			var attributeValue = Number(layer.feature.properties[attribute]);

			//test for min
			if (attributeValue<min){
				min = attributeValue;
			};

			//test for max
			if (attributeValue>max){
				max = attributeValue;
			};
		};
	});

	//set mean
	var mean = (max + min)/2;

	//return values as an objest
	return {
		max: max,
		mean: mean,
		min: min
	};
};

//way at the bottom- we call the create map function once the doc has loaded.

$(document).ready(createMap);
