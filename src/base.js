//Basic object that can be chart or layer
export function base() {
	
  var obj = {};
	obj.properties = [];
	
  obj.add_property = function( propname, defaultval ) {
    obj.properties.push(propname);
		
		var getter = "get_" + propname;
    obj[ propname ] = function( vf ) {
      if( vf === undefined )
        throw "No value passed in setter for property '" + propname + "'.";
      if( typeof(vf) === "function" )
        obj[ getter ] = vf
      else
        obj[ getter ] = function() { return vf };

      if(obj.chart)
        if(obj.chart[propname]){
          obj.chart[propname] = obj[propname];
          obj.chart[getter] = obj[getter];
        }
      if(obj.layers)
        for(var i in obj.layers)
          if(obj.layers[i][propname]){
            obj.layers[i][propname] = obj[propname];
            obj.layers[i][getter] = obj[getter];
          }

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

