
var offenderGradientCanvas = d3.select("#offenderGradient")
	    .append("svg")
	    .attr("width", 120)
	    .attr("height", 20);

var offenderGradient = offenderGradientCanvas.append("defs")
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