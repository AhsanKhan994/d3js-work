
$(document).ready(function(e) {
	
	d3.csv("data/BPD_data.csv", function(error, dt) {
	  
	  var data = d3.nest()
		.key(function(d) { return d['Description'];})
		.rollup(function(d) { 
		 return d3.sum(d, function(g) {return g['Total Incidents']; });
		})
		.entries(dt);

        //sort bars based on value
        data = data.sort(function (a, b) {
            return d3.ascending(a.values, b.values);
        })
		
		
		$(".loadingGif").remove();
		
        //set up svg using margin conventions - we'll need plenty of room on the left for labels
        var margin = {
            top: 15,
            right: 25,
            bottom: 15,
            left: 150
        };
		
		var format = d3.format("0,000");

        var width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        var svg = d3.select(".placeSvg").append("svg")
            .attr("width", width + margin.left + margin.right+30)
            .attr("height", height + margin.top + margin.bottom+35)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var x = d3.scale.linear()
            .range([0, width])
            .domain([0, d3.max(data, function (d) {
                return d.values;
            })]);

        var y = d3.scale.ordinal()
            .rangeRoundBands([height, 0], .1)
            .domain(data.map(function (d) {
                return d.key;
            }));

        //make y axis to show bar names
        var yAxis = d3.svg.axis()
            .scale(y)
            //no tick marks
            .tickSize(0)
            .orient("left");

        var gy = svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
			
		// initializing the x-axis
		var xAxis = d3.svg.axis().scale(x).ticks(10).orient("bottom");
			
	  	svg.append("g")
		  .attr("class", "x axis")
		  .attr("transform", "translate(0," + height + ")")
		  .call(xAxis)
		  .append("text")
		  .attr("class", "label")
		  .attr("x", width / 2)
		  .attr("y", 50)
		  .style("text-anchor", "middle")
		  .style("font-size", "12px")
		  .text("Total Incidents");

		data.sort(function(a,b){return b.values-a.values;});
        var bars = svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("g")

        //append rects
        bars.append("rect")
            .attr("class", "bar")
            .attr("y", function (d) {
                return y(d.key);
            })
			.attr("width",0)
            .attr("height", y.rangeBand()-1)
            .attr("x", 0)
			.transition()
			.delay(function(d,i){return (i*20);})
			.duration(500)
			.ease("cubic")
            .attr("width", function (d) {
                return x(d.values);
            });

        //add a value label to the right of each bar
        bars.append("text")
            .attr("class", "label")
            //y position of the label is halfway down the bar
            .attr("y", function (d) {
                return y(d.key) + y.rangeBand() / 2 + 4;
            })
            .attr("x",0)
            .text(function (d) {
                return format(d.values);
            })
			.transition()
			.delay(function(d,i){return (i*20);})
			.duration(500)
			.ease("cubic")
			//x position is 3 pixels to the right of the bar
            .attr("x", function (d) {
                return x(d.values) + 3;
            });
			
		$(".x-axis-p").css("display","block");	
		
	});	
});
