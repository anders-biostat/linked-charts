export function heatmapChart(chart, id){
	
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
		.add_property("cellMouseOut", function() {});
	
	//returns maximum and minimum values of the data
	layer.dataRange = function(){
		var i = 0, range, newRange;
		do{
			newRange = d3.extent(layer.chart.get_colIds(), 
				function(col) {return layer.get_value(layer.chart.get_rowIds()[i], col);});
			if(typeof range === "undefined")
				range = newRange;
			if(newRange[0] < range[0])
				range[0] = newRange[0];
			if(newRange[1] > range[1])
				range[1] = newRange[1];
			i++;
		}while (i < layer.chart.get_nrows())
			
		return range;
	}
		
	//reset a colourScale
	//by default this function is to be called during each update
	//yet some transformations, such as zooming, will avoid it
	layer.resetColourScale = function(){
	//create colorScale
		var scale = d3.scaleSequential(layer.get_palette);
		layer.colourScale = function(val){
			val = (val - layer.get_colourRange()[0]) / 
				(layer.get_colourRange()[1] - layer.get_colourRange()[0]);
			return scale(val);
		}
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
		if(typeof layer.g == "undefined")
			layer.g = layer.chart.svg.append("g")
		else
			layer.g.classed("hidden", false);
				
		//resize heatmap body
		layer.g.transition(layer.chart.transition)
			.attr("transform", "translate(" + layer.chart.get_margin().left + ", " +
					layer.chart.get_margin().top + ")");
					
		//add rows
		var rows = layer.g.selectAll(".data_row").data(layer.chart.get_rowIds().slice());
		rows.exit()
			.remove();
		rows.enter()
			.append("g")
				.attr("class", "data_row")
			.merge(rows).transition(layer.chart.transition)
				.attr("transform", function(d) {
					return "translate(0, " + 
						layer.chart.axes.scale_y(layer.chart.get_heatmapRow(d)) + ")";
				});
						
		//add cells	
		var cells = layer.g.selectAll(".data_row").selectAll(".data_point")
			.data(function(d) {
				return layer.chart.get_colIds().map(function(e){
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
		
		//if there is a g object for heatmap body, remove it
		obj.real_svg.selectAll(".heatmapBody").remove();
		//if there is any canvas, remove it as well
		obj.real_svg.selectAll("canvas").remove();
		
		//create a canvas object
		var heatmapBody = obj.real_div.append("canvas")
			.style("position", "absolute")
			.style("left", obj.get_margin().left + "px")
			.style("top", obj.get_margin().top + "px")
			.property("width", obj.get_width())
			.property("height", obj.get_height())
			.node().getContext("2d");
		var pixelHeatmap = document.createElement("canvas");
		pixelHeatmap.width = obj.get_ncols();
		pixelHeatmap.height = obj.get_nrows();
		
		//store colour of each cell
		var rgbColour, position;
		//create an object to store information on each cell of a heatmap
		var pixelData = new ImageData(obj.get_ncols(), obj.get_nrows());

		for(var i = 0; i < obj.get_rowIds().length; i++)
			for(var j = 0; j < obj.get_colIds().length; j++) {
					rgbColour = d3.rgb(obj.get_colour(obj.get_value(obj.get_rowIds()[i], 
																													obj.get_colIds()[j])));
					position = obj.get_heatmapRow(obj.get_rowIds()[i]) * obj.get_ncols() * 4 +
						obj.get_heatmapCol(obj.get_colIds()[j]) * 4;
					pixelData.data[position] = rgbColour.r;
					pixelData.data[position + 1] = rgbColour.g;
					pixelData.data[position + 2] = rgbColour.b;
			}
		//set opacity of all the pixels to 1
		for(var i = 0; i < obj.get_ncols() * obj.get_nrows(); i++)
			pixelData.data[i * 4 + 3] = 255;
		
		//put a small heatmap on screen and then rescale it
		pixelHeatmap.getContext("2d").putImageData(pixelData, 0 , 0);

		heatmapBody.imageSmoothingEnabled = false;
		//probaly no longer required, but let it stay here just in case
    //heatmapBody.mozImageSmoothingEnabled = false;
		//heatmapBody.webkitImageSmoothingEnabled = false;
    //heatmapBody.msImageSmoothingEnabled = false;

		heatmapBody.drawImage(pixelHeatmap, 0, 0, 
			obj.get_colIds().length, obj.get_rowIds().length,
			0, 0,	obj.get_width(), obj.get_height());
	}
	
	layer.update = function() {
		
		//if(layer.update_not_yet_called){
		//	layer.update_not_yet_called = false;
		//	layer.resetColourScale();
		//}
		
		layer.resetColourScale();
	
		if(layer.get_mode() == "default")
			layer.chart.get_ncols() * layer.chart.get_nrows() > 5000 ? layer.mode("canvas") : layer.mode("svg");
		
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
	
	return layer;
}