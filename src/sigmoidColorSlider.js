import { chartBase } from "./chartBase";

function sigmoid( x, midpoint, slope ) {
  return 1 / ( 1 + Math.exp( -slope * ( x - midpoint ) ) )
}

function make_stretched_sigmoid( midpoint, slope, xl, xr ) {
  var yl = sigmoid( xl, midpoint, slope, 0, 1 )
  var yr = sigmoid( xr, midpoint, slope, 0, 1 )
  var ym = Math.min( yl, yr )
  return function(x) { return ( sigmoid( x, midpoint, slope, 1 ) - ym ) / Math.abs( yr - yl ) }
}

export function sigmoidColorSlider() {

  // for now only horizontal

  var obj = chartBase()
    .add_property( "straightColorScale" )
    .add_property( "midpoint", undefined )
    .add_property( "slopewidth", undefined )
    .add_property( "on_drag", function() {})
		.add_property( "on_change", function() {})
    .margin( { top: 20, right: 10, bottom: 5, left: 10 } )
    .height( 80 )
    .transitionDuration( 0 );    

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

    var g = obj.svg.append( "g" )
      .attr( "class", "sigmoidColorSlider" )
      .attr( "transform", "translate(" + obj.get_margin().left + ", " + 
																	obj.get_margin().top + ")" );  // space for axis

    obj.axis = g.append( "g" )
      .attr( "class", "axis" );

    var defs = g.append( "defs" );

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

    obj.colorBar = g.append( "rect" )
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

    obj.mainMarker = g.append( "use" )
      .attr( "xlink:href", "#mainMarker")
      .attr( "y", 28 )
      .call( d3.drag()
        .on( "drag", function() {
          obj.midpoint( obj.pos_scale.invert( obj.pos_scale( obj.get_midpoint() ) + d3.event.dx ) );
          obj.clamp_markers();
          obj.get_on_drag();
          obj.update();
        } )
        .on("end", function() {
					obj.get_on_change();
				})
			);

    obj.rightMarker = g.append( "use" )
      .attr( "xlink:href", "#rightMarker")
      .attr( "y", 30 )
      .call( d3.drag()
        .on( "drag", function() {
          obj.slopewidth( obj.pos_scale.invert( obj.pos_scale( obj.get_slopewidth() ) + d3.event.dx ) );
          obj.clamp_markers();
          obj.update();        
          obj.get_on_drag();
        } )
				.on("end", function() {
					obj.get_on_change();
				})
			);

    obj.leftMarker = g.append( "use" )
      .attr( "xlink:href", "#leftMarker")
      .attr( "y", 30 )
      .call( d3.drag()
        .on( "drag", function() {
          obj.slopewidth( obj.pos_scale.invert( obj.pos_scale( obj.get_slopewidth() ) - d3.event.dx ) );
          obj.clamp_markers();
          obj.update();        
          obj.get_on_drag();
        } )
			  .on("end", function() {
				  obj.get_on_change();
			  })
		  );

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
      obj.slopewidth( Math.abs(percent_scale( 15 )) );

    obj.pos_scale = d3.scaleLinear()
      .range( [ 0, obj.get_plotWidth() ] )
      .domain( obj.get_straightColorScale.domain() )

    d3.axisTop()
      .scale( obj.pos_scale )
      ( obj.axis );

    obj.colorBar
      .attr( "width", obj.get_plotWidth() );

    //obj.the_sigmoid = function(x) { return sigmoid( x, obj.get_midpoint(), 1.38 / obj.get_slopewidth(), 0, 1 ) };
    obj.the_sigmoid = make_stretched_sigmoid( obj.get_midpoint(), 1.38 / obj.get_slopewidth(), 
      obj.get_straightColorScale.domain()[0], obj.get_straightColorScale.domain()[1] );

    obj.gradient.selectAll( "stop" )
      .data( d3.range(100) )
      .style( "stop-color", function(d) { 
        return obj.get_straightColorScale( 
          percent_scale( 100 * obj.the_sigmoid( percent_scale(d) ) ) ) } ) ;

    obj.mainMarker
      .attr( "x", obj.pos_scale( obj.get_midpoint() ) );
    obj.rightMarker
      .attr( "x", obj.pos_scale( obj.get_midpoint() + obj.get_slopewidth() ) )
    obj.leftMarker
      .attr( "x", obj.pos_scale( obj.get_midpoint() - obj.get_slopewidth() ) )

		//obj.get_on_change();

  }

  return obj;

}
