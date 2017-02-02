import { base } from "./base";
import { layerBase } from "./layerBase";
import { add_click_listener } from "./additionalFunctions";

//basic chart object
export function chartBase() {
	var chart = base()
		.add_property("width", 500)
		.add_property("height", 500)
		.add_property("plotWidth", 440)
		.add_property("plotHeight", 440)
		.add_property("margin", { top: 10, right: 10, bottom: 50, left: 50 })
		.add_property("transitionDuration", 1000); //may be set to zero
	
	chart.transition = undefined;
  chart.width("_override_", "plotWidth", function(){
  			return chart.get_width() - 
  				(chart.get_margin().right + chart.get_margin().left);
  });
  chart.plotWidth("_override_", "width", function(){
  			return chart.get_plotWidth() +
  				(chart.get_margin().right + chart.get_margin().left);
  });
  chart.margin("_override_", "plotWidth", function(){
  			return chart.get_width() - 
  				(chart.get_margin().right + chart.get_margin().left);
  });
  chart.height("_override_", "plotHeight", function(){
  			return chart.get_height() - 
  				(chart.get_margin().top + chart.get_margin().bottom);
  });
  chart.plotHeight("_override_", "height", function(){
  			return chart.get_plotHeight() +
  				(chart.get_margin().top + chart.get_margin().bottom);
  });
  chart.margin("_override_", "plotHeight", function(){
  			return chart.get_height() - 
  				(chart.get_margin().top + chart.get_margin().bottom);
  });

  chart.put_static_content = function( element ) {
		chart.container = element.append("div");
		chart.container.node().ondragstart = function() { return false; };
		chart.svg = chart.container.append("svg");
		chart.container.append("div")
			.attr("class", "inform hidden")
			.append("p")
				.attr("class", "value");
	}

	chart.afterUpdate = function(){
		if(chart.get_transitionDuration() != 0)
			chart.transition = 
				d3.transition().duration(chart.get_transitionDuration());
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
    chart.afterUpdate();
    return chart;
  }
	
	//update parts
	chart.updateSize = function(){
		if(typeof chart.transition !== "undefined"){
			chart.svg.transition(chart.transition)
				.attr("width", chart.get_width())
				.attr("height", chart.get_height());
			chart.container.transition(chart.transition)
				.style("width", chart.get_width() + "px")
				.style("height", chart.get_height() + "px");
		} else {
			chart.svg
				.attr("width", chart.get_width())
				.attr("height",	chart.get_height());
			chart.container
				.style("width", chart.get_width() + "px")
				.style("height", chart.get_height() + "px");
		}
		return chart;			
	}

	chart.update = function(){
		chart.updateSize();
		return chart;
	}
  return chart;
}

export function layerChartBase(){
	var chart = chartBase()
		.add_property("activeLayer", undefined);
	
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
		for(var k in chart.layers)
			chart.get_layer(k).put_static_content();		
	}

	var inherited_update = chart.update;
	chart.update = function() {
		inherited_update();
		for(var k in chart.layers)
			chart.get_layer(k).update();
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

export function axisChart() {
	
	var chart = layerChartBase();
	
	chart.add_property("singleScaleX", true)
		.add_property("singleScaleY", true)
		.add_property("domainX")
		.add_property("domainY")
		.add_property("aspectRatio", null)
		.add_property("labelX")
		.add_property("labelY")
		.add_property("markedUpdated", function() {});

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
								domain[1] = d3.min([domain[1], chart.get_layer(k)["get_layerDomain" + axis]()[1]]);
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
			chart.domainX(get_domain("X"));
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
			chart.domainY(get_domain("Y"));
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

	chart.zoom = function(lu, rb){
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
		
		var domainY = chart.get_domainY();
		if(domainY.length == 2 && typeof domainY[0] === "number")
			chart.axes.scale_y = d3.scaleLinear()
				.nice();
		else
			chart.axes.scale_y = d3.scalePoint()
				.padding(0.3); 	
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

	chart.updateAxes = function(){
    chart.axes.x_label
    	.text( chart.get_labelX());
		chart.axes.y_label
   		.text( chart.get_labelY() );
    chart.axes.scale_x.domain(chart.get_domainX());
		chart.axes.scale_y.domain(chart.get_domainY());

    if(typeof chart.transition !== "undefined") {
	    d3.axisBottom()
	      .scale( chart.axes.scale_x )
	      ( chart.axes.x_g.transition(chart.transition) );

	    d3.axisLeft()
	      .scale( chart.axes.scale_y )
	      ( chart.axes.y_g.transition(chart.transition) );	
    } else {
	    d3.axisBottom()
	      .scale( chart.axes.scale_x )
	      ( chart.axes.x_g );

	    d3.axisLeft()
	      .scale( chart.axes.scale_y )
	      ( chart.axes.y_g );    	
    }

    for(var k in chart.layers)
    	chart.get_layer(k).updatePointLocation();
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
		.add_property("dispColIds", function() {return chart.get_colIds();})
		.add_property("dispRowIds", function() {return chart.get_rowIds();})
		.add_property("heatmapRow", function(rowId) {return chart.get_dispRowIds().indexOf(rowId);})
		.add_property("heatmapCol", function(colId) {return chart.get_dispColIds().indexOf(colId);});
	

}
