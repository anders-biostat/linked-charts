export function base() {
	
  var obj = {};
  obj.propList = [];

  obj.add_property = function( propertyName, defaultValue, typeCheck ) {
    //save the name of the property
    obj.propList.push(propertyName);
		
    var getter = "get_" + propertyName;

    //define the setter
    obj[ propertyName ] = function( vf ) {
      //if value is not defined, consider this a getter call
      if( vf === undefined )
        return obj[ getter ]();

      if(typeof typeCheck === "function")
         vf = typeCheck(vf);
      //if value is a function replace the getter with it,
      //otherwise replace getter with a function that returns this value
      if( typeof(vf) === "function" )
        obj[ getter ] = vf
      else 
        obj[ getter ] = function() { return vf };

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

  //wraps a setter using the provided wrapper function
  obj.wrapSetter = function(propertyName, wrapper){
    if(typeof wrapper !== "function")
      throw "Error in 'wrapSetter': wrapper is not a function."
    if(obj.propList.indexOf(propertyName) == -1)
      throw "Error in 'wrapSetter': this object doesn't have " + propertyName +
        " property";

    var oldSetter = obj[propertyName];
    obj[propertyName] = function(){
      //if no arguments were passed return the getter value
      if(arguments.length == 0)
        return obj["get_" + propertyName]();

      //otherwise run the wrapped setter
     return wrapper(oldSetter).apply(obj, arguments);
    }
    
    return obj;
  }
	
	return obj;
}

