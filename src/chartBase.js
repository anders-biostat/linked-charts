import { base } from "./base";
import { layerBase } from "./layerBase";

//basic chart object
export function chartBase() {
	var chart = base()
		.add_property("width", 500)
		.add_property("height", 400)
		.add_property("margin", { top: 20, right: 10, bottom: 50, left: 50 })
		.add_property("transitionDuration", 1000);
	
  chart.put_static_content = function( element ) {
		chart.container = element.append( "div" );
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
	
	//Basic layer functionality
	chart.layers = {};
	
	chart.get_nlayers = function() {
		return chart.layers.length;
	}
	
	chart.get_layer = function(k) {
		return chart.layers[k];
	}
	
	chart.add_layer = function(k) {
		if(typeof k === "undefined")
			k = chart.get_nlayers();
		
		var layer = layerBase();
		chart.layers[k] = {};
		layer.chart = chart;
		chart.layers[k] = layer;
		//Object.assign(chart.layers[k], layer)
			
		return chart.get_layer(k);
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
		for(var k in chart.layers)
			chart.get_layer(k).update();

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

export function axisChartBase() {
	
	var chart = chartBase();
	
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
					if(typeof chart.get_layer(k).get_domainX() !== "undefined")
						if(typeof domain === "undefined") 
							domain = chart.get_layer(k).get_domainX()
						else {
							domain[0] = d3.min([domain[0], chart.get_layer(k).get_domainX()[0]]);
							domain[1] = d3.min([domain[1], chart.get_layer(k).get_domainX()[1]]);
						}
			} else { //if scale is categorical, find unique values from each layer
				for(var k in chart.layers)
					if(typeof chart.get_layer(k).get_domainX() !== "undefined")
						if(typeof domain === "undefined") 
							domain = chart.get_layer(k).get_domainX()
						else 
							domain = domain.concat(chart.get_layer(k).get_domainX()
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
					if(typeof chart.get_layer(k).get_domainY() !== "undefined")
						if(typeof domain === "undefined") 
							domain = chart.get_layer(k).get_domainY()
						else {
							domain[0] = d3.min([domain[0], chart.get_layer(k).get_domainY()[0]]);
							domain[1] = d3.min([domain[1], chart.get_layer(k).get_domainY()[1]]);
						}							
			} else { //if scale is categorical, find unique values from each layer
				for(var k in chart.layers)
					if(typeof chart.get_layer(k).get_domainY() !== "undefined")
						if(typeof domain === "undefined") 
							domain = chart.get_layer(k).get_domainY()
						else 
							domain = domain.concat(chart.get_layer(k).get_domainY()
								.filter(function(e){
									return domain.indexOf(e) < 0;
								}));
			}
		}
		
		return domain;
	}
	
	//redefine setters for axis domains
	chart.domainX = function(domain){
		//set default getter
		if(domain == "reset")
			chart.get_domainX = get_domainX;
		//if user provided function, use this function
		if(typeof domain === "function")
			get_domainX = domain;
		if(domain.length)
			get_domainX = function() {
				return domain;
			};
			
		return chart;
	}
	chart.domainY = function(domain){
		if(domain == "reset")
			chart.get_domainY = get_domainY;
		if(typeof domain === "function")
			get_domainY = domain;
		if(domain.length)
			get_domainY = function() {
				return domain;
			};
		
		return chart;
	}
	
	chart.get_domainX = get_domainX;
	chart.get_domainY = get_domainY;
	
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
		if(chart.get_domainX().length == 2)
			chart.axes.scale_x = d3.scaleLinear()
				.domain( chart.get_domainX() )
				.range( [ 0, chart.get_width() ] )
				.nice()
		else
			chart.axes.scale_x = d3.scaleQuantize()
				.domain( chart.get_domainX() )
				.range( [0, chart.get_width()] )
				.nice();	
		
		if(chart.get_domainY().length == 2)
			chart.axes.scale_y = d3.scaleLinear()
				.domain( chart.get_domainY() )
				.range( [chart.get_height(), 0] )
				.nice()
		else
			chart.axes.scale_x = d3.scaleQuantize()
				.domain( chart.get_domainY() )
				.range( [chart.get_height(), 0] )
				.nice();
		
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
