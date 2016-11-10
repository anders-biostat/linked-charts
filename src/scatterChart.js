import { axisChartBase } from "./chartBase";

export function scatterChart(id, chart) {

	if(chart === undefined)
		chart = axisChartBase();
	if(id === undefined)
		id = "layer" + chart.get_nlayers();

  var layer = chart.add_layer(id)
		.add_property("x")
		.add_property("y")
		.add_property("style", "")
		.add_property("npoints")
		.add_property("dataIds")
    .add_property("size", 4)
    .add_property("colour", "black")
		.add_property("groupName", function(i){return i;});
	chart.setActiveLayer(id);
	
  // Set default for dataIds, namely to return numbers accoring to numPoints
  layer.dataIds( function() { return d3.range( layer.get_npoints() ) } );

  layer.findPoints = function(lu, rb){
    return layer.g.selectAll(".data_point")
      .filter(function(d) {
        var loc = [layer.chart.axes.scale_x(layer.chart.get_x(d)), 
                  layer.chart.axes.scale_y(layer.get_y(d))]
        return (loc[0] - layer.get_size(d) <= rb[0]) && 
          (loc[1] - layer.get_size(d) <= rb[1]) && 
          (loc[0] + layer.get_size(d) >= lu[0]) && 
          (loc[1] + layer.get_size(d) >= lu[1]);
      });
  }
  layer.zoom = function(lu, rb){
    layer.chart.domainX([layer.chart.axes.scale_x.invert(lu[0]), 
                        layer.chart.axes.scale_x.invert(rb[0])]);
    layer.chart.domainY([layer.chart.axes.scale_y.invert(rb[1]),
                        layer.chart.axes.scale_y.invert(lu[1])]);
    layer.chart.update();
  }
  layer.resetDomain = function(){
    layer.chart.domainX("reset");
    layer.chart.domainY("reset");
    layer.chart.update();
  }

  // Set default for numPoints, namely to count the data provided for x
  layer.npoints( function() {
    var val;
    for( var i = 0; i < 10000; i++ ) {
      try {
        // try to get a value
        val = layer.get_x(i)
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
	
	layer.layerDomainX(function() {
		if(layer.get_contScaleX()){
      return d3.extent( layer.get_dataIds(), function(k) { return layer.get_x(k) } )
    } else {
      return layer.get_dataIds().map(function(e) { return layer.get_x(e);});
    }
	});
	layer.layerDomainY(function() {
    if(layer.get_contScaleY()) {
		  return d3.extent( layer.get_dataIds(), function(k) { return layer.get_y(k) } )
    } else{
      return layer.get_dataIds().map(function(e) { return layer.get_y(e);});
    }
	});

  //default hovering behaviour
  layer.pointMouseOver(function(d){
    //change colour and class
    d3.select(this)
      .attr("fill", function(d) {
        return d3.rgb(layer.get_colour(d)).darker(0.5);
      })
      .classed("hover", true);
    //show label
    layer.chart.container.select(".inform")
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY - 10) + "px")
        .select(".value")
          .html("ID: <b>" + d + "</b>;<br>" + 
            "x = " + layer.get_x(d) + ";<br>" + 
            "y = " + layer.get_y(d));  
    layer.chart.container.select(".inform")
      .classed("hidden", false);
  });
  layer.pointMouseOut(function(d){
    d3.select(this)
      .attr("fill", function(d) {
        return layer.get_colour(d);
      })
      .classed("hover", false);
    layer.chart.container.select(".inform")
      .classed("hidden", true);
  })

	//for now there is no inherited_update for a layer
  //var inherited_update = obj.update;
  
	layer.update_not_yet_called = true;
	
  layer.update = function() {

    if( layer.update_not_yet_called ) {
      layer.update_not_yet_called = false;   
      layer.g = layer.chart.svg.append("g")
				.attr("class", "chart_g");
      layer.add_click_listener();
    } 
		
		layer.g.transition(layer.chart.transition)
			.attr("transform", "translate(" + 
				layer.get_margin().left + ", " +
				layer.get_margin().top + ")");

		var sel = layer.g.selectAll( ".data_point" )
      .data( layer.get_dataIds() );
    sel.exit()
      .remove();  
    sel.enter().append( "circle" )
      .attr( "class", "data_point" )
      .on( "click", layer.get_on_click )
      .on( "mouseover", layer.get_pointMouseOver)
      .on( "mouseout", layer.get_pointMouseOut)
    .merge( sel )
      .transition(layer.chart.transition)
        .attr( "r", function(d) {return layer.get_size(d)} )
        .attr( "fill", function(d) { return layer.get_colour(d)})
        .attr( "cx", function(d) { return layer.chart.axes.scale_x( layer.get_x(d) ) } )
        .attr( "cy", function(d) { return layer.chart.axes.scale_y( layer.get_y(d) ) } )
        .attr( "style", function(d) { return layer.get_style(d) } );

    return layer;
  };

  return layer;
}
