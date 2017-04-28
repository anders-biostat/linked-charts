import { axisChart } from "./chartBase";

export function lineChart(id, chart){
	
	if(chart === undefined)
		chart = axisChart();
	if(id === undefined)
		id = "layer" + chart.get_nlayers();
	
	var layer = chart.create_layer(id).get_layer(id)
		.add_property("lineFun")
		.add_property("lineStepNum", 100)
		.add_property("lineWidth", 1.5)
		.add_property("dasharray", undefined);
	chart.syncProperties(layer);

	layer.type = "lineChart";
	
	layer.updatePoints = function(){
		var lines = layer.g.selectAll(".data_point")
			.data(layer.get_dataIds(), function(d) {return d;});
		lines.exit()
			.remove();
		lines.enter()
			.append("path")
				.attr("class", "data_point")
				.attr("fill", "none")
			.merge(lines)
        .on( "click", layer.get_on_click )
        .on( "mouseover", layer.get_pointMouseOver )
        .on( "mouseout", layer.get_pointMouseOut );			
	};

	layer.dresser(function(sel){
		sel.attr("stroke", function(d) {return layer.get_colour(d);})
			.attr("stroke-width", function(d) {return layer.get_lineWidth(d);})
			.attr("stroke-dasharray", function(d) {return layer.get_dasharray(d)});
	});

	layer.updatePointLocation = function(){
		//define the length of each step
		var lineStep = (layer.chart.axes.scale_x.domain()[1] - 
										layer.chart.axes.scale_x.domain()[0]) / 
										layer.get_lineStepNum();
		var get_data = function(d){
			var lineData = [];
			for(var i = layer.chart.axes.scale_x.domain()[0]; 
					i < layer.chart.axes.scale_x.domain()[1]; i += lineStep)
			lineData.push({
				x: i,
				y: layer.get_lineFun(d, i)
			});
							
			var line = d3.line()
				.x(function(c) {return layer.chart.axes.scale_x(c.x);})
				.y(function(c) {return layer.chart.axes.scale_y(c.y);});
							
			return line(lineData);
		};
		
		if(typeof layer.chart.transition !== "undefined")
			layer.g.selectAll(".data_point").transition(layer.chart.transition)
				.attr("d", get_data)
		else
			layer.g.selectAll(".data_point")
				.attr("d", get_data);			
	};

	return layer;
}