
var svg = d3.select(".placeSvg")
	.append("svg")
	.append("g")

svg.append("g")
	.attr("class", "slices");
svg.append("g")
	.attr("class", "labelName");
svg.append("g")
	.attr("class", "labelValue");
svg.append("g")
	.attr("class", "lines");

var width = 960,
    height = 450,
    radius = Math.min(width, height) / 2;

var pie = d3.layout.pie()
	.sort(null)
	.value(function(d) {
    //console.log(d);
		return d.values;
	});

var arc = d3.svg.arc()
	.outerRadius(radius * 0.8)
	.innerRadius(radius * 0.4);

var outerArc = d3.svg.arc()
	.innerRadius(radius * 0.9)
	.outerRadius(radius * 0.9);

var legendRectSize = radius * 0.05;
var legendSpacing = radius * 0.02;

var div = d3.select(".placeSvg").append("div").attr("class", "toolTip");

svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var colorRange = d3.scale.category20();
var color = d3.scale.ordinal()
	.range(colorRange.range());

var totalSum=0;

var mainDataSet=[];

$(function(){

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
				totalSum+=ee['values'];
			}
		});
		
		//console.log(datasetTotal);

		/*datasetTotal = [
				{key:"Category 1 Category 1", values:19}, 
				{key:"Category 2", values:5}, 
				{key:"Category 3", values:13},
				{key:"Category 4", values:17},
				{key:"Category 5", values:19},
				{key:"Category 6", values:27}
		
		datasetOption1 = [
				{label:"Category 1", value:22}, 
				{label:"Category 2", value:33}, 
				{label:"Category 3", value:4},
				{label:"Category 4", value:15},
				{label:"Category 5", value:36},
				{label:"Category 6", value:0}
				];
		
		datasetOption2 = [
				{label:"Category 1", value:10}, 
				{label:"Category 2", value:20}, 
				{label:"Category 3", value:30},
				{label:"Category 4", value:5},
				{label:"Category 5", value:12},
				{label:"Category 6", value:23}
				];
		*/
		change(datasetTotal);
		
	
		
		});

});


d3.selectAll("input")
	.on("change", selectDataset);
	
function selectDataset()
{
	var value = this.value;
	if (value == "total")
	{
		change(datasetTotal);
	}
	else if (value == "option1")
	{
		change(datasetOption1);
	}
	else if (value == "option2")
	{
		change(datasetOption2);
	}
}

function change(data) {

	/* ------- PIE SLICES -------*/
	var slice = svg.select(".slices").selectAll("path.slice")
        .data(pie(data), function(d){ return d.data.key });

    slice.enter()
        .insert("path")
        .style("fill", function(d) { return color(d.data.key); })
    	.style("opacity", 0.8)
        .attr("class", "slice");
		
    
	slice
        .transition()
		.delay(function(d,i){return i*30;})
		.duration(30)
        .attrTween('d', function(d) {
		var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
		return function(t) {
			d.endAngle = i(t); 
			return arc(d)
			}
		});
	
		
    slice
        .on("mousemove", function(d){
            div.style("left", d3.event.pageX+10+"px");
            div.style("top", d3.event.pageY-25+"px");
            div.style("display", "inline-block");
            div.html((d.data.key)+"<br>"+((d.data.values/totalSum)*100).toFixed(1)+"%");
        });
    slice
        .on("mouseout", function(d){
            div.style("display", "none");
        });
		
	slice
		.on("click",function(d){
			drawChart(d.data.key);
		});

    slice.exit()
        .remove();

    var legend = svg.selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) {
            var height = legendRectSize + legendSpacing;
            var offset =  height * color.domain().length / 2;
            var horz = -3 * legendRectSize;
            var vert = i * height - offset;
            return 'translate(' + (horz-12) + ',' + vert + ')';
        });

    legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', color)
        .style('stroke', color)
		.style('opacity',0.8);

    legend.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(function(d) { return d; });

    /* ------- TEXT LABELS -------*/

    var text = svg.select(".labelName").selectAll("text")
        .data(pie(data), function(d){ return d.data.key });

    text.enter()
        .append("text")
        .attr("dy", ".35em")
        .text(function(d) {
            return (d.data.key+": "+d.values+"%");
        });

    function midAngle(d){
        return d.startAngle + (d.endAngle - d.startAngle)/2;
    }

    text
        .transition().duration(1000)
        .attrTween("transform", function(d) {
     
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var pos = outerArc.centroid(d2);
                pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                return "translate("+ pos +")";
            };
        })
        .styleTween("text-anchor", function(d){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                return midAngle(d2) < Math.PI ? "start":"end";
            };
        })
        .text(function(d) {
            return (d.data.key+": "+((d.data.values/totalSum)*100).toFixed(1)+ "%");
        });


    text.exit()
        .remove();

    /* ------- SLICE TO TEXT POLYLINES -------*/

    var polyline = svg.select(".lines").selectAll("polyline")
        .data(pie(data), function(d){ return d.data.key });

    polyline.enter()
        .append("polyline");

    polyline.transition().duration(1000)
        .attrTween("points", function(d){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var pos = outerArc.centroid(d2);
                pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                return [arc.centroid(d2), outerArc.centroid(d2), pos];
            };
        });

    polyline.exit()
        .remove();
		
	$(".loadingGif").remove();	
};

function drawChart(name){
		
	$("#district_name").text(name);
	
	$(".placeSvg2").empty();
	
	var data=[];
	$.map(mainDataSet,function(element,index){
		
		if(element.key==name){
			data=element.values;
		}
	});
			
        //sort bars based on value
        data = data.sort(function (a, b) {
            return d3.ascending(a.values, b.values);
        })
		
		
		var format = d3.format("0,000");
		
        //set up svg using margin conventions - we'll need plenty of room on the left for labels
        var margin = {
            top: 15,
            right: 25,
            bottom: 15,
            left: 200
        };

        var width = 960 - margin.left - margin.right,
            height = 1500 - margin.top - margin.bottom;

        var svg = d3.select(".placeSvg2").append("svg")
            .attr("width", width + margin.left + margin.right+30)
            .attr("height", height + margin.top + margin.bottom)
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

		data.sort(function(a,b){return b.values-a.values;});
        var bars = svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("g")

        //append rects
        bars.append("rect")
            .attr("class", "bar")
			.style("fill",color(name))
			.style("opacity",0.7)
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
		
		
		$(window).scrollTop($(".placeSvg2").position().top);
		
	
}

