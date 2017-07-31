//Basic object that can be chart or layer
/**
  * @hideconstructor  
  * @class
  * @description Basic object that provides property funtionality.
  */
export function base() {
	
  var obj = {};
  obj.propList = [];
/**
  * @function add_property
  * @description Adds a property to this object
  * @memberof base
  * @param {string} propertyName - Name of a property.
  * @param {value|function} [defaultValue] - Default value for a property.
  *   Can also be a function that returns desired value or object.
  * @return Object
  */
  obj.add_property = function( propertyName, defaultValue ) {
		
    obj.propList.push(propertyName);
		var getter = "get_" + propertyName;
    var overrideList = {};

    obj[ propertyName ] = function( vf, propertyName, overrideFunc ) {

      if( vf === undefined )
        return obj[ getter ]();      

      if( vf == "_override_"){
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

		if(typeof defaultValue === "function")
			obj[ getter ] = defaultValue
		else
			obj[ getter ] = function() { return defaultValue };
    return obj;
  }
	
	return obj;
}

