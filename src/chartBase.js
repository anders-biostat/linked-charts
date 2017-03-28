import { base } from "./base";
import { layerBase } from "./layerBase";
import { add_click_listener } from "./additionalFunctions";
import { legend } from "./legend";
//basic chart object
export function chartBase() {
	var chart = base()
		.add_property("width", 500)
		.add_property("height", 500)
		.add_property("plotWidth", 440)
		.add_property("plotHeight", 440)
		.add_property("margin", { top: 15, right: 10, bottom: 50, left: 50 })
		.add_property("title", "")
		.add_property("titleX", function() {return chart.width() / 2;})
		.add_property("titleY", function() {return d3.min([17, chart.margin().top * 0.9]);})
		.add_property("titleSize", function() {return d3.min([15, chart.margin().top * 0.8]);})
		.add_property("transitionDuration", 1000)
		.add_property("markedUpdated", function() {}); //may be set to zero
	
	chart.transition = undefined;
  chart.width("_override_", "plotWidth", function(){
  			return chart.get_width() - 
  				(chart.get_margin().right + chart.get_margin().left);
  });
/*  chart.plotWidth("_override_", "width", function(){
  			return chart.get_plotWidth() +
  				(chart.get_margin().right + chart.get_margin().left);
  }); */
  chart.margin("_override_", "plotWidth", function(){
  			return chart.get_width() - 
  				(chart.get_margin().right + chart.get_margin().left);
  });
  chart.height("_override_", "plotHeight", function(){
  			return chart.get_height() - 
  				(chart.get_margin().top + chart.get_margin().bottom);
  });
 /* chart.plotHeight("_override_", "height", function(){
  			return chart.get_plotHeight() +
  				(chart.get_margin().top + chart.get_margin().bottom);
  }); */
  chart.margin("_override_", "plotHeight", function(){
  			return chart.get_height() - 
  				(chart.get_margin().top + chart.get_margin().bottom);
  });

  chart.set_margin = function(margin){
  	if(typeof margin.top === "undefined")
  		margin.top = chart.margin().top;
  	if(typeof margin.bottom === "undefined")
  		margin.bottom = chart.margin().bottom;
  	if(typeof margin.left === "undefined")
  		margin.left = chart.margin().left;
  	if(typeof margin.right === "undefined")
  		margin.right = chart.margin().right;
  	
  	chart.margin(margin);
  	return chart;
  }

  chart.put_static_content = function( element ) {
		chart.container = element.append("div");
		chart.container.node().ondragstart = function() { return false; };
		chart.svg = chart.container.append("svg");
		chart.viewBox = chart.svg.append("defs")
			.append("clipPath")
				.attr("id", "viewBox")
				.append("rect");
		chart.container.append("div")
			.attr("class", "inform hidden")
			.append("p")
				.attr("class", "value");
		chart.svg.append("text")
			.attr("class", "title plainText")
			.attr("text-anchor", "middle");
	}

	chart.defineTransition = function(){
		chart.transition = 
			d3.transition().duration(chart.transitionDuration());
		chart.transition
			.on("end", chart.defineTransition);
	}

	chart.mark = function(selection) {
		if(selection == "__clear__"){
			chart.svg.selectAll(".data_point.marked")
				.classed("marked", false);
			chart.svg.selectAll(".data_point")
				.attr("opacity", 1);
			return;
		}

		if(chart.svg.selectAll(".data_point.marked").empty())
			chart.svg.selectAll(".data_point")
				.attr("opacity", 0.5);
		selection.classed("switch", true);
		if(selection.size() < 2)
			selection.filter(function() {return d3.select(this).classed("marked");})
				.classed("switch", false)
				.classed("marked", false)
				.attr("opacity", 0.5);
		selection.filter(function() {return d3.select(this).classed("switch");})
			.classed("marked", true)
			.classed("switch", false)
			.attr("opacity", 1);
		if(chart.svg.selectAll(".data_point.marked").empty())
			chart.svg.selectAll(".data_point")
				.attr("opacity", 1);

		chart.markedUpdated();
	}

	chart.afterUpdate = function(){
		if(chart.get_transitionDuration() != 0)
			chart.defineTransition();
	}

  chart.place = function( element ) {
    if( element === undefined )
      element = "body";
    if( typeof( element ) == "string" ) {
      var node = element;
      element = d3.select( node );
      if( element.size() == 0 )
        throw "Error in function 'place': DOM selection for string '" +
          node + "' did not find a node."
  	}

		chart.put_static_content( element );
    chart.update();
    chart.afterUpdate();
    return chart;
  }
	
	//update parts
	chart.updateSize = function(){
		chart.viewBox
			.attr("x", -5) //Let's leave some margin for a view box so that not to cut
			.attr("y", -5) //points that are exactly on the edge
			.attr("width", chart.get_plotWidth() + 10) 
			.attr("height", chart.get_plotHeight() + 10);
		if(typeof chart.transition !== "undefined"){
			chart.svg.transition(chart.transition)
				.attr("width", chart.get_width())
				.attr("height", chart.get_height());
			chart.container.transition(chart.transition)
				.style("width", chart.get_width() + "px")
				.style("height", chart.get_height() + "px");
			chart.svg.select(".title").transition(chart.transition)
				.attr("font-size", chart.titleSize())
				.attr("x", chart.titleX())
				.attr("y", chart.titleY());
		} else {
			chart.svg
				.attr("width", chart.get_width())
				.attr("height",	chart.get_height());
			chart.container
				.style("width", chart.get_width() + "px")
				.style("height", chart.get_height() + "px");
			chart.svg.select(".title")
				.attr("font-size", chart.titleSize())
				.attr("x", chart.titleX())
				.attr("y", chart.titleY());
		}
		return chart;			
	}
	chart.updateTitle = function(){
		chart.svg.select(".title")
			.text(chart.title());		
	}

	chart.update = function(){
		chart.updateSize();
		chart.updateTitle();
		return chart;
	}
  return chart;
}

export function layerChartBase(){
	var chart = chartBase()
		.add_property("activeLayer", undefined)
		.add_property("showLegend", true);
	
	chart.legend = legend(chart);

	//Basic layer functionality
	chart.layers = {};
	var findLayerProperty = function(propname){
		return function() {
			if(chart.get_activeLayer()[propname])
				return chart.get_activeLayer()[propname].apply(chart, arguments)
			else {
				for(var i in chart.layers)
					if(chart.layers[i][propname])
						return chart.layers[i][propname].apply(chart, arguments);
				return;
			}
		}
	}
	chart.syncProperties = function(layer){
		for(var i in layer)
			if(typeof chart[i] === "undefined")
				chart[i] = findLayerProperty(i);
	}

	chart.get_nlayers = function() {
		return Object.keys(chart.layers).length;
	}
	chart.get_layer = function(id) {
		return chart.layers[id];
	}
	chart.add_layer = function(id) {
		if(typeof id === "undefined")
			id = "layer" + chart.get_nlayers();
		var layer = layerBase(id);
		layer.chart = chart;
		chart.layers[id] = layer;
		chart.activeLayer(chart.get_layer(id));

		return chart;
	}

	chart.findPoints = function(lu, rb){
		var selPoints = [];
		chart.svg.selectAll(".chart_g").each(function(){
			selPoints.unshift(
				chart.get_layer(d3.select(this).attr("id")).findPoints(lu, rb)
			);
		});
		return selPoints;
	}

	chart.placeLayer = function(id){
		chart.get_layer(id).put_static_content();
		chart.get_layer(id).updateSize();
		chart.get_layer(id).update();
	}

	var inherited_put_static_content = chart.put_static_content;
	chart.put_static_content = function(element){
		inherited_put_static_content(element);
		add_click_listener(chart);
		chart.legend.g = chart.svg.append("g");
		for(var k in chart.layers)
			chart.get_layer(k).put_static_content();		
	}

	var inherited_update = chart.update;
	chart.update = function() {
		for(var k in chart.layers){
			chart.get_layer(k).updatePoints();
			chart.get_layer(k).updatePointStyle();
		}
		inherited_update();
		if(chart.showLegend() && Object.keys(chart.legend.blocks).length > 0)
			chart.legend.update();
		return chart;
	}

	var inherited_afterUpdate = chart.afterUpdate;
	chart.afterUpdate = function(){
		inherited_afterUpdate();
		for(var k in chart.layers)
			chart.get_layer(k).afterUpdate();
	}

	var inherited_updateSize = chart.updateSize;
	chart.updateSize = function(){
		inherited_updateSize();
		for(var k in chart.layers)
			chart.get_layer(k).updateSize();
	}

	return chart;
}

export function axisChart() {
	
	var chart = layerChartBase();
	
	chart.add_property("singleScaleX", true)
		.add_property("singleScaleY", true)
		.add_property("domainX")
		.add_property("domainY")
		.add_property("aspectRatio", null)
		.add_property("labelX")
		.add_property("labelY")
		.add_property("ticksX", undefined)
		.add_property("ticksY", undefined);

	chart.axes = {};
	
	//default getter for domain
	//tries to make domain fit data from all layers
	//for axis capital letters a supposed to be used
	var get_domain = function(axis) {
		return function() {
			var domain;
			//TODO: add possibility of adding several axises
			//(one for each plot.layer)
			if(chart["get_singleScale" + axis]()){
				//if all the layers use continuous scale, make the scale continuous
				//otherwise make it categorical
				var contScale = true;
				for(var k in chart.layers)
					contScale = contScale && chart.get_layer(k)["get_contScale" + axis]();

				if(contScale){//if resulting scale is continous, find minimun and maximum values
					for(var k in chart.layers)
						//some of the layers may not have domains at all (such as legends)
						if(typeof chart.get_layer(k)["get_layerDomain" + axis]() !== "undefined")
							if(typeof domain === "undefined") 
								domain = chart.get_layer(k)["get_layerDomain" + axis]()
							else {
								domain[0] = d3.min([domain[0], chart.get_layer(k)["get_layerDomain" + axis]()[0]]);
								domain[1] = d3.max([domain[1], chart.get_layer(k)["get_layerDomain" + axis]()[1]]);
							}
				} else { //if scale is categorical, find unique values from each layer
					for(var k in chart.layers)
						if(typeof chart.get_layer(k)["get_layerDomain" + axis]() !== "undefined")
							if(typeof domain === "undefined") 
								domain = chart.get_layer(k)["get_layerDomain" + axis]()
							else 
								domain = domain.concat(chart.get_layer(k)["get_layerDomain" + axis]()
									.filter(function(e){
										return domain.indexOf(e) < 0;
									}));
				}
			}
			return domain;
		}
	}

	chart.get_domainX = get_domain("X");
	chart.get_domainY = get_domain("Y");

	//redefine setters for axis domains
	chart.domainX = function(domain){
		//set default getter
		if(domain == "reset"){
			chart.domainX(chart.origDomainX);
			return chart;
		}
		//if user provided function, use this function
		if(typeof domain === "function")
			chart.get_domainX = domain;
		if(domain.splice)
			chart.get_domainX = function() {
				return domain;
			};
			
		return chart;
	}
	chart.domainY = function(domain){
		if(domain == "reset"){
			chart.domainY(chart.origDomainY);
			return chart;
		}
		if(typeof domain === "function")
			chart.get_domainY = domain;
		if(domain.splice)
			chart.get_domainY = function() {
				return domain;
			};
		
		return chart;
	}

	chart.zoom = function(lu, rb){
		if(lu[0] == rb[0] || lu[1] == rb[1])
			return;
    chart.domainX([chart.axes.scale_x.invert(lu[0]), 
                        chart.axes.scale_x.invert(rb[0])]);
    chart.domainY([chart.axes.scale_y.invert(rb[1]),
                        chart.axes.scale_y.invert(lu[1])]);
    chart.updateAxes();
  }
  chart.resetDomain = function(){
    chart.domainX("reset");
    chart.domainY("reset");
    chart.updateAxes();
  }

  var inherited_put_static_content = chart.put_static_content;
  chart.put_static_content = function( element ) {
    inherited_put_static_content( element );
		
		var g = chart.svg.append("g")
			.attr("class", "axes_g");

    chart.axes.x_g = g.append( "g" )
      .attr( "class", "x axis" );
    chart.axes.x_label = chart.axes.x_g.append( "text" )
      .attr( "class", "label" )
      .attr( "y", -6 )
      .style( "text-anchor", "end" );

    chart.axes.y_g = g.append( "g" )
      .attr( "class", "y axis" )
    chart.axes.y_label = chart.axes.y_g.append( "text" )
      .attr( "class", "label" )
      .attr( "transform", "rotate(-90)" )
      .attr( "y", 6 )
      .attr( "dy", ".71em" )
      .style( "text-anchor", "end" );

		var domainX = chart.get_domainX();
		if(domainX.length == 2 && typeof domainX[0] === "number")
			chart.axes.scale_x = d3.scaleLinear()
				.nice();
		else{
			chart.axes.scale_x = d3.scalePoint()
				.padding(0.3);	
		}
		chart.origDomainX = chart.get_domainX;
		
		var domainY = chart.get_domainY();
		if(domainY.length == 2 && typeof domainY[0] === "number")
			chart.axes.scale_y = d3.scaleLinear()
				.nice();
		else
			chart.axes.scale_y = d3.scalePoint()
				.padding(0.3); 
		chart.origDomainY = chart.get_domainY;	
  }	
	
	var inherited_updateSize = chart.updateSize;
	chart.updateSize = function() {
		inherited_updateSize();

		if(typeof chart.transition !== "undefined"){
			chart.svg.select(".axes_g").transition(chart.transition)
				.attr("transform", "translate(" + chart.get_margin().left + 
								", " + chart.get_margin().top + ")");
			chart.axes.x_g.transition(chart.transition)
				.attr( "transform", "translate(0," + chart.get_plotHeight() + ")" );
			chart.axes.x_label.transition(chart.transition)
				.attr("x", chart.get_plotWidth());

		}	else {
			chart.svg.select(".axes_g")
				.attr("transform", "translate(" + chart.get_margin().left + 
								", " + chart.get_margin().top + ")");
			chart.axes.x_g
				.attr( "transform", "translate(0," + chart.get_plotHeight() + ")" );
			chart.axes.x_label
				.attr("x", chart.get_plotWidth());
		}
		chart.axes.scale_x.range([0, chart.get_plotWidth()]);
		chart.axes.scale_y.range([chart.get_plotHeight(), 0]);

		chart.updateAxes();

		return chart;
	};

	// This function takes two linear scales, and extends the domain of one of them to get  
	// the desired x:y aspect ratio 'asp'. 
	function fix_aspect_ratio( scaleX, scaleY, asp ) { 
	   var xfactor = ( scaleX.range()[1] - scaleX.range()[0] ) /  
	      ( scaleX.domain()[1] - scaleX.domain()[0] ) 
	   var yfactor = ( scaleY.range()[1] - scaleY.range()[0] ) /  
	      ( scaleY.domain()[1] - scaleY.domain()[0] ) 
	   var curasp = Math.abs( xfactor / yfactor )  // current aspect ratio 
	   if( curasp > asp ) {  // x domain has to be expanded 
	      var cur_dom_length = ( scaleX.domain()[1] - scaleX.domain()[0] ) 
	      var extension = cur_dom_length * ( curasp/asp - 1 ) / 2 
	      scaleX.domain( [ scaleX.domain()[0] - extension, scaleX.domain()[1] + extension ] )       
	   } else { // y domain has to be expanded 
	      var cur_dom_length = ( scaleY.domain()[1] - scaleY.domain()[0] ) 
	      var extension = cur_dom_length * ( asp/curasp - 1 ) / 2 
	      scaleY.domain( [ scaleY.domain()[0] - extension, scaleY.domain()[1] + extension ] )             
	   } 
	} 

	var get_ticks = function(axis){
		var ticks = {tickValues: null, tickFormat: null},
			tickArray = chart["ticks" + axis]();
		
		if(tickArray){
			//check if the ticks are set correctly
			if(typeof tickArray.splice === "undefined")
				throw "Error in 'get_ticks': new tick values and labels should be passed " +
							"as an array";
			if(typeof tickArray[0].splice === "undefined")
				tickArray = [tickArray];
			for(var i = 1; i < tickArray.length; i++)
				if(tickArray[0].length != tickArray[i].length)
					throw "Error in 'get_ticks': the amount of tick labels must be equal to the " +
								"amount of tick values";

			//if only tick values (not tick labels) then return 					
			ticks.tickValues = tickArray[0];
			if(tickArray.length == 1)
				return ticks;

			//if all the labels sets are identical, leave only one of them
			var ident = tickArray.length > 2, j = 1, i;
			while(ident && j < tickArray.length - 1){
				i = 0;
				while(ident && i < tickArray[j].length){
					ident = (tickArray[j][i] == tickArray[j + 1][i]);
					i++;
				}
				j++;
			}
			if(ident)
				tickArray.splice(2);
			
			//if we have several label sets, transform the labels into <tspan> blocks
			var tickLabels = [], value;
			if(tickArray.length > 2){
				for(var i = 0; i < tickArray[0].length; i++){
					value = "";
					for(var j = 1; j < tickArray.length; j++){
						//location
						value += "<tspan x = 0.5 dy = " + 1.1 + "em";
						//colour if any
						if(tickArray.colour) 
							value += " fill = '" + tickArray.colour[j - 1] + "'>"
						else
							value += ">";
						value += tickArray[j][i] + "</tspan>";
					}
					tickLabels.push(value);
				}
			} else {
				tickLabels = tickArray[1];
			}
			ticks.tickFormat = function(d) {return tickLabels[ticks.tickValues.indexOf(d)];};
		}
		
		return ticks;
	}

	chart.updateAxes = function(){
    chart.axes.x_label
    	.text( chart.get_labelX());
		chart.axes.y_label
   		.text( chart.get_labelY() );
    chart.axes.scale_x.domain(chart.get_domainX());
		chart.axes.scale_y.domain(chart.get_domainY());
		if(chart.aspectRatio())
			fix_aspect_ratio(chart.axes.scale_x, chart.axes.scale_y, chart.get_aspectRatio());

		var ticksX = get_ticks("X"),
			ticksY = get_ticks("Y");

    if(typeof chart.transition !== "undefined") {
	    d3.axisBottom()
	      .scale( chart.axes.scale_x )
	      .tickValues(ticksX.tickValues)
	      .tickFormat(ticksX.tickFormat)
	      ( chart.axes.x_g.transition(chart.transition) );

	    d3.axisLeft()
	      .scale( chart.axes.scale_y )
	      .tickValues(ticksY.tickValues)
	      .tickFormat(ticksY.tickFormat)
	      ( chart.axes.y_g.transition(chart.transition) );	
    } else {
	    d3.axisBottom()
	      .tickValues(ticksX.tickValues)
	      .tickFormat(ticksX.tickFormat)
	      .scale( chart.axes.scale_x )
	      ( chart.axes.x_g );

	    d3.axisLeft()
	      .scale( chart.axes.scale_y )
	      .tickValues(ticksY.tickValues)
	      .tickFormat(ticksY.tickFormat) 
	      ( chart.axes.y_g );    	
    }

    var updateX = function() {
    	chart.axes.x_g.selectAll(".tick").selectAll("text")
    		.html(ticksX.tickFormat)
    };
    if(ticksX.tickFormat)
    	if(chart.transition)
    		setTimeout(updateX, chart.transition.duration())
    	else
    		updateX();

    var updateY = function() {
    	chart.axes.y_g.selectAll(".tick").selectAll("text")
    		.html(ticksX.tickFormat)
    };
    if(ticksY.tickFormat)
    	if(chart.transition)
    		setTimeout(updateY, chart.transition.duration())
    	else
    		updateY();

    for(var k in chart.layers)
    	chart.get_layer(k).updatePointLocation();

    return chart;
	}

	return chart;
}