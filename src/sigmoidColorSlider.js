import { svgChartBase } from "./chartBase";

function sigmoid( x, mid_point ) {
  return 1 / ( 1 + Math.exp( ( x - mid_point ) / .03 ) )
}

export function sigmoidColorSlider() {

  // for now only horizontal

  var obj = svgChartBase()
    .add_property( "straightColorScale" )
    .add_property( "midpoint", .5 )
    .height( 50 );    

  obj.straightColorScale(
    d3.scaleLinear()
      .range( [ "white", "darkblue" ] ) );
   
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

    obj.mainMarker = obj.svg.append( "use" )
      .attr( "xlink:href", "#mainMarker")
      .attr( "y", 28 )
      .call( d3.drag().on( "drag", function() {
         obj.midpoint( obj.get_midpoint() + obj.pos_scale.invert( d3.event.dx ) );
         obj.update();
      } ) );

  }

  var inherited_update = obj.update;
  obj.update = function() {
    inherited_update();

    obj.pos_scale = d3.scaleLinear()
      .range( [ 0, obj.get_width() ] )
      .domain( obj.get_straightColorScale.domain() );

    d3.axisTop()
      .scale( obj.pos_scale )
      ( obj.axis );

    obj.colorBar
      .attr( "width", obj.get_width() );

    obj.gradient.selectAll( "stop" )
      .data( d3.range(100) )
      .style( "stop-color", function(d) { 
        return obj.get_straightColorScale( sigmoid( d/100, obj.get_midpoint() ) ) } );

    obj.mainMarker
      .attr( "x", obj.pos_scale( obj.get_midpoint() ) )
  }

  return obj;

}
