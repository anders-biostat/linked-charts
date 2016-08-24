import { svgChartBase } from "./chartBase";

function sigmoid( x, midpoint, width ) {
  return 1 / ( 1 + Math.exp( ( x - midpoint ) * 1.38 / width  ) )
}

export function sigmoidColorSlider() {

  // for now only horizontal

  var obj = svgChartBase()
    .add_property( "straightColorScale" )
    .add_property( "midpoint", undefined )
    .add_property( "slopewidth", undefined )
    .height( 50 );    

  obj.straightColorScale(
    d3.scaleLinear()
      .range( [ "white", "darkblue" ] ) );

  obj.clamp_markers = function() {
    var min = d3.min( obj.get_straightColorScale.domain() );
    var max = d3.max( obj.get_straightColorScale.domain() );
    if( obj.get_midpoint() < min )
       obj.midpoint( min );
    if( obj.get_midpoint() > max )
       obj.midpoint( max );
    if( obj.get_slopewidth() > (max-min) )
       obj.slopewidth( max-min );
    if( obj.get_slopewidth() < (min-max) )
       obj.slopewidth( min-max );
  }
   
  var inherited_put_static_content = obj.put_static_content;
  obj.put_static_content = function( element ) {
    inherited_put_static_content( element );

    obj.axis = obj.svg.append( "g" )
      .attr( "class", "axis" );

    var defs = obj.real_svg.append( "defs" );

    obj.gradient = defs.append( "linearGradient" )
      .attr( "id", "scaleGradient")
      .attr( "x1", "0%")
      .attr( "y1", "0%")
      .attr( "x2", "100%")
      .attr( "y2", "0%");

    obj.gradient.selectAll( "stop" )
      .data( d3.range(100) )
      .enter().append( "stop" )
        .attr( "offset", function(d) { return d + "%" } )

    obj.colorBar = obj.svg.append( "rect" )
      .attr( "x", "0" )
      .attr( "y", "5" )
      .attr( "height", 20 )
      .attr( "fill", "url(#scaleGradient)" )
      .style( "stroke", "black" )
      .style( "stroke-width", "1");

    defs.append( "path" )
         .attr( "id", "mainMarker" )
         .attr( "d", "M 0 0 L 8 5 L 8 25 L -8 25 L -8 5 Z")
         .style( "fill", "gray" )
         .style( "stroke", "black" )

    defs.append( "path" )
         .attr( "id", "rightMarker" )
         .attr( "d", "M 0 0 L 5 5 L 5 15 L 0 15 Z")
         .style( "fill", "lightgray" )
         .style( "stroke", "black" )

    defs.append( "path" )
         .attr( "id", "leftMarker" )
         .attr( "d", "M 0 0 L -5 5 L -5 15 L 0 15 Z")
         .style( "fill", "lightgray" )
         .style( "stroke", "black" )

    obj.mainMarker = obj.svg.append( "use" )
      .attr( "xlink:href", "#mainMarker")
      .attr( "y", 28 )
      .call( d3.drag().on( "drag", function() {
         obj.midpoint( obj.get_midpoint() + obj.pos_scale.invert( d3.event.dx ) );
         obj.clamp_markers();
         obj.update();
      } ) );

    obj.rightMarker = obj.svg.append( "use" )
      .attr( "xlink:href", "#rightMarker")
      .attr( "y", 30 )
      .call( d3.drag().on( "drag", function() {
         obj.slopewidth( obj.get_slopewidth() + obj.pos_scale.invert( d3.event.dx ) );
         obj.clamp_markers();
         obj.update();        
      } ) );

    obj.leftMarker = obj.svg.append( "use" )
      .attr( "xlink:href", "#leftMarker")
      .attr( "y", 30 )
      .call( d3.drag().on( "drag", function() {
         obj.slopewidth( obj.get_slopewidth() - obj.pos_scale.invert( d3.event.dx ) );
         obj.clamp_markers();
         obj.update();        
      } ) );

  }

  var inherited_update = obj.update;
  obj.update = function() {
    inherited_update();

    var percent_scale = d3.scaleLinear()
      .domain( [0, 100] )
      .range( obj.get_straightColorScale.domain() );

    if( obj.get_midpoint() == undefined )
      obj.midpoint( percent_scale( 50 ) );

    if( obj.get_slopewidth() == undefined )
      obj.slopewidth( percent_scale( 15 ) );

    obj.pos_scale = d3.scaleLinear()
      .range( [ 0, obj.get_width() ] )
      .domain( obj.get_straightColorScale.domain() )

    d3.axisTop()
      .scale( obj.pos_scale )
      ( obj.axis );

    obj.colorBar
      .attr( "width", obj.get_width() );

    obj.gradient.selectAll( "stop" )
      .data( d3.range(100) )
      .style( "stop-color", function(d) { 
        return obj.get_straightColorScale( 
          percent_scale( 100 *
             sigmoid( percent_scale(d), obj.get_midpoint(), obj.get_slopewidth() ) ) ) } ) ;

    obj.mainMarker
      .attr( "x", obj.pos_scale( obj.get_midpoint() ) );
    obj.rightMarker
      .attr( "x", obj.pos_scale( obj.get_midpoint() + obj.get_slopewidth() ) )
    obj.leftMarker
      .attr( "x", obj.pos_scale( obj.get_midpoint() - obj.get_slopewidth() ) )
  }

  return obj;

}
