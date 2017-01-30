import { base } from "./base";
import { getEuclideanDistance } from "./additionalFunctions";

export function layerBase() {
	
	var layer = base()
		.add_property("pointMouseOver", function() {})
		.add_property("pointMouseOut", function() {})
		.add_property("on_click", function() {})
		.add_property("markedUpdated", function() {})
		.add_property("layerDomainX")
		.add_property("layerDomainY")
		.add_property("contScaleX", true)
		.add_property("contScaleY", true);;

	layer.update = function(){};
	layer.put_static_content = function(){};
	layer.afterUpdate = function(){};
	layer.updateSize = function(){};

	layer.add_click_listener = function(){

	  var wait_dblClick = null, down, wait_click = null,
	    tolerance = 5, click_coord,
	    event = d3.dispatch('click', 'dblclick');

	  //add a transparent rectangle to detect clicks
	  //and make changes to update function
	  layer.g.append("rect")
	    .attr("class", "clickPanel")
	    .attr("fill", "transparent");
	  var inherited_update = layer.update;
	  layer.update = function(){
	  	inherited_update();
			layer.g.selectAll(".clickPanel")
				.attr("width", layer.chart.get_width())
				.attr("height", layer.chart.get_height());
	  	return layer;
	  }

	  layer.on_mousedown = function(){
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
	    layer.chart.container.select(".inform")
	    	.classed("blocked", true);
	  }
	  layer.on_mousemove = function(){
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
	  }
	  layer.on_mouseup = function(){
	    var mark = d3.event.shiftKey;
	    // remove selection frame
	    layer.chart.container.select(".inform")
	    	.classed("blocked", false);

	    var x = layer.g.selectAll("rect.selection").attr("x") * 1,
	      y = layer.g.selectAll("rect.selection").attr("y") * 1,
	      w = layer.g.selectAll("rect.selection").attr("width") * 1,
	      h = layer.g.selectAll("rect.selection").attr("height") * 1,
	      lu = [x, y], rb = [x + w, y + h],
	      points = d3.select(this),
	      pos = d3.mouse(this);
	    layer.g.selectAll("rect.selection").remove();

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
	    mark ? layer.get_markedUpdated() : layer.zoom(lu, rb);	  	
	  }
	  layer.on_dblclick = function(mark){
			mark ? layer.chart.container.selectAll(".marked").classed("marked", false) : layer.resetDomain();	  	
	  }
	  layer.on_panelClick = function(p, mark){
      var clickedPoint = layer.findPoints(p, p);
      if(!clickedPoint.empty()){
      	if(!mark){
      		var click = clickedPoint.on("click");
      		click.apply(clickedPoint, [clickedPoint.datum()]); 
      	} else {
      		clickedPoint.classed("marked") ? clickedPoint.classed("marked", false) : clickedPoint.classed("marked", true);
      		layer.get_markedUpdated();
      	}
      }
	  }

	  layer.g
	    .on("mousedown", layer.on_mousedown)
	    .on("mousemove", layer.on_mousemove)
	    .on("mouseup", layer.on_mouseup)
	    .on("dblclick", layer.on_dblclick)
	    .on("click", layer.on_panelClick);
	    
	  return layer;
	}
		
	return layer;
}
