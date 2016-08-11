(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.d3 = global.d3 || {})));
}(this, function (exports) { 'use strict';

	var select = d3.select;   // To do: Figure out how to use import correctly with rollup
	// import {select} from "d3-select";    // This here doesn't work.

	function chartBase() {

	  var obj = {};

	  obj.add_property = function( propname, defaultval ) {
	    var getter = "get_" + propname;
	    obj[ propname ] = function( vf ) {
	      if( vf === undefined )
	        throw "No value passed in setter for property '" + propname + "'.";
	      if( typeof(vf) === "function" )
	        obj[ getter ] = vf
	      else
	        obj[ getter ] = function() { return vf };
	      return obj
	    }
	    //Allowing default values to be a function
			if(typeof defaultval === "function")
				obj[ getter ] = defaultval
			else
				obj[ getter ] = function() { return defaultval };
	    return obj;
	  }

	  obj.put_static_content = function() {
	  }

	  obj.place = function( element ) {
	    if( element === undefined )
	      element = "body";
	    if( typeof( element ) == "string" ) {
	      element = select( element );
	      if( element.size == 0 )
	        throw "Error in function 'place': DOM selection for string '" +
	          node + "' did not find a node."
	    }

	    obj.put_static_content( element );

	    obj.update();
	    return obj;
	  }

	  return obj;
	}

	function svgChartBase() {

	  var obj = chartBase()
	    .add_property( "width", 500 )
	    .add_property( "height", 400 )
	    .add_property( "margin", { top: 20, right: 10, bottom: 20, left: 10 } );

	  obj.put_static_content = function( element ) {
	    obj.real_svg = element.append( "svg" );
	    obj.svg = obj.real_svg.append( "g" );
	  }

	  obj.update = function( ) {
	    obj.real_svg
	      .attr( "width", obj.get_width() 
	          + obj.get_margin().left + obj.get_margin().right )
	      .attr( "height", obj.get_height() 
	          + obj.get_margin().top + obj.get_margin().bottom );
	    obj.svg
	      .attr( "transform", "translate(" + obj.get_margin().left + "," 
	          + obj.get_margin().top + ")" );
	    return obj;
	  }

	  return obj;
	}

	function divChartBase() {
		var obj = chartBase();
		
		obj.put_static_content = function(element) {
			obj.real_div = element.append("div");
		}
		
		return obj;
	}

	function scatterChart() {

	  var obj = svgChartBase()
	    .add_property( "x" )
	    .add_property( "y" )
	    .add_property( "style", "" )
	    .add_property( "numPoints" )
	    .add_property( "dataIds" );

	  obj
	    .add_property( "x_label", "" )
	    .add_property( "y_label", "" )
	    .add_property( "on_click", function() {} )

	  // Set default margin
	  obj.margin( { top: 20, right: 20, bottom: 30, left: 40 } );

	  // Set default for dataIds, namely to return numbers accoring to numPoints
	  obj.dataIds( function() { return d3.range( obj.get_numPoints() ) } );

	  // Set default for numPoints, namely to count the data provided for x
	  obj.numPoints( function() {
	    var val;
	    for( var i = 0; i < 10000; i++ ) {
	      try {
	        // try to get a value
	        val = obj.get_x(i)
	      } catch( exc ) {
	        // if call failed with exception, report the last successful 
	        // index, if any, otherwise zero
	        return i > 0 ? i-1 : 0;  
	      }
	      if( val === undefined ) {
	        // same again: return last index with defines return, if any,
	        // otherwise zero
	        return i > 0 ? i-1 : 0;  
	      }
	    }
	    // If we exit the loop, there is either something wrong or there are
	    // really many points
	    throw "There seem to be very many data points. Please supply a number via 'numPoints'."
	  })

	  var inherited_put_static_content = obj.put_static_content;
	  obj.put_static_content = function( element ) {
	    inherited_put_static_content( element );

	    obj.axes = {};

	    obj.axes.x_g = obj.svg.append( "g" )
	      .attr( "class", "x axis" )
	      .attr( "transform", "translate(0," + obj.get_height() + ")" );
	    obj.axes.x_label = obj.axes.x_g.append( "text" )
	      .attr( "class", "label" )
	      .attr( "fill", "black")   // why do I need this?
	      .style( "text-anchor", "end" );

	    obj.axes.y_g = obj.svg.append( "g" )
	      .attr( "class", "y axis" )
	    obj.axes.y_label = obj.axes.y_g.append( "text" )
	      .attr( "class", "label" )
	      .attr( "fill", "black")
	      .attr( "transform", "rotate(-90)" )
	      .style( "text-anchor", "end" );
	  }

	  var inherited_update = obj.update;
	  obj.update_not_yet_called = true;
	  obj.update = function() {
	    inherited_update();

	    var transition = d3.transition();
	    if( obj.update_not_yet_called ) {
	      obj.update_not_yet_called = false;
	      transition.duration( 0 );
	    } else
	      transition.duration(1000);

	    // Set scales and axes
	    var scale_x = d3.scaleLinear()
	      .domain( d3.extent( obj.get_dataIds(), function(k) { return obj.get_x(k) } ) )
	      .range( [ 0, obj.get_width() ] )
	      .nice();
	    var scale_y = d3.scaleLinear()
	      .domain( d3.extent( obj.get_dataIds(), function(k) { return obj.get_y(k) } ) )
	      .range( [ obj.get_height(), 0 ] )
	      .nice();

	    d3.axisBottom()
	      .scale( scale_x )
	      ( obj.axes.x_g.transition(transition) );

	    d3.axisLeft()
	      .scale( scale_y )
	      ( obj.axes.y_g.transition(transition) );

	    obj.axes.x_label
	      .attr( "x", obj.get_width() )
	      .attr( "y", -6 )
	      .text( obj.get_x_label() );

	    obj.axes.y_label
	      .attr( "y", 6 )
	      .attr( "dy", ".71em" )
	      .text( obj.get_y_label() )


	    var sel = obj.svg.selectAll( "circle.datapoint" )
	      .data( obj.get_dataIds() );
	    sel.exit()
	      .remove();  
	    sel.enter().append( "circle" )
	      .classed( "datapoint", true )
	      .attr( "r", 3 )
	    .merge( sel )
	      .on( "click", obj.get_on_click )
	      .transition(transition)
	        .attr( "cx", function(d) { return scale_x( obj.get_x(d) ) } )
	        .attr( "cy", function(d) { return scale_y( obj.get_y(d) ) } )
	        .attr( "style", function(d) { return obj.get_style(d) } );

	    return obj;
	  };


	  return obj;
	}

	function heatmapChart(){
		
		//user set parameters
		var obj = divChartBase()
				.add_property("nrows")
				.add_property("ncols")
				.add_property("value");
		
		//optional parameters with possible default values
		obj.add_property("mode", "default")
			.add_property("height", 1000)
			.add_property("width", 1000)
			.add_property("margin", {top: 100, bottom: 50, left: 100, right: 20})
			.add_property("colLabels", function(i) {return i;})
			.add_property("rowLabels", function(i) {return i;})
			.add_property("colIds", function() {return d3.range(obj.get_ncols());})
			.add_property("rowIds", function() {return d3.range(obj.get_nrows());})
			.add_property("colour", function(val) {return obj.colourScale(val);})
			.add_property("heatmapRow", function(rowId){return rowId;})
			.add_property("heatmapCol", function(colId) {return colId;})
			.add_property("palette", ["#0000FF", "#002FFF", "#005FFF", "#008FFF", "#00BFFF", 
				"#3FCFFF", "#7FDFFF", "#BFEFFF", "#FFFFFF", "#FDFDF3", "#FCFCE8", "#FBFBDD",
				"#FAFAD2", "#F7DBBD", "#F4BDA9", "#F29E94", "#F08080", "#F35F5F", "#F74040",
				"#FB1F1F", "#FF0000"]);
			
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

		//reset a colourScale
		//in cases like zooming and filtering we, probably, need to
		//use previously stored colourScale, so it will be reset only
		//when user tells it to
		obj.resetColourScale = function(){
			//create colorScale
			obj.colourScale = d3.scaleQuantile()
				.domain(obj.dataRange())
				.range(obj.get_palette());	
		}	
		
		var inherited_put_static_content = obj.put_static_content;
		obj.put_static_content = function(element){
			
			inherited_put_static_content(element);
			
			obj.real_div.style("position", "relative");
			
			obj.svg = obj.real_div.append("svg");
			
			//create main parts of the heatmap
			obj.svg.append("g")
				.attr("class", "row label_panel");
			obj.svg.append("g")
				.attr("class", "col label_panel");
			obj.svg.append("g")
				.attr("class", "legend_panel");

			obj.resetColourScale();
		}
		
		obj.update_not_yet_called = true;
		
		obj.updateSVG = function(cellSize, transition) {
			
			//if there is any canvas object, remove it
			obj.svg.selectAll("canvas").remove();
			
			//append or resize heatmap bode
			var heatmapBody = obj.svg.selectAll(".heatmap_body").data(["x"]);
			heatmapBody.enter()
				.append("g")
				.attr("class", "heatmap_body")
				.merge(heatmapBody).transition(transition)
					.attr("transform", "translate(" + obj.get_margin().left + ", " +
						obj.get_margin().top + ")");
			heatmapBody = obj.svg.select(".heatmap_body");
			
			//add rows
			var rows = heatmapBody.selectAll(".data_row").data(obj.get_rowIds());
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
			var cells = heatmapBody.selectAll(".data_row").selectAll(".data_point")
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
					.attr("width", cellSize.width)
					.attr("height", cellSize.height)
				.merge(cells).transition(transition)
					.attr("x", function(d){
						return obj.get_heatmapCol(d[1]) * cellSize.width;
					})
					.attr("fill", function(d) {
						return obj.get_colour(obj.get_value(d[0], d[1]));
					});
		}
		obj.updateCanvas = function() {
			
			//if there is a g object for heatmap body, remove it
			obj.svg.selectAll(".heatmapBody").remove();
			//if there is any canvas, remove it as well
			obj.svg.selectAll("canvas").remove();
			
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
			obj.svg.selectAll("canvas").remove();
			
			//append or resize heatmap bode
			var heatmapBody = obj.svg.selectAll(".heatmap_body").data(["x"]);
			heatmapBody.enter()
				.append("g")
				.attr("class", "heatmap_body")
				.merge(heatmapBody).transition(transition)
					.attr("transform", "translate(" + obj.get_margin().left + ", " +
						obj.get_margin().top + ")");
			heatmapBody = obj.svg.select(".heatmap_body");
			
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
				transition = d3.transition(0);
				obj.update_not_yet_called = false;
			} else {
				transition = d3.transition(1000);
			}

			//update sizes of all parts of the chart
			obj.real_div.transition(transition)
				.style("width", (obj.get_width() + obj.get_margin().left + obj.get_margin().right) + "px")
				.style("height", (obj.get_height() + obj.get_margin().top + obj.get_margin().bottom) + "px");

			obj.svg.transition(transition)
				.attr("height", obj.get_height() + obj.get_margin().top + obj.get_margin().bottom)
				.attr("width", obj.get_width() + obj.get_margin().left + obj.get_margin().right);
			
			obj.svg.selectAll(".label_panel").transition(transition)
				.attr("transform", "translate(" + obj.get_margin().left + ", " +
					obj.get_margin().top + ")");
			
			obj.svg.select(".legend_panel").transition(transition)
				.attr("transform", "translate(" + obj.get_margin().left + 
					", " + (obj.get_height() + obj.get_margin().top)  + ")");
				
			//calculate cell size
			var cellSize = {
				width: obj.get_width() / obj.get_ncols(),
				height: obj.get_height() / obj.get_nrows()
			}
					
			//add column labels
			var colLabels = obj.svg.select(".col").selectAll(".label")
					.data(obj.get_colIds());
			colLabels.exit()
				.remove();
			colLabels.enter()
				.append("text")
					.attr("class", "label")
					.attr("transform", "rotate(-90)")
					.style("text-anchor", "start")
				.merge(colLabels).transition(transition)
					.attr("font-size", cellSize.width)
					.attr("dy", function(d) {return cellSize.width * (obj.get_heatmapCol(d) + 1);})
					.attr("dx", 2)
					.text(function(d) {return obj.get_colLabels(d);});		
			
			//add row labels
			var rowLabels = obj.svg.select(".row").selectAll(".label")
					.data(obj.get_rowIds());
			rowLabels.exit()
				.remove();
			rowLabels.enter()
				.append("text")
					.attr("class", "label")
					.style("text-anchor", "end")
				.merge(rowLabels).transition(transition)
					.attr("font-size", cellSize.height)
					.attr("dy", function(d) {return cellSize.height * (obj.get_heatmapRow(d) + 1);})
					.attr("dx", -2)
					.text(function(d) {return obj.get_rowLabels(d)});

			//add legend
			var legendStep = (obj.colourScale.domain()[1] - obj.colourScale.domain()[0]) / 
					(obj.get_palette().length - 1),
				legendScale = [], legendElementWidth = 20,
				legendElementHeight = 10;
			//if default legend elements are to wide, make them shorter
			if(legendElementWidth * obj.get_palette().length > obj.get_width())
				legendElementWidth = obj.get_width() / obj.get_palette().length;

			for(var i = 0; i < obj.get_palette().length; i++)
				legendScale.push((obj.colourScale.domain()[0] + i * legendStep).toPrecision(2));

			var legendBlocks = obj.svg.select(".legend_panel")
				.selectAll(".legend").data(legendScale);	
			legendBlocks.enter()
				.append("g")
					.attr("class", "legend")
					.attr("num", function(d, i){return i;});
			legendBlocks = obj.svg.select(".legend_panel").selectAll(".legend");
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

	exports.chartBase = chartBase;
	exports.svgChartBase = svgChartBase;
	exports.divChartBase = divChartBase;
	exports.scatterChart = scatterChart;
	exports.heatmapChart = heatmapChart;

	Object.defineProperty(exports, '__esModule', { value: true });

}));