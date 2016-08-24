import {divChartBase} from "./chartBase";

export function heatmapChart(){
	
	//user set parameters
	var obj = divChartBase()
			.add_property("nrows")
			.add_property("ncols")
			.add_property("value");
	
	//optional parameters with possible default values
	obj.add_property("mode", "default")
		.add_property("height", 800)
		.add_property("width", 1000)
		.add_property("margin", {top: 100, bottom: 50, left: 100, right: 20})
		.add_property("colLabels", function(i) {return i;})
		.add_property("rowLabels", function(i) {return i;})
		.add_property("colIds", function() {return d3.range(obj.get_ncols());})
		.add_property("rowIds", function() {return d3.range(obj.get_nrows());})
		.add_property("colour", function(val) {return obj.colourScale(val);})
		.add_property("heatmapRow", function(rowId) {return obj.get_rowIds().indexOf(rowId);})
		.add_property("heatmapCol", function(colId) {return obj.get_rowIds().indexOf(colId);})
		.add_property("palette", d3.interpolateOrRd)
		.add_property("colourRange", function() {return obj.dataRange()})
		.add_property("legendSteps", 21)
		.add_property("labelMouseOver")
		.add_property("labelMouseOut")
		.add_property("cellMouseOver")
		.add_property("cellMouseOut")
		.add_property("labelClick")
		.add_property("cellClick", function() {});
		
	//returns maximum and minimum values of the data
	obj.dataRange = function(){
		var i = 0, range, newRange;
		do{
			newRange = d3.extent(obj.get_colIds(), 
				function(col) {return obj.get_value(obj.get_rowIds()[i], col);});
			if(typeof range === "undefined")
				range = newRange;
			if(newRange[0] < range[0])
				range[0] = newRange[0];
			if(newRange[1] > range[1])
				range[1] = newRange[1];
			i++;
		}while (i < obj.get_nrows())
			
		return range;
	}
	
	obj.reorderRow = function(f){
		if(f == "flip"){
			obj.get_heatmapRow("__flip__");
			return obj;
		}
		var ids = obj.get_rowIds().slice(), ind;
		ids = ids.sort(f);
		obj.heatmapRow(function(rowId){
			if(rowId == "__flip__"){
				ids = ids.reverse();
				return;
			}
			var actIds = obj.get_rowIds(),
				orderedIds = ids.filter(function(e) {
					return actIds.indexOf(e) != -1;
				});
			if(orderedIds.length != actIds.length) {
				orderedIds = actIds.sort(f);
				ids = orderedIds.slice();
			}
			ind = orderedIds.indexOf(rowId);
			if(ind > -1)
				 return ind
			else
				throw "Wrong rowId in obj.get_heatmapRow";
		});
		
		return obj;
	}
	obj.reorderCol = function(f){
		if(f == "flip"){
			obj.get_heatmapCol("__flip__");
			return obj;
		}
		var ids = obj.get_colIds().slice(), ind;
		ids = ids.sort(f);
		obj.heatmapCol(function(colId){
			if(colId == "__flip__"){
				ids = ids.reverse();
				return;
			}

			var actIds = obj.get_colIds(),
				orderedIds = ids.filter(function(e) {
					return actIds.indexOf(e) != -1;
				});
			if(orderedIds.length != actIds.length) {
				orderedIds = actIds.sort(f);
				ids = orderedIds.slice();
			}
			ind = orderedIds.indexOf(colId);
			if(ind > -1)
				 return ind
			else
				throw "Wrong rowId in obj.get_heatmapRow";
		});
		
		return obj;
	}
	
/*	obj.heatmapRow = function(f){
		obj.get_heatmapRow = function(rowId){
			var ids = obj.get_rowIds();
			f ? ids = ids.sort(f): ids = ids.sort();
			return ids.indexOf(rowId);
		}
		return obj;
	}
	obj.heatmapRow();
	
	obj.heatmapCol = function(f){
		obj.get_heatmapCol = function(colId){
			var ids = obj.get_colIds();
			f ? ids = ids.sort(f): ids = ids.sort();
			return ids.indexOf(colId);
		}
		return obj;
	}
	obj.heatmapCol();
*/	
	
	//reset a colourScale
	//in cases like zooming and filtering we, probably, need to
	//use previously stored colourScale, so it will be reset only
	//when user tells it to
	obj.resetColourScale = function(){
	//create colorScale
		var scale = d3.scaleSequential(obj.get_palette);
		obj.colourScale = function(val){
			val = (val - obj.get_colourRange()[0]) / 
				(obj.get_colourRange()[1] - obj.get_colourRange()[0]);
			return scale(val);
		}
	}	
	
	var inherited_put_static_content = obj.put_static_content;
	obj.put_static_content = function(element){
		
		inherited_put_static_content(element);
		
		obj.container = element;
		obj.real_div.style("position", "relative");
		element.append("div")
			.attr("class", "inform hidden")
			.append("p")
				.attr("class", "value");
		
		obj.real_svg = obj.real_div.append("svg");
		
		//create main parts of the heatmap
		obj.real_svg.append("g")
			.attr("class", "row label_panel");
		obj.real_svg.append("g")
			.attr("class", "col label_panel");
		obj.real_svg.append("g")
			.attr("class", "legend_panel");

		obj.resetColourScale();
	}
	
	//some default onmouseover and onmouseout behaviour for cells and labels
	//may be later moved out of the main library
	obj.labelMouseOver(function() {
		d3.select(this).classed("hover", true);
	});
	obj.labelMouseOut(function() {
		d3.select(this).classed("hover", false);
	});
	obj.cellMouseOver(function(d) {
		//change colour and class
		d3.select(this)
			.attr("fill", function(d) {
				return d3.rgb(obj.get_colour(obj.get_value(d[0], d[1]))).darker(0.5);
			})
			.classed("hover", true);		
		//finde column and row labels
		obj.real_svg.select(".col").selectAll(".label")
			.filter(function(dl) {return dl == d[1];})
				.classed("hover", true);
		obj.real_svg.select(".row").selectAll(".label")
			.filter(function(dl) {return dl == d[0];})
				.classed("hover", true);
		//show label
		obj.container.select(".inform")
				.style("left", (d3.event.pageX + 10) + "px")
				.style("top", (d3.event.pageY - 10) + "px")
				.select(".value")
					.html("Row: <b>" + d[0] + "</b>;<br>" + 
						"Col: <b>" + d[1] + "</b>;<br>" + 
						"value = " + obj.get_value(d[0], d[1]));  
		obj.container.select(".inform")
			.classed("hidden", false);
	});
	obj.cellMouseOut(function() {
		//change colour and class
		d3.select(this)
			.attr("fill", function(d) {
				return obj.get_colour(obj.get_value(d[0], d[1]));
			})
			.classed("hover", false);
		//deselect row and column labels
		obj.real_svg.selectAll(".label")
			.classed("hover", false);
		obj.container.select(".inform")
			.classed("hidden", true);
	});
	//set default clicking behaviour for labels (ordering)
	obj.labelClick(function(d){
		//check whether row or col label has been clicked
		var type;
		d3.select(this.parentNode).classed("row") ? type = "row" : type = "col";
		//if this label is already selected, flip the heatmap
		if(d3.select(this).classed("selected")){
			type == "col" ? obj.reorderRow("flip") : obj.reorderCol("flip");
			obj.update();
		} else {
			//unselect other
			obj.real_svg.select("." + type).selectAll(".label")
				.classed("selected", false);
			//select new label and chage ordering
			d3.select(this).classed("selected", true);
			if(type == "col")
				obj.reorderRow(function(a, b){
					return obj.get_value(b, d) - obj.get_value(a, d);
				})
			else
				obj.reorderCol(function(a, b){
					return obj.get_value(d, b) - obj.get_value(d, a);
				});
			obj.update();
		}
	});
	
	obj.update_not_yet_called = true;
	
	obj.updateSVG = function(cellSize, transition) {
		
		//if there is any canvas object, remove it
		obj.real_svg.selectAll("canvas").remove();
		
		//append or resize heatmap body
		obj.svg = obj.real_svg.selectAll(".heatmap_body").data(["x"]);
		obj.svg.enter()
			.append("g")
			.attr("class", "heatmap_body")
			.merge(obj.svg).transition(transition)
				.attr("transform", "translate(" + obj.get_margin().left + ", " +
					obj.get_margin().top + ")");
		obj.svg = obj.real_svg.select(".heatmap_body");
		
		//add rows
		var rows = obj.svg.selectAll(".data_row").data(obj.get_rowIds().slice());
		rows.exit()
			.remove();
		rows.enter()
			.append("g")
				.attr("class", "data_row")
			.merge(rows).transition(transition)
				.attr("transform", function(d) {
					return "translate(0, " + 
						(obj.get_heatmapRow(d) * cellSize.height) + ")";
				});
						
		//add cells	
		var cells = obj.svg.selectAll(".data_row").selectAll(".data_point")
			.data(function(d) {
				return obj.get_colIds().map(function(e){
					return [d, e];
				})
			});
		cells.exit()
			.remove();
		cells.enter()
			.append("rect")
				.attr("class", "data_point")
				.on("mouseover", obj.get_cellMouseOver)
				.on("mouseout", obj.get_cellMouseOut)
				.on("click", obj.get_cellClick)
			.merge(cells).transition(transition)
				.attr("x", function(d){
					return obj.get_heatmapCol(d[1]) * cellSize.width;
				})
				.attr("fill", function(d) {
					return obj.get_colour(obj.get_value(d[0], d[1]));
				})
				.attr("width", cellSize.width)
				.attr("height", cellSize.height);
	}
	obj.updateCanvas = function() {
		
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
	obj.updateSVGTest = function(cellSize, transition) {

		//if there is any canvas object, remove it
		obj.real_svg.selectAll("canvas").remove();
		
		//append or resize heatmap bode
		var heatmapBody = obj.real_svg.selectAll(".heatmap_body").data(["x"]);
		heatmapBody.enter()
			.append("g")
			.attr("class", "heatmap_body")
			.merge(heatmapBody).transition(transition)
				.attr("transform", "translate(" + obj.get_margin().left + ", " +
					obj.get_margin().top + ")");
		heatmapBody = obj.real_svg.select(".heatmap_body");
		
		//add cells
		var point, cell;
		heatmapBody.selectAll(".datapoint")
			.classed("transient", true);
		for(var i = 0; i < obj.get_rowIds().length; i++)
			for(var j = 0; j < obj.get_colIds().length; j++) {
				point = "c" + obj.get_rowIds()[i] + "_" + obj.get_colIds()[j];
				cell = heatmapBody.select("#" + point).transition(transition)

				if(cell.empty())
					cell = heatmapBody.append("rect")
						.attr("id", point)
						.attr("class", "cell datapoint")
						.attr("width", cellSize.width)
						.attr("height", cellSize.height);
				
				cell.transition(transition)
					.attr("x", obj.get_heatmapCol(obj.get_colIds()[j]) * cellSize.width)
					.attr("y", obj.get_heatmapRow(obj.get_rowIds()[i]) * cellSize.height)
					.attr("fill", obj.get_colour(obj.get_value(obj.get_rowIds()[i], 
																										obj.get_colIds()[j])));
				cell.classed("transient", false);
			}
		heatmapBody.selectAll(".datapoint")
			.filter(function() {return d3.select(this).classed("transient")})
				.remove();
	}
	
	obj.update = function() {
		
		var transition;
		if(obj.update_not_yet_called){
			transition = d3.transition().duration(0);
			obj.update_not_yet_called = false;
		} else {
			transition = d3.transition().duration(1000);
		}

		//update sizes of all parts of the chart
		obj.real_div.transition(transition)
			.style("width", (obj.get_width() + obj.get_margin().left + obj.get_margin().right) + "px")
			.style("height", (obj.get_height() + obj.get_margin().top + obj.get_margin().bottom) + "px");

		obj.real_svg.transition(transition)
			.attr("height", obj.get_height() + obj.get_margin().top + obj.get_margin().bottom)
			.attr("width", obj.get_width() + obj.get_margin().left + obj.get_margin().right);
		
		obj.real_svg.selectAll(".label_panel").transition(transition)
			.attr("transform", "translate(" + obj.get_margin().left + ", " +
				obj.get_margin().top + ")");
		
		obj.real_svg.select(".legend_panel").transition(transition)
			.attr("transform", "translate(" + obj.get_margin().left + 
				", " + (obj.get_height() + obj.get_margin().top)  + ")");
			
		//calculate cell size
		var cellSize = {
			width: obj.get_width() / obj.get_ncols(),
			height: obj.get_height() / obj.get_nrows()
		}
				
		//add column labels
		var colLabels = obj.real_svg.select(".col").selectAll(".label")
				.data(obj.get_colIds().slice());
		colLabels.exit()
			.remove();
		colLabels.enter()
			.append("text")
				.attr("class", "label")
				.attr("transform", "rotate(-90)")
				.style("text-anchor", "start")
				.on("mouseover", obj.get_labelMouseOver)
				.on("mouseout", obj.get_labelMouseOut)
				.on("click", obj.get_labelClick)
			.merge(colLabels).transition(transition)
				.attr("font-size", d3.min([cellSize.width, 12]))
				.attr("dy", function(d) {return cellSize.width * (obj.get_heatmapCol(d) + 1);})
				.attr("dx", 2)
				.text(function(d) {return obj.get_colLabels(d);});		
		
		//add row labels
		var rowLabels = obj.real_svg.select(".row").selectAll(".label")
				.data(obj.get_rowIds().slice());
		rowLabels.exit()
			.remove();
		rowLabels.enter()
			.append("text")
				.attr("class", "label")
				.style("text-anchor", "end")
				.on("mouseover", obj.get_labelMouseOver)
				.on("mouseout", obj.get_labelMouseOut)
				.on("click", obj.get_labelClick)
			.merge(rowLabels).transition(transition)
				.attr("font-size", d3.min([cellSize.height, 12]))
				.attr("dy", function(d) {return cellSize.height * (obj.get_heatmapRow(d) + 1);})
				.attr("dx", -2)
				.text(function(d) {return obj.get_rowLabels(d)});

		//add legend
		var legendStep = (obj.get_colourRange()[1] - obj.get_colourRange()[0]) / 
				(obj.get_legendSteps() - 1),
			legendScale = [], legendElementWidth = 20,
			legendElementHeight = 10;
		//if default legend elements are to wide, make them shorter
		if(legendElementWidth * obj.get_palette().length > obj.get_width())
			legendElementWidth = obj.get_width() / obj.get_palette().length;

		for(var i = 0; i < obj.get_legendSteps(); i++)
			legendScale.push((obj.get_colourRange()[0] + i * legendStep).toPrecision(2));

		var legendBlocks = obj.real_svg.select(".legend_panel")
			.selectAll(".legend").data(legendScale);	
		legendBlocks.enter()
			.append("g")
				.attr("class", "legend")
				.attr("num", function(d, i){return i;});
		legendBlocks = obj.real_svg.select(".legend_panel").selectAll(".legend");
		legendBlocks.append("rect");
		legendBlocks.append("text");
	
		legendBlocks
			.attr("transform", function(d, i){
				return "translate(" + legendElementWidth * i + ", 0)"
			});
		legendBlocks.selectAll("rect")
			.attr("y", legendElementHeight * 1.2)
			.attr("width", legendElementWidth)
			.attr("height", legendElementHeight)
			.attr("fill", function(){
				return obj.colourScale(d3.select(this.parentNode).datum());
			});
		legendBlocks.selectAll("text")
			.text(function() {
				if(d3.select(this.parentNode).attr("num") % 2 == 0)
					return d3.select(this.parentNode).datum();
			})
			.attr("dy", legendElementHeight * 4)
			.attr("font-size", d3.min([legendElementHeight * 1.5 - 1, legendElementWidth * 1.5]));

	
		if(obj.get_mode() == "default")
			obj.get_ncols * obj.get_nrows > 5000 ? obj.mode("canvas") : obj.mode("svg");
		if(obj.get_mode() == "canvas") {
			obj.updateCanvas(cellSize);
			return obj;
		}
		if(obj.get_mode() == "svg") {
			obj.updateSVG(cellSize, transition);
			return obj;
		}
		if(obj.get_mode() == "svg_test") {
			obj.updateSVGTest(cellSize, transition);
			return obj;
		}
		
		throw "Error in function 'heatmapChart.update': mode did not correspond to any " +
			"existing type ('canvas', 'svg' or 'default')";
	}
	
	return obj;
}