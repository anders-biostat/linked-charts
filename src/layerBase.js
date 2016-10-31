import { base } from "./base";

export function layerBase() {
	
	var layer = base()
		.add_property("layerDomainX")
		.add_property("layerDomainY")
		.add_property("contScaleX", true)
		.add_property("contScaleY", true)
		.add_property("on_click", function() {});

	layer.add_click_listener = function(){

	//THIS IS TEMPORARY
	//TO DO: decide how better to add this functions.

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


	  var wait_dblClick = null, down, wait_click = null,
	    tolerance = 5, click_coord,
	    event = d3.dispatch('click', 'dblclick');

	  layer.g.append("rect")
	    .attr("class", "clickPanel")
	    .attr("fill", "transparent");
	  
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
	        d3.selectAll('.tmp-selection.selected')
	          .classed("selected", false);

	        var selPoints = layer.findPoints([d.x, d.y], [d.x + d.width, d.y + d.height])
	          .filter(function() {return !d3.select(this).classed("selected")})
	          .classed("selected", true)
	          .classed("tmp-selection", true)
	          .each(function(dp){
	            layer.chart.svg.select(".col").selectAll(".label")
	              .filter(function(label_d) {return label_d == dp.col;})            
	                .classed("tmp-selection", true)
	                .classed("selected", true);

	            layer.chart.svg.select(".row").selectAll(".label")
	              .filter(function(label_d) {return label_d == dp.row;})            
	                .classed("tmp-selection", true)
	                .classed("selected", true);
	          });
	      }
	    })
	    .on("mouseup", function() {
	      // remove selection frame
	      var x = layer.g.selectAll("rect.selection").attr("x") * 1,
	        y = layer.g.selectAll("rect.selection").attr("y") * 1,
	        w = layer.g.selectAll("rect.selection").attr("width") * 1,
	        h = layer.g.selectAll("rect.selection").attr("height") * 1,
	        lu = [x, y], rb = [x + w, y + h],
	        points = d3.select(this),
	        pos = d3.mouse(this);
	      layer.g.selectAll("rect.selection").remove();

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

	      d3.selectAll(".tmp-selection")
	        .classed("tmp-selection",false)
	        .classed("selected", false);
	      
	      // remove temporary selection marker class
	      layer.zoom(lu, rb);
	    } )
	    .on("dblclick", function(){
	      console.log("doubleclick");
	      layer.resetDomain();
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
	      var clickedPoint = layer.findPoints(p, p);
	      if(!clickedPoint.empty()){
	      	var click = clickedPoint.on("click");
	      	click.apply(clickedPoint, [clickedPoint.datum()]); 
	      }
	    });

	  return layer;
	}
		
	return layer;
}