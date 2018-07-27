
var format = d3.format(",");

//set up svg using margin conventions - we'll need plenty of room on the left for labels
var margin = {
	top: 15,
	right: 25,
	bottom: 15,
	left: 200
};

var width = 900 - margin.left - margin.right,
	height = 2000 - margin.top - margin.bottom;

var districts=[];
var finalData={};
			
$(document).ready(function(e) {
	
	d3.csv("data/BPD_data.csv", function(error, dt) {
	  
	  var data = d3.nest()
		.key(function(d) { return d['District'];})
		.key(function(d) { return d['Neighborhood'];})
		.rollup(function(d) { 
		 return d3.sum(d, function(g) {return g['Total Incidents']; });
		})
		.entries(dt);
		
        //sort bars based on value
        data = data.sort(function (a, b) {
            return d3.ascending(a.values, b.values);
        })
		
		$(".loadingGif").remove();
	
		$.map(data,function(element,index){
			
			if(element['key']){
				finalData[element['key']]=element['values'];	
				districts.push(element['key']);
				
				$(".filterBox").append('<label class="container">'+element['key']+'<input type="radio" class="checkBtn" name="radio" value="'+element['key']+'"><span class="checkmark"></span></label>');
			}
		});
		
		$(".checkBtn[value="+districts[0]+"]").prop("checked",true);
		
		console.log(finalData);
		
		drawChart(finalData[districts[0]]);
		
	});	
	
	$(document).on("change",".checkBtn",function(){
		
		var dist_name=$(this).val();
		
		drawChart(finalData[dist_name]);
		
	});
});


function drawChart(data){
	
	
	data=data.sort(function(a,b){return a.values-b.values;});
	
	$("svg").remove();
	
	var svg = d3.select(".placeSvg").append("svg")
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
		.delay(function(d,i){return (20);})
		.duration(400)
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
		.delay(function(d,i){return (20);})
		.duration(400)
		.ease("cubic")
		//x position is 3 pixels to the right of the bar
		.attr("x", function (d) {
			return x(d.values) + 3;
		});
		
	$(".x-axis-p").css("display","block");
	
	loadAnnotation();	

}



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
