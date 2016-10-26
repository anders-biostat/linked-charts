import { axisChartBase } from "./chartBase";

export function scatterChart(id, chart) {

	if(chart === undefined)
		chart = axisChartBase();
	if(id === undefined)
		id = "layer" + chart.layers.length;

  var layer = chart.add_layer(id)
		.add_property("x")
		.add_property("y")
		.add_property("style", "")
		.add_property("npoints")
		.add_property("dataIds")
		.add_property("groupName", function(i){return i;});
	chart.setActiveLayer(id);
	
  // Set default for dataIds, namely to return numbers accoring to numPoints
  layer.dataIds( function() { return d3.range( layer.get_npoints() ) } );

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
		return d3.extent( layer.get_dataIds(), function(k) { return layer.get_x(k) } )
	});
	layer.layerDomainY(function() {
		return d3.extent( layer.get_dataIds(), function(k) { return layer.get_y(k) } )
	});

	//for now there is no inherited_update for a layer
  //var inherited_update = obj.update;
  
	layer.update_not_yet_called = true;
	
  layer.update = function() {

    if( layer.update_not_yet_called ) {
      layer.update_not_yet_called = false;
      layer.g = layer.chart.svg.append("g")
				.attr("class", "chart_g");
    } 
		
		layer.g.transition(layer.chart.transition)
			.attr("transform", "translate(" + 
				layer.get_margin().left + ", " +
				layer.get_margin().top + ")");

		var sel = layer.g.selectAll( ".datapoint" )
      .data( layer.get_dataIds() );
    sel.exit()
      .remove();  
    sel.enter().append( "circle" )
      .attr( "class", "datapoint" )
      .attr( "r", 3 )
    .merge( sel )
      .on( "click", layer.get_on_click )
      .transition(layer.chart.transition)
        .attr( "cx", function(d) { return layer.chart.axes.scale_x( layer.get_x(d) ) } )
        .attr( "cy", function(d) { return layer.chart.axes.scale_y( layer.get_y(d) ) } )
        .attr( "style", function(d) { return layer.get_style(d) } );

    return layer;
  };

  return layer;
}
