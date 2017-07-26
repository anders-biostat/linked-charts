import { axisChart } from "./chartBase";

function lineChart(id, chart){
	
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
				.attr("id", function(d) {return "p" + (layer.id + "_" + d).replace(/ /g,"_");})
        .on( "click", layer.get_on_click )
        .on( "mouseover", layer.get_pointMouseOver )
        .on( "mouseout", layer.get_pointMouseOut );			
	};

	layer.dresser(function(sel){
		sel.attr("stroke", function(d) {return layer.get_colour(d);})
			.attr("stroke-width", function(d) {return layer.get_lineWidth(d);})
			.attr("stroke-dasharray", function(d) {return layer.get_dasharray(d)});
	});

	return layer;
}

export function xLine(id, chart){
	
	var layer = lineChart(id, chart);

	layer.type = "xLine";

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
		
		if(layer.chart.transitionDuration() > 0 && !layer.chart.transitionOff)
			layer.g.selectAll(".data_point").transition("pointLocation")
				.duration(layer.chart.transitionDuration())
				.attr("d", get_data)
		else
			layer.g.selectAll(".data_point")
				.attr("d", get_data);			
	};

	return layer;
}

export function yLine(id, chart){
	
	var layer = lineChart(id, chart);

	layer.type = "yLine";

	layer.updatePointLocation = function(){
		//define the length of each step
		var lineStep = (layer.chart.axes.scale_y.domain()[1] - 
										layer.chart.axes.scale_y.domain()[0]) / 
										layer.get_lineStepNum();
		var get_data = function(d){
			var lineData = [];
			for(var i = layer.chart.axes.scale_y.domain()[0]; 
					i < layer.chart.axes.scale_y.domain()[1]; i += lineStep)
			lineData.push({
				y: i,
				x: layer.get_lineFun(d, i)
			});
							
			var line = d3.line()
				.x(function(c) {return layer.chart.axes.scale_x(c.x);})
				.y(function(c) {return layer.chart.axes.scale_y(c.y);});
							
			return line(lineData);
		};
		
		if(layer.chart.transitionDuration() > 0 && !layer.chart.transitionOff)
			layer.g.selectAll(".data_point").transition("pointLocation")
				.duration(layer.chart.transitionDuration())
				.attr("d", get_data)
		else
			layer.g.selectAll(".data_point")
				.attr("d", get_data);			
	};

	return layer;
}

export function parametricCurve(id, chart){
	var layer = lineChart(id, chart);

	layer.type = "paramCurve";

	layer
		.add_property("xFunction")
		.add_property("yFunction")
		.add_property("paramRange", [0, 1]);
	layer.chart.syncProperties(layer);

	var get_data = function(d){
		var paramRange = layer.paramRange();
		
		if(paramRange[1] < paramRange[0])
			paramRange = [paramRange[1], paramRange[0]];

		var lineStep = (paramRange[1] - paramRange[0]) / 
										layer.get_lineStepNum();

		var lineData = [];
		for(var t = paramRange[0]; t < paramRange[1]; t += lineStep)
			lineData.push({
				x: layer.get_xFunction(d, t),
				y: layer.get_yFunction(d, t)
			});
			
		return lineData;
	};	

	layer.updatePointLocation = function(){
		
		var line = d3.line()
			.x(function(c) {return layer.chart.axes.scale_x(c.x);})
			.y(function(c) {return layer.chart.axes.scale_y(c.y);});

		if(layer.chart.transitionDuration() > 0 && !layer.chart.transitionOff)
			layer.g.selectAll(".data_point").transition("pointLocation")
				.duration(layer.chart.transitionDuration())
				.attr("d", function(d) {return line(get_data(d));})
		else
			layer.g.selectAll(".data_point")
				.attr("d", function(d) {return line(get_data(d));});
	}

	layer.layerDomainX(function() {
		var dataIds = layer.dataIds(),
			domainX = [];
		for(var i = 0; i < dataIds.length; i++)
			domainX = domainX.concat(d3.extent(get_data(dataIds[i]).map(function(e) {return e.x})));
		return d3.extent(domainX);
	});

	layer.layerDomainY(function() {
		var dataIds = layer.dataIds(),
			domainY = [];
		for(var i = 0; i < dataIds.length; i++)
			domainY = domainY.concat(d3.extent(get_data(dataIds[i]).map(function(e) {return e.y})));
		return d3.extent(domainY);
	});

	return layer;
}