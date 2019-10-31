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

export function separateBy(data, properties, type){
  if(typeof data !== "object")
    throw "Error in function 'separateBy': first argument is not an object";
  
  //check if data is an object or an array
  var type;
  data.length === undefined ? type = "obj" : type = "arr";

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

/*  //go through all elements to find all possible values of the selected property
  for(var i = 0; i < keys.length; i++){
    if(typeof data[keys[i]][properties[0]] !== "undefined" &&
      uniqueList.indexOf(data[keys[i]][properties[0]]) == -1
    )
      uniqueList.push(data[keys[i]][properties[0]]);
  } */

  //if none of the objects have this property, continue with the next step
  //of the recursion
  var found = false, i = 0;
  while(!found && i < keys.length) {
    if(data[keys[i]][properties[0]] !== "undefined")
      found = true;
    i++;
  }
  if(!found) {
    properties.shift();
    return separateBy(data, properties)
  }

  //otherwise initialize properties of the new object
  //for(var i = 0; i < uniqueList.length; i++)
  //  type == "obj" ? newData[uniqueList[i]] = {} : newData[uniqueList[i]] = [];

  //go through all the elements again and place them in a suitable category
  var newElement;
  for(var i = 0; i < keys.length; i++){
    value = data[keys[i]][properties[0]];
    if(value !== undefined) {
      newElement = {};
      Object.assign(newElement, data[keys[i]]);
      delete newElement[properties[0]];
      if(newData[value] === undefined)
        type == "obj" ? newData[value] = {} : newData[value] = [];

      if(type == "obj") newData[value][keys[i]] = {};
      type == "obj" ? newData[value][keys[i]] = newElement :
                      newData[value].push(newElement);
    }
  }
  //if type is array but all values of the property are unique change arrays in objects
  //May be this should be optional
  if(type == "arr") {
    var change = true, i = 0,
    newProperties = Object.keys(newData);
    while(change && i < newProperties.length) {
      change = (newData[newProperties[i]].length == 1);
      i++;
    }
    if(change){
      var a;
      for(var i = 0; i < newProperties.length; i++){
        a = {};
        Object.assign(a, newData[newProperties[i]][0]);
        newData[newProperties[i]] = {};
        Object.assign(newData[newProperties[i]], a);
      }
    }
  }
  //Now go through all the properties of the new object and call this function
  //recursively
  properties.shift();
  
  for(var i = 0; i < newProperties.length; i++)
    newData[newProperties[i]] = separateBy(newData[newProperties[i]], properties.slice());
  return newData;
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

export function add_click_listener(chart){

  var wait_dblClick = null, down, wait_click = null,
    tolerance = 5, click_coord, downThis,
    pacer = call_pacer(100), panStarted = false;
 
  //add a transparent rectangle to detect clicks
  //and make changes to update function
  chart.svg.selectAll(".plotArea").append("rect")
    .attr("class", "clickPanel")
    .attr("fill", "transparent")
    .lower();
  var inherited_updateSize = chart.updateSize;
  
  chart.updateSize = function(){
    inherited_updateSize();
     chart.svg.selectAll(".clickPanel")
      .attr("width", chart.plotWidth())
      .attr("height", chart.plotHeight());
    return chart;
  }

  var on_mousedown = function(){
    //remove all the hints if there are any
    chart.container.selectAll(".hint")
      .remove();

    var p = d3.mouse(this);

    //Firefox ignores CSS properties when reporting the mouse position 
    //relative to an element (probably will be fixed in v.68)
    //upd. v.70 - still no changes
    //until then check if the browser is Firefox
    if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1 && 
        navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1] < 72){
      p[0] -= chart.paddings().left;
      p[1] -= chart.paddings().top;
    }

    down = d3.mouse(document.body);
    downThis = p.slice();
    wait_click = window.setTimeout(function() {wait_click = null;}, 1000);
    if(!chart.pan("mode"))
      chart.svg.selectAll(".plotArea").append("rect")
        .attr("class", "selection")
        .attr("x", p[0])
        .attr("y", p[1])
        .attr("width", 1)
        .attr("height", 1);
    if(chart.pan("mode")){
      panStarted = true;
      chart.pan("down", downThis);
      chart.transitionOff = true;
    }
    chart.container.selectAll(".inform")
      .classed("blocked", true);

    document.addEventListener("mousemove", on_mousemove, false);

    document.addEventListener("mouseup", on_mouseup, false);
  }
  var wait = false;
  var on_mousemove = function(e){
    var s = chart.svg.select(".selection"),
      rect = chart.svg.select(".clickPanel").node().getBoundingClientRect(),
      p = [d3.max([d3.min([e.clientX - rect.left, chart.plotWidth()]), 0]), 
            d3.max([d3.min([e.clientY - rect.top, chart.plotHeight()]), 0])];
        
    if(panStarted){
      if(!wait){
        wait = true;
        setTimeout(function() {wait = false}, 100);
        chart.panMove(p);
      }
      return;
    }

    if(!s.empty()) {
      s.attr("x", d3.min([p[0], downThis[0]]))
        .attr("y", d3.min([downThis[1], p[1]]))
        .attr("width", Math.abs(downThis[0] - p[0]))
        .attr("height", Math.abs(downThis[1] - p[1]));
      
    var shadow = chart.svg.select(".shadow");

    if(shadow.empty() && 
          Math.abs((downThis[0] - p[0]) * (downThis[1] - p[1])) > 10)
      shadow = chart.svg.selectAll(".plotArea").append("path")
        .attr("class", "shadow")
        .attr("fill", "#444")
        .attr("opacity", 0.6);

    shadow
      .attr("d", "M 0 0" + 
                " h " + chart.plotWidth() + 
                " v " + chart.plotHeight() + 
                " h -" + chart.plotWidth() + 
                " v -" + chart.plotHeight() +
                " M " + s.attr("x") + " " + s.attr("y") + 
                " v " + s.attr("height") +
                " h " + s.attr("width") +
                " v -" + s.attr("height") +                  
                " h -" + s.attr("width")) 
     // .lower();
     return;
    }

    var canvases = [];
    chart.container.selectAll("canvas")
      .filter(function() {return d3.select(this).classed("active")})
      .each(function() {canvases.push(d3.select(this).attr("id"));});

    if(canvases.length > 0) {
      pacer.do(function(){
        var elements = chart.findElements(p, p);
        if(Array.isArray(elements)) {
          //this is a heatmap in a canvas mode
          if(elements.length == 0) {
            chart.get_on_mouseout();
            return;
          }

          chart.container.selectAll(".inform")
            .style("left", (p[0] + 10 + chart.paddings().left) + "px")
            .style("top", (p[1] + 10 + chart.paddings().top) + "px")
            .select(".value")
              .html(function() {return chart.get_informText(elements[0][0], elements[0][1])});
        } else {
          //one of the layers is in canvas mode
          var i = Object.keys(elements).length,
            flag = true, layerId;

          while(flag && i > 0) {
            i--;
            layerId = Object.keys(elements)[i]; 
            flag = (elements[layerId].length == 0)
          }
          if(!flag && canvases.indexOf(layerId) != -1)
            d3.customEvent(e, chart.get_layer(layerId).get_on_mouseover, this, [elements[layerId][elements[layerId].length - 1]]);
            //chart.get_layer(layerId).get_on_mouseover(elements[layerId][0]);
          if(flag && chart.get_on_mouseout)
            chart.get_layer(layerId).get_on_mouseout();
        }

      })
    }
  }

  var on_mouseup = function(e) {
    var rect = chart.svg.select(".clickPanel").node().getBoundingClientRect(),
      pos = [d3.max([d3.min([e.clientX - rect.left, chart.plotWidth()]), 0]), 
            d3.max([d3.min([e.clientY - rect.top, chart.plotHeight()]), 0])];
    d3.event = e;

    var mark = d3.event.shiftKey || chart.selectMode();
    // remove selection frame
    chart.container.selectAll(".inform")
      .classed("blocked", false);

    if(!chart.svg.select("rect.selection").empty())
      var x = +chart.svg.selectAll("rect.selection").attr("x"),
        y = +chart.svg.selectAll("rect.selection").attr("y"),
        w = +chart.svg.selectAll("rect.selection").attr("width"),
        h = +chart.svg.selectAll("rect.selection").attr("height"),
        lu = [x, y], 
        rb = [x + w, y + h];
    
    var elements = chart.svg.selectAll(".plotArea");
    
    chart.svg.selectAll("rect.selection").remove();
    chart.svg.select(".shadow").remove();

    if(wait_click && getEuclideanDistance(down, d3.mouse(document.body)) < tolerance){
      window.clearTimeout(wait_click);
      wait_click = null;
      if(wait_dblClick && 
        getEuclideanDistance(click_coord, d3.mouse(document.body)) < tolerance
      ){
        window.clearTimeout(wait_dblClick);
        wait_dblClick = null;
        elements.on("dbl_click").apply(elements, [mark]);
      } else {
        wait_dblClick = window.setTimeout((function(e) {
          return function() {
            elements.on("click").call(elements, pos, mark);
            wait_dblClick = null;
            if(panStarted) {
              panStarted = false;
              chart.panMove(pos);
              chart.container.selectAll(".inform").classed("blocked", false);
              chart.transitionOff = false;
              return;
            }          
          };
        })(d3.event), 300);
      }
      click_coord = d3.mouse(document.body);
      return;
    }

    if(panStarted) {
      panStarted = false;
      chart.panMove(pos);
      chart.container.selectAll(".inform").classed("blocked", false);
      chart.transitionOff = false;
      return;
    }

    // remove temporary selection marker class
    if(lu)
      if(mark)
        chart.mark(chart.findElements(lu, rb))
      else 
        chart.zoom(lu, rb);

    document.onmousemove = null;
    document.onmouseup = null;      
  }
  var on_dblclick = function(mark){
    mark ? chart.mark("__clear__") : chart.resetDomain();
  }
  var on_panelClick = function(p, mark){

    d3.event.stopPropagation();
    //if this function wasn't called throug timers and 
    //therefore didn't get position as arguement, ignore
    if(p === undefined)
      return;

    //find all the points that intersect with the cursor position
    var clicked = chart.findElements(p, p);
    if(clicked.length == 0)
      return;

    if(mark){
      chart.mark(clicked);
      return;      
    }

    //if we are in canvas mode, on_click can't be called the usual way
    //there are no 'data_elements' to select
    var canvases = [];
    chart.container.selectAll("canvas")
      .filter(function() {return d3.select(this).classed("active")})
      .each(function() {canvases.push(d3.select(this).attr("id"));});

    if(canvases.length > 0) 
      if(Array.isArray(clicked)) {
          //this is a heatmap in a canvas mode
          chart.get_on_click(clicked[0][0], clicked[0][1])
          return;
        } else {
          //one of the layers is in canvas mode
          var i = Object.keys(clicked).length,
            flag = true, layerId;

          while(flag && i > 0) {
            i--;
            layerId = Object.keys(clicked)[i]; 
            if(clicked[layerId].length != 0) {
              if(chart.clickSingle()) {
                flag = false;
                d3.customEvent(d3.event, chart.get_layer(layerId).get_on_click, this, [clicked[layerId][0]])
              } else {
                for(var j = 0; j < clicked[layerId].length; j++)
                  d3.customEvent(d3.event, chart.get_layer(layerId).get_on_click, this, [clicked[layerId][j]])
              }
            }
          }

          return;
        }
    
    var clickedElements = chart.get_elements(clicked),
      activeElement = clickedElements.filter(function(d){
        return d == chart.container.selectAll(".inform").datum();
      });
    if(!activeElement.empty())
      clickedElements = activeElement;

    if(chart.clickSingle())
      clickedElements = d3.select(clickedElements.node());

    var clickFun;
    clickedElements.each(function(d){
      clickFun = d3.select(this).on("click");
      clickFun.call(this, d)
    })
  }

  chart.svg.selectAll(".plotArea")
    .on("mousedown", on_mousedown, true)
    //.on("mousemove", on_mousemove, true)
    //.on("mouseup", on_mouseup, true)
    .on("dbl_click", on_dblclick, true)
    .on("click", on_panelClick, true);
  
  chart.container.node().addEventListener("mousemove", on_mousemove, false);

  return chart;
}

export function pearsonCorr( v1, v2 ) {
   var sum1 = 0;
   var sum2 = 0;
   for( var i = 0; i < v1.length; i++ ) {
      sum1 += v1[i];
      sum2 += v2[i];
   }
   var mean1 = sum1 / v1.length;
   var mean2 = sum2 / v2.length;
   var cov = 0
   var var1 = 0
   var var2 = 0
   for( var i = 0; i < v1.length; i++ ) {
      cov += ( v1[i] - mean1 ) * ( v2[i] - mean2 );
      var1 += ( v1[i] - mean1 ) * ( v1[i] - mean1 );
      var2 += ( v2[i] - mean2 ) * ( v2[i] - mean2 );
   } 
   return cov / Math.sqrt( var1 * var2 );
} 

function wrapText(text, width, height, minSize, maxSize, fontRatio){
  var splitBy = function(text, symbol){
    var spl = text.split(symbol);
    if(spl[spl.length - 1] == "")
      spl.pop();
    if(spl.length == 1) return;
    var mult = 0, bestSep, leftSide = 0,
      rightSide = text.length;
    for(var i = 0; i < spl.length - 1; i++){
      leftSide += (spl[i].length + 1);
      rightSide -= (spl[i].length + 1);
      if(mult < leftSide * rightSide){
        mult = leftSide *  rightSide;
        bestSep = i;
      }
    }
    return [spl.slice(0, bestSep + 1).join(symbol) + symbol, 
            spl.slice(bestSep + 1, spl.length - bestSep).join(symbol)];
  }

  var splitByVowel = function(text){
    var vowelInd = Array.apply(null, Array(text.length)).map(Number.prototype.valueOf,0),
      vowels = ["a", "A", "o", "O", "e", "E", "u", "U", "i", "I"];
    
    for(var i = 0; i < text.length; i++)
      if(vowels.indexOf(text[i]) != -1)
        vowelInd[i] = 1;
    for(var i = 0; i < vowelInd.length - 1; i++)
      vowelInd[i] = (vowelInd[i] - vowelInd[i + 1]) * vowelInd[i];
    vowelInd[vowelInd.length - 1] = 0;
    vowelInd[vowelInd.length - 2] = 0;
    if(vowelInd.indexOf(1) == -1)
      return [text.substring(0, Math.ceil(text.length / 2)) + "-", 
              text.substring(Math.ceil(text.length / 2))];
    var mult = 0, bestSep;
    for(var i = 0; i < text.length; i++)
      if(vowelInd[i] == 1)
        if(mult < (i + 2) * (text.length - i - 1)){
          mult = (i + 2) * (text.length - i - 1);
          bestSep = i;
        }

      return [text.substring(0, bestSep + 1) + "-", 
              text.substring(bestSep + 1)];
  }

  if(typeof minSize === "undefined")
    minSize = 8;
  if(typeof maxSize === "undefined")
    maxSize = 13;
  if(typeof fontRatio === "undefined")
    fontRatio = 0.6;
  var fontSize = d3.min([height, maxSize]),
    spans = [text], maxLength = text.length,
    allowedLength, longestSpan = 0,
    mult, br;

  while(maxLength * fontSize * fontRatio > width && fontSize >= minSize){
    if(maxLength == 1)
      fontSize = width / fontRatio * 0.95
    else {
      if(height / (spans.length + 1) < width / (maxLength * fontRatio) * 0.95)
        fontSize = width / (maxLength * fontRatio) * 0.95
      else {
        var charachters = [" ", ".", ",", "/", "\\", "-", "_", "+", "*", "&", "(", ")", "?", "!"],
          spl, i = 0;
        while(typeof spl === "undefined" && i < charachters.length){
          spl = splitBy(spans[longestSpan], charachters[i]);
          i++;
        }
        if(typeof spl === "undefined")
          spl = splitByVowel(spans[longestSpan]);
        spans.splice(longestSpan, 1, spl[0], spl[1]);

        allowedLength = Math.floor(width / (fontSize * fontRatio));

        for(var i = 0; i < spans.length - 1; i++)
          if(spans[i].length + spans[i + 1].length <= allowedLength &&
              spans[i].length + spans[i + 1].length < maxLength){
            spans.splice(i, 2, spans[i] + spans[i + 1]);
            fontSize = d3.min([height / (spans.length - 1), maxSize]);
            allowedLength = Math.floor(width / (fontSize * fontRatio));
          }

        fontSize = d3.min([height / spans.length, maxSize]);
        maxLength = spans[0].length;
        longestSpan = 0;
        for(var i = 1; i < spans.length; i++)
          if(spans[i].length > maxLength){
            maxLength = spans[i].length;
            longestSpan = i;
          }
      }
    }     
  }

 // fontSize = d3.min([height / spans.length, width / (maxLength * fontRatio)]);

  return {spans: spans, fontSize: fontSize};
}

export function fillTextBlock(g, width, height, text, minSize, maxSize, fontRatio){
  var fit = wrapText(text, width, height, minSize, maxSize, fontRatio),
    spans = g.selectAll("text").data(d3.range(fit.spans.length));
    spans.exit().remove();
    spans.enter().append("text")
      .merge(spans)
        .attr("class", "plainText")
        .attr("text-anchor", "left")
        .attr("font-size", fit.fontSize)
        .attr("y", function(d) {return (d + 1) * fit.fontSize;})
        .text(function(d) {return fit.spans[d]});
}

export function get_symbolSize(type, r) {
  var sizeCoef = {
    "Circle": 30,
    "Cross": 35,
    "Diamond": 46,
    "Square": 36,
    "Star": 47,
    "Triangle": 44,
    "Wye": 37
  };

  return Math.pow(r * 28.2 / sizeCoef[type], 2) * 3.14;
}

export function escapeRegExp(str) {
  return str.replace(/[\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

export function call_pacer( interval ) {

   /*
   This "call pacer" serves to avoid jerky appearance when a redraw
   function is triggered to often because events fire to rapidly.
   
   Say, you have a handler, e.g., for a 'drag' event, which is supposed
   to call an 'update' function. Usually you would write
      some_object.on( "drag", update );
   If 'update' is complex, you may want to make sure that it is not called
   more often than, say, once in 30 ms. If the drag event fires more often,
   intermittant calls to 'update' should be skipped. For this, write.
     var pacer = call_pacer( 30 );
     some_object.on( "drag", function() { pacer.do( update ) } )
   Now, pacer.do will call 'update', but only if the last call was more than
   30 ms ago. It also ensures that after a lapse of more than 30 ms without
   event, the last lapsed call is then called, to draw the final state.
   */

   var obj = {
      interval: interval,
      prev_time: -Infinity,
      timer: null }

   obj.do = function() {
      var callback = arguments[0],
        args = [];
      for(var i = 1; i < arguments.length; i++)
        args.push(arguments[i]);
      if( obj.timer )
         obj.timer.stop();
      if( d3.now() - obj.prev_time >= interval ) {         
         callback.call(this, args);
         obj.prev_time = d3.now();
      } else {
         obj.timer = d3.timeout( callback, 1.5 * interval )
      }
   }

   return obj;
}

export function check(type, property) {
  if(type == "number_nonneg") {
    return function(value) {
      if(typeof value === "function")
        return value;

      if(!isNaN(+value)) value = +value;
      if(typeof value === "number"){
        if(value >= 0)
          return value;
        throw "Error in 'typeCheck' for property '" + property + 
          "': negative values are not allowed."
      }
      throw "Error in 'typeCheck' for property '" + property + 
        "': numeric value is required."
    }
  }

  if(type == "array") {
    return function(value) {
      if(typeof value === "function")
        return value;

      if(Array.isArray(value)) return value;
    
      if(typeof value === "object") {
        var arr = [];
        for(el in value) 
          if(typeof value[el] == "string" || typeof value[el] == "number")
            arr.push(value[el])
          else
            throw "Error in 'typeCheck' for property '" + property + 
                  "': the value is not an array."
        return arr;
      }
      if(typeof value === "number" || typeof value == "string") return [value];

      throw "Error in 'typeCheck' for property '" + property + 
             "': the value is not an array."
    }         
  }

  if(type == "array_fun") {
    return function(value) {
      if(typeof value === "object")
        return function(i) {return value[i]}

      return value;
    }
  }

  if(type = "matrix_fun") {
    return function(value) {
      if(typeof value === "function")
        return value;
      if(typeof value === "object"){
        var keys = Object.keys(value);
        if(typeof value[keys[0]] === "object")
          return function(i, j) {return value[i][j]}
        else
          return function(i) {return value[i]}
      }

      throw "Error in 'typeCheck' for property '" + property + 
        "': the value is not an array or an object."
    }
  }  
}

//interpretes NAs from R as NaNs and other cases that we don't want to use,
//when defining domains
export function isNaN(value) {
  return (value == "NA" || value == "NaN" || value == "NAN" || value == "na" || value == "Infinity" || value == "Inf") 
}

//from http://indiegamr.com/generate-repeatable-random-numbers-in-js/
//Math.seed must be defined before calling this function
export function random(max, min) {
  max = max || 1;
  min = min || 0;
 
  Math.seed = (Math.seed * 9301 + 49297) % 233280;
  var rnd = Math.seed / 233280;
 
  return min + rnd * (max - min);
}