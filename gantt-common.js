/**
 * @author Dimitry Kudrayvtsev
 * @version 2.0
 */

d3.gantt = function() {
    var FIT_TIME_DOMAIN_MODE = "fit";
    var FIXED_TIME_DOMAIN_MODE = "fixed";
    
    var margin = {
	top : 20,
	right : 40,
	bottom : 20,
	left : 150
    };
    var timeDomainStart = d3.time.day.offset(new Date(),-3);
    var timeDomainEnd = d3.time.hour.offset(new Date(),+3);
    var timeDomainMode = FIT_TIME_DOMAIN_MODE;// fixed or fit
    var taskTypes = [];
    var taskStatus = [];
    var height = document.body.clientHeight - margin.top - margin.bottom-5;
    var width = document.body.clientWidth - margin.right - margin.left-5;

    var tickFormat = "%H:%M";

    var keyFunction = function(d) {
	return d.startDate + d.taskName + d.endDate;
    };

    var rectTransform = function(d) {
	return "translate(" + xScale(d.startDate) + "," + yScale(d.taskName) + ")";
    };

    var xScale = d3.time.scale().domain([ timeDomainStart, timeDomainEnd ]).range([ 0, width ]).clamp(true);

    var yScale = d3.scale.ordinal().domain(taskTypes).rangeRoundBands([ 0, height - margin.top - margin.bottom ], .1);
    
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickFormat(d3.time.format(tickFormat)).tickSubdivide(true)
	    .tickSize(8).tickPadding(8);

    var yAxis = d3.svg.axis().scale(yScale).orient("left").tickSize(0);

    var initTimeDomain = function() {
	if (timeDomainMode === FIT_TIME_DOMAIN_MODE) {
	    if (tasks === undefined || tasks.length < 1) {
		timeDomainStart = d3.time.day.offset(new Date(), -3);
		timeDomainEnd = d3.time.hour.offset(new Date(), +3);
		return;
	    }
	    tasks.sort(function(a, b) {
		return a.endDate - b.endDate;
	    });
	    timeDomainEnd = tasks[tasks.length - 1].endDate;
	    tasks.sort(function(a, b) {
		return a.startDate - b.startDate;
	    });
	    timeDomainStart = tasks[0].startDate;
	}
    };

    var initAxis = function() {
	xScale = d3.time.scale().domain([ timeDomainStart, timeDomainEnd ]).range([ 0, width ]).clamp(true);
	yScale = d3.scale.ordinal().domain(taskTypes).rangeRoundBands([ 0, height - margin.top - margin.bottom ], .1);
	xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickFormat(d3.time.format(tickFormat)).tickSubdivide(true)
		.tickSize(8).tickPadding(8);

	yAxis = d3.svg.axis().scale(yScale).orient("left").tickSize(0);
    };
    
    function gantt(tasks) {
	
	initTimeDomain();
	initAxis();
	
	var svg = d3.select("body")
	.append("svg")
	.attr("class", "chart")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
        .attr("class", "gantt-chart")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
	
      var bar = svg.selectAll(".chart")
	 .data(tasks, keyFunction).enter()

	 bar.append("rect")
	 .attr("rx", 5)
         .attr("ry", 5)
	 .attr("class", function(d){ 
	     if(taskStatus[d.status] == null){ return "bar";}
	     return taskStatus[d.status];
	     }) 
	 .attr("y", 0)
	 .attr("transform", rectTransform)
	 .attr("height", function(d) { return yScale.rangeBand(); })
	 .attr("width", function(d) { 
	     return (xScale(d.endDate) - xScale(d.startDate)); 
	     });
	 
	 bar.append("text")
	    .attr("x", function(d) {
	    	return (xScale(d.endDate) - xScale(d.startDate)); 
	     })
	    .attr("y", 3)
	    .attr("dy", "8px")
	 .attr("transform", rectTransform)
	    .text(function(d) {
	        var diff = Math.abs(d.endDate - d.startDate);
	        var hours = diff / 36e5;
	        var format = "hrs";
	        var final = (Math.round(hours * 10) / 10);
	        if (final < 1) {
	            final = (diff / 1000) / 60;
	            format = "mins";
	        }
	        return (Math.round(final * 10) / 10) + format;
	    });

	 svg.append("g")
	 .attr("class", "x axis")
	 .attr("transform", "translate(0, " + (height - margin.top - margin.bottom) + ")")
	 .transition()
	 .call(xAxis);
	 
	 svg.append("g").attr("class", "y axis").transition().call(yAxis);
	 
	 return gantt;

    };
    
    gantt.redraw = function(tasks) {

	initTimeDomain();
	initAxis();
	
        var svg = d3.select("svg");

        var ganttChartGroup = svg.select(".gantt-chart");
        var rect = ganttChartGroup.selectAll("rect").data(tasks, keyFunction);
        
        rect.enter()
         .insert("rect",":first-child")
         .attr("rx", 5)
         .attr("ry", 5)
	 .attr("class", function(d){ 
	     if(taskStatus[d.status] == null){ return "bar";}
	     return taskStatus[d.status];
	     }) 
	 .transition()
	 .attr("y", 0)
	 .attr("transform", rectTransform)
	 .attr("height", function(d) { return yScale.rangeBand(); })
	 .attr("width", function(d) { 
	     return (xScale(d.endDate) - xScale(d.startDate)); 
	     });

        rect.transition()
          .attr("transform", rectTransform)
	 .attr("height", function(d) { return yScale.rangeBand(); })
	 .attr("width", function(d) { 
	     return (xScale(d.endDate) - xScale(d.startDate)); 
	     });
        
	rect.exit().remove();

	svg.select(".x").transition().call(xAxis);
	svg.select(".y").transition().call(yAxis);
	
	return gantt;
    };

    gantt.margin = function(value) {
	if (!arguments.length)
	    return margin;
	margin = value;
	return gantt;
    };

    gantt.timeDomain = function(value) {
	if (!arguments.length)
	    return [ timeDomainStart, timeDomainEnd ];
	timeDomainStart = +value[0], timeDomainEnd = +value[1];
	return gantt;
    };

    /**
     * @param {string}
     *                vale The value can be "fit" - the domain fits the data or
     *                "fixed" - fixed domain.
     */
    gantt.timeDomainMode = function(value) {
	if (!arguments.length)
	    return timeDomainMode;
        timeDomainMode = value;
        return gantt;

    };

    gantt.taskTypes = function(value) {
	if (!arguments.length)
	    return taskTypes;
	taskTypes = value;
	return gantt;
    };
    
    gantt.taskStatus = function(value) {
	if (!arguments.length)
	    return taskStatus;
	taskStatus = value;
	return gantt;
    };

    gantt.width = function(value) {
	if (!arguments.length)
	    return width;
	width = +value;
	return gantt;
    };

    gantt.height = function(value) {
	if (!arguments.length)
	    return height;
	height = +value;
	return gantt;
    };

    gantt.tickFormat = function(value) {
	if (!arguments.length)
	    return tickFormat;
	tickFormat = value;
	return gantt;
    };


    
    return gantt;
};
