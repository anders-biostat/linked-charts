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

export function colourSlider() {

  // for now only horizontal

  var obj = chartBase()
    .add_property( "straightColourScale" )
    .add_property( "midpoint", undefined )
    .add_property( "slopeWidth", undefined )
    .add_property( "linkedChart", undefined, function(value) {
      if(typeof value === "string"){
        var names = value.split(".");
        value = window[names[0]];
        for(var i = 1; i < names.length; i++)
          value = value[names[i]];
      }
      return value;
    } )
    .add_property( "on_drag", function() {})
		.add_property( "on_change", function() {})
    .paddings( { top: 20, right: 10, bottom: 5, left: 10 } )
    .height( 80 )
    .transitionDuration( 0 );    

  obj.showPanel(false);

  obj.straightColourScale(
    d3.scaleLinear()
      .range( [ "white", "darkblue" ] ) );
  
  obj.setStraightColourScale = function() {
    if(obj.linkedChart() && obj.linkedChart().colourScale) {
      obj.straightColourScale(obj.linkedChart().colourScale)
//      obj.linkedChart().colourScale = obj.colourScale;
      if(obj.linkedChart().updateElementStyle) {
        obj.on_drag(obj.linkedChart().updateElementStyle);
      }
      if(obj.linkedChart().updateCellColour) {
        obj.on_drag(obj.linkedChart().updateCellColour);
      }
    }
  }

  var clamp_markers = function() {
    var min = d3.min( obj.get_straightColourScale.domain() );
    var max = d3.max( obj.get_straightColourScale.domain() );
    if( obj.get_midpoint() < min )
       obj.midpoint( min );
    if( obj.get_midpoint() > max )
       obj.midpoint( max );
    if( obj.midpoint() - min < obj.slopeWidth()/2 ) 
       obj.slopeWidth( (obj.midpoint() - min) * 2 );
    if( max - obj.midpoint() < obj.slopeWidth()/2 )
       obj.slopeWidth( (max - obj.midpoint()) * 2 );
  }
	
  var inherited_put_static_content = obj.put_static_content;
  obj.put_static_content = function( element ) {
    inherited_put_static_content( element );

    var g = obj.svg.append( "g" )
      .attr( "class", "sigmoidColorSlider" )
      .attr( "transform", "translate(" + obj.paddings().left + ", " + 
																	obj.paddings().top + ")" );  // space for axis

    obj.axis = g.append( "g" )
      .attr( "class", "axis" );

    var defs = g.append( "defs" );

    obj.gradient = defs.append( "linearGradient" )
      .attr( "id", "scaleGradient" + Math.random().toString(36).substring(2, 6))
      .attr( "x1", "0%")
      .attr( "y1", "0%")
      .attr( "x2", "100%")
      .attr( "y2", "0%");

    obj.gradient.selectAll( "stop" )
      .data( d3.range(100) )
      .enter().append( "stop" )
        .attr( "offset", function(d) { return d + "%" } )

    var gradId = obj.gradient.attr("id");

    obj.colorBar = g.append( "rect" )
      .attr( "x", "0" )
      .attr( "y", "5" )
      .attr( "height", 20 )
      .attr( "fill", "url(#" + gradId +")" )
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
          clamp_markers();
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
          obj.slopeWidth( obj.pos_scale.invert( obj.pos_scale( obj.slopeWidth() ) + d3.event.dx * 2 ) );
          clamp_markers();
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
          obj.slopeWidth( obj.pos_scale.invert( obj.pos_scale( obj.slopeWidth() ) - d3.event.dx * 2 ) );
          clamp_markers();
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

    obj.setStraightColourScale();

    if(obj.get_straightColourScale.domain == undefined)
      obj.get_straightColourScale.domain = function() {
        return [0, 1];
      }
		var domain = obj.get_straightColourScale.domain(),
      percScDomain = [],
      posScDomain = [];

    var allNum = true;
    for(var i = 0; i < domain.length; i++){
      percScDomain.push(i * 100 / (domain.length - 1));
      posScDomain.push(i * obj.plotWidth() / (domain.length - 1));
      allNum = (typeof domain[i] === "number") && allNum;
    }

    if(!allNum) {
      obj.colourScale = obj.get_straightColourScale;
      return obj;
    }


    var percent_scale = d3.scaleLinear()
      .domain( percScDomain )
      .range( domain );

    if( obj.get_midpoint() == undefined )
      obj.midpoint( percent_scale( 50 ) );

    if( obj.get_slopeWidth() == undefined )
      obj.slopeWidth( Math.abs(percent_scale( 70 ) - percent_scale(0)) );

    obj.pos_scale = d3.scaleLinear()
      .range( posScDomain )
      .domain( domain )

    d3.axisTop()
      .scale( obj.pos_scale )
      ( obj.axis );

    obj.colorBar
      .attr( "width", obj.get_plotWidth() );

    //obj.the_sigmoid = function(x) { return sigmoid( x, obj.get_midpoint(), 1.38 / obj.get_slopewidth(), 0, 1 ) };
    obj.the_sigmoid = make_stretched_sigmoid( obj.get_midpoint(), 1.38 / obj.slopeWidth(), 
      d3.min(obj.get_straightColourScale.domain()), d3.max(obj.get_straightColourScale.domain()) );

    obj.gradient.selectAll( "stop" )
      .data( d3.range(100) )
      .style( "stop-color", function(d) { 
        return obj.get_straightColourScale( 
          percent_scale( 100 * obj.the_sigmoid( percent_scale(d) ) ) ) } ) ;

    obj.colourScale = function(val){
      return obj.get_straightColourScale( 
          percent_scale( 100 * obj.the_sigmoid( val ) ) );
    }

    if(obj.linkedChart() && obj.linkedChart().colour)
      obj.linkedChart().colour(function(val) {
        if(obj.linkedChart().colourValue)
          val = obj.linkedChart().get_colourValue(val);
        return obj.colourScale(val);
      });


    obj.mainMarker
      .attr( "x", obj.pos_scale( obj.get_midpoint() ) );
    obj.rightMarker
      .attr( "x", obj.pos_scale( obj.get_midpoint() + obj.slopeWidth()/2 ) )
    obj.leftMarker
      .attr( "x", obj.pos_scale( obj.get_midpoint() - obj.slopeWidth()/2 ) )

		//obj.get_on_change();

  }

  return obj;

}
