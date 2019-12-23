import { fillTextBlock } from "./additionalFunctions";
import { get_symbolSize } from "./additionalFunctions";

export function legend(chart) {
	var legend = lc.base()
		.add_property("width", 200)
		.add_property("height", function() {return chart.height();})
		.add_property("sampleHeight", 20)
		.add_property("titles", {})
		.add_property("ncol")
		.add_property("container");

	var blocks = {};
	legend.chart = chart;

	legend.set_title = function(titles) {
		var curTitles = legend.titles();
		for(var i in titles) 
			curTitles[i] = titles[i];
		
		legend.titles(curTitles);

		return legend;
	}

	legend.get_nblocks = function() {
		return Object.keys(blocks).length;
	}

	legend.add_block = function(scale, type, id, layer){
		//scale can be an array or d3 scale. If scale is an array,
		//we need to turn it into a scale
		var block = {};
		if(typeof scale === "function")
			block.scale = scale
		else
			block.scale = function() {return scale;};
		
		if(typeof layer !== "undefined")
			block.layer = layer;
		if(["colour", "size", "symbol", "dash"].indexOf(type) == -1)
			throw "Error in 'legend.add_block': " + type + " is not a suitable type of legend block. " +
				"Please, use one of these: 'colour', 'size', 'symbol', 'dash'";
		block.type = type;

		blocks[id] = block;
		
		if(legend.container())
			updateGrid();

		return legend.chart;
	}

	legend.updateScale = function(scale, id){
		if(typeof blocks[id] === "undefined")
			throw "Error in 'legend.updateScale': A block with ID " + id +
				" is not defined";
		blocks[id].scale = scale;
		legend.updateBlock(id);

		return legend.chart;
	}

	 var convertScale = function(id) {
		var scale, newScale;
		if(typeof blocks[id].scale === "function")
			scale = blocks[id].scale();
		if(typeof scale === "undefined" || 
				(typeof scale !== "function" && typeof scale.splice === "undefined"))
			scale = blocks[id].scale;
		
		if(typeof scale !== "function"){
			var scCont = false,
				rCont = false;
			if(scale.length == 1)
				throw "Error in 'legend.convertScale': range of the scale is not defined.";
			if(scale[0].length == 2 && typeof scale[0][0] === "number" && 
																typeof scale[0][1] === "number")
				scCont = true;
			if(blocks[id].type == "colour" && scale[0].length != scale[1].length)
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
			blocks[id].domain = scale[0];
			if(typeof newScale.domain === "undefined")
				newScale.domain = blocks[id].domain;
		} else {
			//scale is a function it is either a d3 scale or it has a domain property
			if(typeof scale !== "function")
				throw "Error in 'legend.convertScale': the type of scale argument is not suported. " +
					"Scale should be an array or a function."
			var domain;
			typeof scale.domain === "function" ? domain = scale.domain() : domain = scale.domain;
			if(typeof domain === "undefined")
				throw "Error in 'legend.convertScale': the domain of the scale is not defined.";
			//look for undefined values in the domain and remove them
			var i = 0;
			while(i < domain.length)
				if(domain[i] === undefined)
					domain.splice(i, 1)
				else
					i++;

			blocks[id].domain = domain;
			newScale = scale;
			if(scale.steps)
				newScale.steps = scale.steps
			else {
				var allNum = true;
				i = 0;

				while(allNum && i < domain.length) {
					allNum = allNum && typeof domain[i] === "number";
					i++;
				}
				if(allNum)
					domain = d3.extent(domain);

				domain.length == 2 && typeof domain[0] === "number" ? newScale.steps = 9 : newScale.steps = domain.length;
			} 
		}
		return newScale;
	}

	legend.removeBlock = function(id) {
		if(typeof blocks[id] === "undefined")
			throw "Error in 'legend.remove': block with ID " + id +
			" doesn't exist";
		if(typeof blocks[id].layer !== "undefined")
			blocks[id].layer.legendBlocks.splice(
				blocks[id].layer.legendBlocks.indexOf(id), 1
			);
		delete blocks[id];
		legend.container().select("#" + id).remove();
		updateGrid();

		return legend.chart;
	}

	legend.renameBlock = function(oldId, newId) {
		blocks[newId] = blocks[oldId];
		delete blocks[oldId];
		if(typeof blocks[newId].layer !== "undefined")
			blocks[newId].layer.legendBlocks.splice(
				blocks[newId].layer.legendBlocks.indexOf(oldId), 1, newId
			);
		if(legend.container()){
			legend.container().select("#" + oldId)
				.attr("id", newId);
			legend.updateBlock(newId);
		}

		return legend.chart;
	}
var updateGrid = function() {
		//define optimal layout for all the blocks
		//and create a table
		var bestWidth, bestHeight,
			n = Object.keys(blocks).length;

		if(typeof legend.ncol() === "undefined"){
			var minSum = 1 + n, j;
			bestHeight = 1; 
			for(var i = 2; i <= Math.ceil(Math.sqrt(n)); i++){
				j =  Math.ceil(n / i);
				if(i + j <= minSum){
					minSum = i + j;
					bestHeight = i;
				}
			}
			bestWidth = Math.ceil(n / bestHeight);
		} else {
			bestWidth = legend.ncol();
			bestHeight = Math.ceil(n / bestWidth);
		}
		legend.container().select(".legendTable").remove();
		legend.container().append("table")
			.attr("class", "legendTable")
			.selectAll("tr").data(d3.range(bestHeight))
				.enter().append("tr");
		legend.container().selectAll("tr").selectAll("td")
			.data(function(d) {
				return d3.range(bestWidth).map(function(e) {
					return [d, e];
				})
			})	
			.enter().append("td")
				.attr("id", function(d) {
					try{
						return Object.keys(blocks)[d[0] * bestWidth + d[1]]
										.replace(/[ .]/g, "_");
					} catch(exc) {return undefined;}
				});
		for(var i in blocks)
			legend.updateBlock(i);
	}


	legend.updateBlock = function(id){
		if(typeof blocks[id] === "undefined")
			throw "Error in 'legend.updateBlock': block with ID " + id +
				" is not defined";

		var scale = convertScale(id),
			tableCell = legend.container().select("#" + id.replace(/[ .]/g, "_")),
			cellWidth = legend.width() / legend.container().select("tr").selectAll("td").size(),
			steps = scale.steps,
			cellHeight = legend.sampleHeight() * steps;

		var blockSvg = tableCell.selectAll("svg");
		if(blockSvg.empty())
			blockSvg = tableCell.append("svg");
		blockSvg.attr("width", cellWidth)
			.attr("height", cellHeight);
	
		var title = blockSvg.select(".title");
		if(title.empty())
			title = blockSvg.append("g")
				.attr("class", "title");
		var titleWidth = d3.min([20, cellWidth * 0.2]);
		fillTextBlock(title, cellHeight, titleWidth, (legend.titles()[id] == "") ? "" : (legend.titles()[id] || id));
		title.attr("transform", "rotate(-90)translate(-" + cellHeight + ", 0)");

		var sampleValues;
		if(blocks[id].domain.length == steps)
			sampleValues = blocks[id].domain;
		else
			sampleValues = d3.range(steps).map(function(e) {
				var l = blocks[id].domain.length - 1;
				return (blocks[id].domain[l] - e * 
								(blocks[id].domain[l] - blocks[id].domain[0]) / 
								(steps - 1));
			})
		var sampleData = [],n;
		for(var i = 0; i < sampleValues.length; i++){
			if(typeof sampleValues[i] === "number")
				if(Math.abs(sampleValues[i] >= 1 || sampleValues[i] == 0))
					sampleValues[i] = sampleValues[i].toFixed(2)
				else {
					n = 1 - Math.floor(Math.log(Math.abs(sampleValues[i]))/Math.log(10));
					if(n > 5)
						sampleValues[i] =  sampleValues[i].toExponential()
					else	
						sampleValues[i] =  sampleValues[i].toFixed(n);
				}	
					

			sampleData.push([sampleValues[i]]);
		}
		
		var samples = blockSvg.selectAll(".sample").data(sampleData);
		samples.exit().remove();
		samples.enter().append("g")
			.attr("class", "sample")
			.merge(samples)
				.attr("transform", function(d, i) {
					return "translate(" + (titleWidth + 1) + ", " + 
									(i * legend.sampleHeight()) + ")";
				});

		if(blocks[id].type == "colour"){
			var rect = blockSvg.selectAll(".sample").selectAll("rect").data(function(d){
				return d;
			});
			rect.enter().append("rect")
				.merge(rect)
					.attr("width", titleWidth)
					.attr("height", legend.sampleHeight())
					.attr("fill", function(d) {return scale(d)});
		}
		if(blocks[id].type == "symbol"){
			var size = d3.min([legend.sampleHeight() / 2, 
													titleWidth / 2]);
			var symbols = blockSvg.selectAll(".sample").selectAll("path").data(function(d){
				return d;
			});
			symbols.enter().append("path")
				.merge(symbols)
					.attr("d", function(d) {
						return d3.symbol()
							.type(d3["symbol" + scale(d)])
							.size(get_symbolSize(scale(d), size))();
					})
					.attr("transform", "translate(" + size + ", " + size + ")");
		}
		if(blocks[id].type == "dash"){
			var lines = blockSvg.selectAll(".sample").selectAll("line").data(function(d){
				return d;
			});
			lines.enter().append("line")
				.style("stroke", "black")
			 	.merge(lines)
			 		.attr("x1", 0)
			 		.attr("x2", titleWidth)
			 		.attr("y1", legend.sampleHeight() / 2)
			 		.attr("y2", legend.sampleHeight() / 2)
			 		.attr("stroke-dasharray", function(d) {return scale(d)});
		}

		var sampleText = blockSvg.selectAll(".sample").selectAll("g").data(function(d){
			return (typeof d[0] === "number") ? [d[0].toString()] : d;
		});
		sampleText.enter().append("g")
			.merge(sampleText)
				.attr("transform", "translate(" + (titleWidth + 5) + ", 0)");
		blockSvg.selectAll(".sample").selectAll("g").each(function(d) {
			fillTextBlock(d3.select(this), cellWidth - 2 * titleWidth - 5, 
											legend.sampleHeight(), d
										);
		});		
	}
	legend.update = function() {
		updateGrid();
	}

	return legend;
}