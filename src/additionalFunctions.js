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
    tolerance = 5, click_coord,
    event = d3.dispatch('click', 'dblclick');

  //add a transparent rectangle to detect clicks
  //and make changes to update function
  chart.svg.append("rect")
    .attr("class", "clickPanel")
    .attr("fill", "transparent")
    .lower();
  var inherited_updateSize = chart.updateSize;
  
  chart.updateSize = function(){
    inherited_updateSize();
     chart.svg.selectAll(".clickPanel")
      .attr("width", chart.get_width())
      .attr("height", chart.get_height());
    return chart;
  }

  var on_mousedown = function(){
    down = d3.mouse(document.body);
    wait_click = window.setTimeout(function() {wait_click = null;}, 1000);
    if(self.onSelection != "doNothing"){
      if(!d3.event.shiftKey || this.onSelection == "zoom") {
        chart.svg.selectAll(".data_point").classed("selected",false);
        chart.svg.selectAll(".label").classed("selected",false);
      }
      var p = d3.mouse(this);  //Mouse position on the heatmap
      chart.svg.append("rect")
        .attr("class", "selection")
        .attr("rx", 0)
        .attr("ry", 0)
        .attr("x", p[0])
        .attr("y", p[1])
        .attr("width", 1)
        .attr("height", 1);
      //chart.svg.select(".clickPanel").raise();
    }
    chart.container.select(".inform")
      .classed("blocked", true);
  }
  var on_mousemove = function(){
    var s = chart.svg.select(".selection");
        
    if(!s.empty()) {
      var p = d3.mouse(this),
      //The latest position and size of the selection rectangle
      d = {
        x: parseInt(s.attr("x"), 10),
        y: parseInt(s.attr("y"), 10),
        width: parseInt(s.attr("width"), 10),
        height: parseInt(s.attr("height"), 10)
      },
      move = {
        x: p[0] - d.x,
        y: p[1] - d.y
      };
        
      if(move.x < 1 || (move.x * 2 < d.width)) {
        d.x = p[0];
        d.width -= move.x;
      } else {
        d.width = move.x;       
      }
        
      if(move.y < 1 || (move.y * 2 < d.height)) {
        d.y = p[1];
        d.height -= move.y;
      } else {
        d.height = move.y;       
      }
         
      s.attr("x", d.x)
        .attr("y", d.y)
        .attr("width", d.width)
        .attr("height", d.height);
        
      // deselect all temporary selected state objects
      d3.selectAll('.tmp-selection.selected')
        .classed("selected", false);

      //here we need to go through all layers
      var selPoints = chart.findPoints(
        [d.x - chart.get_margin().left, d.y - chart.get_margin().top], 
        [d.x + d.width - chart.get_margin().left, d.y + d.height - chart.get_margin().top]
      );
      if(typeof selPoints.empty === "function")
        selPoints = [selPoints];

      for(var i = 0; i < selPoints.length; i++)
        selPoints[i]
          .filter(function() {return !d3.select(this).classed("selected")})
          .classed("selected", true)
          .classed("tmp-selection", true)
          .each(function(dp){
            chart.svg.select(".col").selectAll(".label")
              .filter(function(label_d) {return label_d == dp.col;})            
                .classed("tmp-selection", true)
                .classed("selected", true);
            chart.svg.select(".row").selectAll(".label")
              .filter(function(label_d) {return label_d == dp.row;})            
                .classed("tmp-selection", true)
                .classed("selected", true);
          });
    }
  }

  var on_mouseup = function(){
    var mark = d3.event.shiftKey;
    // remove selection frame
    chart.container.select(".inform")
      .classed("blocked", false);

    var x = chart.svg.selectAll("rect.selection").attr("x") * 1,
      y = chart.svg.selectAll("rect.selection").attr("y") * 1,
      w = chart.svg.selectAll("rect.selection").attr("width") * 1,
      h = chart.svg.selectAll("rect.selection").attr("height") * 1,
      lu = [x - chart.get_margin().left, y - chart.get_margin().top], 
      rb = [x + w - chart.get_margin().left, y + h - chart.get_margin().top],
      points = d3.select(this),
      pos = d3.mouse(this);
    chart.svg.selectAll("rect.selection").remove();
    pos[0] = pos[0] - chart.get_margin().left;
    pos[1] = pos[1] - chart.get_margin().top;

    if(wait_click && getEuclideanDistance(down, d3.mouse(document.body)) < tolerance){
      window.clearTimeout(wait_click);
      wait_click = null;
      if(wait_dblClick && 
        getEuclideanDistance(click_coord, d3.mouse(document.body)) < tolerance
      ){
        //console.log("doubleclick");
        window.clearTimeout(wait_dblClick);
        wait_dblClick = null;
        points.on("dblclick").apply(points, [mark]);
      } else {
        wait_dblClick = window.setTimeout((function(e) {
          return function() {
            points.on("click").call(points, pos, mark);
            wait_dblClick = null;
          };
        })(d3.event), 300);
      }
      click_coord = d3.mouse(document.body);
      return;
    }
    // remove temporary selection marker class
    if(mark)
      d3.selectAll(".selected")
        .classed("marked", true);
    d3.selectAll(".tmp-selection")
      .classed("tmp-selection",false)
      .classed("selected", false)
    mark ? chart.get_markedUpdated(chart.svg.selectAll(".marked")) : chart.zoom(lu, rb);      
  }
  var on_dblclick = function(mark){
    mark ? chart.container.selectAll(".marked").classed("marked", false) : chart.resetDomain();
    if(mark) chart.get_markedUpdated();     
  }
  var on_panelClick = function(p, mark){
    var clickedPoints = chart.findPoints(p, p);
    if(typeof clickedPoints.empty === "function")
      clickedPoints = [clickedPoints];
    var i = 0;
    while(i < clickedPoints.length && clickedPoints[i].empty())
      i++;

    if(i < clickedPoints.length){
      if(!mark){
        var click = clickedPoints[i].on("click");
        click.call(clickedPoints[i].node(), clickedPoints[i].datum()); 
      } else {
        clickedPoints[i].classed("marked") ? clickedPoints[i].classed("marked", false) : clickedPoints[i].classed("marked", true);
        chart.get_markedUpdated(chart.svg.selectAll(".marked"));
      }
    }
  }

  chart.svg
    .on("mousedown", on_mousedown)
    .on("mousemove", on_mousemove)
    .on("mouseup", on_mouseup)
    .on("dblclick", on_dblclick)
    .on("click", on_panelClick);
      
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