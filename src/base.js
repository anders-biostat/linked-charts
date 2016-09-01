//Basic object that can be chart or layer
export function base() {
	
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
	
	return obj;
}
