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

//functions to convert mouseup, mousedown and mousemove events
//into click, doubleclick and selection
export function add_click_listener(layer){

//THIS IS TEMPORARY

//returns range of an array
Array.prototype.range = function(){
  return [d3.min(this), d3.max(this)];
}

//adds a vector or a scalar to a vector
Array.prototype.add = function(b){
  var s = Array(this.length);
  for(var i = 0; i < this.length; i++)
    if(typeof(b) == "number")
      s[i] = this[i] + b;
    else
      s[i] = this[i] + b[i];
  return s;
} 

//multiplies an array by a scalar or performs scalar multiplication of two vectors
Array.prototype.mult = function(b){
  var s = Array(this.length);
  for(var i = 0; i < this.length; i++)
    if(typeof(b) == "number")
      s[i] = this[i] * b;
    else
      s[i] = this[i] * b[i];
  return s;
}
  
//returns distance between two points
Array.prototype.enorm = function(){
  return Math.sqrt(this.reduce(function(prev, cur) {return prev + cur*cur;}, 0));
}

Array.prototype.allIndexOf = function(val){
    var indexes = [];
    for(var i = 0; i < this.length; i++)
        if (this[i] === val)
            indexes.push(i);
    return indexes;
}


  var wait_dblClick = null, down, wait_click = null,
    tolerance = 5, click_coord,
    event = d3.dispatch('click', 'dblclick');
  
  layer.g
    .on("mousedown", function() {      
      down = d3.mouse(document.body);
      wait_click = window.setTimeout(function() {wait_click = null;}, 500);
      if(self.onSelection != "doNothing"){
        if(!d3.event.shiftKey || this.onSelection == "zoom") {
          layer.chart.svg.selectAll(".data_point").classed("selected",false);
          layer.chart.svg.selectAll(".label").classed("selected",false);
        }
        var p = d3.mouse(this);  //Mouse position on the heatmap
        layer.g.append("rect")
          .attr("class", "selection")
          .attr("rx", 0)
          .attr("ry", 0)
          .attr("x", p[0])
          .attr("y", p[1])
          .attr("width", 1)
          .attr("height", 1);
      }
    })
    .on("mousemove", function() {
      var s = layer.g.select(".selection");
      
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
        d3.selectAll('.tmp-selection.selected').classed("selected", false);

        layer.chart.svg.selectAll('.data_point').filter(function(dp, i) {
          var cx, cy, hw, hh;
          this.width ? hw = this.width.baseVal.value/2 : hw = this.r.baseVal.value;
          this.height ? hh = this.height.baseVal.value/2 : hh = this.r.baseVal.value;
          if(this.r) {
            cx = this.cx.baseVal.value;
            cy = this.cy.baseVal.value;
          } else {
            cx = this.x.baseVal.value + hw;
            cy = this.y.baseVal.value + hh;
          }
          if(!d3.select(this).classed("selected") &&
              Math.abs(cx - d.x) <= hw && Math.abs(cy - d.y) <= hh) {
      
            d3.select(this)
              .classed("tmp-selection", true)
              .classed("selected", true);

            layer.chart.svg.select(".col").selectAll(".label")
              .filter(function(label_d) {return label_d == dp.col;})            
                .classed("tmp-selection", true)
                .classed("selected", true);

            layer.chart.svg.select(".row").selectAll(".label")
              .filter(function(label_d) {return label_d == dp.row;})            
                .classed("tmp-selection", true)
                .classed("selected", true);
          }
        });
      }
    })
    .on("mouseup", function() {
      // remove selection frame
      layer.g.selectAll("rect.selection").remove();
      var points = d3.select(this),
        pos = d3.mouse(this);


      if(wait_click && down.add(d3.mouse(document.body).mult(-1)).enorm() < tolerance){
        window.clearTimeout(wait_click);
        wait_click = null;
        if(wait_dblClick && click_coord.add(d3.mouse(document.body).mult(-1)).enorm() < tolerance){
                    //console.log("doubleclick");
                    window.clearTimeout(wait_dblClick);
                    wait_dblClick = null;
                    points.on("dblclick").apply(points);
        } else {
          wait_dblClick = window.setTimeout((function(e) {
                        return function() {
                            points.on("click").apply(points, [pos]);
                            wait_dblClick = null;
                        };
                    })(d3.event), 300);
        }
        click_coord = d3.mouse(document.body);
        return;
      }
      d3.selectAll(".tmp-selection").classed("tmp-selection",false);
      
      // remove temporary selection marker class
     /* 
      if(self.onSelection == "zoom"){
        if(self.dataPoints.rowOrder.filter(function(e){return e != -1}).length == self.dataPoints.rowLabels.length)
          self.dataPoints.savedRowOrder = self.dataPoints.rowOrder.slice();
        if(self.dataPoints.colOrder.filter(function(e){return e != -1}).length == self.dataPoints.colLabels.length) 
          self.dataPoints.savedColOrder = self.dataPoints.colOrder.slice();
        
        cont.select("#rowLabels").selectAll(".label")
          .filter(function(){return !d3.select(this).classed("text-selection")})
          .each(function(d){
            if(self.dataPoints.rowOrder.indexOf(d.row) != -1)
              self.dataPoints.rowOrder[self.dataPoints.rowOrder.indexOf(d.row)] = -1;
          });
        cont.select("#colLabels").selectAll(".label")
          .filter(function(){return !d3.select(this).classed("text-selection")})
          .each(function(d){
            if(self.dataPoints.colOrder.indexOf(d.col) != -1)
              self.dataPoints.colOrder[self.dataPoints.colOrder.indexOf(d.col)] = -1;
          });
        self.dataPoints.colOrder = self.dataPoints.colOrder.filter(function(d) {return d != -1;});
        self.dataPoints.rowOrder = self.dataPoints.rowOrder.filter(function(d) {return d != -1;});
        cont.selectAll(".text-selection.selected").classed("selected", false);
        cont.selectAll(".cell-selection.selected").classed("selected", false);
        cont.selectAll(".text-selection").classed("text-selection", false);
        cont.selectAll(".cell-selection").classed("cell-selection", false);
        self.updatePlot();
      } 
*/
    })
    .on("dblclick", function(){
      console.log("doubleclick");
      /*var update = false;
      if(self.dataPoints.savedColOrder && 
        self.dataPoints.savedColOrder.length != self.dataPoints.colOrder.length
      ){
        self.dataPoints.colOrder = self.dataPoints.savedColOrder.slice();
        update = true;
      }
      if(self.dataPoints.savedRowOrder && 
        self.dataPoints.savedRowOrder.length != self.dataPoints.rowOrder.length
      ){
        self.dataPoints.rowOrder = self.dataPoints.savedRowOrder.slice();
        update = true;
      }
      if(update)
        self.updatePlot();*/
    })  

    .on("click", function(p){

      console.log("click");
      console.log(p);
      var clickedPoint = layer.findPoints(p, p),
        click = clickedPoint.on("click");
      click.apply(clickedPoint, [clickedPoint.datum()]); 
    });

  return layer;
}