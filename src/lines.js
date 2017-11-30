import { axesChart } from "./axesChart";

function line(id, chart){
	
	if(chart === undefined)
		chart = axesChart();
	if(id === undefined)
		id = "layer" + chart.get_nlayers();
	
	var layer = chart.add_layer(id).get_layer(id)
		.add_property("lineFun")
		.add_property("lineStepNum", 100)
		.add_property("lineWidth", 1.5)
		.add_property("dasharray", undefined);
	chart.syncProperties(layer);
	
	layer.nelements(1);

	layer.updateElements = function(){
		var lines = layer.g.selectAll(".data_element")
			.data(layer.elementIds(), function(d) {return d;});
		lines.exit()
			.remove();
		lines.enter()
			.append("path")
				.attr("class", "data_element")
				.attr("fill", "none")
			.merge(lines)
				.attr("id", function(d) {return "p" + (layer.id + "_" + d).replace(/[ .]/g,"_");})
        .on( "click", layer.get_on_click )
        .on( "mouseover", layer.get_elementMouseOver )
        .on( "mouseout", layer.get_elementMouseOut );			
	};

	layer.dresser(function(sel){
		sel.attr("stroke", function(d) {return layer.get_colour(d);})
			.attr("stroke-width", function(d) {return layer.get_lineWidth(d);})
			.attr("stroke-dasharray", function(d) {return layer.get_dasharray(d)})
			.attr("opacity", function(d) { return layer.get_opacity(d)} );
	});

	layer.findElements = function(lu, rb) {
		var r = 5;
		return layer.g.selectAll("path")
			.filter(function(){
				var line = d3.select(this).attr("d").substr(1)
					.split("L")
						.map(function(e){return e.split(",")});
				var inside = false, i = 0;
				while(!inside && i < line.length){
					if((line[i][0] - r <= rb[0]) && (line[i][1] - r <= rb[1]) && 
          (line[i][0] + r >= lu[0]) && (line[i][1] + r >= lu[1]))
						inside = true;
					i++;
				}
				return inside;
			}).data().map(function(e) {return [layer.id, e]});
	}

	layer.updateElementPosition = function(){
		var line = d3.line()
			.x(function(c) {return layer.chart.axes.scale_x(c.x);})
			.y(function(c) {return layer.chart.axes.scale_y(c.y);});

		if(layer.chart.transitionDuration() > 0 && !layer.chart.transitionOff)
			layer.g.selectAll(".data_element").transition("elementPosition")
				.duration(layer.chart.transitionDuration())
				.attr("d", function(d) {return line(layer.get_data(d));})
		else
			layer.g.selectAll(".data_element")
				.attr("d", function(d) {return line(layer.get_data(d));});

		return layer.chart;
	}

  //default hovering behaviour
  layer.elementMouseOver(function(d){
    var pos = d3.mouse(layer.chart.container.node());
    //change colour and class
    d3.select(this)
      .attr("stroke", function(d) {
        return d3.rgb(layer.get_colour(d)).darker(0.5);
      })
      .classed("hover", true);
    //show label
    layer.chart.container.selectAll(".inform").data([d])
        .style("left", (pos[0] + 10) + "px")
        .style("top", (pos[1] + 10) + "px")
        .select(".value")
          .html(layer.get_informText(d));  
    layer.chart.container.selectAll(".inform")
      .classed("hidden", false);
  });
  layer.elementMouseOut(function(d){
    d3.select(this)
      .attr("stroke", function(d) {
        return layer.get_colour(d);
      })
      .classed("hover", false);
    layer.chart.container.selectAll(".inform")
      .classed("hidden", true);
  });		

	return chart;
}

export function xLine(id, chart){
	
	var layer = line(id, chart).activeLayer();

	layer.type = "xLine";

	layer.get_data = function(d){
		var domain = layer.layerDomainX();
		if(domain === undefined)
			domain = layer.chart.axes.scale_x.domain();

		//define the length of each step
		var lineStep = (domain[1] - domain[0]) / 
										layer.get_lineStepNum(d);

		var lineData = [];
		for(var i = domain[0]; i < domain[1]; i += lineStep)
			lineData.push({
				x: i,
				y: layer.get_lineFun(i, d)
			});
							
		var line = d3.line()
			.x(function(c) {return layer.chart.axes.scale_x(c.x);})
			.y(function(c) {return layer.chart.axes.scale_y(c.y);});
							
		return lineData;
	};

	return layer.chart;
}

export function yLine(id, chart){
	
	var layer = line(id, chart).activeLayer();

	layer.type = "yLine";

	layer.get_data = function(d){
		var domain = layer.layerDomainY();
		if(domain === undefined)
			domain = layer.chart.axes.scale_y.domain();

		//define the length of each step
		var lineStep = (domain[1] - domain[0]) / 
										layer.get_lineStepNum(d);

		var lineData = [];
		for(var i = domain[0]; i < domain[1]; i += lineStep)
			lineData.push({
				y: i,
				x: layer.get_lineFun(i, d)
			});
							
		var line = d3.line()
			.x(function(c) {return layer.chart.axes.scale_x(c.x);})
			.y(function(c) {return layer.chart.axes.scale_y(c.y);});
							
		return lineData;
	};

	return layer.chart;
}

export function parametricCurve(id, chart){
	
	var layer = line(id, chart).activeLayer();

	layer.type = "paramCurve";

	layer
		.add_property("xFunction")
		.add_property("yFunction")
		.add_property("paramRange", [0, 1]);
	layer.chart.syncProperties(layer);

	layer.get_data = function(d){
		var paramRange = layer.paramRange();
		
		if(paramRange[1] < paramRange[0])
			paramRange = [paramRange[1], paramRange[0]];

		var lineStep = (paramRange[1] - paramRange[0]) / 
										layer.get_lineStepNum();

		var lineData = [];
		for(var t = paramRange[0]; t < paramRange[1]; t += lineStep)
			lineData.push({
				x: layer.get_xFunction(t, d),
				y: layer.get_yFunction(t, d)
			});
			
		return lineData;
	};	

	layer.layerDomainX(function() {
		var elementIds = layer.elementIds(),
			domainX = [];
		for(var i = 0; i < elementIds.length; i++)
			domainX = domainX.concat(d3.extent(get_data(elementIds[i]).map(function(e) {return e.x})));
		return d3.extent(domainX);
	});

	layer.layerDomainY(function() {
		var elementIds = layer.elementIds(),
			domainY = [];
		for(var i = 0; i < elementIds.length; i++)
			domainY = domainY.concat(d3.extent(get_data(elementIds[i]).map(function(e) {return e.y})));
		return d3.extent(domainY);
	});

	return layer.chart;
}

export function pointLine(id, chart){
	
	var layer = line(id, chart).activeLayer();

	layer.type = "pointLine";

	layer
		.add_property("x")
		.add_property("y");
	layer.chart.syncProperties(layer);

	layer.get_data = function(d){
		var lineData = [];		
		for(var t = 0; t < layer.lineStepNum(); t++)
			lineData.push({
				x: layer.get_x(d, t),
				y: layer.get_y(d, t)
			});
			
		return lineData;
	};		
	
	layer.layerDomainX(function() {
		var domain = [];
		layer.elementIds().map(function(id) {
			return d3.extent(d3.range(layer.lineStepNum()).map(function(e){
				return layer.get_x(id, e);
			}))
		}).forEach(function(e) {domain = domain.concat(e)});

		return d3.extent(domain);
	})

	layer.layerDomainY(function() {
		var domain = [];
		layer.elementIds().map(function(id) {
			return d3.extent(d3.range(layer.lineStepNum()).map(function(e){
				return layer.get_y(id, e);
			}))
		}).forEach(function(e) {domain = domain.concat(e)});

		return d3.extent(domain);
	})

	return layer.chart;
}

export function pointRibbon(id, chart) {

	var layer = pointLine(id, chart).activeLayer();

	layer.type = "pointRibbon";
	layer.chart.syncProperties(layer);

	layer.opacity(0.33)
		.lineWidth(0);

	layer.get_data = function(d){
		var lineData = [];		
		for(var t = 0; t < layer.lineStepNum(); t++)
			lineData.push({
				x: layer.get_x(d, t)[0],
				y: layer.get_y(d, t)[0]
			});
		for(var t = layer.lineStepNum() - 1; t >= 0; t--)
			lineData.push({
				x: layer.get_x(d, t)[1],
				y: layer.get_y(d, t)[1]
			});
		return lineData;
	};

	layer.dresser(function(sel){
		sel.attr("fill", function(d) {return layer.get_colour(d);})
			.attr("stroke-width", function(d) {return layer.get_lineWidth(d);})
			.attr("stroke-dasharray", function(d) {return layer.get_dasharray(d)})
			.attr("opacity", function(d) { return layer.get_opacity(d)} );
	});

	layer.layerDomainX(function() {
		var domain = [];
		layer.elementIds().map(function(id) {
			return d3.range(layer.lineStepNum()).map(function(e){
				if(domain.length == 0)
					domain = layer.get_x(id, e)
				else {
					domain[0] = d3.min(layer.get_x(id, e).concat(domain[0]));
					domain[1] = d3.max(layer.get_x(id, e).concat(domain[1]));
				}
			})
		});

		return domain;
	})

	layer.layerDomainY(function() {
		var domain = [];
		layer.elementIds().map(function(id) {
			return d3.range(layer.lineStepNum()).map(function(e){
				if(domain.length == 0)
					domain = layer.get_y(id, e)
				else {
					domain[0] = d3.min(layer.get_y(id, e).concat(domain[0]));
					domain[1] = d3.max(layer.get_y(id, e).concat(domain[1]));
				}
			})
		});

		return domain;
	})


	return layer.chart;
}