export function base() {
	
  var obj = {};
  obj.propList = [];

  obj.add_property = function( propertyName, defaultValue ) {
    //save the name of the property
    obj.propList.push(propertyName);
		
    var getter = "get_" + propertyName,
      overrideList = {};

    //define the setter
    obj[ propertyName ] = function( vf, propertyName, overrideFunc ) {
      //if value is not defined, consider this a getter call
      if( vf === undefined )
        return obj[ getter ]();      

      //if setter is called in "override" mode, save the function
      //to replace with it another property's getter each time this
      //setter is called
      if( vf == "__override__"){
        if(typeof overrideFunc === "function")
          overrideList[propertyName] = overrideFunc
        else
          overrideList[propertyName] = function() {return overrideFunc;}
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

    //define a getter
		if(typeof defaultValue === "function")
			obj[ getter ] = defaultValue
		else
			obj[ getter ] = function() { return defaultValue };
    return obj;
  }
	
	return obj;
}

