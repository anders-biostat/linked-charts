//Basic object that can be chart or layer
export function base() {
	
  var obj = {};
	
  obj.add_property = function( propname, defaultval ) {
		
		var getter = "get_" + propname;
    var overrideList = {};

    obj[ propname ] = function( vf, propname, overrideFunc ) {

      if( vf === undefined )
        return obj[ getter ]();      

      if( vf == "_override_"){
        if(typeof overrideFunc === "function")
          overrideList[propname] = overrideFunc
        else
          overrideList[propname] = function() {return overrideFunc;}
      } else {
        if( typeof(vf) === "function" )
          obj[ getter ] = vf
        else
          obj[ getter ] = function() { return vf };

        for(var i in overrideList)
          obj["get_" + i] = overrideList[i];
      }
      //setter always returns chart, never layer
      if(obj.layers)
        return obj
      else
        if(obj.chart)
          return obj.chart
        else
          return obj;
    }

		if(typeof defaultval === "function")
			obj[ getter ] = defaultval
		else
			obj[ getter ] = function() { return defaultval };
    return obj;
  }
	
	return obj;
}

