import {select} from "d3-select";

export function chartBase() {

  var obj = {};

  obj.add_property = function( propname, defaultval ) {
    var getter = "get_" + propname;
    obj[ propname ] = function( vf ) {
      if( vf === undefined )
        throw "No value passed in setter for property '" + propname + "'.";
      if( typeof(vf) === "function" )
        obj[ getter ] = vf
      else
        obj[ getter ] = function() { return vf };
      return obj
    }
    //Allowing default values to be a function
		if(typeof defaultval === "function")
			obj[ getter ] = defaultval
		else
			obj[ getter ] = function() { return defaultval };
    return obj;
  }

  obj.put_static_content = function() {
  }

  obj.place = function( element ) {
    if( element === undefined )
      element = "body";
    if( typeof( element ) == "string" ) {
      element = select( element );
      if( element.size == 0 )
        throw "Error in function 'place': DOM selection for string '" +
          node + "' did not find a node."
    }

    obj.put_static_content( element );

    obj.update();
    return obj;
  }

  return obj;
}

export function svgChartBase() {

  var obj = chartBase()
    .add_property( "width", 500 )
    .add_property( "height", 400 )
    .add_property( "margin", { top: 20, right: 10, bottom: 20, left: 10 } );

  obj.put_static_content = function( element ) {
    obj.real_svg = element.append( "svg" );
    obj.svg = obj.real_svg.append( "g" );
  }

  obj.update = function( ) {
    obj.real_svg
      .attr( "width", obj.get_width() 
          + obj.get_margin().left + obj.get_margin().right )
      .attr( "height", obj.get_height() 
          + obj.get_margin().top + obj.get_margin().bottom );
    obj.svg
      .attr( "transform", "translate(" + obj.get_margin().left + "," 
          + obj.get_margin().top + ")" );
    return obj;
  }

  return obj;
}

export function divChartBase() {
	var obj = chartBase();
	
	obj.put_static_content = function(element) {
		obj.real_div = element.append("div");
	}
	
	return obj;
}
