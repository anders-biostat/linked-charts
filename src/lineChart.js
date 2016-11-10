import { axisChartBase } from "./chartBase";

export function lineChart(id, chart){
	
	if(chart === undefined)
		chart = axisChartBase();
	if(id === undefined)
		id = "layer" + chart.get_nlayers();
	
	var layer = chart.add_layer(id)
		.add_property("nlines")
		.add_property("lineIds", function() {return d3.range(layer.get_nlines());})
		.add_property("lineFun")
		.add_property("lineStyle", "")
		.add_property("lineStepNum", 100);
	chart.setActiveLayer(id);
	
	layer.update_not_yet_called = true;
	
	layer.update = function(){
    
		if( layer.update_not_yet_called ) {
      layer.update_not_yet_called = false;
      layer.g = layer.chart.svg.append("g")
				.attr("class", "chart_g");
    }
		
		layer.g.transition(layer.chart.transition)
			.attr("transform", "translate(" + 
				layer.get_margin().left + ", " +
				layer.get_margin().top + ")");
		
		//define the length of each step
		var lineStep = (layer.chart.axes.scale_x.domain()[1] - 
										layer.chart.axes.scale_x.domain()[0]) / 
										layer.get_lineStepNum();

		var lines = layer.g.selectAll(".line")
			.data(layer.get_lineIds());
		lines.exit()
			.remove();
		lines.enter()
			.append("path")
				.attr("class", "line")
				.attr("fill", "none")
				.attr("stroke", "black")
				.attr("stroke-width", 1.5)
					.merge(lines).transition(layer.chart.transition)
						.attr("style", function(d){
							return layer.get_lineStyle(d);
						})
						.attr("d", function(d){
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
						});

			return layer;
		}
			
	return layer;
}