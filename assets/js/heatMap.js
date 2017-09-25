/**var selectedTractIndex = -1;
var currentSelectedCoords = [];
var width = 0.9*$('#heatMapContainer').width();
var height = 0.8*width;
var canvas = d3.select("#heatmap")
	    .append("svg")
	    .attr("width", width)
	    .attr("height", height);

var ellipseLayer = canvas.append("g");
var displayHeatMap = function() {

	d3.select("svg").remove();
	width = 0.9*$('#heatMapContainer').width();
	//var width = $('.content').width();
	height = 0.8*width;
	var active = d3.select(null);
	var projection = d3.geoAlbersUsa().scale(5000).translate([width / 8, height / 2.5]);
	var polygonPath = d3.geoPath(projection);
	var scale = 1.8;
	var simplifyTolerace = 0.0008;
	var mapdata = [];
	var offenderPts = [];
	var schoolPts = []

	canvas = d3.select("#heatmap")
	    .append("svg")
	    .attr("width", width)
	    .attr("height", height);

	var g = canvas.append("g");
	ellipseLayer = canvas.append("g");
	var offenderLayer = canvas.append("g");
	var schoolLayer = canvas.append("g");
	var firstTime = true;
	var zoom = d3.zoom().scaleExtent([1.8,80])
	.translateExtent([[0.0, 0.0], [2.0*width, 1.2*height]])
	.on("zoom",zoomed);

	
	reset();
	canvas.call(zoom);

	function clicked(d, index) {
		if (active.node() === this) return reset();
		active.classed("active", false);
		active = d3.select(this).classed("active", true);
		var coords = d.geometry.coordinates[0];
		currentSelectedCoords = coords;

		var minX = 10000, maxX = -10000, minY = 10000, maxY = -10000;
		for(var i = 0; i < coords.length; i++) {
			var currentCoord = projection(coords[i]);
			if(currentCoord[0] < minX) {
				minX = currentCoord[0];
			}
			if(currentCoord[0] > maxX) {
				maxX = currentCoord[0];
			}

			if(currentCoord[1] < minY) {
				minY = currentCoord[1]; 
			}
			if(currentCoord[1] > maxY) {
				maxY = currentCoord[1];
			}
		}
	    
	    var dx = maxX - minX;
	    var dy = maxY - minY;
	    var x = (maxX + minX) / 2.0;
	    var y = (maxY + minY) / 2.0;
	    scale = Math.max(1, Math.min(30, 0.9 / Math.max(dx / width, dy / height)));
	    var translate = [width / 2 - scale * x, height / 2 - scale * y];
	    canvas.transition()
			.duration(750)
			.call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale) );
		selectedTractIndex = index;
	}

	//% pop receiving food stamps or other public assistance
	var publicRates = new Array();
	var publicRateMin = 10000;
	var publicRateMax = -10000;
	var readPublic = function() {

		d3.csv("assets/data/tractPublicAssistance.csv", function(data){
			publicRates = []
			for(var i = 0; i < data.length; i++) {
				var rate = parseFloat(data[i].assistance);
				publicRates.push(rate);
				if(rate > publicRateMax) {
					publicRateMax = rate;
				}
				if(rate < publicRateMin) {
					publicRateMin = rate;
				}
			}

		});
	};
	readPublic();

	//median income
	var medianIncomes = new Array();
	var incomeMin = 10000000;
	var incomeMax = -10000000;
	var readIncome = function() {
		d3.csv("assets/data/tractMedianIncome.csv", function(data){
			medianIncomes = []
			for(var i = 0; i < data.length; i++) {
				if(data[i].income == "null") {
					medianIncomes.push("null");
				}
				else {
					var rate = parseInt(data[i].income)
					medianIncomes.push(rate);
					if(rate > incomeMax) {
						incomeMax = rate;
					}
					if(rate < incomeMin) {
						incomeMin = rate;
					}
				}
			}
		});
	};
	readIncome();

	//% without health insurance
	var healthRates = []
	var healthRateMin = 10000;
	var healthRateMax = -10000;
	var readHealth = function() {
	    d3.csv("assets/data/tractNoHealthInsurance.csv", function(data){
			healthRates = new Array();
			for(var i = 0; i < data.length; i++) {
			    var rate = parseFloat(data[i].healthrate);
			    healthRates.push(rate);
			    if(rate > healthRateMax) {
				healthRateMax = rate;
			    }
			    if(rate < healthRateMin) {
				healthRateMin = rate;
			    }

			}
		});
	};
	readHealth();

	//% below poverty line
	var povertyRates= []
	var povertyMin = 10000;
	var povertyMax = -10000;
	var readPoverty = function() {
	    d3.csv("assets/data/tractPovertyRatio.csv", function(data){
			povertyRates = new Array();
			for(var i = 0; i < data.length; i++) {
			    var rate = parseFloat(data[i].povertyrate);
			    povertyRates.push(rate);
			    if(rate > povertyMax) {
				povertyMax = rate;
			    }
			    if(rate < povertyMin) {
				povertyMin = rate;
			    }

			}
		});
	};
	readPoverty();

	//offender population density
	var offenderDensities = []
	var offenderRateMin = 10000;
	var offenderRateMax = -10000;
	var readOffenderDensities = function() {
	    d3.csv("assets/data/tractOffenderDensity1.csv", function(data){
			offenderDensities = new Array();
			for(var i = 0; i < data.length; i++) {
			    var rate = parseFloat(data[i].offenderDensity);
			    offenderDensities.push(rate);
			    if(rate > offenderRateMax) {
				offenderRateMax = rate;
			    }
			    if(rate < offenderRateMin) {
				offenderRateMin = rate;
			    }

			}
		});
	};
	readOffenderDensities();

	//% female-headed households
	var fhhs = []
	var fhhMin = 10000;
	var fhhMax = -10000;
	var readFHHs = function() {
	    d3.csv("assets/data/tractFHH.csv", function(data){
			fhhs = new Array();
			for(var i = 0; i < data.length; i++) {
			    var rate = parseFloat(data[i].fhh);
			    fhhs.push(rate);
			    if(rate > fhhMax) {
				fhhMax = rate;
			    }
			    if(rate < fhhMin) {
				fhhMin = rate;
			    }

			}
		});
	};
	readFHHs();

	//% household size > 4
	var hhSizes = []
	var hhSizeMin = 10000;
	var hhSizeMax = -10000;
	var readHHSizes = function() {
	    d3.csv("assets/data/tractHHSize.csv", function(data){
			hhSizes = new Array();
			for(var i = 0; i < data.length; i++) {
			    var rate = parseFloat(data[i].sizeGreaterThan5);
			    hhSizes.push(rate);
			    if(rate > hhSizeMax) {
				hhSizeMax = rate;
			    }
			    if(rate < hhSizeMin) {
				hhSizeMin = rate;
			    }

			}
		});
	};
	readHHSizes();

	//% Under 18
	var under18s = []
	var u18Min = 10000;
	var u18Max = -10000;
	var readUnder18 = function() {
	    d3.csv("assets/data/tractUnder18.csv", function(data){
			under18s = new Array();
			for(var i = 0; i < data.length; i++) {
			    var rate = parseFloat(data[i].percentUnder18);
			    under18s.push(rate);
			    if(rate > u18Max) {
				u18Max = rate;
			    }
			    if(rate < u18Min) {
				u18Min = rate;
			    }

			}
		});
	};
	readUnder18();

	var visualizedTraitList = []
	var visMin = 10000;
	var visMax = -10000;

	//% with bachelor's degree
	var educationRates = []
	var educationRateMin = 10000;
	var educationRateMax = -10000;
	var readEducation = function() {
		d3.csv("assets/data/tractEducation.csv", function(data){
			educationRates = new Array();
			for(var i = 0; i < data.length; i++) {
				var rate = parseFloat(data[i].percentBachelor);
				educationRates.push(rate);
				if(rate > educationRateMax) {
					educationRateMax = rate;
				}
				if(rate < educationRateMin) {
					educationRateMin = rate;
				}

			}
			visMin = educationRateMin;
			visMax = educationRateMax;
			visualizedTraitList = educationRates;
		});
	};
	readEducation();



	d3.json("assets/data/mo.json", function(error, data) {
		if (error) throw error;
		var newdata = [];
		var i = 0;
		data.features.forEach(function(d) {
			var points = d.geometry.coordinates[0];
			newpoints = simplify(points,simplifyTolerace,false);
		i+=1;
		d.geometry.coordinates[0] = newpoints;
	});
		mapdata = data;
		if(firstTime) {
			drawMap();
		//saveFile ("new", "json", newdata)
	}
	});

	d3.csv("assets/data/sexOffenders.csv", function(data) {
		for(var i = 0; i < data.length; i++) {
			var longitude = parseFloat(data[i].longitude);
			var lat = parseFloat(data[i].latitude);
			var coord = [longitude, lat];
			if(coord[1] < 40.559 && coord[0] > -95.8
				&& coord[1] > 35.7 && coord[0] < -88.9
				) {
				var projectedCoords = projection(coord);
			offenderPts.push([projectedCoords[0],projectedCoords[1],i]);
		}
	}

	    offenderLayer.append("g").selectAll("rect")
			.data(offenderPts)
			.enter()
			.append("rect")
			.attr("id",function(d) { return "offender_"+d[2] })
			.attr("x", function(d) { return d[0]})
			.attr("y", function(d) { return d[1]})
			.attr("width", "0.05")
			.attr("height", "0.05")
			.attr("fill", "orange")
			.attr("data-tog","0")
			.on("click", function(d) { return drawEllipseAroundOffender(this, 1000, d[2])});
	});

	d3.csv("assets/data/publicschools.csv", function(data) {
		for(var i = 0; i < data.length; i++) {
			var longitude = parseFloat(data[i].longitude);
			var lat = parseFloat(data[i].latitude);
			var coord = [longitude, lat];
			if(coord[1] < 40.559 && coord[0] > -95.8
				&& coord[1] > 35.7 && coord[0] < -88.9
				) {
				var projectedCoords = projection(coord);
			schoolPts.push([projectedCoords[0],projectedCoords[1],i]);
		}
	}

	    schoolLayer.append("g").selectAll("rect")
			.data(schoolPts)
			.enter()
			.append("rect")
			.attr("id",function(d) { return "school_"+d[2] })
			.attr("x", function(d) { return d[0]})
			.attr("y", function(d) { return d[1]})
			.attr("width", "0.05")
			.attr("height", "0.05")
			.attr("fill", "blue")
			.attr("data-tog","0")
			.on("click", function(d) { return drawEllipseAroundSchool(this, 1000, d[2])});
	    
	});

	d3.csv("assets/data/privateschools.csv", function(data) {
		for(var i = 0; i < data.length; i++) {
			var longitude = parseFloat(data[i].longitude);
			var lat = parseFloat(data[i].latitude);
			var coord = [longitude, lat];
			if(coord[1] < 40.559 && coord[0] > -95.8
				&& coord[1] > 35.7 && coord[0] < -88.9
				) {
				var projectedCoords = projection(coord);
			schoolPts.push([projectedCoords[0],projectedCoords[1],i]);
		}
	}

	    schoolLayer.append("g").selectAll("rect")
			.data(schoolPts)
			.enter()
			.append("rect")
			.attr("id",function(d) { return "school_"+d[2] })
			.attr("x", function(d) { return d[0]})
			.attr("y", function(d) { return d[1]})
			.attr("width", "0.05")
			.attr("height", "0.05")
			.attr("fill", "blue")
			.attr("data-tog","0")
			.on("click", function(d) { return drawEllipseAroundSchool(this, circleRadiusValue, d[2])});
	    
	});

	d3.csv("assets/data/childcarefacilities.csv", function(data) {
		for(var i = 0; i < data.length; i++) {
			var longitude = parseFloat(data[i].longitude);
			var lat = parseFloat(data[i].latitude);
			var coord = [longitude, lat];
			if(coord[1] < 40.559 && coord[0] > -95.8
				&& coord[1] > 35.7 && coord[0] < -88.9
				) {
				var projectedCoords = projection(coord);
			schoolPts.push([projectedCoords[0],projectedCoords[1],i]);
		}
	}

	    schoolLayer.append("g").selectAll("rect")
			.data(schoolPts)
			.enter()
			.append("rect")
			.attr("id",function(d) { return "school_"+d[2] })
			.attr("x", function(d) { return d[0]})
			.attr("y", function(d) { return d[1]})
			.attr("width", "0.05")
			.attr("height", "0.05")
			.attr("fill", "blue")
			.attr("data-tog","0")
			.on("click", function(d) { return drawEllipseAroundSchool(this, circleRadiusValue, d[2])});
	    
	});

	var drawMap = function(){
	    var colorScale = d3.scaleLinear().domain([visMin,visMax]).range(["#ffc1c1","#a30000"]);    
	    g.selectAll("path")
		.data(mapdata.features)
		.enter().append("path")
		.attr("fill", function(d,i) {
			//console.log(d.properties.INTPTLAT10.substring(1),d.properties.INTPTLON10.substring(2));
			if(visualizedTraitList[i] == "null") {
				return "white";
			}
			else {
				return colorScale(visualizedTraitList[i]);
			}
		})
		.attr("d", polygonPath)
		.attr("class", "feature")
		.style("stroke", "#fff")
		.style("stroke-width", 0.03)
		.on("click", clicked)
		.transition()
		.call(zoom.transform, initialTransform);

		readOffenderDensities();
		var colorScaleBlue = d3.scaleLinear().domain([offenderRateMin,offenderRateMax]).range(["#ffffff","#191970"]);

		g.selectAll("rect")
		.data(mapdata.features)
		.enter().append("rect")
		.classed("offenderRect", true)
		.attr("fill", function(d,i) {
			return colorScaleBlue(offenderDensities[i]);
		})
		.attr("x", function(d,i) {
			return projection([-parseFloat(d.properties.INTPTLON10.substring(2)),parseFloat(d.properties.INTPTLAT10.substring(1))])[0];
		})
		.attr("y", function(d,i) {
			return projection([-parseFloat(d.properties.INTPTLON10.substring(2)),parseFloat(d.properties.INTPTLAT10.substring(1))])[1];
		})
		.attr("width", 0.2)
		.attr("height", 0.2)
		.on("click", clicked)
		.transition()
		.call(zoom.transform, initialTransform);

	};

	var updateData = function() {
		var colorScale = d3.scaleLinear().domain([visMin,visMax]).range(["#ffc1c1","#a30000"]);
		$(".feature").attr("fill", function(d,i) {
			if(visualizedTraitList[d] == "null") {
				return "white";
			}
			else {
				return colorScale(visualizedTraitList[d]);
			}
		})
	}


	function drawEllipseAroundOffender(elem, feetDistance, idx) {
		var projectedCoordsX = $(elem).attr("x");
		var projectedCoordsY = $(elem).attr("y");
		var toggle = $(elem).attr("data-tog");
		if (toggle == "0"){
			var degreeDist = (circleRadiusValue / 1000) * 5000*d3.geoDistance([-90.189132,38.786635],[-90.208432,38.785164]) / 5.511811;
			ellipseLayer.append("ellipse")
			.attr('id','ellipse_'+idx)
			.attr("cx", projectedCoordsX)
			.attr("cy", projectedCoordsY)
			.attr("rx", degreeDist)
			.attr("ry", degreeDist)
			.attr("fill", "green")
			.attr("opacity", 0.5);
			$(elem).attr("data-tog", "1");
		}
		else{
			console.log("remove");
			$('#ellipse_'+idx).remove();
			$(elem).attr("data-tog", "0");
		}
	}

	function drawEllipseAroundSchool(elem, feetDistance, idx) {
		var projectedCoordsX = $(elem).attr("x");
		var projectedCoordsY = $(elem).attr("y");
		var toggle = $(elem).attr("data-tog");
		if (toggle == "0"){
			var degreeDist = (circleRadiusValue / 1000) * 5000*d3.geoDistance([-90.189132,38.786635],[-90.208432,38.785164]) / 5.511811;
			ellipseLayer.append("ellipse")
				.attr('id','ellipse_'+idx)
				.attr("cx", projectedCoordsX)
				.attr("cy", projectedCoordsY)
				.attr("rx", degreeDist)
				.attr("ry", degreeDist)
				.attr("fill", "green")
				.attr("opacity", 0.5);
			$(elem).attr("data-tog", "1");
		}
		else{
			console.log("remove");
			$('#ellipse_'+idx).remove();
			$(elem).attr("data-tog", "0");
		}
	}

	$("#bdegree").on("click",function() {
		if ($(this).attr("data-tog") == "0"){
			readEducation();
			visMin = educationRateMin;
			visMax = educationRateMax;
			visualizedTraitList = educationRates;
			updateData();
			$(this).attr("data-tog", "1")
			$(this).attr("style", 'background-color:#e0e2e5' );
			$(this).siblings().attr("style", 'background-color:#fff' );
			$(this).siblings().attr("data-tog", "0");
		}
	});

	$("#fstamps").on("click", function() {
		if ($(this).attr("data-tog") == "0"){
			readPublic();
			visMin = publicRateMin;
			visMax = publicRateMax;
			visualizedTraitList = publicRates;
			updateData();
			$(this).attr("data-tog", "1")
			$(this).attr("style", 'background-color:#e0e2e5' );
			$(this).siblings().attr("style", 'background-color:#fff' );
			$(this).siblings().attr("data-tog", "0");
		}
	});
	    

	$("#medIncome").on("click", function() {
		if ($(this).attr("data-tog") == "0"){
			readIncome();
			visMin = incomeMin;
			visMax = incomeMax;
			visualizedTraitList = medianIncomes;
			updateData();
			$(this).attr("data-tog", "1")
			$(this).attr("style", 'background-color:#e0e2e5' );
			$(this).siblings().attr("style", 'background-color:#fff' );
			$(this).siblings().attr("data-tog", "0");
		}
	});

	$("#healthRate").on("click", function() {
	    if ($(this).attr("data-tog") == "0"){
		readHealth();
		visMin = healthRateMin;
		visMax = healthRateMax;
		visualizedTraitList = healthRates;
		updateData();
		$(this).attr("data-tog", "1")
		$(this).attr("style", 'background-color:#e0e2e5' );
		$(this).siblings().attr("style", 'background-color:#fff' );
		$(this).siblings().attr("data-tog", "0");
	    }
	});

	$("#povertyRate").on("click", function() {
	    if ($(this).attr("data-tog") == "0"){
		readPoverty();
		visMin = povertyMin;
		visMax = povertyMax;
		visualizedTraitList = povertyRates;
		updateData();
		$(this).attr("data-tog", "1")
		$(this).attr("style", 'background-color:#e0e2e5' );
		$(this).siblings().attr("style", 'background-color:#fff' );
		$(this).siblings().attr("data-tog", "0");
	    }
	});

	$("#fhhRate").on("click", function() {
	    if ($(this).attr("data-tog") == "0"){
		readPoverty();
		visMin = fhhMin;
		visMax = fhhMax;
		visualizedTraitList = fhhs;
		updateData();
		$(this).attr("data-tog", "1")
		$(this).attr("style", 'background-color:#e0e2e5' );
		$(this).siblings().attr("style", 'background-color:#fff' );
		$(this).siblings().attr("data-tog", "0");
	    }
	});

	$("#hhSize").on("click", function() {
	    if ($(this).attr("data-tog") == "0"){
		readHHSizes();
		visMin = hhSizeMin;
		visMax = hhSizeMax;
		visualizedTraitList = hhSizes;
		updateData();
		$(this).attr("data-tog", "1")
		$(this).attr("style", 'background-color:#e0e2e5' );
		$(this).siblings().attr("style", 'background-color:#fff' );
		$(this).siblings().attr("data-tog", "0");
	    }
	});

	$("#under18Rate").on("click", function() {
	    if ($(this).attr("data-tog") == "0"){
		readUnder18();
		visMin = u18Min;
		visMax = u18Max;
		visualizedTraitList = under18s;
		updateData();
		$(this).attr("data-tog", "1")
		$(this).attr("style", 'background-color:#e0e2e5' );
		$(this).siblings().attr("style", 'background-color:#fff' );
		$(this).siblings().attr("data-tog", "0");
	    }
	});

	$("#offenderDensity").on("click", function() {
	    if ($(this).attr("data-tog") == "0"){
		readOffenderDensities();
		visMin = offenderRateMin;
		visMax = offenderRateMax;
		visualizedTraitList = offenderDensities;
		updateData();
		$(this).attr("data-tog", "1")
		$(this).attr("style", 'background-color:#e0e2e5' );
		$(this).siblings().attr("style", 'background-color:#fff' );
		$(this).siblings().attr("data-tog", "0");
	    }
	});
				
	function zoomed() {


	    g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
	    g.attr("transform", d3.event.transform);
	    offenderLayer.style("stroke-width", 1.5 / d3.event.transform.k + "px");
	    offenderLayer.attr("transform", d3.event.transform);
	    schoolLayer.style("stroke-width", 1.5 / d3.event.transform.k + "px");
	    schoolLayer.attr("transform", d3.event.transform);
	    ellipseLayer.style("stroke-width", 1.5 / d3.event.transform.k + "px");
	    ellipseLayer.attr("transform", d3.event.transform);

	};


	function stopped() {
	    if (d3.event.defaultPrevented) d3.event.stopPropagation();
	};

	var initialTransform = d3.zoomIdentity
	    .translate(-width/4,-height/4)
	    .scale(1.8);

	function reset() {
		
		
		active.classed("active", false);
	    active = d3.select(null);

	};

};

 $('#radiusSlider').mousemove(function (){
          document.getElementById("circleRadius").innerHTML=this.value*(1000/40);
          circleRadiusValue = document.getElementById("circleRadius").innerHTML;
          redrawCircles();
      });

var redrawCircles = function() {
	var degreeDist = (circleRadiusValue / 1000) * 5000*d3.geoDistance([-90.189132,38.786635],[-90.208432,38.785164]) / 5.511811;
	d3.selectAll("ellipse").attr("rx", degreeDist).attr("ry", degreeDist);
	
};

$('#showOffenderDensity').click(function (){
      if(d3.select("#showOffenderDensity").property("checked")) {
      	d3.selectAll(".offenderRect").attr("opacity", 1.0);
      	
      }
      else {
      	d3.selectAll(".offenderRect").attr("opacity", 0.0);
      }
});

displayHeatMap();
**/


