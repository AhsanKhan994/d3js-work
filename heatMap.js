

$(function(){
	
	
	// Defining the tooltip div
	div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);
	
	d3.csv("data/BPD_data.csv", function(error, dt) {
	  	
		var data = d3.nest()
			.key(function(d) { return d['District'];})
			.rollup(function(d) { 
			 return d3.sum(d, function(g) {return g['Total Incidents']; });
			})
			.entries(dt);
		
		
		mainDataSet = d3.nest()
			.key(function(d) { return d['District'];})
			.key(function(d) { return d['Neighborhood'];})
			.rollup(function(d) { 
			 return d3.sum(d, function(g) {return g['Total Incidents']; });
			})
			.entries(dt);
			
		
		datasetTotal=[];
		
		$.map(data,function(ee,dd){
			
			if(ee['key']){
				datasetTotal.push(ee);	
			}
		});
		
		
		datasetTotal.sort(function(a,b){return b.value-a.value;});
		
		var svg = d3.select("svg"),
		margin = {top: 20, right: 20, bottom: 30, left: 50},
		width = +svg.attr("width") - margin.left - margin.right,
		height = +svg.attr("height") - margin.top - margin.bottom;
		
		
		var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
			y = d3.scaleLinear().rangeRound([height, 0]);
		
		var g = svg.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
		
		
		  x.domain(datasetTotal.map(function(d) { return d.key; }));
		  y.domain([0, d3.max(datasetTotal, function(d) { return d.value; })]);
		
		  g.append("g")
			  .attr("class", "axis axis--x")
			  .attr("transform", "translate(0," + (height) + ")")
			  .call(d3.axisBottom(x));
		
		  g.append("g")
			  .attr("class", "axis axis--y")
			  .call(d3.axisLeft(y))
			.append("text")
			  .attr("transform", "rotate(-90)")
			  .attr("y", 6)
			  .attr("dy", "0.71em")
			  .attr("text-anchor", "end")
			  .text("Frequency");
		
		  g.selectAll(".bar")
			.data(datasetTotal)
			.enter().append("rect")
			  .attr("class", "bar")
			  .attr("x", 0)
			  .attr("y", function(d) { return y(d.value); })
			  .attr("width", x.bandwidth())
			  .attr("height", function(d) { return height - y(d.value);})			 
			  .on('mouseout', function() { // on mouse out hide line, circles and text
			
				d3.select(".tooltip")
				  .style("opacity", "0"); 
				  
			  })
			  .on('mouseover', function() { // on mouse in show line, circles and text
				
				d3.select(".tooltip")
				  .style("opacity", "1"); 
			  })
			  .on("mousemove",function(d){
			  
				  $("div.tooltip").html("<div class='c_left'></div><div class='c_right'><b>"+d.key+"</b></div><div class='c_left'></div><div class='c_right'>"+d3.format(',')(d.value)+"</div>");
				
				  $("div.tooltip").css("opacity",1)
					.css("left", (d3.event.pageX-50) + "px")		
					.css("top", (d3.event.pageY - 100) + "px");
			  })
			     .transition()
			.delay(function(d,i){return (i*40);})
			.duration(80)
			  .attr("x", function(d) { return x(d.key); });


			$(".loadingGif").remove();
			
			loadAnnotation();
					
		});

});


function loadAnnotation(){
	
      const annotations = [
        {
          note: {
            label: "",
            title: "",
            wrap: 150,
            align: "left"
          },
          connector: {
            end: "arrow" // 'dot' also available
          },
          x: 248,
          y: 75,
          dy: -5,
          dx: 160
        },{
          note: {
            label: "Northeastern and Southeastern districts often suffer from highest number of crimes",
            title: "",
            wrap: 150,
			align:"left"
          },
          connector: {
            end: "arrow",
            type: "curve",
            //can also add a curve type, e.g. curve: d3.curveStep
            points: [[100, -15]]
          },
          x: 150,
          y: 30,
          dy: 0,
          dx: 262
        }].map(function(d){ d.color = "#E8336D"; return d})

        const makeAnnotations = d3.annotation()
          .type(d3.annotationLabel)
          .annotations(annotations)

        d3.select("svg")
          .append("g")
          .attr("class", "annotation-group")
          .call(makeAnnotations)

}
