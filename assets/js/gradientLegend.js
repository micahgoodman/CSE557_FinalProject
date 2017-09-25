
var gradientCanvas = d3.select("#demographicGradient")
	    .append("svg")
	    .attr("width", 120)
	    .attr("height", 20);

var gradient = gradientCanvas.append("defs")
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