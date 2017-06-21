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
		.add_property("mode", "default")
		.add_property("colour", function(val) {return chart.colourScale(val);})
		.add_property("palette", d3.interpolateOrRd) //? Do we need it? Really
		.add_property("colourRange", function() {return chart.dataRange()})
		.add_property("clusterRowMetric", getEuclideanDistance)
		.add_property("clusterColMetric", getEuclideanDistance)
		.add_property("on_click", function() {})
		.add_property("rowTitle", "")
		.add_property("showValue", false)
		.add_property("colTitle", "")
		.add_property("showLegend", true)
		.add_property("informText", function(rowId, colId) {
			return "Row: <b>" + rowId + "</b>;<br>" + 
						"Col: <b>" + colId + "</b>;<br>" + 
						"value = " + chart.get_value(rowId, colId).toFixed(2)
			});

	chart.margin({top: 100, left: 100, right: 10, bottom: 40});

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
	chart.dispRowIds("_override_", "nrows", function(){
		return chart.get_dispRowIds().length;
	});
	chart.dispColIds("_override_", "ncols", function(){
		return chart.get_dispColIds().length;
	}); 
	chart.axes = {};
	chart.marked = [];

	var inherited_put_static_content = chart.put_static_content;
	chart.put_static_content = function(element){
		inherited_put_static_content(element);
		add_click_listener(chart);
		//create main parts of the heatmap
		chart.svg.append("g")
			.attr("class", "row label_panel");
		chart.svg.append("g")
			.attr("class", "col label_panel");
		chart.canvas = chart.container.append("canvas")
			.style("position", "absolute")
			.style("z-index", -5);		
		chart.g = chart.svg.select(".plotArea").append("g")
			.attr("class", "chart_g")
			.attr("clip-path", "url(#" + chart.svg.select("clipPath").attr("id") + ")");
		chart.text = chart.g.append("g")
			.attr("class", "text_g");
		chart.axes.x_label = chart.svg.append("text")
			.attr("class", "axisLabel")
			.attr("text-anchor", "end");
		chart.axes.y_label = chart.svg.append("text")
			.attr("class", "axisLabel")
			.attr("text-anchor", "end")
			.attr("transform", "rotate(-90)");
		chart.svg.append("g")
			.attr("class", "legend_panel");

		(get_mode() == "svg") ? chart.g.classed("active", true) : 
														chart.canvas.classed("active", true);

		chart.svg.select(".clickPanel")
			.on("mouseover", function() {
				chart.container.select(".inform").classed("hidden", false);
			})
			.on("mouseout", function() {
				chart.container.select(".inform").classed("hidden", true);
			})

		if(chart.showPanel()){
			chart.panel.add_button("Zoom in", "#zoomIn", function(chart){
				var removeRows = d3.max([chart.nrows() * 0.1, 1]),
					removeCols = d3.max([chart.ncols() * 0.1, 1]);
				var rowLabels = chart.svg.select(".row").selectAll(".label")
					.filter(function() {
						return this.y.baseVal[0].value > removeRows * chart.cellSize.height &&
										this.y.baseVal[0].value < chart.plotHeight() - (removeRows - 1) * chart.cellSize.height;
					}).data(),
				colLabels = chart.svg.select(".col").selectAll(".label")
					.filter(function() {
						return this.y.baseVal[0].value > removeCols * chart.cellSize.width &&
										this.y.baseVal[0].value < chart.plotWidth() - (removeCols - 1) * chart.cellSize.width;
					}).data();
				if(colLabels.length > 0)
					chart.dispColIds(colLabels);
				if(rowLabels.length > 0)
					chart.dispRowIds(rowLabels);
				chart.updateStarted = true;
				chart.updateLabels();
				chart.updateLabelPosition();
				chart.updateStarted = false;				
			}, "Double click to return to original scales");
			chart.panel.add_button("Zoom out", "#zoomOut", function(chart){
				var addRows = d3.max([chart.nrows() * 0.1, 1]),
					addCols = d3.max([chart.ncols() * 0.1, 1]),
					rowIds = chart.get_heatmapRow("__order__"),
					colIds = chart.get_heatmapCol("__order__"),
					dispRowIds = chart.dispRowIds(),
					dispColIds = chart.dispColIds();
				if(typeof rowIds.splice === "undefined")
					rowIds = chart.rowIds();
				if(typeof colIds.splice === "undefined")
					colIds = chart.colIds();

				var flag = true, first = -1, last = rowIds.length;
				while(flag && first < rowIds.length){
					first++;
					flag = dispRowIds.indexOf(rowIds[first]) == -1;
				}
				flag = true;
				while(flag && last >= 0){
					last--;
					flag = dispRowIds.indexOf(rowIds[last]) == -1;
				}
				for(var i = 0; i < addRows; i++){
					if(first - i - 1 >= 0)
						dispRowIds.unshift(rowIds[first - i - 1]);
					if(last + i + 1 < rowIds.length)
						dispRowIds.push(rowIds[last + i + 1]);
				}
				flag = true, first = -1, last = colIds.length;
				while(flag && first < colIds.length){
					first++;
					flag = dispColIds.indexOf(colIds[first]) == -1;
				}
				flag = true;
				while(flag && last >= 0){
					last--;
					flag = dispColIds.indexOf(colIds[last]) == -1;
				}
				for(var i = 0; i < addCols; i++){
					if(first - i - 1 >= 0)
						dispColIds.unshift(colIds[first - i - 1]);
					if(last + i + 1 < colIds.length)
						dispColIds.push(colIds[last + i + 1]);
				}

				chart.dispColIds(dispColIds);
				chart.dispRowIds(dispRowIds);
				chart.updateStarted = true;
				chart.updateLabels();
				chart.updateLabelPosition();
				chart.updateCellColour();
				chart.updateLabelText();
				chart.updateStarted = false;
			}, "Double click to return to original scales");			
		}
	}

	var get_mode = function() {
		if(chart.mode() == "default")
			return chart.ncols() * chart.nrows() > 5000 ? "canvas" : "svg";
		return chart.mode();
	}

	chart.findPoints = function(lu, rb){
		var selectedIds = [];
		if(get_mode() == "svg") {
			var selectedPoints = chart.g.selectAll(".data_point")
				.filter(function() {
					var loc = [this.x.baseVal.value, this.y.baseVal.value];
					return (loc[0] <= rb[0]) && (loc[1] <= rb[1]) && 
						(loc[0] + chart.cellSize.width >= lu[0]) && 
						(loc[1] + chart.cellSize.height >= lu[1]);
				});
			selectedIds = selectedPoints.data().map(function(e){
				return "p" + e[0] + "_-sep-_" + e[1];
			});
		} else {
			var selCols = chart.svg.select(".col").selectAll(".label")
				.filter(function() {
					var loc = this.y.baseVal[0].value;
					return (loc >= lu[0] && loc <= rb[0] + chart.cellSize.width)
				}).data(),
				selRows = chart.svg.select(".row").selectAll(".label")
				.filter(function() {
					var loc = this.y.baseVal[0].value;
					return (loc >= lu[1] && loc <= rb[1] + chart.cellSize.height)
				}).data();
			for(var i = 0; i < selRows.length; i++)
				for(var j = 0; j < selCols.length; j++)
					selectedIds.push("p" + selRows[i] + "_-sep-_" + selCols[j]);
		}

		return selectedIds;
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
			chart.svg.select(".legend_panel").transition(chart.transition)
				.attr("transform", "translate(0, " + 
					(chart.get_margin().top + chart.get_plotHeight()) + ")");
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
			chart.svg.select(".legend_panel")
				.attr("transform", "translate(0, " + 
					(chart.get_margin().top + chart.get_plotHeight()) + ")");
			chart.axes.x_label
				.attr("font-size", d3.min([chart.get_margin().bottom - 2, 15]))
				.attr("x", chart.get_plotWidth() + chart.get_margin().left)
				.attr("y", chart.get_height());
			chart.axes.y_label
				.attr("font-size", d3.min([chart.get_margin().right - 2, 15]))
				.attr("x", - chart.get_margin().top)
				.attr("y", chart.get_width());
		}
		chart.canvas
			.style("left", chart.margin().left)
			.style("top", chart.margin().top)
			.attr("width", chart.plotWidth())
			.attr("height", chart.plotHeight());		

		chart.updateLegendSize();
		chart.updateLabelPosition();
		return chart;
	}

	chart.updateLabelPosition = function(){
		var ncols = chart.dispColIds().length,
			nrows = chart.dispRowIds().length;

		//calculate cell size
		chart.cellSize = {
			width: chart.plotWidth() / ncols,
			height: chart.plotHeight() / nrows
		}
		//create scales
		chart.axes.scale_x = d3.scaleLinear()
			.domain( [0, ncols - 1] )
			.range( [0, chart.plotWidth() - chart.cellSize.width] );
		chart.axes.scale_y = d3.scaleLinear()
			.domain( [0, nrows - 1] )
			.range( [0, chart.plotHeight() - chart.cellSize.height] );

		if(typeof chart.transition !== "undefined"){
			chart.svg.select(".col").selectAll(".label").transition(chart.transition)
				.attr("font-size", d3.min([chart.cellSize.width, 12]))
				.attr("y", function(d) {return chart.axes.scale_x(chart.get_heatmapCol(d) + 1);});
			chart.svg.select(".row").selectAll(".label").transition(chart.transition)
				.attr("font-size", d3.min([chart.cellSize.height, 12]))
				.attr("y", function(d) {return chart.axes.scale_y(chart.get_heatmapRow(d) + 1);});
		
		} else {
			chart.svg.select(".col").selectAll(".label")
				.attr("font-size", d3.min([chart.cellSize.width, 12]))
				.attr("y", function(d) {return chart.axes.scale_x(chart.get_heatmapCol(d) + 1);});
			chart.svg.select(".row").selectAll(".label")
				.attr("font-size", d3.min([chart.cellSize.height, 12]))
				.attr("y", function(d) {return chart.axes.scale_y(chart.get_heatmapRow(d) + 1);});
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
					.attr("id", function(d) {return d.replace(/ /g,"_")})
					.on("mouseover", chart.labelMouseOver)
					.on("mouseout", chart.labelMouseOut)
					.on("click", chart.labelClick);
		rowLabels.enter()
			.append("text")
				.attr("class", "label")
				.style("text-anchor", "end")
				.attr("dx", -2)
				.merge(rowLabels)
					.attr("id", function(d) {return d.replace(/ /g,"_")})
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
		if(selectedCells.length < 2)
			return;
		var rowIdsAll = [], colIdsAll = [];
		selectedCells.map(function(e){
			rowIdsAll.push(e.substr(1).split("_-sep-_")[0]);
			colIdsAll.push(e.substr(1).split("_-sep-_")[1]);
		});
		var rowIds = [], colIds = [];

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
		chart.updateStarted = true;
		chart.updateLabels()
			.updateLabelPosition()
			.updateCellColour()
			.updateLabelText();
		chart.updateStarted = false;
		return chart;
	}

	chart.resetColourScale = function(){
	//create colorScale
		var range = chart.get_colourRange();
		chart.colourScale = d3.scaleSequential(chart.get_palette).domain(range);
		if(chart.get_showLegend())
			chart.updateLegend();		
	}	

	//some default onmouseover and onmouseout behaviour for cells and labels
	//may be later moved out of the main library
	chart.pointMouseOver = function(d) {
		var pos = d3.mouse(chart.container.node());
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
			.style("left", (pos[0] + 10) + "px")
			.style("top", (pos[1] + 10) + "px")
			.select(".value")
				.html(function() {return chart.get_informText(d[0], d[1])});  
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
		if(!chart.checkMode())
			return chart;

		if(get_mode() == "svg") {
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
		} else {
			if(!chart.updateStarted)
				chart.updateCanvas();
		}
		
		return chart;
	}

	chart.updateCells = function(){
		if(!chart.checkMode())
			return chart;

		var markedCells = chart.get_marked().length;

		if(get_mode() == "svg") {
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
					.attr("opacity", 0.5)
					.merge(cells)
						.attr("id", function(d) {return "p" + (d[0] + "_-sep-_" + d[1]).replace(/ /g,"_")})
						.attr("rowId", function(d) {return d[0];})
						.attr("colId", function(d) {return d[1];})
						.on("mouseover", chart.pointMouseOver)
						.on("mouseout", chart.pointMouseOut)
						.on("click", function(d) {
							chart.get_on_click.apply(this, [d[0], d[1]]);
						});
			if(chart.get_showValue())
				chart.updateTexts();
		} else {
			var dispRowIds = chart.dispRowIds(),
				dispColIds = chart.dispColIds(),
				i = 0;

			while(i < chart.marked.length)
				if(dispRowIds.indexOf(chart.marked[i][0]) == -1 || dispColIds.indexOf(chart.marked[i][1]) == -1)
					chart.marked.splice(i, 1);
				else
					i++;

			if(!chart.updateStarted)
				chart.updateCanvas();
		}

		var newMarked = chart.get_marked().length;

		if(markedCells > newMarked)
			chart.markedUpdated();
		if(newMarked == 0)
			chart.g.selectAll(".data_point")
				.attr("opacity", 1);

		
		return chart;
	}

	chart.updateCellPosition = function(){
		if(!chart.checkMode())
			return chart;

		if(get_mode() == "svg"){
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
		} else {
			chart.updateCanvas();
		}

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

		return chart;		
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

	chart.updateLegendSize = function(){
		//calculate the size of element of legend
		var height = d3.min([chart.get_margin().bottom * 0.5, 20]),
			width = d3.min([chart.get_width()/23, 30]),
			fontSize = d3.min([chart.get_margin().bottom * 0.3, width / 2, 15]),
			blocks = chart.svg.select(".legend_panel").selectAll(".legend_block")
			.attr("transform", function(d) {
				return "translate(" + (d + 1) * width + ", 0)";
			});
		blocks.selectAll("text")
			.attr("font-size", fontSize)
			.attr("dy", chart.get_margin().bottom * 0.4)
			.attr("dx", width);
		blocks.selectAll("rect")
			.attr("height", height)
			.attr("width", width)
			.attr("y", chart.get_margin().bottom * 0.5);
	}

	chart.updateLegend = function(){
		var range = chart.get_colourRange(),
			step = (range[1] - range[0]) / 20,
			blocks = chart.svg.select(".legend_panel")
			.selectAll(".legend_block").data(d3.range(21))
				.enter().append("g")
					.attr("class", "legend_block");
		blocks.append("text")
			.attr("text-anchor", "end");
		blocks.append("rect");
		chart.svg.select(".legend_panel")
			.selectAll(".legend_block").selectAll("text")
				.text(function(d) {
					if(d % 2 == 0)
						return (range[0] + step * d).toFixed(2)
					else
						return "";
				});
		chart.svg.select(".legend_panel")
			.selectAll(".legend_block").selectAll("rect")
				.attr("fill", function(d) {return chart.colourScale(range[0] + step * d)});
	}

	chart.checkMode = function(){
		if((get_mode() == "svg") && (chart.canvas.classed("active"))) {
			chart.canvas.classed("active", false);
			chart.g.classed("active", true);
			chart.canvas.node().getContext("2d")
				.clearRect(0, 0, chart.plotWidth(), chart.plotHeight());

			chart.mark(chart.marked.map(function(e) {return "p" + e.join("_-sep-_")}));

			if(chart.updateStarted)
				return true;
			else{			
				chart.update();
				return false;
			}
		}
		if((get_mode() == "canvas") && chart.g.classed("active")){
			chart.canvas.classed("active", true);
			chart.marked = chart.g.selectAll(".marked").data();
			chart.g.classed("active", false);
			while (chart.g.node().firstChild) 
    		chart.g.node().removeChild(chart.g.node().firstChild);
		}
		return true;
	}

	chart.updateCanvas = function(){
		console.log("Canvas");
		var ctx = chart.canvas.node().getContext("2d");
		ctx.clearRect(0, 0, chart.plotWidth(), chart.plotHeight());
		var ncols = chart.ncols(), nrows = chart.nrows(),
			rowIds = chart.dispRowIds(),
			colIds = chart.dispColIds();
		var pixelHeatmap = document.createElement("canvas");
		pixelHeatmap.width = ncols;
		pixelHeatmap.height = nrows;
		
		//store colour of each cell
		var rgbColour, position;
		//create an object to store information on each cell of a heatmap
		var pixelData = new ImageData(ncols, nrows);

		for(var i = 0; i < nrows; i++)
			for(var j = 0; j < ncols; j++) {
					rgbColour = d3.rgb(chart.get_colour(chart.get_value(rowIds[i], 
																													colIds[j])));
					position = chart.get_heatmapRow(rowIds[i]) * ncols * 4 +
						chart.get_heatmapCol(colIds[j]) * 4;
					pixelData.data[position] = rgbColour.r;
					pixelData.data[position + 1] = rgbColour.g;
					pixelData.data[position + 2] = rgbColour.b;
			}
		//set opacity of pixels
		if(chart.marked.length == 0)
			for(var i = 0; i < ncols * nrows; i++)
				pixelData.data[i * 4 + 3] = 255
		else
			for(var i = 0; i < ncols * nrows; i++)
				pixelData.data[i * 4 + 3] = 75;
		for(var i = 0; i < chart.marked.length; i++){
			position = chart.get_heatmapRow(chart.marked[i][0]) * ncols * 4 +
						chart.get_heatmapCol(chart.marked[i][1]) * 4;			
			pixelData.data[position + 3] = 255;
		}
		
		//put a small heatmap on screen and then rescale it
		pixelHeatmap.getContext("2d").putImageData(pixelData, 0 , 0);

		ctx.imageSmoothingEnabled = false;
		//probaly no longer required, but let it stay here just in case
    //heatmapBody.mozImageSmoothingEnabled = false;
		//heatmapBody.webkitImageSmoothingEnabled = false;
    //heatmapBody.msImageSmoothingEnabled = false;

		ctx.drawImage(pixelHeatmap, 0, 0, 
			ncols, nrows,
			0, 0,	chart.plotWidth(), chart.plotHeight());

	}

	chart.getPoints = function(data){
		if(data.length == 2 && data[0].substr)
			data = [data];
		data = data.map(function(e) {return "p" + e.join("_-sep-_")});

		if(get_mode() == "svg") 
			return (data.length > 0) ?
				chart.svg.selectAll("#" + lc.escapeRegExp(data.join(", #").replace(/ /g, "_"))) :
				chart.svg.selectAll("______");
		else
			return data;
	}

	var inherited_get_marked = chart.get_marked;
	chart.get_marked = function(){
		if(get_mode() == "svg")
			return inherited_get_marked()
		else
			return chart.marked;
	}

	var inherited_mark = chart.mark;
	chart.mark = function(marked){
		if(get_mode() == "svg")
			inherited_mark(marked)
		else {
			if(marked == "__clear__")
				chart.marked = []
			else {
				if(marked.length && marked[0].substr)
					marked = marked.map(function(e) {return e.substr(1).split("_-sep-_")});
				var ids = chart.marked.map(function(e) {return e.join("_")}),
					ind;
				for(var i = 0; i < marked.length; i++){
					ind = ids.indexOf(marked[i].join("_"));
					if(ind == -1)
						chart.marked.push(marked[i])
					else {
						chart.marked.splice(ind, 1);
						ids.splice(ind, 1);
					}
				}
			}
		}

		if(get_mode() == "canvas")
			chart.updateCanvas();
		chart.markedUpdated();
		return chart;
	}	
	
	chart.update = function() {
		chart.updateTitle();
		chart.resetColourScale();
		chart.axes.x_label
			.text(chart.get_colTitle());
		chart.axes.y_label
			.text(chart.get_rowTitle());
		chart.updateStarted = true;
		chart.updateLabels()
			.updateSize()
			.updateLabelText()
			.updateCellColour();
		chart.updateStarted = false;

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