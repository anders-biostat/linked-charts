import { axesChart } from "./axesChart";
import { check } from "./additionalFunctions";

export function barchart(id, chart){
	
	if(chart === undefined)
		chart = axesChart();
	if(id === undefined)
		id = "layer" + chart.get_nlayers();
	
	var layer = chart.create_layer(id).get_layer(id)
		.add_property("ngroups", undefined, check("number_nonneg", "ngroups"))
		.add_property("groupIds", undefined, check("array", "groupIds"))
		.add_property("nbars", undefined, check("number_nonneg", "nbars"))
		.add_property("barIds", undefined, check("array", "barIds"))
		.add_property("nstacks", undefined, check("number_nonneg", "nstacks"))
		.add_property("stackIds", undefined, check("array", "stackIds"))
		.add_property("value", undefined, function(value) {
			if(typeof value === "function")
				return value;

			var inds;
			if(typeof value === "object") {
				if(value.__inds__) {
					inds = value.__inds__;
					value.__inds__ = null;
				}
				var groups = Object.keys(value);
				if(typeof value[groups[0]] === "object") {
					var bars = Object.keys(value[groups[0]]);
					if(typeof value[groups[0]][bars[0]] === "object") {
						var stacks = Object.keys(value[groups[0]][bars[0]]);
						if(typeof value[groups[0]][bars[0]][stacks[0]] === "object")
							return function(groupId, barId, stackId) {
								if(inds) groupId = inds.indexOf(groupId) + 1;
								return value[groupId][barId][stackId][0];
							}
						else
							return function(groupId, barId, stackId) {
								if(inds) groupId = inds.indexOf[groupId] + 1;
								return value[groupId][barId][stackId];
							}
					}
				}
			}

		  throw "Error in 'typeCheck' for property 'value" + 
     			   "': the value is not an array or an object."

		})
		.add_property("groupWidth", 0.6)
		.add_property("stroke", "#444")
		.add_property("strokeWidth", 0);

	layer.chart.syncProperties(layer);
	layer.type = "barchart";

	layer.chart.informText(function(groupId, barId, stackId){
			var id = groupId;
			if(layer.nbars() > 1) id += ", " + barId;
			if(layer.nstacks() > 1) id += ", " + stackId;
			return "ID: <b>" + id + "</b>;<br>" + 
            "value = " + layer.get_value(groupId, barId, stackId).toFixed(2)
		});

	//setting a number of elements or their IDs should replace
	//each other
	["group", "bar", "stack"].forEach(function(name){
		//if number of elements is set, define their IDs
		layer.wrapSetter("n" + name + "s", function(oldSetter){
			return function() {
				layer["get_" + name + "Ids"] = function(){
					return d3.range(oldSetter());
				};
				return oldSetter.apply(layer, arguments);
			}
		});
		//if element IDs are set, define their number
		layer.wrapSetter(name + "Ids", function(oldSetter){
			return function() {
				layer["get_n" + name + "s"] = function(){
					return oldSetter().length;
				};
				return oldSetter.apply(layer, arguments);
			}
		});
	});

	layer.nbars(1);
	layer.nstacks(1);
	layer.contScaleX(false);
	layer.elementIds(function(){
		if(layer.nbars() == 1 && layer.barIds()[0] == 0)
			return layer.stackIds();
		var ids = [], barIds = layer.barIds(), stackIds = layer.stackIds();
		for(var i = 0; i < layer.nbars(); i++)
			for(var j = 0; j < layer.nstacks(); j++)
				ids.push(barIds[i] + ", " + stackIds[j]);
		return ids;
	});
	layer.colourValue(function(id) {
		if(id.split && layer.nstacks() == 1 && (layer.stackIds()[0] == 0 || layer.stackIds()[0] == 1))
			return id.split(", ")[0].toString()
		else 
			return id.toString();
	});
	layer.colour(function(gropuId, barId, stackId) {
      if((layer.nbars() == 1) && (barId == 0))
      		return layer.colourScale(layer.get_colourValue(stackId))
      else
      	return layer.colourScale(layer.get_colourValue(barId + ", " + stackId));
    })
	layer.addColourScaleToLegend(true);

	layer.layerDomainX(function() {
		var groupIds = layer.groupIds();
		if(layer.contScaleX())
			return [d3.min(groupIds), d3.max(groupIds)]
		else
			return layer.groupIds();
	});
	layer.layerDomainY(function(){
		//go through all bars and find the highest
		var barIds = layer.barIds(),
			groupIds = layer.groupIds(),
			stackIds = layer.stackIds(),
			maxHeight = 0, curHeihgt;
		for(var i = 0; i < layer.ngroups(); i++)
			for(var j = 0; j < layer.nbars(); j++){
				curHeihgt = 0;
				for(var k = 0; k < layer.nstacks(); k++)
					curHeihgt += layer.get_value(groupIds[i], barIds[j], stackIds[k]);
				if(curHeihgt > maxHeight) maxHeight = curHeihgt;
			}

		return [0, maxHeight];
	});

  //default hovering behaviour
  layer.elementMouseOver(function(d){
    var pos = d3.mouse(chart.container.node());
    //change colour and class
    d3.select(this)
      .attr("fill", function(d) {
        return d3.rgb(layer.get_colour(d[0], d[1], d[2])).darker(0.5);
      })
      .classed("hover", true);
    //show label
    layer.chart.container.select(".inform")
        .style("left", (pos[0] + 10) + "px")
        .style("top", (pos[1] + 10) + "px")
        .select(".value")
          .html(layer.get_informText(d[0], d[1], d[2]));  
    layer.chart.container.select(".inform")
      .classed("hidden", false);
  });
  layer.elementMouseOut(function(d){
    d3.select(this)
      .attr("fill", function(d) {
        return layer.get_colour(d[0], d[1], d[2]);
      })
      .classed("hover", false);
    layer.chart.container.select(".inform")
      .classed("hidden", true);
  });


	layer.findElements = function(lu, rb){
		return layer.g.selectAll(".data_element")
			.filter(function(){
				var x = +d3.select(this).attr("x"),
					y = +d3.select(this).attr("y"),
					width = +d3.select(this).attr("width"),
					height = +d3.select(this).attr("height");

				return (lu[0] <= x + width && rb[0] > x && 
								lu[1] <= y + height && rb[1] > y)
			}).data();
	}
	layer.get_position = function(id){
		//gets id as data (so here we have an array of three ids)
		return [layer.g.select("#p" + id.join("_")).attr("x"),
						layer.g.select("#p" + id.join("_")).attr("y")];
	}

	layer.updateElementPosition = function(){
		var groupWidth, groupIds = layer.groupIds();
		if(layer.contScaleX())
			groupWidth = Math.abs(layer.chart.axes.scale_x(groupIds[1]) - layer.chart.axes.scale_x(groupIds[0])) * layer.groupWidth()
		else
			groupWidth = layer.chart.axes.scale_x.step() * layer.groupWidth();

		var barWidth = groupWidth/layer.nbars(),
			//for now it's just a linear scale
			heightMult = Math.abs(layer.chart.axes.scale_y(1) - layer.chart.axes.scale_y(0)),
			groupScale = d3.scaleLinear()
				.domain([0, layer.nbars() - 1])
				.range([-groupWidth/2, groupWidth/2 - barWidth]),
			barIds = layer.barIds(),
			stackIds = layer.stackIds();
		if(layer.chart.transitionDuration() > 0 && !layer.chart.transitionOff){
			layer.g.selectAll(".data_element").transition("elementPosition")
				.duration(layer.chart.transitionDuration())
				.attr("width", barWidth)
				.attr("height", function(d){ 
					return layer.get_value(d[0], d[1], d[2]) * heightMult;
				})
				.attr("x", function(d){
					if(layer.chart.axes.scale_x(d[0]) == undefined)
						return -500;
					return groupScale(barIds.indexOf(d[1])) + 
						layer.chart.axes.scale_x(d[0]);
				})
				.attr("y", function(d){
					var height = 0;
					for(var i = 0; i <= stackIds.indexOf(d[2]); i++)
						height += layer.get_value(d[0], d[1], stackIds[i]);
					return layer.chart.axes.scale_y(height);
				})
		}	else {
			layer.g.selectAll(".data_element")
				.attr("width", barWidth)
				.attr("height", function(d){ 
					return layer.get_value(d[0], d[1], d[2]) * heightMult;
				})
				.attr("x", function(d){
					if(layer.chart.axes.scale_x(d[0]) == undefined)
						return -500;
					return groupScale(barIds.indexOf(d[1])) + 
						layer.chart.axes.scale_x(d[0]);
				})
				.attr("y", function(d){
					var height = 0;
					for(var i = 0; i <= stackIds.indexOf(d[2]); i++)
						height += layer.get_value(d[0], d[1], stackIds[i]);
					return layer.chart.axes.scale_y(height);
				});
		}

		return layer;			
	}
	layer.updateElementStyle = function(){
		layer.resetColourScale();
    var sel = layer.g.selectAll(".data_element");
    if(layer.chart.transitionDuration() > 0 && !layer.chart.transitionOff)
      sel = sel.transition("elementStyle")
        .duration(layer.chart.transitionDuration());

		sel
			.attr("fill", function(d) {
				return layer.get_colour(d[0], d[1], d[2]);
			})
			.attr("stroke", function(d) {
				return layer.get_stroke(d[0], d[1], d[2]);
			})
			.attr("stroke-width", function(d) {
				return layer.get_strokeWidth(d[0], d[1], d[2]);
			})
			.attr("opacity", function(d){
				return layer.get_opacity(d[0], d[1], d[2]);
			});

			if(layer.chart.get_marked().length != 0)
				layer.colourMarked();

	}

	layer.updateElements = function(){
		
		var groups = layer.g.selectAll(".group")
			.data(layer.groupIds(), function(d) {return d;});
		groups.exit()
			.remove();
		groups.enter()
			.append("g")
				.attr("class", "group");

		var bars = layer.g.selectAll(".group").selectAll(".bar")
			.data(function(d) {
				return layer.barIds().map(function(e){
					return [d, e];
				})
			}, function(d) {return d;});
		bars.exit()
			.remove();
		bars.enter()
			.append("g")
				.attr("class", "bar");

		var stacks = layer.g.selectAll(".group").selectAll(".bar").selectAll(".data_element")
			.data(function(d){
				return layer.stackIds().map(function(e){
					return d.concat(e);
				})
			}, function(d) {return d;});
		stacks.exit()
			.remove();
		stacks.enter()
			.append("rect")
				.attr("class", "data_element")
				.merge(stacks)
					.attr("id", function(d) {return "p" + layer.id + "_" + d.join("_").replace(/[ .]/g, "_")})
					.on( "click", function(d) {layer.get_on_click(d[0], d[1], d[2])} )
        	.on( "mouseover", layer.get_elementMouseOver )
        	.on( "mouseout", layer.get_elementMouseOut );		
	}

	return layer.chart;
}