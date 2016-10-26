import { getEuclideanDistance } from "./additionalFunctions";
import { tableChartBase } from "./chartBase";
import { add_click_listener } from "./additionalFunctions";

export function heatmapChart(id, chart){

	if(chart === undefined)
		chart = tableChartBase();
	if(id === undefined)
		id = "layer" + chart.layers.length;
	
	//TO DO: See if we need colIds and rowIds to be stored separately for
	//each layer
	
	var layer = chart.add_layer(id)
		.add_property("value")
		.add_property("mode", "default")
		.add_property("colour", function(val) {return layer.colourScale(val);})
		.add_property("palette", d3.interpolateOrRd)
		.add_property("colourRange", function() {return layer.dataRange()})
		.add_property("labelClick", function() {})
		.add_property("cellMouseOver", function() {})
		.add_property("cellMouseOut", function() {})
		.add_property("clusterRowsMetric", getEuclideanDistance)
		.add_property("clusterColsMetric", getEuclideanDistance);
	
	chart.setActiveLayer(id);
	
	//returns maximum and minimum values of the data
	layer.dataRange = function(){
		var i = 0, range, newRange,
			rowIds = layer.get_rowIds(),
			colIds = layer.get_colIds();
		do{
			newRange = d3.extent(colIds, 
				function(col) {return layer.get_value(rowIds[i], col);});
			if(typeof range === "undefined")
				range = newRange;
			if(newRange[0] < range[0])
				range[0] = newRange[0];
			if(newRange[1] > range[1])
				range[1] = newRange[1];
			i++;
		}while (i < layer.get_nrows())
			
		return range;
	}

	//find all the cells inside a rectangle
	layer.findPoints = function(lu, rb){
		return layer.g.selectAll(".data_point")
			.filter(function(d) {
				var loc = [layer.chart.axes.scale_x(layer.chart.get_heatmapCol(d[1])), 
									layer.chart.axes.scale_y(layer.get_heatmapRow(d[0]))]
				return (loc[0] <= rb[0]) && (loc[1] <= rb[1]) && 
					(loc[0] + layer.chart.cellSize.width >= lu[0]) && 
					(loc[1] + layer.chart.cellSize.height>= lu[1]);
			});
	}
		
	//reset a colourScale
	//by default this function is to be called during each update
	//yet some transformations, such as zooming, will avoid it
	layer.resetColourScale = function(){
	//create colorScale
		var range = layer.get_colourRange();
		var scale = d3.scaleSequential(layer.get_palette).domain(range);
		/*
		layer.colourScale = function(val){
			val = (val - range[0]) / 
				(range[1] - range[0]);
			return scale(val);
		} */
		
		layer.colourScale = scale;
	}	
	
	/*var inherited_put_static_content = layer.put_static_content;
	layer.put_static_content = function(element){	
		inherited_put_static_content(element);
		layer.resetColourScale();
	}
	*/
	
	//some default onmouseover and onmouseout behaviour for cells and labels
	//may be later moved out of the main library
	layer.cellMouseOver(function(d) {
		//change colour and class
		d3.select(this)
			.attr("fill", function(d) {
				return d3.rgb(layer.get_colour(layer.get_value(d[0], d[1]))).darker(0.5);
			})
			.classed("hover", true);		
		//find column and row labels
		layer.chart.svg.select(".col").selectAll(".label")
			.filter(function(dl) {return dl == d[1];})
				.classed("hover", true);
		layer.chart.svg.select(".row").selectAll(".label")
			.filter(function(dl) {return dl == d[0];})
				.classed("hover", true);
		//show label
		layer.chart.container.select(".inform")
				.style("left", (d3.event.pageX + 10) + "px")
				.style("top", (d3.event.pageY - 10) + "px")
				.select(".value")
					.html("Row: <b>" + d[0] + "</b>;<br>" + 
						"Col: <b>" + d[1] + "</b>;<br>" + 
						"value = " + layer.get_value(d[0], d[1]));  
		layer.chart.container.select(".inform")
			.classed("hidden", false);
	});
	layer.cellMouseOut(function() {
		//change colour and class
		d3.select(this)
			.attr("fill", function(d) {
				return layer.get_colour(layer.get_value(d[0], d[1]));
			})
			.classed("hover", false);
		//deselect row and column labels
		layer.chart.svg.selectAll(".label")
			.classed("hover", false);
		layer.chart.container.select(".inform")
			.classed("hidden", true);
	});
	
	//set default clicking behaviour for labels (ordering)
	layer.labelClick(function(d){
		//check whether row or col label has been clicked
		var type;
		d3.select(this.parentNode).classed("row") ? type = "row" : type = "col";
		//if this label is already selected, flip the heatmap
		if(d3.select(this).classed("selected")){
			type == "col" ? layer.chart.reorderRow("flip") : layer.chart.reorderCol("flip");
			layer.chart.update();
		} else {
			//unselect other
			layer.chart.svg.select("." + type).selectAll(".label")
				.classed("selected", false);
			//select new label and chage ordering
			d3.select(this).classed("selected", true);
			if(type == "col")
				layer.chart.reorderRow(function(a, b){
					return layer.get_value(b, d) - layer.get_value(a, d);
				})
			else
				layer.chart.reorderCol(function(a, b){
					return layer.get_value(d, b) - layer.get_value(d, a);
				});
			layer.chart.update();
		}
	});
	
	//layer.update_not_yet_called = true;
	
	layer.updateColour = function() {
		layer.g.selectAll(".data_point")
			.attr("fill", function(d) {
				return layer.get_colour(layer.get_value(d[0], d[1]));
			});
	}
	
	layer.updateSVG = function() {
		
		if(typeof layer.canvas != "undefined")
			layer.canvas.classed("hidden", true);
		if(typeof layer.g == "undefined"){
			layer.g = layer.chart.svg.append("g");
			add_click_listener(layer);
		} else {
			layer.g.classed("hidden", false);
		}
				
		//resize heatmap body
		layer.g.transition(layer.chart.transition)
			.attr("transform", "translate(" + layer.get_margin().left + ", " +
					layer.get_margin().top + ")");
					
		//add rows
		var rows = layer.g.selectAll(".data_row").data(layer.get_rowIds().slice());
		rows.exit()
			.remove();
		rows.enter()
			.append("g")
				.attr("class", "data_row")
			.merge(rows).transition(layer.chart.transition)
				.attr("transform", function(d) {
					return "translate(0, " + 
						layer.chart.axes.scale_y(layer.get_heatmapRow(d)) + ")";
				});
						
		//add cells	
		var cells = layer.g.selectAll(".data_row").selectAll(".data_point")
			.data(function(d) {
				return layer.get_colIds().map(function(e){
					return [d, e];
				})
			});
		cells.exit()
			.remove();
		cells.enter()
			.append("rect")
				.attr("class", "data_point")
				.on("mouseover", layer.get_cellMouseOver)
				.on("mouseout", layer.get_cellMouseOut)
				.on("click", layer.get_on_click)
			.merge(cells).transition(layer.chart.transition)
				.attr("x", function(d){
					return layer.chart.axes.scale_x(layer.chart.get_heatmapCol(d[1]));
				})
				.attr("width", layer.chart.cellSize.width)
				.attr("height", layer.chart.cellSize.height);
		layer.updateColour();
		//TO DO: See if it's better to do something more clever about having several layers
		layer.chart.svg
			.selectAll(".label")
			.on("click", layer.get_labelClick);
	}
	layer.updateCanvas = function() {
	
		if(typeof layer.g != "undefined")
			layer.g.classed("hidden", true);
		if(typeof layer.canvas == "undefined")
			layer.canvas = layer.chart.container.append("canvas")
		else
			layer.canvas.classed("hidden", false);

		//if there is any canvas, remove it as well
		layer.canvas.remove();
		
		//create a canvas object
		var heatmapBody = layer.chart.container.append("canvas")
			.style("position", "absolute")
			.style("left", layer.get_margin().left + "px")
			.style("top", layer.get_margin().top + "px")
			.property("width", layer.get_width())
			.property("height", layer.get_height())
			.node().getContext("2d");
		var pixelHeatmap = document.createElement("canvas");
		pixelHeatmap.width = layer.get_ncols();
		pixelHeatmap.height = layer.get_nrows();
		
		//store colour of each cell
		var rgbColour, position;
		//create an object to store information on each cell of a heatmap
		var pixelData = new ImageData(layer.get_ncols(), layer.get_nrows());

		for(var i = 0; i < layer.get_rowIds().length; i++)
			for(var j = 0; j < layer.get_colIds().length; j++) {
					rgbColour = d3.rgb(layer.get_colour(layer.get_value(layer.get_rowIds()[i], 
																													layer.get_colIds()[j])));
					position = layer.get_heatmapRow(layer.get_rowIds()[i]) * layer.get_ncols() * 4 +
						layer.get_heatmapCol(layer.get_colIds()[j]) * 4;
					pixelData.data[position] = rgbColour.r;
					pixelData.data[position + 1] = rgbColour.g;
					pixelData.data[position + 2] = rgbColour.b;
			}
		//set opacity of all the pixels to 1
		for(var i = 0; i < layer.get_ncols() * layer.get_nrows(); i++)
			pixelData.data[i * 4 + 3] = 255;
		
		//put a small heatmap on screen and then rescale it
		pixelHeatmap.getContext("2d").putImageData(pixelData, 0 , 0);

		heatmapBody.imageSmoothingEnabled = false;
		//probaly no longer required, but let it stay here just in case
    //heatmapBody.mozImageSmoothingEnabled = false;
		//heatmapBody.webkitImageSmoothingEnabled = false;
    //heatmapBody.msImageSmoothingEnabled = false;

		heatmapBody.drawImage(pixelHeatmap, 0, 0, 
			layer.get_colIds().length, layer.get_rowIds().length,
			0, 0,	layer.get_width(), layer.get_height());
	}
	
	layer.update = function() {
		
		//if(layer.update_not_yet_called){
		//	layer.update_not_yet_called = false;
		//	layer.resetColourScale();
		//}
		
		layer.resetColourScale();
	
		if(layer.get_mode() == "default")
			layer.get_ncols() * layer.get_nrows() > 5000 ? layer.mode("canvas") : layer.mode("svg");
		
		if(layer.get_mode() == "canvas") {
			layer.updateCanvas();
			return layer;
		}
		if(layer.get_mode() == "svg") {
			layer.updateSVG();
			return layer;
		}
		
		throw "Error in function 'heatmapChart.update': mode did not correspond to any " +
			"existing type ('canvas', 'svg' or 'default')";
	}
	
	layer.clusterRows = function(){
		var items = {}, it = [],
			rowIds = layer.get_rowIds(),
			colIds = layer.get_colIds();
		
		for(var i = 0; i < rowIds.length; i++) {
			for(var j = 0; j < colIds.length; j++)
				it.push(layer.get_value(rowIds[i], colIds[j]));
			items[rowIds[i]] = it.slice();
			it = [];
		}
		
		var getDistance = function(a, b) {
			return layer.get_clusterRowsMetric(items[a], items[b]);
		}
		
		var newOrder = [];
		var traverse = function(node) {
			if(node.value){
				newOrder.push(node.value);
				return;
			}
			traverse(node.left);
			traverse(node.right);
		}
		
		var clusters = clusterfck.hcluster(rowIds, getDistance, clusterfck.COMPLETE_LINKAGE);
		traverse(clusters);
		
		layer.chart.reorderRow(function(a, b){
			return newOrder.indexOf(a) - newOrder.indexOf(b);
		});
		
		layer.chart.update();
	}
	
	layer.clusterCols = function(){
		var items = {}, it = [],
			rowIds = layer.get_rowIds(),
			colIds = layer.get_colIds();
		
		for(var i = 0; i < colIds.length; i++) {
			for(var j = 0; j < rowIds.length; j++)
				it.push(layer.get_value(rowIds[j], colIds[i]));
			items[colIds[i]] = it.slice();
			it = [];
		}

		
		var getDistance = function(a, b) {
			return layer.get_clusterColsMetric(items[a], items[b]);
		}
		
		var newOrder = [];
		var traverse = function(node) {
			if(node.value){
				newOrder.push(node.value);
				return;
			}
			traverse(node.left);
			traverse(node.right);
		}
		
		var clusters = clusterfck.hcluster(colIds, getDistance, clusterfck.COMPLETE_LINKAGE);
		traverse(clusters);
		
		layer.chart.reorderCol(function(a, b){
			return newOrder.indexOf(a) - newOrder.indexOf(b);
		});
		
		layer.chart.update();
	}
	
	return layer;
}