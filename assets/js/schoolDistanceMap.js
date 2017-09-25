var schoolDistCanvasWidth = Math.max(272,$('#schoolDistanceMap').width());
var schoolDistCanvasHeight = Math.max(136,0.5*$('#schoolDistanceMap').width());
var marginX = 0.1*schoolDistCanvasWidth;
var marginY = 0.1*schoolDistCanvasHeight;
var selectedPolygon = -1;

var schoolDistanceCanvas = d3.select("#schoolDistanceMap")
	    .append("svg")
	    .attr("width", schoolDistCanvasWidth)
	    .attr("height", schoolDistCanvasHeight);


//Credit to Eartz: https://gist.github.com/Eartz/82cb776ce98e81fbc713
var getPolygonBounds = function(polygon) {
	var paths = polygon.getPaths();
	var bounds = new google.maps.LatLngBounds();
	paths.forEach(function(path) {
		var ar = path.getArray();
		for(var i = 0, l = ar.length;i < l; i++) {
			bounds.extend(ar[i]);
		}
	});
	return bounds;
}

var findSchoolOffenderDistances = function(polygon) {
	var tractBounds = getPolygonBounds(polygon);
        selectedPolygon = polygon;
	var tractSchools = new Array();
	var tractOffenders = new Array();
	for(var i = 0; i < schoolsInZoom.length; i++) {
		if(tractBounds.contains(schoolsInZoom[i])) {
			tractSchools.push(schoolsInZoom[i]);
		}
	    
	}
	/**bar ranges: 0-1000 feet, 1000-2000 feet, 2000-4000 feet, 4000-10000 feet, > 10000 feet **/
	var lt1000 = new Array();
	var gt1000lt2000 = new Array();
	var gt2000lt4000 = new Array();
	var gt4000lt10000 = new Array();
	var gt10000 = new Array();
	var maxLen = 0;
	for(var i = 0; i < tractSchools.length; i++) {
		var minDist = 1000000.0;
		for(var j = 0; j < offendersInZoom.length; j++) {
			var currentDist = 3.28084 * google.maps.geometry.spherical.computeDistanceBetween(tractSchools[i], offendersInZoom[j]);
			if(currentDist < minDist) {
				minDist = currentDist;
			}
		}
		if(minDist <= 1000) {
			lt1000.push(minDist);
			if(lt1000.length > maxLen) {
				maxLen = lt1000.length;
			}
		}
		else {
			if(minDist <= 2000) {
				gt1000lt2000.push(minDist);
				if(gt1000lt2000.length > maxLen) {
					maxLen = gt1000lt2000.length;
				}
			}
			else {
				if(minDist <= 4000) {
					gt2000lt4000.push(minDist);
					if(gt2000lt4000.length > maxLen) {
						maxLen = gt2000lt4000.length;
					}
				}
				else {
					if(minDist <= 10000) {
						gt4000lt10000.push(minDist);
						if(gt4000lt10000.length > maxLen) {
							maxLen = gt4000lt10000.length;
						}
					}
					else {
						gt10000.push(minDist);
						if(gt10000.length > maxLen) {
							maxLen = gt10000.length;
						}
					}
				}
			}
		}
	}
	
	var s = d3.selectAll('svg');
	s = s.remove();
	schoolDistCanvasWidth = Math.max(272,$('#schoolDistanceMap').width());
	schoolDistCanvasHeight = Math.max(136,0.5*$('#schoolDistanceMap').width());

	marginX = 0.15*schoolDistCanvasWidth;
	marginY = 0.1*schoolDistCanvasHeight;
	var graphHeight = 0.8 * schoolDistCanvasHeight;
	var graphWidth = 0.8 * schoolDistCanvasWidth;
	var y = d3.scaleLinear().domain([0,(1.0/0.9)*maxLen]).range([schoolDistCanvasHeight-(0.9*marginY), 0])
	schoolDistanceCanvas = d3.select("#schoolDistanceMap")
	    .append("svg")
	    .attr("width", schoolDistCanvasWidth)
	    .attr("height", schoolDistCanvasHeight);
	schoolDistanceCanvas.append("g")
	.attr("transform", "translate(" + 0.5*marginX + ", 0)")
    .call(d3.axisLeft(y));
	schoolDistanceCanvas.append("rect")
			.attr("x", marginX)
			.attr("y", marginY + (graphHeight - (lt1000.length / maxLen) * graphHeight))
			.attr("width", graphWidth / 20.0)
			.attr("height", (lt1000.length / maxLen) * graphHeight);
	schoolDistanceCanvas.append("text")
			.attr("x", 0.65*marginX)
			.attr("y", marginY + graphHeight + (0.8*marginY))
			.text("<1000");

	schoolDistanceCanvas.append("rect")
			.attr("x", marginX+(2.5*graphWidth / 10.0))
			.attr("y", marginY + (graphHeight - (gt1000lt2000.length / maxLen) * graphHeight))
			.attr("width", graphWidth / 20.0)
			.attr("height",(gt1000lt2000.length / maxLen) * graphHeight);
	schoolDistanceCanvas.append("text")
			.attr("x", marginX+(2.5*graphWidth / 10.0)-(0.75*marginX))
			.attr("y", marginY + graphHeight + (0.8*marginY))
			.text("1000-2000");

	schoolDistanceCanvas.append("rect")
			.attr("x", marginX+(5*graphWidth / 10.0))
			.attr("y", marginY + (graphHeight - (gt2000lt4000.length / maxLen) * graphHeight))
			.attr("width", graphWidth / 20.0)
			.attr("height", (gt2000lt4000.length / maxLen) * graphHeight);
	schoolDistanceCanvas.append("text")
			.attr("x", marginX+(5*graphWidth / 10.0)-(0.75*marginX))
			.attr("y", marginY + graphHeight + (0.8*marginY))
			.text("2000-4000");

	schoolDistanceCanvas.append("rect")
			.attr("x", marginX+(7.5*graphWidth / 10.0))
			.attr("y", marginY + (graphHeight - (gt4000lt10000.length / maxLen) * graphHeight))
			.attr("width", graphWidth / 20.0)
			.attr("height", (gt4000lt10000.length / maxLen) * graphHeight);
	schoolDistanceCanvas.append("text")
			.attr("x", marginX+(7.5*graphWidth / 10.0)-(0.75*marginX))
			.attr("y", marginY + graphHeight + (0.8*marginY))
			.text("4000-10K");

	schoolDistanceCanvas.append("rect")
			.attr("x", marginX+(10*graphWidth / 10.0))
			.attr("y", marginY + (graphHeight - (gt10000.length / maxLen) * graphHeight))
			.attr("width", graphWidth / 20.0)
			.attr("height", (gt10000.length / maxLen) * graphHeight);
	schoolDistanceCanvas.append("text")
			.attr("x", marginX+(10*graphWidth / 10.0)-(0.75*marginX))
			.attr("y", marginY + graphHeight + (0.8*marginY))
			.text(">10K feet");

	gradientCanvas = d3.select("#demographicGradient")
	    .append("svg")
	    .attr("width", 120)
	    .attr("height", 20);

	gradient = gradientCanvas.append("defs")
	      .append("linearGradient")
	        .attr("id", "gradient")
	        .attr("spreadMethod", "pad");

	gradient.append("stop")
	    .attr("offset", "0%")
	    .attr("stop-color", d3.rgb(255,230,230))
	    .attr("stop-opacity", 1);

	gradient.append("stop")
	    .attr("offset", "100%")
	    .attr("stop-color", d3.rgb(153,0,0))
	    .attr("stop-opacity", 1);

	gradientCanvas.append("rect")
	    .attr("x", 0)
	    .attr("y", 0)
	    .attr("width", 120)
	    .attr("height", 20)
	    .style("fill", "url(#gradient)");

	 offenderGradientCanvas = d3.select("#offenderGradient")
	    .append("svg")
	    .attr("width", 120)
	    .attr("height", 20);

	offenderGradient = offenderGradientCanvas.append("defs")
	      .append("linearGradient")
	        .attr("id", "offenderGradient")
	        .attr("spreadMethod", "pad");

	offenderGradient.append("stop")
	    .attr("offset", "0%")
	    .attr("stop-color", d3.rgb(240,248,255))
	    .attr("stop-opacity", 1);

	offenderGradient.append("stop")
	    .attr("offset", "100%")
	    .attr("stop-color", d3.rgb(25,25,112))
	    .attr("stop-opacity", 1);

	offenderGradientCanvas.append("rect")
	    .attr("x", 0)
	    .attr("y", 0)
	    .attr("width", 120)
	    .attr("height", 20)
	    .style("fill", "url(#offenderGradient)");

}
