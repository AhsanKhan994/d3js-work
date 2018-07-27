
$(document).ready(function(e) {

    // width and height settings
    var width = 900;
    var height = 500;
    var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 50
    };
    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;

    // colors
    var colorLine = ["blue", "green", "purple"];
	
	// Hours
	var hours=["12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"];
	
	// Defining the tooltip div
	div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

    // initializing the SVG
    var svg = d3.select(".placeSvg").append("svg")
        .attr("width", width + margin.left + margin.right + 150)
        .attr("height", height + margin.top + margin.bottom + 150);

    // appending the heading text
    svg.append("g")
        .attr("transform", "translate(" + 550 + "," + (margin.top + 10) + ")")
        .append("text")
        .style("font-size", "30px")
        .attr("text-anchor", "middle")
        .text("Time of the day that is most vulnerable");


    // initializing the main group g
    svg = svg.append("g")
        .attr("class", "main_group")
        .attr("transform", "translate(" + (margin.left+10) + "," + (margin.top + 50) + ")");


    // reading the csv data
    d3.csv("data/BPD_data.csv", function(error, data) {
	  
	  var trans_data = d3.nest()
		.key(function(d) { return d.CrimeTime.split(":")[0];})
		.rollup(function(d) { 
		 return d3.sum(d, function(g) {return g['Total Incidents']; });
		})
		.entries(data);
	   
	   if(trans_data.length>24){	
	   		trans_data.splice(24-trans_data.length); 
	   }
  	  
	  $(".loadingGif").remove();
	  
	  /*var x = d3.scale.linear()
		  .domain([-1, 24])
		  .range([0, width]);
		  */
		  
	  var x = d3.scale.ordinal()
		  .domain([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23])
		  .rangeBands([0, width]);
		  
	  var y = d3.scale.linear()
			  .domain([0, d3.max(trans_data,function(g){return g.values;})])
			  .range([height, 0]);	
	  
	  var width_w = x.rangeBand()/2;		
  
	  var xAxis = d3.svg.axis().scale(x).orient("bottom")
		  .tickFormat(function(tick_index) {
			  var f = ["12AM", "", "2AM", "", "4AM", "", "6AM", "", "8AM", "", "10AM", "", "12PM", "", "2PM", "", "4PM", "", "6PM", "", "8PM", "", "10PM", ""];
			  
		  return (f[tick_index]);
	  }),
		  yAxis = d3.svg.axis().scale(y).orient("left");

	   // initializing the x-axis
	  svg.append("g")
		  .attr("class", "x axis")
		  .attr("transform", "translate(0," + height + ")")
		  .call(xAxis)
		  .append("text")
		  .attr("class", "label")
		  .attr("x", width / 2)
		  .attr("y", 50)
		  .style("text-anchor", "middle")
		  .style("font-size", "20px")
		  .text("Hours of Crime");

	  // initializing the y-axis
	  svg.append("g")
		  .attr("class", "y axis")
		  .call(yAxis)
		  .append("text")
		  .attr("transform", "rotate(0)")
		  .attr("class", "label")
		  .attr("y", -30)
		  .attr("x", -28)
		  .attr("dy", ".71em")
		  .style("text-anchor", "start")
		  .style("font-size", "20px")
		  .text("Total Incidents");


  
		// define the line
	  var valueline = d3.svg.line()
		  .x(function(d) {
			  return x(d.key);
		  })
		  .y(function(d) {
			  return y(d.values);
		  });

	  // for transition on the line
	  function getInterpolation(d) {

		  var interpolate = d3.scale.quantile()
			  .domain([0, 1])
			  .range(d3.range(1, d.length + 1));

		  return function(t) {
			  var interpolatedLine = d.slice(0, interpolate(t));
			  return valueline(interpolatedLine);
		  }
	  }



	  //For vertical line				
	  var mouseG = d3.select(".main_group").append("g")
	  .attr("transform", "translate("+width_w+",0)")
		.attr("class", "mouse-over-effects");
  
	  //this is the black vertical line to follow mouse
	  mouseG.append("path") 
		.attr("class", "mouse-line")
		.style("stroke", "#ccc")
		.style("stroke-width", "1px")
		.style("opacity", "0");	
		
	  
		svg = svg.append("g")
			.attr("transform", "translate("+width_w+",0)");
  
		// adding the line
		svg.append("path")
			.attr("class", "line")
			.attr("id", "path1")
			.transition()
			.delay(50)
			.duration(700)
			.attr("d", valueline(trans_data))
			.style("stroke", function(d, i) {
				return colorLine[2];
			})
			.attrTween('d', function(d) {
				return getInterpolation(trans_data);
			});
		  
			  
		//Adding the line dots 
		var dots = svg.append("g")
			.attr("id", "dots1")
			.selectAll(".dots")
			.data(trans_data)
			.enter();
	
		dots.append("circle")
			.attr("class", "dots dots1")
			.attr("r", 0)
			.attr("cx", function(d) {
				return x(d.key);
			})
			.attr("cy", function(d) {
				return y(d.values);
			})
			.style("fill", function(d, i) {
				return colorLine[2];
			})
			.transition()
			.delay(400)
			.duration(100)
			.attr("r", 5);
			
  
	  
		  
		//Creating the vertical line for showing the value in tooltip box.			
		d3.select(".main_group").append('rect') // append a rect to catch mouse movements on canvas
		 .attr("transform", "translate("+width_w+",0)")
		  .attr('width', width) // can't catch mouse events on a g element
		  .attr('height', height)
		  .attr('fill', 'none')
		  .attr('pointer-events', 'all')
		  .on('mouseout', function() { // on mouse out hide line, circles and text
			d3.select(".mouse-line")
			  .style("opacity", "0");
			d3.selectAll(".mouse-per-line circle")
			  .style("opacity", "0");
			d3.selectAll(".mouse-per-line text")
			  .style("opacity", "0");
			d3.select(".hover_tooltip")
			  .style("opacity", "0"); 
			  
			$("div.tooltip").css("opacity",0);	  
			  
		  })
		  .on('mouseover', function() { // on mouse in show line, circles and text
			d3.select(".mouse-line")
			  .style("opacity", "1");
			d3.selectAll(".mouse-per-line circle")
			  .style("opacity", "1");
			d3.selectAll(".mouse-per-line text")
			  .style("opacity", "1");
			d3.select(".hover_tooltip")
			  .style("opacity", "1"); 
		  })
		  .on('mousemove', function() { // mouse moving over canvas
			
			 var xPos = d3.mouse(this)[0];
			 var leftEdges = x.range();
			 var width_w = x.rangeBand()/2;
			 
			 
			 var j;
			 for(j=0; xPos > (leftEdges[j] + width_w); j++) {}
			  //do nothing, just increment j until case fails
			 
			 var linePos=x(x.domain()[j]);
			
			
			 if(linePos!=undefined){	
			
			   d3.select(".mouse-line")
				.attr("d", function() {
				  var d = "M" + linePos + "," + height;
				  d += " " + linePos + "," + 0;
				  return d;
				});	
				
				
				if(trans_data[j]){
					
				  format = d3.format("0,000");

				  $("div.tooltip").html("<div class='c_left'>Hours of Crime Time:&nbsp;</div><div class='c_right'>"+hours[j]+"</div><br><div class='c_left'>Total Incidents:&nbsp;</div><div class='c_right'>"+format(trans_data[j].values)+"</div>");
				
				  $("div.tooltip").css("opacity",1)
					.css("left", (d3.event.pageX-50) + "px")		
					.css("top", (d3.event.pageY - 100) + "px");
  
				}
			  
			 }
			  
			  
		  });



	});
});

