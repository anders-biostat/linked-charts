var select = d3.select;   // To do: Figure out how to use import correctly with rollup
// import {select} from "d3-select";    // This here doesn't work.

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
	
	obj.add_lines = function(){
		if(!obj.real_svg)
			throw "Error in function 'add_lines': the chart doesn't have" +
			" a svg element";
		
		//just added some code that can add lines in charts where they are not
		//supposed to be added. Probably no one will ever need it
		if(!obj.svg)
			obj.svg = obj.real_svg.append("g");
			if(obj.get_margin())
				obj.svg
					.attr("transform", "translate(" + obj.get_margin().left +
						", " + obj.get_margin().top + ")");
		
		obj.add_property("nlines")
			.add_property("lineIds", function() {return d3.range(obj.get_nlines());})
			.add_property("lineFun")
			.add_property("lineStyle", "")
			.add_property("lineStepNum", 100);
			
		var inherited_update = obj.update;
		
		obj.update = function(){
			
			inherited_update();
			
			if(!obj.scale_x) 
				obj.scale_x = d3.scaleLinear()
					.domain( [ 0, obj.get_width() ] )
					.range( [ 0, obj.get_width() ] )
					.nice();
			if(!obj.scale_y)
				obj.scale_y = d3.scaleLinear()
					.domain( [ obj.get_height(), 0 ] )
					.range( [ obj.get_height(), 0 ] )
					.nice();
			
			//define the length of each step
			var lineStep = (obj.scale_x.domain()[1] - obj.scale_x.domain()[0]) / 
				obj.get_lineStepNum();

			var lines = obj.svg.selectAll(".line")
				.data(obj.get_lineIds());
			lines.exit()
				.remove();
			lines.enter()
				.append("path")
					.attr("class", "line")
					.attr("fill", "none")
					.attr("stroke", "black")
					.attr("stroke-width", 1.5)
				//do we need transition that is synchronized with other transitions
				//of the chart?
				//If so, a transition should be an object property as well.
				//Or may be we can add it through add_property function?
				.merge(lines)
					.attr("style", function(d){
						return obj.get_lineStyle(d);
					})
					.attr("d", function(d){
						var lineData = [];
						
						for(var i = obj.scale_x.domain()[0]; i < obj.scale_x.domain()[1]; i += lineStep)
							lineData.push({
								x: i,
								y: obj.get_lineFun(d, i)
							});
						
						var line = d3.line()
							.x(function(c) {return obj.scale_x(c.x);})
							.y(function(c) {return obj.scale_y(c.y);});
						
						return line(lineData);
					});

			return obj;
		}
		
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
