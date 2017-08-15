import { getEuclideanDistance, add_click_listener } from "./additionalFunctions";
import { chartBase } from "./chartBase";
import { dendogram } from "./dendogram";

export function heatmapChart(id, chart){

	var chart = chartBase()
		.add_property("nrows")
		.add_property("ncols");
	
	chart.add_property("colLabel", function(i) {return i;})
		.add_property("rowLabel", function(i) {return i;})
		.add_property("colIds", function() {return undefined})
		.add_property("rowIds", function() {return undefined})
		.add_property("dispColIds", function() {return chart.colIds();})
		.add_property("dispRowIds", function() {return chart.rowIds();})
		.add_property("heatmapRow", function(rowId) {return chart.dispRowIds().indexOf(rowId);})
		.add_property("heatmapCol", function(colId) {return chart.dispColIds().indexOf(colId);})
		.add_property("showDendogramRow", true)
		.add_property("showDendogramCol", true)
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
			return "Row: <b>" + chart.get_rowLabel(rowId) + "</b>;<br>" + 
						"Col: <b>" + chart.get_colLabel(colId) + "</b>;<br>" + 
						"value = " + chart.get_value(rowId, colId).toFixed(2)
			});

	chart.margins({top: 100, left: 100, right: 10, bottom: 40});

	chart.ncols("__override__", "colIds", function(){
		return d3.range(chart.get_ncols()).map(function(e) {return e.toString()});
	});
	chart.nrows("__override__", "rowIds", function(){
		return d3.range(chart.get_nrows()).map(function(e) {return e.toString()});
	});
	chart.rowIds("__override__", "nrows", function(){
		return chart.get_rowIds().length;
	});
	chart.colIds("__override__", "ncols", function(){
		return chart.get_colIds().length;
	});
	chart.rowIds("__override__", "dispRowIds", function(){
		return chart.rowIds();
	})
	chart.colIds("__override__", "dispColIds", function(){
		return chart.colIds();
	})

	chart.axes = {};
	chart.marked = [];

	(function() {
		var show = {Row: chart.showDendogramRow(), Col: chart.showDendogramCol()};
		chart.showDendogram = function(type, sh){
			if(sh === undefined)
				return show[type];
			show[type] = sh && chart["showDendogram" + type]();
			return chart;		
		}
	})();
	chart.showDendogram("Row", false)
		.showDendogram("Col", false);


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
			});

		if(chart.showPanel()){
			chart.panel.add_button("Zoom in", "#zoomIn", function(chart){
				var removeRows = -Math.ceil(chart.dispRowIds().length * 0.1),
					removeCols = -Math.ceil(chart.dispColIds().length * 0.1);
				chart.dispRowIds(chart.addLines(removeRows, "top"));
				chart.dispRowIds(chart.addLines(removeRows, "bottom"));
				chart.dispColIds(chart.addLines(removeCols, "left"));
				chart.dispColIds(chart.addLines(removeCols, "right"));

				chart.updateStarted = true;
				chart.updateLabels();
				chart.updateLabelPosition();
				chart.updateStarted = false;				
			}, "Double click to return to original scales");
			chart.panel.add_button("Zoom out", "#zoomOut", function(chart){
				var addRows = Math.ceil(chart.dispRowIds().length * 0.1),
					addCols = Math.ceil(chart.dispColIds().length * 0.1);
				
				chart.dispRowIds(chart.addLines(addRows, "top"));
				chart.dispRowIds(chart.addLines(addRows, "bottom"));
				chart.dispColIds(chart.addLines(addCols, "left"));
				chart.dispColIds(chart.addLines(addCols, "right"));

				chart.updateStarted = true;
				chart.updateLabels();
				chart.updateLabelPosition();
				chart.updateCellColour();
				chart.updateLabelText();
				chart.updateStarted = false;
			}, "Double click to return to original scales");
			chart.panel.add_button("Cluster rows", "#clusterRows", function(chart){
				chart.cluster("Row");
				chart.showDendogram("Row", true);
				chart.updateLabelPosition();
			});
			chart.panel.add_button("Cluster columns", "#clusterCols", function(chart){
				chart.cluster("Col");
				chart.showDendogram("Col", true);
				chart.updateLabelPosition();
			});
			chart.panel.add_button("Restore original order", "#restoreOrder", function(chart){
				var rowIds = chart.rowIds().slice(),
					colIds = chart.colIds().slice();
				chart.reorder("Row", function(a, b) {return rowIds.indexOf(a) - rowIds.indexOf(b)});
				chart.reorder("Col", function(a, b) {return colIds.indexOf(a) - colIds.indexOf(b)});
				if(chart.dendogramRow)
					chart.dendogramRow.remove();
				if(chart.dendogramCol)
					chart.dendogramCol.remove();
				chart.updateStarted = true;
				chart.updateLabels()
					.updateLabelPosition()
					.updateLabelText()
					.updateCellColour();
				chart.updateStarted = false;
			});				
		}
	}

	var get_mode = function() {
		if(chart.mode() == "default")
			return chart.dispColIds().length * chart.dispRowIds().length > 2500 ? "canvas" : "svg";
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
	chart.get_position = function(id){
		return [chart.axes.scale_x(chart.get_heatmapCol(id[1])) + chart.cellSize.width/2,
						chart.axes.scale_y(chart.get_heatmapRow(id[0])) + chart.cellSize.height/2]
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

	chart.reorder = function(type, f){
		if(f == "flip"){
			chart["get_heatmap" + type]("__flip__");
			chart.updateLabelPosition();
			return chart;
		}
		f.domain = chart["disp"+ type + "Ids"]().slice();
		var orderedIds = chart["get_heatmap" + type]("__order__");
		if(orderedIds == -1)
			orderedIds = chart[type.toLowerCase() + "Ids"]().slice();

		var savedOrder = orderedIds.slice();
		var newF = function(a, b){
			if(f.domain.indexOf(a) != -1 && f.domain.indexOf(b) != -1)
				return f(a, b);
			if(savedOrder.indexOf(a) != -1 && savedOrder.indexOf(b) != -1)
				return savedOrder.indexOf(a) - savedOrder.indexOf(b);
			return chart[type.toLowerCase() + "Ids"]().indexOf(a) -
							chart[type.toLowerCase() + "Ids"]().indexOf(b);
		}

		var dispIds = chart["disp" + type + "Ids"]().slice().sort(f);
		orderedIds.sort(newF);
		var mult = 1;

		chart["heatmap" + type](function(id){
			if(id == "__flip__"){
				mult *= -1;
				//dispIds.reverse();
				orderedIds.reverse();
				return;
			}
			if(id == "__order__")
				return orderedIds;
			if(id == "__sort__"){
				dispIds = chart["disp" + type + "Ids"]().slice().sort(function(a, b){return mult * newF(a, b);});
				return;
			}

			return dispIds.indexOf(id);
		});

		if(chart.svg){
			var invType;
			type == "Row" ? invType = "col" : invType = "row";
			chart.svg.select("." + invType).selectAll(".sorted")
				.classed("selected", false)
				.classed("sorted", false);		
		}
		return chart;
	}

	chart.addLines = function(k, side){
		var orderedIds, dispIds;
		if(side == "top" || side == "bottom"){
			orderedIds = chart.get_heatmapRow("__order__");
			if(orderedIds == -1)
				orderedIds = chart.rowIds();
			dispIds = chart.dispRowIds();
		}
		if(side == "left" || side == "right"){
			orderedIds = chart.get_heatmapCol("__order__");
			if(orderedIds == -1)
				orderedIds = chart.colIds();
			dispIds = chart.dispColIds();
		}
		if(k == 0) return dispIds;
		if(k < 0){
			k = -k;
			var pos, ind;
			if(side == "top" || side == "left"){
				pos = 0;
				while(k > 0 && dispIds.length > 1){
					ind = dispIds.indexOf(orderedIds[pos]);
					if(ind != -1){
						k--;
						dispIds.splice(ind, 1);
					}
					pos++;
				}
				return dispIds;
			}
			else{
				pos = orderedIds.length - 1;
				while(k > 0 && dispIds.length > 1){
					ind = dispIds.indexOf(orderedIds[pos]);
					if(ind != -1){
						k--;
						dispIds.splice(ind, 1);
					}
					pos--;
				}
				return dispIds;
			}
		}

		var border;
		if(side == "top" || side == "left"){
			border = orderedIds.length
			for(var i = 0; i < dispIds.length; i++)
				if(border > orderedIds.indexOf(dispIds[i]))
					border = orderedIds.indexOf(dispIds[i]);
			for(var i = border - 1; i >= d3.max([0, border - k]); i--)
				dispIds.unshift(orderedIds[i]);
		} else { 
			border = -1;
			for(var i = 0; i < dispIds.length; i++)
				if(border < orderedIds.indexOf(dispIds[i]))
					border = orderedIds.indexOf(dispIds[i]);
				for(var i = border + 1; i < d3.min([orderedIds.length, border + k + 1]); i++)
					dispIds.push(orderedIds[i]);
		}
		return dispIds;
	}
	
	var inherited_updateSize = chart.updateSize;
	chart.updateSize = function(){
		inherited_updateSize();
		if(chart.transitionDuration() > 0 && !chart.transitionOff){
			var t = d3.transition("size").duration(chart.transitionDuration());
			if(!chart.showDendogram("Row"))
				chart.svg.selectAll(".label_panel.row").transition(t)
					.attr("transform", "translate(" + chart.margins().left + ", " +
						chart.margins().top + ")");
			if(!chart.showDendogram("Col"))
				chart.svg.selectAll(".label_panel.col").transition(t)
					.attr("transform", "translate(" + chart.margins().left + ", " +
						chart.margins().top + ")");

			chart.svg.select(".legend_panel").transition(t)
				.attr("transform", "translate(0, " + 
					d3.min([chart.height() - 40, chart.height() - chart.margins().bottom * 0.9]) + ")");
			chart.axes.x_label.transition(t)
				.attr("font-size", d3.min([chart.margins().bottom - 2, 15]))
				.attr("x", chart.plotWidth() + chart.margins().left)
				.attr("y", chart.height());
			chart.axes.y_label.transition(t)
				.attr("font-size", d3.min([chart.margins().right - 2, 15]))
				.attr("x", - chart.margins().top)
				.attr("y", chart.width());
		} else {
			if(!chart.showDendogram("Row"))
				chart.svg.selectAll(".label_panel.row")
					.attr("transform", "translate(" + chart.margins().left + ", " +
						chart.margins().top + ")");
			if(!chart.showDendogram("Col"))
				chart.svg.selectAll(".label_panel.col")
					.attr("transform", "translate(" + chart.margins().left + ", " +
						chart.margins().top + ")");

			chart.svg.select(".legend_panel")
				.attr("transform", "translate(0, " + 
					d3.min([chart.height() - 40, chart.height() - chart.margins().bottom * 0.9]) + ")");
			chart.axes.x_label
				.attr("font-size", d3.min([chart.margins().bottom - 2, 15]))
				.attr("x", chart.get_plotWidth() + chart.margins().left)
				.attr("y", chart.get_height());
			chart.axes.y_label
				.attr("font-size", d3.min([chart.margins().right - 2, 15]))
				.attr("x", - chart.margins().top)
				.attr("y", chart.width());
		}
		chart.canvas
			.style("left", chart.margins().left + "px")
			.style("top", chart.margins().top + "px")
			.attr("width", chart.plotWidth())
			.attr("height", chart.plotHeight());		

		chart.updateLegendSize();
		chart.updateLabelPosition();
		return chart;
	}

	chart.updateLabelPosition = function(){
		var ncols = chart.dispColIds().length,
			nrows = chart.dispRowIds().length;
		chart.get_heatmapRow("__sort__");
		chart.get_heatmapCol("__sort__");
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

		if(chart.transitionDuration() > 0 && !chart.transitionOff){
			var t = d3.transition("labelPosition").duration(chart.transitionDuration());
			chart.svg.select(".col").selectAll(".label").transition(t)
				.attr("font-size", d3.min([chart.cellSize.width, 12]))
				.attr("y", function(d) {return chart.axes.scale_x(chart.get_heatmapCol(d) + 1);});
			chart.svg.select(".row").selectAll(".label").transition(t)
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
		
		if(chart.showDendogram("Col"))
			chart.drawDendogram("Col");
		if(chart.showDendogram("Row"))
			chart.drawDendogram("Row");
		
		return chart;
	}

	chart.updateLabels = function(){
		//add column labels
		var colLabel = chart.svg.select(".col").selectAll(".label")
				.data(chart.get_dispColIds(), function(d) {return d;});
		colLabel.exit()
			.remove();
		//add row labels
		var rowLabel = chart.svg.select(".row").selectAll(".label")
				.data(chart.get_dispRowIds(), function(d) {return d;});
		rowLabel.exit()
			.remove();
		colLabel.enter()
			.append("text")
				.attr("class", "label")
				.attr("transform", "rotate(-90)")
				.style("text-anchor", "start")
				.attr("dx", 2)
				.merge(colLabel)
					.attr("id", function(d) {return d.toString().replace(/ /g,"_")})
					.on("mouseover", chart.labelMouseOver)
					.on("mouseout", chart.labelMouseOut)
					.on("click", chart.labelClick);
		rowLabel.enter()
			.append("text")
				.attr("class", "label")
				.style("text-anchor", "end")
				.attr("dx", -2)
				.merge(rowLabel)
					.attr("id", function(d) {return d.toString().replace(/ /g,"_")})
					.on("mouseover", chart.labelMouseOver)
					.on("mouseout", chart.labelMouseOut)
					.on("click", chart.labelClick);

		chart.updateCells();
		return chart;
	}

	chart.updateLabelText = function(){
		if(chart.transitionDuration() > 0 && !chart.transitionOff){
			var t = d3.transition("labelText").duration(chart.transitionDuration());
			chart.svg.select(".col").selectAll(".label").transition(t)
				.text(function(d) {return chart.get_colLabel(d);});
			chart.svg.select(".row").selectAll(".label").transition(t)
				.text(function(d) {return chart.get_rowLabel(d)});		
		} else {
			chart.svg.select(".col").selectAll(".label")
				.text(function(d) {return chart.get_colLabel(d);});
			chart.svg.select(".row").selectAll(".label")
				.text(function(d) {return chart.get_rowLabel(d)});
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
		//chart.clusterRowIds(rowIds)
		//chart.clusterColIds(colIds)
		chart.updateLabels();
		chart.updateLabelPosition();
		//chart.cluster('Row')
		//	 .cluster('Col');
		//if(chart.dendogramRow) chart.drawDendogram("Row");
		//if(chart.dendogramCol) chart.drawDendogram("Col");
		return chart;
	}

	chart.resetDomain = function(){
		chart.dispColIds(chart.colIds());
		chart.dispRowIds(chart.rowIds());
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
		var range = chart.colourRange();
		chart.colourScale = d3.scaleSequential(chart.get_palette).domain(range);
		if(chart.showLegend())
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
			type == "col" ? chart.reorder("Row", "flip") : chart.reorder("Col", "flip");
		} else {
			//select new label and chage ordering
			if(type == "col"){
				chart.reorder("Row", function(a, b){
					return chart.get_value(b, d) - chart.get_value(a, d);
				});
				if(chart.dendogramRow)
					chart.dendogramRow.remove();
			} else {
				chart.reorder("Col", function(a, b){
					return chart.get_value(d, b) - chart.get_value(d, a);
				});
				if(chart.dendogramCol)
					chart.dendogramCol.remove();
			}
			chart.updateLabelPosition();
		}
		
		d3.select(this).classed("sorted", true)
			.classed("selected", true);
	};
	
	var isSorted = function(label) {
		var id = d3.select(label).datum(),
			sorted = true, i = 1, dataIds;

		if(d3.select(label.parentNode).classed("row")){
			dataIds = chart.dispColIds();
			while(sorted && i < dataIds.length) {
				if(chart.get_value(id, dataIds[i]) > chart.get_value(id, dataIds[i - 1]))
					sorted = false;
				i++;
			}
			if(sorted) return sorted;
			i = 1;
			sorted = true;
			while(sorted && i < dataIds.length) {
				if(chart.get_value(id, dataIds[i]) < chart.get_value(id, dataIds[i - 1]))
					sorted = false;
				i++;
			}
			return sorted;

		} else {
			dataIds = chart.dispRowIds();
			while(sorted && i < dataIds.length) {
				if(chart.get_value(dataIds[i], id) > chart.get_value(dataIds[i - 1], id))
					sorted = false;
				i++;
			}
			if(sorted) return sorted;
			i = 1;
			sorted = true;
			while(sorted && i < dataIds.length) {
				if(chart.get_value(dataIds[i], id) < chart.get_value(dataIds[i - 1], id))
					sorted = false;
				i++;
			}
			return sorted;
		}
	}

	chart.updateCellColour = function() {
		if(!chart.checkMode())
			return chart;

		if(get_mode() == "svg") {
			if(chart.transitionDuration() > 0 && !chart.transitionOff)
				chart.g.selectAll(".data_point").transition("cellColour").duration(chart.transitionDuration())
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

		chart.svg.selectAll(".sorted").filter(function(d){
			return !isSorted(this);
		})
			.classed("sorted", false)
			.classed("selected", false);
		
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
			if(chart.transitionDuration() > 0 && !chart.transitionOff)
				chart.g.selectAll(".data_point").transition("cellPosition")
					.duration(chart.transitionDuration())
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

	chart.cluster = function(type, features){
		console.log(type);
		if(type != "Row" && type != "Col")
			throw "Error in 'cluster': type " + type + " cannot be recognised. " +
					"Please, use either 'Row' or 'Col'";
		
		chart.showDendogram(type, true);

		if(chart["dendogram" + type] === undefined){
			chart["dendogram" + type] = dendogram(chart);
			type == "Row" ? chart["dendogram" + type].orientation("v") : chart["dendogram" + type].orientation("h"); 
		};

		chart["dendogram" + type]
			.dataIds(function() {
				return chart["disp" + type + "Ids"]();
			});
		if(features === undefined)
			type == "Row" ? features = chart.dispColIds() :
											features = chart.dispRowIds();
		//console.log(features);

		if(type == "Row")
			chart["dendogram" + type]
				.data(function(id) {
					return features.map(function(e) {return chart.get_value(id, e)});
				})
		else
			chart["dendogram" + type]
				.data(function(id) {
					return features.map(function(e) {return chart.get_value(e, id)});
				});

		chart["dendogram" + type]
			.distance(function(a, b){
				return chart["get_cluster" + type + "Metric"](a, b);
			})
			.cluster();

		var newOrder = chart["dendogram" + type].clusters.val_inds.map(function(e) {return e.toString()});

		chart.reorder(type, function(a, b){
			return newOrder.indexOf(a) - newOrder.indexOf(b);
		});

		//if(chart.g)
		//	chart.updateLabelPosition();	

		return chart;
	}

	chart.drawDendogram = function(type){
		//if rows (or columns) are not clustered and 
		//thus no dendogram is defined, do nothing
		if(chart["dendogram" + type] === undefined)
			return chart;
		if(chart["dendogram" + type].g === undefined)
			chart["dendogram" + type].place()
		else
			chart["dendogram" + type].g.selectAll("line")
				.remove();
			chart["dendogram" + type].draw();
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
		if(chart.transitionDuration() > 0 && !chart.transitionOff)
			chart.g.selectAll(".tval").transition("textPosition")
				.duration(chart.transitionDuration())
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
		if(chart.transitionDuration() > 0 && !chart.transitionOff)
			chart.g.selectAll(".tval").transition("textValues")
				.duration(chart.transitionDuration())
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
		var height = d3.min([chart.margins().bottom * 0.5, 20]),
			width = d3.min([chart.width()/23, 30]),
			fontSize = d3.min([chart.margins().bottom * 0.3, width / 2, 15]),
			blocks = chart.svg.select(".legend_panel").selectAll(".legend_block")
			.attr("transform", function(d) {
				return "translate(" + (d + 1) * width + ", 0)";
			});
		blocks.selectAll("text")
			.attr("font-size", fontSize)
			.attr("dy", chart.margins().bottom * 0.45)
			.attr("dx", width);
		blocks.selectAll("rect")
			.attr("height", height)
			.attr("width", width)
			.attr("y", chart.margins().bottom * 0.5);
	}

	chart.updateLegend = function(){
		var range = chart.get_colourRange(),
			step = (range[1] - range[0]) / 20,
			blocks = chart.svg.select(".legend_panel")
			.selectAll(".legend_block").data(d3.range(21))
				.enter().append("g")
					.attr("class", "legend_block");
		blocks.append("text")
			.attr("text-anchor", "end")
			.attr("class", "plainText");
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
				.attr("fill", function(d) {return chart.get_colour(range[0] + step * d)});
	}

	chart.checkMode = function(){
		if((get_mode() == "svg") && (chart.canvas.classed("active"))) {
			chart.canvas.classed("active", false);
			chart.g.classed("active", true);
			chart.canvas.node().getContext("2d")
				.clearRect(0, 0, chart.plotWidth(), chart.plotHeight());

			if(chart.updateStarted)
				return true;
			else{			
				chart.updateStarted = true;
				chart.updateLabels()
					.updateLabelText()
					.updateCellColour();
				chart.updateStarted = false;
				chart.mark(chart.marked.map(function(e) {return "p" + e.join("_-sep-_")}));
				chart.marked = [];
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
		var rowIds = chart.dispRowIds(),
			colIds = chart.dispColIds(),
			ncols = colIds.length, nrows = rowIds.length;
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
	
	chart.pan.move = function(p) {
		var move = [p[0] - chart.pan.down[0], p[1] - chart.pan.down[1]],
			addRows = Math.floor(Math.abs(move[1] / chart.cellSize.height)),
			addCols = Math.floor(Math.abs(move[0] / chart.cellSize.width));
		chart.pan.down[0] += Math.sign(move[0]) * addCols * chart.cellSize.width;
		chart.pan.down[1] += Math.sign(move[1]) * addRows * chart.cellSize.height;

		chart.dispColIds(chart.addLines(-Math.sign(move[0]) * addCols, "right"));
		chart.dispColIds(chart.addLines(Math.sign(move[0]) * addCols, "left"));
		chart.dispRowIds(chart.addLines(Math.sign(move[1]) * addRows, "top"));
		chart.dispRowIds(chart.addLines(-Math.sign(move[1]) * addRows, "bottom"));

		if(Math.abs(addRows) + Math.abs(addCols) > 0) {
			chart.updateStarted = true;
			chart.updateLabels();
			chart.updateLabelPosition();
			chart.updateCellColour();
			chart.updateLabelText();
			chart.updateStarted = false;
		}			
	}

	chart.update = function() {
		chart.updateTitle();
		chart.resetColourScale();
		chart.dispColIds(function() {return chart.colIds();});
		chart.dispRowIds(function() {return chart.rowIds();});
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

