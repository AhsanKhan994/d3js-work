// JavaScript Document

$(function(){
	
	d3.csv("data/BPD_data.csv", function(error, dt) {
	  
	  var data = d3.nest()
		.key(function(d) { return d['Weapon'];})
		.rollup(function(d) { 
		 return d3.sum(d, function(g) {return g['Total Incidents']; });
		})
		.entries(dt);
		
		var trans_data=[];
        
        $.map(data,function(elem,d){
			
			if(elem['key']){
				trans_data.push({'value':elem['values'],'name':elem['key']});
			}
			
			
		});
		
		$(".loadingGif").remove();
	
		 var visualization = d3plus.viz()
		.container(".placeSvg")  // container DIV to hold the visualization
		.data(trans_data)  // data to use with the visualization
		.type("tree_map")   // visualization type
		.id("name")         // key for which our data is unique on
		.size("value")      // sizing of blocks
		.draw();    
		
	});
	
	
});