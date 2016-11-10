import { base } from "./base";
import { layerBase } from "./layerBase";

//basic chart object
export function chartBase() {
	var chart = base()
		.add_property("width", 500)
		.add_property("height", 500)
		.add_property("margin", { top: 20, right: 10, bottom: 50, left: 50 })
		.add_property("transitionDuration", 1000);
	
  chart.put_static_content = function( element ) {
		chart.container = element.append("div");
		chart.svg = chart.container.append("svg");
	}

  chart.place = function( element ) {
    if( element === undefined )
      element = "body";
    if( typeof( element ) == "string" ) {
      element = d3.select( element );
      if( element.size == 0 )
        throw "Error in function 'place': DOM selection for string '" +
          node + "' did not find a node."
    }

		chart.put_static_content( element );

    chart.update();
    return chart;
  }
	
	chart.update_not_yet_called = true;
	
	chart.update = function(){
		
		var k;
		if(chart.update_not_yet_called){
			chart.update_not_yet_called = false;
			chart.transition = 
				d3.transition().duration(0);
		} else {
			chart.transition = 
				d3.transition().duration(chart.get_transitionDuration());
		}

		chart.svg.transition(chart.transition)
			.attr("width", 
				chart.get_width() + chart.get_margin().left + chart.get_margin().right)
			.attr("height", 
				chart.get_height() + chart.get_margin().top + chart.get_margin().bottom);
		chart.container.transition(chart.transition)
			.style("width", 
				(chart.get_width() + chart.get_margin().left + chart.get_margin().right)
				+ "px")
			.style("height", 
				(chart.get_height() + chart.get_margin().top + chart.get_margin().bottom) 
				+ "px");
		return chart;
	}
	
  return chart;
}

export function layerChartBase(){
	var chart = chartBase();
	chart.properties.push("add_layer");
	chart.properties.push("get_layer");
	chart.properties.push("place");
	
	//Basic layer functionality
	chart.layers = {};

	chart.get_nlayers = function() {
		return Object.keys(chart.layers).length;
	}
	chart.get_layer = function(k) {
		return chart.layers[k];
	}
	chart.add_layer = function(k) {
		if(typeof k === "undefined")
			k = "layer" + chart.get_nlayers();
		var layer = layerBase();
		chart.layers[k] = {};
		layer.chart = chart;
		chart.layers[k] = layer;
		//Object.assign(chart.layers[k], layer)

		for(var i = 0; i < chart.properties.length; i++){
			layer[chart.properties[i]] = chart[chart.properties[i]];
			layer["get_" + chart.properties[i]] = chart["get_" + chart.properties[i]];
		}
			
		return chart.get_layer(k);
	}
	chart.setActiveLayer = function(id) {
		var layer = chart.layers[id];
		for(var i = 0; i < layer.properties.length; i++){
			chart[layer.properties[i]] = layer[layer.properties[i]];
			chart["get_" + layer.properties[i]] = layer["get_" + layer.properties[i]];
		}
		return chart;
	}
	
var inherited_put_static_content = chart.put_static_content;
	chart.put_static_content = function(element){
		inherited_put_static_content(element);
		chart.container.append("div")
			.attr("class", "inform hidden")
			.append("p")
				.attr("class", "value");		
	}

	var inherited_update = chart.update;
	chart.update = function() {
		inherited_update();

		for(var k in chart.layers)
			chart.get_layer(k).update();
		
		chart.svg.select(".clickPanel")
			//.attr("x", chart.get_margin().left)
			//.attr("y", chart.get_margin().top)
			.attr("width", chart.get_width())
			.attr("height", chart.get_height());

		return chart;
	}
	return chart;
}

export function axisChartBase() {
	
	var chart = layerChartBase();
	
	chart.add_property("singleScaleX", true)
		.add_property("singleScaleY", true)
		.add_property("domainX")
		.add_property("domainY")
		.add_property("labelX")
		.add_property("labelY");
	
	//default getter for domainX
	var get_domainX = function() {
		//TODO: add possibility of adding several axises
		//(one for each plot.layer)
		var domain;
		
		if(chart.get_singleScaleX()){
			var contScale = true;
			for(var k in chart.layers)
				contScale = contScale && chart.get_layer(k).get_contScaleX();
			if(contScale){ //if resulting scale is continous, find minimun and maximum values
				for(var k in chart.layers)
					//some of the layers may not have domains at all (such as legends)
					if(typeof chart.get_layer(k).get_layerDomainX() !== "undefined")
						if(typeof domain === "undefined") 
							domain = chart.get_layer(k).get_layerDomainX()
						else {
							domain[0] = d3.min([domain[0], chart.get_layer(k).get_layerDomainX()[0]]);
							domain[1] = d3.min([domain[1], chart.get_layer(k).get_layerDomainX()[1]]);
						}
			} else { //if scale is categorical, find unique values from each layer
				for(var k in chart.layers)
					if(typeof chart.get_layer(k).get_layerDomainX() !== "undefined")
						if(typeof domain === "undefined") 
							domain = chart.get_layer(k).get_layerDomainX()
						else 
							domain = domain.concat(chart.get_layer(k).get_layerDomainX()
								.filter(function(e){
									return domain.indexOf(e) < 0;
								}));
			}
		}
		
		return domain;
	}
	var get_domainY = function() {
		var domain;
		
		if(chart.get_singleScaleY()){
			var contScale = true;
			for(var k in chart.layers)
				contScale = contScale && chart.get_layer(k).get_contScaleY();
			if(contScale){
				for(var k in chart.layers)
					if(typeof chart.get_layer(k).get_layerDomainY() !== "undefined")
						if(typeof domain === "undefined") 
							domain = chart.get_layer(k).get_layerDomainY()
						else {
							domain[0] = d3.min([domain[0], chart.get_layer(k).get_layerDomainY()[0]]);
							domain[1] = d3.min([domain[1], chart.get_layer(k).get_layerDomainY()[1]]);
						}							
			} else { //if scale is categorical, find unique values from each layer
				for(var k in chart.layers)
					if(typeof chart.get_layer(k).get_layerDomainY() !== "undefined")
						if(typeof domain === "undefined") 
							domain = chart.get_layer(k).get_layerDomainY()
						else 
							domain = domain.concat(chart.get_layer(k).get_layerDomainY()
								.filter(function(e){
									return domain.indexOf(e) < 0;
								}));
			}
		}
		
		return domain;
	}

	chart.get_domainX = get_domainX;
	chart.get_domainY = get_domainY;

	//redefine setters for axis domains
	chart.domainX = function(domain){
		//set default getter
		if(domain == "reset"){
			chart.domainX(get_domainX());
			return chart;
		}
		//if user provided function, use this function
		if(typeof domain === "function")
			chart.get_domainX = domain;
		if(domain.length)
			chart.get_domainX = function() {
				return domain;
			};
			
		return chart;
	}
	chart.domainY = function(domain){
		if(domain == "reset"){
			chart.domainY(get_domainY());
			return chart;
		}
		if(typeof domain === "function")
			chart.get_domainY = domain;
		if(domain.length)
			chart.get_domainY = function() {
				return domain;
			};
		
		return chart;
	}
	
  var inherited_put_static_content = chart.put_static_content;
  chart.put_static_content = function( element ) {
    inherited_put_static_content( element );

    chart.axes = {};
		
		var g = chart.svg.append("g")
			.attr("transform", "translate(" + chart.get_margin().left + 
				", " + chart.get_margin().top + ")");
		
    chart.axes.x_g = g.append( "g" )
      .attr( "class", "x axis" )
      .attr( "transform", "translate(0," + chart.get_height() + ")" );
    chart.axes.x_label = chart.axes.x_g.append( "text" )
      .attr( "class", "label" )
      .style( "text-anchor", "end" );

    chart.axes.y_g = g.append( "g" )
      .attr( "class", "y axis" )
    chart.axes.y_label = chart.axes.y_g.append( "text" )
      .attr( "class", "label" )
      .attr( "transform", "rotate(-90)" )
      .style( "text-anchor", "end" );
  }	
	
	var inherited_update = chart.update;
	
	chart.update = function() {
	
		//set scales and update axes
		var domainX = chart.get_domainX();
		if(domainX.length == 2)
			chart.axes.scale_x = d3.scaleLinear()
				.domain( domainX )
				.range( [ 0, chart.get_width() ] )
				.nice()
		else{
			chart.axes.scale_x = d3.scalePoint()
				.domain( domainX )
				.range( [0, chart.get_width()] )
				.padding(0.3);	
		}
		
		var domainY = chart.get_domainY();
		if(domainY.length == 2)
			chart.axes.scale_y = d3.scaleLinear()
				.domain( domainY )
				.range( [chart.get_height(), 0] )
				.nice()
		else
			chart.axes.scale_y = d3.scalePoint()
				.domain( get_domainY )
				.range( [chart.get_height(), 0] )
				.padding(0.3);
		
		inherited_update();
		
    d3.axisBottom()
      .scale( chart.axes.scale_x )
      ( chart.axes.x_g.transition(chart.transition) );

    d3.axisLeft()
      .scale( chart.axes.scale_y )
      ( chart.axes.y_g.transition(chart.transition) );

    chart.axes.x_label
      .attr( "x", chart.get_width() )
      .attr( "y", -6 )
      .text( chart.get_labelX() );

    chart.axes.y_label
      .attr( "y", 6 )
      .attr( "dy", ".71em" )
      .text( chart.get_labelY() );
		
		return chart;
	}
	
	return chart;
}

export function tableChartBase() {
	
	var chart = layerChartBase();
	
	chart.add_property("nrows")
		.add_property("ncols");
	
	chart.add_property("colLabels", function(i) {return i;})
		.add_property("rowLabels", function(i) {return i;})
		.add_property("colIds", function() {return undefined})
		.add_property("rowIds", function() {return undefined})
		.add_property("dispColIds", function() {return chart.get_rowIds();})
		.add_property("dispRowIds", function() {return chart.get_colIds();})
		.add_property("heatmapRow", function(rowId) {return chart.get_dispRowIds().indexOf(rowId);})
		.add_property("heatmapCol", function(colId) {return chart.get_dispColIds().indexOf(colId);})
		.add_property("labelMouseOver")
		.add_property("labelMouseOut")
		.add_property("colStyle", "")
		.add_property("rowStyle", "");

	//if user specifies column or row Ids, set the number of rows or columns automatically
	/*chart.colIds = function(f) {
		if(f.length) chart.ncols(f.length);
		typeof f == "function" ? chart.get_colIds = f : chart.get_colIds = function() {return f;};
	}
	chart.rowIds = function(f) {
		if(f.length) chart.nrows(f.length);
		typeof f == "function" ? chart.get_rowIds = f : chart.get_rowIds = function() {return f;};
	}
*/
	
	//make nrows and ncols protected from recursion
	//if get_colIds and get_rowIds are not using get_ncols
	//and get_nrows, the number of rows and columns will be
	//set equal to the number of Ids
	chart.ncols = function(n){
		if(!chart.get_colIds())
			chart.colIds(d3.range(n));
		return chart;
	}
	chart.nrows = function(n){
		if(!chart.get_rowIds())
			chart.rowIds(d3.range(n));
		return chart;
	}

	chart.get_nrows = (function() {
			var inFun = false;
			return function(){
				if(inFun) return undefined;
				inFun = true;
				try {
					return chart.get_dispRowIds().length;
				} finally {
					inFun = false;
				}
			}
		})();
	chart.get_ncols = (function() {
			var inFun = false;
			return function(){
				if(inFun) return undefined;
				inFun = true;
				try {
					return chart.get_dispColIds().length;
				} finally {
					inFun = false;
				}
			}
		})();

	//set default hovering behaviour
	chart.labelMouseOver(function() {
		d3.select(this).classed("hover", true);
	});
	chart.labelMouseOut(function() {
		d3.select(this).classed("hover", false);
	});
	
	chart.reorderRow = function(f){
		if(f == "flip"){
			chart.get_heatmapRow("__flip__");
			return chart;
		}
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
		
		return chart;
	}
	chart.reorderCol = function(f){
		if(f == "flip"){
			chart.get_heatmapCol("__flip__");
			return chart;
		}
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
		return chart;
	}
	
	
	var inherited_put_static_content = chart.put_static_content;
	chart.put_static_content = function(element){
		
		inherited_put_static_content(element);
		
		//chart.container.style("position", "relative");

		//create main parts of the heatmap
		chart.svg.append("g")
			.attr("class", "row label_panel");
		chart.svg.append("g")
			.attr("class", "col label_panel");
		
		//delete later if unnecessary
		chart.axes = {};
	}
	
	var inherited_update = chart.update;
	chart.update = function() {
		//update sizes of all parts of the chart
		chart.container.transition(chart.transition)
			.style("width", (chart.get_width() + chart.get_margin().left + chart.get_margin().right) + "px")
			.style("height", (chart.get_height() + chart.get_margin().top + chart.get_margin().bottom) + "px");

		chart.svg.transition(chart.transition)
			.attr("height", chart.get_height() + chart.get_margin().top + chart.get_margin().bottom)
			.attr("width", chart.get_width() + chart.get_margin().left + chart.get_margin().right);
		
		chart.svg.selectAll(".label_panel").transition(chart.transition)
			.attr("transform", "translate(" + chart.get_margin().left + ", " +
				chart.get_margin().top + ")");
			
		//calculate cell size
		chart.cellSize = {
			width: chart.get_width() / chart.get_ncols(),
			height: chart.get_height() / chart.get_nrows()
		}
		
		//create scales
		chart.axes.scale_x = d3.scaleLinear()
			.domain( [0, chart.get_ncols() - 1] )
			.range( [0, chart.get_width() - chart.cellSize.width] )
			.nice();
		chart.axes.scale_y = d3.scaleLinear()
			.domain( [0, chart.get_nrows() - 1] )
			.range( [0, chart.get_height() - chart.cellSize.height] )
			.nice();

		//add column labels
		var colLabels = chart.svg.select(".col").selectAll(".label")
				.data(chart.get_dispColIds().slice());
		colLabels.exit()
			.remove();
		colLabels.enter()
			.append("text")
				.attr("class", "label")
				.attr("transform", "rotate(-90)")
				.style("text-anchor", "start")
				.on("mouseover", chart.get_labelMouseOver)
				.on("mouseout", chart.get_labelMouseOut)
			.merge(colLabels).transition(chart.transition)
				.attr("font-size", d3.min([chart.cellSize.width, 12]))
				.attr("dy", function(d) {return chart.axes.scale_x(chart.get_heatmapCol(d) + 1);})
				.attr("dx", 2)
				.text(function(d) {return chart.get_colLabels(d);});		
		
		//add row labels
		var rowLabels = chart.svg.select(".row").selectAll(".label")
				.data(chart.get_dispRowIds().slice());
		rowLabels.exit()
			.remove();
		rowLabels.enter()
			.append("text")
				.attr("class", "label")
				.style("text-anchor", "end")
				.on("mouseover", chart.get_labelMouseOver)
				.on("mouseout", chart.get_labelMouseOut)
			.merge(rowLabels).transition(chart.transition)
				.attr("font-size", d3.min([chart.cellSize.height, 12]))
				.attr("dy", function(d) {return chart.axes.scale_y(chart.get_heatmapRow(d) + 1);})
				.attr("dx", -2)
				.text(function(d) {return chart.get_rowLabels(d)});
		
		inherited_update();

		return chart;
	}		
	
	return chart;
}
