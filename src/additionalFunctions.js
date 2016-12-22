export function cache( f ) {
  var the_cache = {}
  return function() {
    if( arguments[0] === "clear" ) {
      the_cache = {}
      return undefined;
    }
    if( !( arguments in Object.keys(the_cache) ) &&
			!(arguments.length == 0 && Object.keys(the_cache).length != 0))
      the_cache[arguments] = f.apply( undefined, arguments );
    return the_cache[arguments];
  }
}

export function separateBy(data, properties){
  if(typeof data !== "object")
    throw "Error in function 'separateBy': first argument is not an object";
  
  //check if data is an object or an array
  var type;
  typeof data.length === "undefined" ? type = "obj" : type = "arr";

  if(typeof properties === "number" || typeof properties === "string")
    properties = [properties];
  //turn "properities" into an array and throw an Error if this isn't possible
  if(typeof properties.length === "undefined")
    throw "Error in function 'separateBy': " + properties.toString() +
          " is not a property name"; 
  
  //end of a recursive function. There are no more properties to
  //separate by
  if(properties.length == 0)
    return data;

  var newData = {}, uniqueList = [], keys, value;
  //if data is an array, keys = ["0", "1", "2", ...]
  var keys = Object.keys(data);

  //go through all elements to find all possible values of the selected property
  for(var i = 0; i < keys.length; i++){
    if(typeof data[keys[i]][properties[0]] !== "undefined" &&
      uniqueList.indexOf(data[keys[i]][properties[0]]) == -1
    )
      uniqueList.push(data[keys[i]][properties[0]]);
  }

  //if none of the objects have this property, continue with the next step
  //of the recursion
  if(uniqueList.length == 0){
    properties.shift();
    return separateBy(data, properties)
  }
  //otherwise initialize properties of the new object
  for(var i = 0; i < uniqueList.length; i++)
    type == "obj" ? newData[uniqueList[i]] = {} : newData[uniqueList[i]] = [];

  //go through all the elements again and place them in a suitable category
  for(var i = 0; i < keys.length; i++){
    value = data[keys[i]][properties[0]];
    if(typeof value !== "undefined"){
      delete data[keys[i]][properties[0]];
      if(type == "obj") newData[value][keys[i]] = {};
      type == "obj" ? Object.assign(newData[value][keys[i]], data[keys[i]]) :
                      newData[value].push(data[keys[i]]);
    }
  }
  //if type is array but all values of the property are unique change arrays in objects
  //May be this should be optional
  if(type == "arr"){
    var change = true, i = 0;
    while(change && i < uniqueList.length){
      change = (newData[uniqueList[i]].length == 1);
      i++;
    }
    if(change){
      var a;
      for(var i = 0; i < uniqueList.length; i++){
        a = {};
        Object.assign(a, newData[uniqueList[i]][0]);
        newData[uniqueList[i]] = {};
        Object.assign(newData[uniqueList[i]], a);
      }
    }
  }
  //Now go through all the properties of the new object and call this function
  //recursively
  properties.shift();
  
  for(var i = 0; i < uniqueList.length; i++)
    newData[uniqueList[i]] = separateBy(newData[uniqueList[i]], properties.slice());
  return newData;
}

export function fireEvent(element,event){
	if (document.createEventObject){
		// dispatch for IE
		var evt = document.createEventObject();
		return element.fireEvent('on'+event,evt)
	} else {
    // dispatch for firefox + others
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent(event, true, true ); // event type,bubbling,cancelable
    return !element.dispatchEvent(evt);
  }
}

export function getEuclideanDistance(a, b) {
	if(a.length != b.length)
		throw "Error in getEuclideanDistance: length of the" +
			"input vectors is not the same";
	var sum = 0;
	for(var i = 0; i < a.length; i++)
		sum += (a[i] - b[i]) * (a[i] - b[i]);
	
	return Math.sqrt(sum);
}
