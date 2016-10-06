
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
//var attValue
//not sure I'll need this..
var normalized = true
var raw = false
var IndexCounter = 0; //tracks attribute being mapped

function createMap(){
    //create the map
    map = L.map('map', {
    	//set geographic center
        center: [40, -90],
        //set initial zoom level
        zoom: 5,
    });


//add OSM base tilelayer
    L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
	subdomains: 'abcd',
	maxZoom: 8
}).addTo(map);

getData(map);
return map;
};


//radius function

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

//calculate the radius of each proportional symbol
function calcRawPropRadius(rawAttValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 50;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
  };

//end radius function

function createPopup(properties, attribute, layer, radius){
    //add city to popup content string
    var popupContent = "<p><b>City:</b> " + properties.City + "</p>";
	console.log(rawAttribute)
    //add formatted attribute to panel content string
    var year = attribute.split("_")[1];
    popupContent += "<p><b>Homicide rate in " + year + ":</b> " + properties[attribute] + " homicides per 100,000 people</p>" + "<p><b>Total homicides in " + year + ":</b> " + properties[rawAttribute];

    //replace the layer popup
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-radius)
    });
};

//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
	console.log("Hi")
    //Determine which attribute to visualize with proportional symbols
    attribute = attributes[0];
    rawAttribute=rawAttributes[0];
    console.log(attribute)
    console.log("Hi again")

    //create marker options
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

    //build popup content string
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

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

// function rawPointToLayer(feature, latlng, rawAttributes){
	// console.log("Hi raw data")
    // //Determine which attribute to visualize with proportional symbols
    // rawAttribute = rawAttributes[0];
    // console.log(rawAttribute)
    // console.log("Hi again")
// 
    // //create marker options
    // var options = {
        // fillColor: "#ff3900",
        // color: "#000",
        // weight: 1,
        // opacity: 1,
        // fillOpacity: 0.8
    // };
// 
    // //For each feature, determine its value for the selected attribute
    // var rawAttValue = Number(feature.properties[rawAttribute]);
// 
    // //Give each feature's circle marker a radius based on its attribute value
    // options.radius = calcPropRadius(rawAttValue);
// 
    // //create circle marker layer
    // var layer = L.circleMarker(latlng, options);
// 
    // //build popup content string
    // var popupContent = "<p><b>City:</b> " + feature.properties.City + "</p>";
//     
    // //add formatted attribute to popup content string
    // var year = rawAttribute.split("_")[0];
    // popupContent += "<p><b>Crime Rate in " + year + ":</b> " + feature.properties[rawAttribute] + " homicides per 100,000 people</p>";
// 
    // //bind the popup to the circle marker
     // //Example 2.5 line 1...bind the popup to the circle marker
    // layer.bindPopup(popupContent, {
        // offset: new L.Point(0,-options.radius)
    // });
//     
    // layer.on({
        // mouseover: function(){
            // this.openPopup();
        // },
        // mouseout: function(){
            // this.closePopup();
        // },
        // click: function(){
            // $("#panel").html(popupContent);
        // }
    // });
// 
    // //return the circle marker to the L.geoJson pointToLayer option
    // return layer;
// };

//Add circle markers for point features to the map
function createPropSymbols(data, map, rawAttributes){
	console.log(attributes);
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
        	return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

//Like createPropSymbols- create raw proportional symbols here
// function createRawPropSymbols(data, map, attributes) {
	    // L.geoJson(data, {
        // pointToLayer: function(feature, latlng){
        	// return pointToLayer(feature, latlng, attributes);
        // }
    // }).addTo(map);
// };

			

function updatePropSymbols(map, attribute){
	console.log("THIS IS" + IndexCounter)
    map.eachLayer(function(layer){
      //Example 3.16 line 4
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;
			console.log("this is!" + IndexCounter)
            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);
			if(IndexCounter > 0) {
				console.log("COUNTTER");
			}
            //add city to popup content string
          createPopup(props, attribute, layer, radius, rawAttribute);
          
        };
	});
	updateLegend(map, attribute);
};

//Mirror the updatePropSymbols function with one that takes rawAttributes for basis for proportional symbols.  Again- probably unnecessary[just give the updatePropSymbols a new parameter?]
// function updateRawPropSymbols(map, rawAttribute){
    // map.eachLayer(function(layer){
      // //Example 3.16 line 4
        // if (layer.feature && layer.feature.properties[rawAttribute]){
            // //access feature properties
            // var props = layer.feature.properties;
// 
            // //update each feature's radius based on new attribute values
            // var radius = calcPropRadius(props[rawAttribute]);
            // layer.setRadius(radius);
// 
            // //add city to popup content string
            // var popupContent = "<p><b>City:</b> " + props.City + "</p>";
// 
            // //add formatted attribute to panel content string
            // var year = rawAttribute.split("_")[1];
            // popupContent += "<p><b>Population in " + year + ":</b> " + props[rawAttribute] + " million</p>";
// 
            // //replace the layer popup
            // layer.bindPopup(popupContent, {
                // offset: new L.Point(0,-radius)
            // });
        // };
	// });
// };

function createSequenceControls(map, attributes){
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
    console.log("working")
    $('.range-slider').attr({
        max: 6,
        min: 0,
        value: 0,
        step: 1
    });
    
    var dataArray = [attributes, rawAttributes];
    
    $('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    $('#panel').append('<button class="skip" id="forward">Skip</button>');
    //$('#reverse').html('<img src="img/backward.png">');
    //$('#forward').html('<img src="img/forward.png">');
    
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

        //Step 8: update slider
        $('.range-slider').val(index);
        
         //Step 9: pass new attribute to update symbols
        updatePropSymbols(map, attributes[index]);
        
    });

    //Step 5: input listener for slider
    $('.range-slider').on('input', function(){
        //Step 6: get the new index value
        var index = $(this).val();
        
         //Step 9: pass new attribute to update symbols
        updatePropSymbols(map, attributes[index]);
        
    });
    
       //wait for a change in the dropdown attribute menu
	$('#selector').change(function() {
		$('.range-slider').val(0); //set the slider value back to 0

		//update the attribute index
		IndexCounter++; 
		IndexCounter = IndexCounter > 1 ? 0 : IndexCounter;
		console.log(IndexCounter)
		
		
		//update the proportional symbols at year 2008 with the correct attribute
		updatePropSymbols(map, dataArray[IndexCounter][0], dataArray[0][0]);
		return IndexCounter;
	});
  
};
console.log("this is the" + IndexCounter)
//Create new sequence controls

// function createSequenceControls(map, attributes){  
	// console.log(attributes) 
    // var SequenceControl = L.Control.extend({
        // options: {
            // position: 'bottomleft'
        // },
// 
       // onAdd: function(map){
            // // create the control container with a particular class name
            // var container = L.DomUtil.create('div', 'sequence-control-container');
// 
            // //create range input element (slider)
            // $(container).append('<input class="range-slider" type="range">');
// 
//       
	        // //add skip buttons
            // $(container).append('<button class="skip" id="reverse" title="Reverse">Reverse</button>');
            // $(container).append('<button class="skip" id="forward" title="Forward">Skip</button>');
// 	
			// //kill any mouse event listeners on the map
            // $(container).on('mousedown dblclick', function(e){
                // L.DomEvent.stopPropagation(e);
            // });
// 
// 			
            // return container;
        // }
    // });
// 
 // map.addControl(new SequenceControl());
// 
 // $('.range-slider').attr({
   // max: 6,
   // min: 0,
   // value: 0,
   // step: 1
 // });
// 		
// $('.skip').click(function(){
    // var index = $('.range-slider').val();
    // if($(this).attr('id')=='forward'){
      // index++;
      // index = index > 6 ? 0 : index;
    // } else if ($(this).attr('id') == 'reverse'){
      // index--;
      // index = index < 0 ? 6 : index;
    // };
// 
  // $('.range-slider').val(index);
 // updatePropSymbols(map, attributes[index]);
  // console.log(attributes[index]);
// });
// 
  // $('.range-slider').on('input', function(){
    // var index = $(this).val();
  // updatePropSymbols(map, attributes[index]);
  // });
// };
    		
//Haven't worked this out yet- [probably not correct way to do this] but added another range slider for the raw data- will want to merge it with existing slider..	
function createRawSequenceControls(map, rawAttributes){
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
    console.log("working")
    $('.range-slider').attr({
        max: 6,
        min: 0,
        value: 0,
        step: 1
    });
    $('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    $('#panel').append('<button class="skip" id="forward">Skip</button>');
    $('#reverse').html('<img src="img/backward.png">');
    $('#forward').html('<img src="img/forward.png">');
    
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

        //Step 8: update slider
        $('.range-slider').val(index);
        
         //Step 9: pass new attribute to update symbols
        updateRawPropSymbols(map, rawAttributes[index]);
        
    });
   

    //Step 5: input listener for slider
    $('.range-slider').on('input', function(){
        //Step 6: get the new index value
        var index = $(this).val();
        
         //Step 9: pass new attribute to update symbols
        updateRawPropSymbols(map, rawAttributes[index]);
        
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

    //check result
    console.log("these are the attributes")
    console.log(attributes);

    return attributes;
};

//This function will put the raw data into an array (same process as normalized data above)
function processRawData(data){
	console.log("Raw data")
    //empty array to hold attributes
    var rawAttributes = [];
	console.log(rawAttributes)
    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var rawAttribute in properties){
        //only take attributes with population values
        if (rawAttribute.indexOf("Raw") > -1){
            rawAttributes.push(rawAttribute);
            console.log(rawAttributes)
            console.log(rawAttribute)
            //return rawAttribute
        };
    };

    //check result
    console.log("these are the attributes")
    console.log(rawAttributes);

    return rawAttributes;
    
};
	
//Step 2: Import GeoJSON data
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
            //createPropSymbols(response, map, attributes);
            //createRawSymbols
            createSequenceControls(map, attributes);
            //createRawSequenceControls(map, rawAttributes);
            console.log("sequence working");
            createLegend(map, attributes);
            
            //This is my fifth operator- though it doesn't work right yet.  I can't get the layer to toggle, it overlays the function over and over.
            (function(){
            $("#Normalized").click(function(){
            	 normalize = true
            	if (normalize = true) {
            	createPropSymbols(response, map, attributes);
            	
            	}
            });
            
            $("#Raw").click(function(){
            	normalize = false
            	raw = true
            	if (raw = true) {
            	createPropSymbols(response, map, rawAttributes);
            	}
            });
            })();
            return response
        }
		
	});
};

function getCircleValues(map, attribute){
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
        max = -Infinity;

    map.eachLayer(function(layer){
        //get the attribute value
        if (layer.feature){
            var attributeValue = Number(layer.feature.properties[attribute]);

            //test for min
            if (attributeValue < min){
                min = attributeValue;
            };

            //test for max
            if (attributeValue > max){
                max = attributeValue;
            };
        };
    });

    //set mean
    var mean = (max + min) / 2;

    //return values as an object
    return {
        max: max,
        mean: mean,
        min: min
    };
};

//Example 2.7 line 1...function to create the legend
function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">')

            //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="250px" height="200px">';
            
            //array of circle names to base loop on
        	var circles = {
				max: 42.2,
				mean: 16.18,
				min: 2.7
			};

        	//Step 2: loop to add each circle and text to svg string
        	for (var i=0; i<circles.length; i++){
            //circle string
            svg += '<circle class="legend-circle" id="' + circles[i] + 
            '" fill="#F47821" fill-opacity="0.8" stroke="#000000" cx="90"/>';
            
             //text string
            svg += '<text id="' + circles[i] + '-text" x="65" y="60"></text>';
        	};

        	//close svg string
        	svg += "</svg>";


            //add attribute legend svg to container
            $(container).append(svg);

            return container;
        }
    });

    map.addControl(new LegendControl());

    updateLegend(map, attributes[0]);
};

//Update the legend with new attribute
function updateLegend(map, attribute){
    //create content for legend
    var year = attribute.split("_")[1];
    var content = "Homicides in " + year;

    //replace legend content
    $('#temporal-legend').html(content);
    
    //get the max, mean, and min values as an object
    var circleValues = getCircleValues(map, attribute);
    
    for (var key in circleValues){
        //get the radius
    	var radius = calcPropRadius(circleValues[key]);

        //Step 3: assign the cy and r attributes
        $('#'+key).attr({
            cy: 179 - radius,
            r: radius
        });
    };
};



//This is my fifth operator- attempting to resymbolize by calling updatePropSymbols based on raw/normalized data.
	//console.log("this is the normal function hear me roar")
        //when clicked, call function:
       //$("#Normalized").click(function(){
       		//console.log("this is the normalized function")
       		//console.log(attributes)
            //normalize = true
            //if (normalize = true) {
            	//want to turn off Raw symbols when "normalized" button clicked
            	// if (map.hasLayer(updateRawPropSymbols)){
            		// console.log("map has rawPropSymbol layer")
                	// map.removeLayer(updateRawPropSymbols);
            	//} 
            	//also want to call the function which wil update proportional symbols based on normalized attributes
            	//updatePropSymbols(map, attribute);
            	//console.log(attributes);
            //}
         //});
// 
 //$("#Raw").click(function(){
       		//normalize = false
       		//if (normalize = false){
       			//console.log("this is the raw function")
       			// if (map.hasLayer(layer)){
                	// map.removeLayer(layer);
            	//} 
            	//Upon clicking "Raw" button, the same function is called as above, except this time with raw attributes being passed in
       			//updatePropSymbols(map, rawAttribute);
       			//console.log(rawAttributes)
       		//}
     //});
     //end createMinMax
// 
//createNormalizedRaw(pointToLayer, )
console.log("im normal")

//way at the bottom- we call the create map function once the doc has loaded.

$(document).ready(createMap);


//This is my plan to implement the fifth operator:
//create a layer based on raw proportional symbols
//assign new proportional symbol size based on different attribute
//sequence based on year
//popups- keep raw/normalized for both.
//toggle layers on and off


