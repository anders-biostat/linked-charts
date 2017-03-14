import { base } from "./base";
import { fillTextBlock } from "./additionalFunctions"

export function legend(chart) {
	var legend = base()
		.add_property("width", function() {return chart.margin().right;})
		.add_property("height", function() {return chart.plotHeight();})
		.add_property("x", function() {return chart.plotWidth() + chart.margin().left;})
		.add_property("y", function() {return chart.margin().top;})
		.add_property("alignX")
		.add_property("alignY");

	legend.blocks = {};
	legend.chart = chart;

	legend.add = function(scale, type, id, layer){
		legend.chart.set_margin({right: d3.max([75, legend.chart.margin().right])});
		//scale can be an array or d3 scale. If scale is an array,
		//we need to turn it into a scale
		var block = {};
		if(typeof scale === "function")
			block.scale = scale
		else
			block.scale = function() {return scale;};
		if(typeof layer !== "undefined")
			block.layer = layer;
		if(["colour", "size", "style"].indexOf(type) == -1)
			throw "Error in 'legend.add': " + type + " is not a suitable type of legend block. " +
				"Please, use one of these: 'colour', 'size', 'style'";
		block.type = type;

		legend.blocks[id] = block;
		//legend.update();

		return legend.chart;
	}

	legend.convertScale = function(id) {
		var scale, newScale;
		try{
			scale = legend.blocks[id].scale();
		} catch (exc) {
			scale = legend.blocks[id].scale;
		}
		if(typeof scale !== "function" && typeof scale.splice === "undefined")
			scale = legend.blocks[id].scale;
		
		if(typeof scale !== "function"){
			var scCont = false,
				rCont = false;
			if(scale.length == 1)
				throw "Error in 'legend.add': range of the scale is not defined.";
			if(scale[0].length == 2 && typeof scale[0][0] === "number" && 
																typeof scale[0][1] === "number")
				scCont = true;
			if(legend.blocks[id].type == "colour" && scale[0].length != scale[1].length)
				rCont = true;
			if(scale[1].length == 2 && typeof scale[0][0] === "number" && 
																typeof scale[0][1] === "number")
				rCont = true;
			if(scCont && rCont){
				newScale = d3.scaleLinear()
					.domain(scale[0])
					.range(scale[1]);
				scale.steps ? newScale.steps = scale.steps : newScale.steps = 9;
			}
			if(scCont && !rCont){
				newScale = d3.scaleQuantize()
					.domain(scale[0])
					.range(scale[1]);
				newScale.steps = scale[1].length;
			}
			if(!scCont && rCont){
				newScale = d3.scalePoint()
					.domain(scale[0])
					.range(scale[1]);
				newScale.steps = scale[0].length;
			}
			if(!scCont && !rCont){
				if(scale[0].length > scale[1].length)
					scale[0].splice(scale[1].length);
				if(scale[1].length > scale[0].length)
					scale[1].splice(scale[0].length);
				newScale = d3.scaleOrdinal()
					.domain(scale[0])
					.range(scale[1]);
				newScale.steps = scale[0].length;				
			}
			legend.blocks[id].domain = scale[0];
		} else {
			//scale is a function it is either a d3 scale or it has a domain property
			if(typeof scale !== "function")
				throw "Error in 'legend.add': the type of scale argument is not suported. " +
					"Scale should be an array or a function."
			var domain;
			scale().domain ? domain = scale().domain() : domain = scale.domain;
			if(typeof domain === "undefined")
				throw "Error in 'legend.add': the domain of the scale is not defined.";
			legend.blocks[id].domain = domain;
			newScale = scale;
			if(scale.steps)
				newScale.steps = scale.steps
			else {
				domain.length == 2 ? newScale.steps = 9 : newScale.steps = domain.length;
			} 
		}
		return newScale;
	}

	legend.remove = function(id) {
		if(typeof legend.blocks[id] === "undefined")
			throw "Error in 'legend.remove': block with ID " + id +
			" doesn't exist";
		if(typeof legend.blocks[id].layer !== "undefined")
			legend.blocks[id].layer.legendBlocks.splice(
				legend.blocks[id].layer.legendBlocks.indexOf(id), 1
			);
		delete legend.blocks[id];
		legend.g.select("#" + id).remove();
		legend.update();

		return legend.chart;
	}

	legend.rename = function(oldId, newId) {
		legend.blocks[newId] = legendBlocks.blocks[oldId];
		delete legend.blocks[oldId];
		if(typeof legend.blocks[newId].layer !== "undefined")
			legend.blocks[newId].layer.legendBlocks.splice(
				legend.blocks[newId].layer.legendBlocks.indexOf(oldId), 1, newId
			);
		legend.g.select("#" + oldId)
			.attr("id", newId);
		legend.update();

		return legend.chart;
	}
	legend.updateGrid = function() {
		//assume that optimal side ratio of each block is 2:1
		//define optimal layout for all the blocks
		var n = Object.keys(legend.blocks).length,
			minVacantArea = legend.width() * legend.height(),
			bestLayout, j, blockHeight, blockWidth; 
		for(var i = 1; i <= Math.floor(Math.sqrt(n)); i++){
			j =  Math.ceil(n / i);
			blockHeight = d3.min([legend.height() / i, legend.width() * 2 / j]);
			blockWidth = d3.min([blockHeight / 2, legend.width() / j]);
			if(minVacantArea > legend.height() * legend.width() - blockHeight * blockWidth * n){
				minVacantArea = legend.height() * legend.width() - blockHeight * blockWidth * n;
				bestLayout = [i, j];
			}
		}
		blockWidth = legend.width() / bestLayout[1];
		blockHeight = legend.height() / bestLayout[0];
		var row = 0, col = 0;
		for(var i in legend.blocks){
			legend.blocks[i].width = blockWidth;
			legend.blocks[i].height = blockHeight;
			legend.blocks[i].x = col * blockWidth;
			legend.blocks[i].y = row * blockHeight;
			col++;
			if(col == bestLayout[1]){
				col = 0;
				row++;
			}
		} 
	}
	legend.updateBlock = function(id){
		var scale = legend.convertScale(id);
		legend.blocks[id].height = d3.min([legend.blocks[id].height, scale.steps * 20]);
		if(typeof legend.blocks[id] === "undefined")
			throw "Error in 'legend.updateBlock': block with ID " + id +
				" is not defined."
		//redraw the block
		var block_g = legend.g.select("#" + id);
		if(block_g.empty())
			block_g = legend.g.append("g")
				.attr("id", id);
		block_g.attr("transform", "translate(" + legend.blocks[id].x + ", " 
																+ legend.blocks[id].y + ")");
		
		var title = block_g.select(".title");
		if(title.empty())
			title = block_g.append("g")
				.attr("class", "title");
		fillTextBlock(title, legend.blocks[id].height, legend.blocks[id].width * 0.2, id);
		title.attr("transform", "rotate(-90)translate(-" + legend.blocks[id].height + ", 0)");

		var sampleValues;
		if(legend.blocks[id].domain.length == scale.steps)
			sampleValues = legend.blocks[id].domain;
		else
			sampleValues = d3.range(scale.steps).map(function(e) {
				return legend.blocks[id].domain[0] + e * (legend.blocks[id].domain[1] - legend.blocks[id].domain[0]) / 
																			(scale.steps - 1)
			})
		var sampleData = [];
		for(var i = 0; i < sampleValues.length; i++)
			sampleData.push([sampleValues[i]]);
		
		var samples = block_g.selectAll(".sample").data(sampleData);
		samples.exit().remove();
		samples.enter().append("g")
			.attr("class", "sample")
			.merge(samples)
				.attr("transform", function(d, i) {
					return "translate(" + legend.blocks[id].width*0.2 + ", " + 
									(i * legend.blocks[id].height / scale.steps) + ")";
				});

		if(legend.blocks[id].type == "colour"){
			var rect = block_g.selectAll(".sample").selectAll("rect").data(function(d){
				return d;
			});
			rect.enter().append("rect")
				.merge(rect)
					.attr("width", d3.min([legend.blocks[id].width * 0.2 ,20]))
					.attr("height", legend.blocks[id].height / scale.steps)
					.attr("fill", function(d) {return scale(d)});
			
			var sampleText = block_g.selectAll(".sample").selectAll("g").data(function(d){
				return (typeof d[0] === "number") ? [d[0].toString()] : d;
			});
			sampleText.enter().append("g")
				.merge(sampleText)
					.attr("transform", "translate(" + (legend.blocks[id].width * 0.25) + ", 0)");
			block_g.selectAll(".sample").selectAll("g").each(function(d) {
				fillTextBlock(d3.select(this), legend.blocks[id].width * 0.55, 
												legend.blocks[id].height / scale.steps, d
											);
			});	
		}
		if(legend.blocks[id].type == "size"){

		}
	}
	legend.update = function() {
		legend.g
			.attr("transform", "translate(" + legend.x() + ", " + legend.y() + ")");
		legend.updateGrid();
		for(var k in legend.blocks)
			legend.updateBlock(k);

		return legend.chart;
	}

	return legend;
}