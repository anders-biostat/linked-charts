import {svgChartBase} from "./chartBase";

export function scatterChart() {

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
