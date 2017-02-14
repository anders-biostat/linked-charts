import { getEuclideanDistance, add_click_listener } from "./additionalFunctions";
import { chartBase } from "./chartBase";

export function heatmapChart(id, chart){

	var chart = chartBase()
		.add_property("nrows")
		.add_property("ncols");
	
	chart.add_property("colLabels", function(i) {return i;})
		.add_property("rowLabels", function(i) {return i;})
		.add_property("colIds", function() {return undefined})
		.add_property("rowIds", function() {return undefined})
		.add_property("dispColIds", function() {return chart.get_colIds();})
		.add_property("dispRowIds", function() {return chart.get_rowIds();})
		.add_property("heatmapRow", function(rowId) {return chart.get_dispRowIds().indexOf(rowId);})
		.add_property("heatmapCol", function(colId) {return chart.get_dispColIds().indexOf(colId);})
		.add_property("value")
		.add_property("colour", function(val) {return chart.colourScale(val);})
		.add_property("palette", d3.interpolateOrRd) //? Do we need it? Really
		.add_property("colourRange", function() {return chart.dataRange()})
		.add_property("clusterRowMetric", getEuclideanDistance)
		.add_property("clusterColMetric", getEuclideanDistance)
		.add_property("on_click", function() {})
		.add_property("markedUpdated", function() {})
		.add_property("rowTitle", "")
		.add_property("showValue", false)
		.add_property("colTitle", "");

	chart.margin({top: 100, left: 100, right: 10, bottom: 10});

	chart.ncols("_override_", "colIds", function(){
		return d3.range(chart.get_ncols());
	});
	chart.nrows("_override_", "rowIds", function(){
		return d3.range(chart.get_nrows());
	});
	chart.rowIds("_override_", "nrows", function(){
		return chart.get_rowIds().length;
	});
	chart.colIds("_override_", "ncols", function(){
		return chart.get_colIds().length;
	});
/*	chart.dispRowIds("_override_", "nrows", function(){
		return chart.get_dispRowIds().length;
	});
	chart.dispColIds("_override_", "ncols", function(){
		return chart.get_dispColIds().length;
	}); */
	chart.axes = {};

	var inherited_put_static_content = chart.put_static_content;
	chart.put_static_content = function(element){
		inherited_put_static_content(element);
		add_click_listener(chart);
		//create main parts of the heatmap
		chart.svg.append("g")
			.attr("class", "row label_panel");
		chart.svg.append("g")
			.attr("class", "col label_panel");
				//delete canvas if any
		chart.g = chart.svg.append("g")
			.attr("class", "chart_g");
		chart.text = chart.g.append("g")
			.attr("class", "text_g");
		chart.axes.x_label = chart.svg.append("text")
			.attr("class", "axisLabel")
			.attr("text-anchor", "end");
		chart.axes.y_label = chart.svg.append("text")
			.attr("class", "axisLabel")
			.attr("text-anchor", "end")
			.attr("transform", "rotate(-90)");
	}

	chart.findPoints = function(lu, rb){
		var selectedPoints = chart.g.selectAll(".data_point")
			.filter(function() {
				var loc = [this.x.baseVal.value, this.y.baseVal.value];
				return (loc[0] <= rb[0]) && (loc[1] <= rb[1]) && 
					(loc[0] + chart.cellSize.width >= lu[0]) && 
					(loc[1] + chart.cellSize.height >= lu[1]);
			});
		if(!selectedPoints.empty())
			return selectedPoints;
		if(lu[0] * lu[1] < 0 && rb[0] * rb[1] < 0 )
			if(lu[0] < 0)
				selectedPoints = chart.svg.select(".row").selectAll(".label")
					.filter(function(){
						var loc = d3.select(this).attr("dy") * 1;
						return lu[1] >= loc - chart.cellSize.height && rb[1] <= loc;
					})
			else
				selectedPoints = chart.svg.select(".col").selectAll(".label")
					.filter(function(){
						var loc = d3.select(this).attr("dy") * 1;
						return lu[0] >= loc - chart.cellSize.width && rb[0] <= loc;
					});
		return selectedPoints;
	}	
	//returns maximum and minimum values of the data
	chart.dataRange = function(){
		var i = 0, range, newRange,
			rowIds = chart.get_rowIds(),
			colIds = chart.get_colIds();
		do{
			newRange = d3.extent(colIds, 
				function(col) {return chart.get_value(rowIds[i], col);});
			if(typeof range === "undefined")
				range = newRange;
			if(newRange[0] < range[0])
				range[0] = newRange[0];
			if(newRange[1] > range[1])
				range[1] = newRange[1];
			i++;
		}while (i < chart.get_nrows())
			
		return range;
	}

	//set default hovering behaviour
	chart.labelMouseOver = function() {
		d3.select(this).classed("hover", true);
	};
	chart.labelMouseOut = function() {
		d3.select(this).classed("hover", false);
	};

	chart.reorderRow = function(f){
		if(f == "flip"){
			chart.get_heatmapRow("__flip__");
			chart.updateLabelPosition();
			return chart;
		}
		chart.svg.select(".col").selectAll(".label")
			.classed("selected", false)
			.classed("sorted", false);

		var ids = chart.get_rowIds().slice(), ind;
		ids = ids.sort(f);
		chart.heatmapRow(function(rowId){
			if(rowId == "__flip__"){
				ids = ids.reverse();
				return;
			}
			if(rowId == "__order__")
				return ids.sort(f);
			var actIds = chart.get_dispRowIds(),
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
				throw "Wrong rowId in chart.get_heatmapRow";
		});
		
		chart.updateLabelPosition();
		return chart;
	}
	chart.reorderCol = function(f){
		if(f == "flip"){
			chart.get_heatmapCol("__flip__");
			chart.updateLabelPosition();
			return chart;
		}
		chart.svg.select(".row").selectAll(".label")
			.classed("selected", false)
			.classed("sorted", false);
		var ids = chart.get_colIds().slice(), ind;
		ids = ids.sort(f);
		chart.heatmapCol(function(colId){
			if(colId == "__flip__"){
				ids = ids.reverse();
				return;
			}
			if(colId == "__order__")
				return ids.sort(f);

			var actIds = chart.get_dispColIds(),
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
				throw "Wrong rowId in chart.get_heatmapRow";
		});
		chart.updateLabelPosition();
		return chart;
	}
	
	var inherited_updateSize = chart.updateSize;
	chart.updateSize = function(){
		inherited_updateSize();
		if(typeof chart.transition !== "undefined"){
			chart.svg.selectAll(".label_panel").transition(chart.transition)
				.attr("transform", "translate(" + chart.get_margin().left + ", " +
					chart.get_margin().top + ")");
			chart.g.transition(chart.transition)
				.attr("transform", "translate(" + chart.get_margin().left + ", " +
					chart.get_margin().top + ")");
			chart.axes.x_label.transition(chart.transition)
				.attr("font-size", d3.min([chart.get_margin().bottom - 2, 15]))
				.attr("x", chart.get_plotWidth() + chart.get_margin().left)
				.attr("y", chart.get_height());
			chart.axes.y_label.transition(chart.transition)
				.attr("font-size", d3.min([chart.get_margin().right - 2, 15]))
				.attr("x", - chart.get_margin().top)
				.attr("y", chart.get_width());
		} else {
			chart.svg.selectAll(".label_panel")
				.attr("transform", "translate(" + chart.get_margin().left + ", " +
					chart.get_margin().top + ")");
			chart.g
				.attr("transform", "translate(" + chart.get_margin().left + ", " +
					chart.get_margin().top + ")");								
			chart.axes.x_label
				.attr("font-size", d3.min([chart.get_margin().bottom - 2, 15]))
				.attr("x", chart.get_plotWidth() + chart.get_margin().left)
				.attr("y", chart.get_height());
			chart.axes.y_label
				.attr("font-size", d3.min([chart.get_margin().right - 2, 15]))
				.attr("x", - chart.get_margin().top)
				.attr("y", chart.get_width());

		}

		chart.updateLabelPosition();
		return chart;
	}

	chart.updateLabelPosition = function(){
		var ncols = chart.get_dispColIds().length,
			nrows = chart.get_dispRowIds().length;

		//calculate cell size
		chart.cellSize = {
			width: chart.get_plotWidth() / ncols,
			height: chart.get_plotHeight() / nrows
		}
		//create scales
		chart.axes.scale_x = d3.scaleLinear()
			.domain( [0, ncols - 1] )
			.range( [0, chart.get_plotWidth() - chart.cellSize.width] )
			.nice();
		chart.axes.scale_y = d3.scaleLinear()
			.domain( [0, nrows - 1] )
			.range( [0, chart.get_plotHeight() - chart.cellSize.height] )
			.nice();

		if(typeof chart.transition !== "undefined"){
			chart.svg.select(".col").selectAll(".label").transition(chart.transition)
				.attr("font-size", d3.min([chart.cellSize.width, 12]))
				.attr("dy", function(d) {return chart.axes.scale_x(chart.get_heatmapCol(d) + 1);});
			chart.svg.select(".row").selectAll(".label").transition(chart.transition)
				.attr("font-size", d3.min([chart.cellSize.height, 12]))
				.attr("dy", function(d) {return chart.axes.scale_y(chart.get_heatmapRow(d) + 1);});
		
		} else {
			chart.svg.select(".col").selectAll(".label")
				.attr("font-size", d3.min([chart.cellSize.width, 12]))
				.attr("dy", function(d) {return chart.axes.scale_x(chart.get_heatmapCol(d) + 1);});
			chart.svg.select(".row").selectAll(".label")
				.attr("font-size", d3.min([chart.cellSize.height, 12]))
				.attr("dy", function(d) {return chart.axes.scale_y(chart.get_heatmapRow(d) + 1);});
		}
		chart.updateCellPosition();
		return chart;
	}

	chart.updateLabels = function(){
		//add column labels
		var colLabels = chart.svg.select(".col").selectAll(".label")
				.data(chart.get_dispColIds(), function(d) {return d;});
		colLabels.exit()
			.remove();
		//add row labels
		var rowLabels = chart.svg.select(".row").selectAll(".label")
				.data(chart.get_dispRowIds(), function(d) {return d;});
		rowLabels.exit()
			.remove();
		colLabels.enter()
			.append("text")
				.attr("class", "label")
				.attr("transform", "rotate(-90)")
				.style("text-anchor", "start")
				.attr("dx", 2)
				.merge(colLabels)
					.on("mouseover", chart.labelMouseOver)
					.on("mouseout", chart.labelMouseOut)
					.on("click", chart.labelClick);
		rowLabels.enter()
			.append("text")
				.attr("class", "label")
				.style("text-anchor", "end")
				.attr("dx", -2)
				.merge(rowLabels)
					.on("mouseover", chart.labelMouseOver)
					.on("mouseout", chart.labelMouseOut)
					.on("click", chart.labelClick);

		chart.updateCells();
		return chart;
	}

	chart.updateLabelText = function(){
		if(typeof chart.transition !== "undefined"){
			chart.svg.select(".col").selectAll(".label").transition(chart.transition)
				.text(function(d) {return chart.get_colLabels(d);});
			chart.svg.select(".row").selectAll(".label").transition(chart.transition)
				.text(function(d) {return chart.get_rowLabels(d)});		
		} else {
			chart.svg.select(".col").selectAll(".label")
				.text(function(d) {return chart.get_colLabels(d);});
			chart.svg.select(".row").selectAll(".label")
				.text(function(d) {return chart.get_rowLabels(d)});
		}
		return chart;		
	}

	chart.zoom = function(lu, rb){
		var selectedCells = chart.findPoints(lu, rb);
		if(selectedCells.size() < 2)
			return;
		var rowIdsAll = selectedCells.data().map(function(d){
				return d[0];
			}),
			colIdsAll = selectedCells.data().map(function(d){
				return d[1];
			}),
			rowIds = [], colIds = [];

		for(var i = 0; i < rowIdsAll.length; i++)
			if(rowIds.indexOf(rowIdsAll[i]) == -1)
				rowIds.push(rowIdsAll[i]);
		for(var i = 0; i < colIdsAll.length; i++)
			if(colIds.indexOf(colIdsAll[i]) == -1)
				colIds.push(colIdsAll[i]);
		if(rowIds.length > 0 )
		chart.dispRowIds(rowIds);
		chart.dispColIds(colIds);
		chart.updateLabels();
		chart.updateLabelPosition();

		return chart;
	}

	chart.resetDomain = function(){
		chart.dispColIds(chart.get_colIds);
		chart.dispRowIds(chart.get_rowIds);
		chart.updateLabels()
			.updateLabelPosition()
			.updateCellColour()
			.updateLabelText();
		return chart;
	}

	chart.resetColourScale = function(){
	//create colorScale
		var range = chart.get_colourRange();
		chart.colourScale = d3.scaleSequential(chart.get_palette).domain(range);		
	}	

	//some default onmouseover and onmouseout behaviour for cells and labels
	//may be later moved out of the main library
	chart.pointMouseOver = function(d) {
		//change colour and class
		d3.select(this)
			.attr("fill", function(d) {
				return d3.rgb(chart.get_colour(chart.get_value(d[0], d[1]))).darker(0.5);
			})
			.classed("hover", true);		
		//find column and row labels
		chart.svg.select(".col").selectAll(".label")
			.filter(function(dl) {return dl == d[1];})
				.classed("hover", true);
		chart.svg.select(".row").selectAll(".label")
			.filter(function(dl) {return dl == d[0];})
				.classed("hover", true);
		//show label
		if(chart.get_showValue()){
			chart.g.selectAll(".tval").filter(function(fd){
				return fd[0] == d[0] && fd[1] == d[1];
			})
			.classed("hidden", false);
		} else {
		chart.container.select(".inform")
			.style("left", (d3.event.pageX + 10) + "px")
			.style("top", (d3.event.pageY - 10) + "px")
			.select(".value")
				.html("Row: <b>" + d[0] + "</b>;<br>" + 
						"Col: <b>" + d[1] + "</b>;<br>" + 
						"value = " + chart.get_value(d[0], d[1]));  
		chart.container.select(".inform")
			.classed("hidden", false);
		}
	};
	chart.pointMouseOut = function(d) {
		//change colour and class
		d3.select(this)
			.attr("fill", function(d) {
				return chart.get_colour(chart.get_value(d[0], d[1]));
			})
			.classed("hover", false);
		//deselect row and column labels
		chart.svg.selectAll(".label")
			.classed("hover", false);
		if(chart.get_showValue()){
			chart.g.selectAll(".tval").classed("hidden", true);
		} else {
			chart.container.select(".inform")
				.classed("hidden", true);
		}
	};
	
	//set default clicking behaviour for labels (ordering)
	chart.labelClick = function(d){
		//check whether row or col label has been clicked
		var type;
		d3.select(this.parentNode).classed("row") ? type = "row" : type = "col";
		//if this label is already selected, flip the heatmap
		if(d3.select(this).classed("sorted")){
			type == "col" ? chart.reorderRow("flip") : chart.reorderCol("flip");
		} else {
			//select new label and chage ordering
			if(type == "col")
				chart.reorderRow(function(a, b){
					return chart.get_value(b, d) - chart.get_value(a, d);
				})
			else
				chart.reorderCol(function(a, b){
					return chart.get_value(d, b) - chart.get_value(d, a);
				});
		}
		d3.select(this).classed("sorted", true);
		chart.svg.selectAll(".sorted").classed("selected", true);
	};
	
	chart.updateCellColour = function() {
		if(typeof chart.transition !== "undefined")
			chart.g.selectAll(".data_point").transition(chart.transition)
				.attr("fill", function(d) {
					return chart.get_colour(chart.get_value(d[0], d[1]));
			})
		else
			chart.g.selectAll(".data_point")
				.attr("fill", function(d) {
					return chart.get_colour(chart.get_value(d[0], d[1]));
			});
		chart.svg.selectAll(".sorted")
			.classed("selected", false)
			.classed("sorted", false);

		if(chart.get_showValue())
			chart.updateTextValues();
		return chart;
	}

	chart.updateCells = function(){
		//add rows
		var rows = chart.g.selectAll(".data_row")
			.data(chart.get_dispRowIds(), function(d) {return d;});
		rows.exit()
			.remove();
		rows.enter()
			.append("g")
				.attr("class", "data_row");

		//add cells	
		var cells = chart.g.selectAll(".data_row").selectAll(".data_point")
			.data(function(d) {
				return chart.get_dispColIds().map(function(e){
					return [d, e];
				})
			}, function(d) {return d;});
		cells.exit()
			.remove();
		cells.enter()
			.append("rect")
				.attr("class", "data_point")
				.merge(cells)
					.on("mouseover", chart.pointMouseOver)
					.on("mouseout", chart.pointMouseOut)
					.on("click", function(d) {
						chart.get_on_click.apply(this, [d[0], d[1]]);
					});
		
		if(chart.get_showValue())
			chart.updateTexts();
		
		return chart;
	}

	chart.updateCellPosition = function(){
		if(typeof chart.transition !== "undefined")
			chart.g.selectAll(".data_point").transition(chart.transition)
				.attr("x", function(d){
					return chart.axes.scale_x(chart.get_heatmapCol(d[1]));
				})
				.attr("width", chart.cellSize.width)
				.attr("height", chart.cellSize.height)								
				.attr("y", function(d) {
					return chart.axes.scale_y(chart.get_heatmapRow(d[0]))
				})
		else
			chart.g.selectAll(".data_point")
				.attr("x", function(d){
					return chart.axes.scale_x(chart.get_heatmapCol(d[1]));
				})
				.attr("width", chart.cellSize.width)
				.attr("height", chart.cellSize.height)								
				.attr("y", function(d) {
					return chart.axes.scale_y(chart.get_heatmapRow(d[0]))
				});

		if(chart.get_showValue())
			chart.updateTextPosition();

		return chart;
	}

	//type shoud be Row or Col
	chart.cluster = function(type){
		if(type != "Row" && type != "Col")
			throw "Error in 'cluster': type " + type + " cannot be recognised. " +
					"Please, use either 'Row' or 'Col'";
		var items = {}, it = [],
			aIds = chart["get_disp" + type + "Ids"](),
			bIds;
		type == "Row" ? bIds = chart.get_dispColIds() :
			bIds = chart.get_dispRowIds();

		for(var i = 0; i < aIds.length; i++) {
			for(var j = 0; j < bIds.length; j++)
				type == "Row" ? it.push(chart.get_value(aIds[i], bIds[j])) :
												it.push(chart.get_value(bIds[j], aIds[i]));
			items[aIds[i]] = it.slice();
			it = [];
		}

		var getDistance = function(a, b) {
			return chart["get_cluster" + type + "Metric"](items[a], items[b]);
		};

		var newOrder = [];
		var traverse = function(node) {
			if(node.value){
				newOrder.push(node.value);
				return;
			}
			traverse(node.left);
			traverse(node.right);
		}

		var clusters = clusterfck.hcluster(aIds, getDistance, clusterfck.COMPLETE_LINKAGE);
		traverse(clusters);
		
		var oldOrder = chart["get_heatmap" + type]("__order__");
		chart["reorder" + type](function(a, b){
			if(newOrder.indexOf(a) != -1 && newOrder.indexOf(b) != -1)
				return newOrder.indexOf(a) - newOrder.indexOf(b);
			return oldOrder.indexOf(a) - oldOrder.indexOf(b);
		});
		
		chart.updateLabelPosition();		
	}

	chart.updateTexts = function(){
		//add rows
		var rows = chart.g.selectAll(".text_row")
			.data(chart.get_dispRowIds(), function(d) {return d;});
		rows.exit()
			.remove();
		rows.enter()
			.append("g")
				.attr("class", "text_row");

		//add text	
		var text = chart.g.selectAll(".text_row").selectAll(".tval")
			.data(function(d) {
				return chart.get_dispColIds().map(function(e){
					return [d, e];
				})
			}, function(d) {return d;});
		text.exit()
			.remove();
		text.enter()
			.append("text")
				.attr("class", "tval hidden");
		return chart;		
	}
	chart.updateTextPosition = function(){
		if(typeof chart.transition !== "undefined")
			chart.g.selectAll(".tval").transition(chart.transition)
				.attr("x", function(d){
					return chart.axes.scale_x(chart.get_heatmapCol(d[1]));
				})
				.attr("font-size", chart.cellSize.height * 0.5)								
				.attr("y", function(d) {
					return chart.axes.scale_y(chart.get_heatmapRow(d[0]) ) + chart.cellSize.height * 0.75
				})
		else
			chart.g.selectAll(".tval")
				.attr("x", function(d){
					return chart.axes.scale_x(chart.get_heatmapCol(d[1]));
				})
				.attr("font-size", chart.cellSize.height * 0.5)								
				.attr("y", function(d) {
					return chart.axes.scale_y(chart.get_heatmapRow(d[0])) + chart.cellSize.height * 0.75;
				})
		return chart;
	}
	chart.updateTextValues = function(){
		if(typeof chart.transition !== "undefined")
			chart.g.selectAll(".tval").transition(chart.transition)
				.text(function(d) {
					return chart.get_value(d[0], d[1]).toFixed(1);
			})
		else
			chart.g.selectAll(".tval")
				.text(function(d) {
					return chart.get_value(d[0], d[1]).toFixed(1);
			});
		return chart;
	}
	
	chart.update = function() {
		chart.resetColourScale();
		chart.axes.x_label
			.text(chart.get_colTitle());
		chart.axes.y_label
			.text(chart.get_rowTitle());
		chart.updateLabels()
			.updateSize()
			.updateLabelText()
			.updateCellColour();

		return chart;
	}

	return chart;	
}

/*	layer.updateCanvas = function() {
	
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

		for(var i = 0; i < layer.get_dispRowIds().length; i++)
			for(var j = 0; j < layer.get_dispColIds().length; j++) {
					rgbColour = d3.rgb(layer.get_colour(layer.get_value(layer.get_dispRowIds()[i], 
																													layer.get_dispColIds()[j])));
					position = layer.get_heatmapRow(layer.get_dispRowIds()[i]) * layer.get_ncols() * 4 +
						layer.get_heatmapCol(layer.get_dispColIds()[j]) * 4;
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
			layer.get_dispColIds().length, layer.get_dispRowIds().length,
			0, 0,	layer.get_width(), layer.get_height());
	}*/