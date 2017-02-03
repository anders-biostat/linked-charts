import { base } from "./base";
import { getEuclideanDistance } from "./additionalFunctions";

export function layerBase(id) {
	
	var layer = base()
		.add_property("pointMouseOver", function() {})
		.add_property("pointMouseOut", function() {})
		.add_property("on_click", function() {})
		.add_property("layerDomainX")
		.add_property("layerDomainY")
		.add_property("contScaleX", true)
		.add_property("contScaleY", true)
		.add_property("dresser", function(){});

	layer.id = id;

	layer.update = function() {
    
    layer.updatePoints();
    layer.updatePointStyle();
    layer.updatePointLocation();

    return layer;
  };

	layer.put_static_content = function() {
    layer.g = layer.chart.svg.append("g")
      .attr("class", "chart_g")
      .attr("id", layer.id);
    //layer.chart.svg.select(".clickPanel").raise();
	};
	
	layer.afterUpdate = function(){};
  
  layer.updateSize = function(){
    if(typeof layer.chart.transition !== "undefined"){
      layer.g.transition(layer.chart.transition)
        .attr("transform", "translate(" + 
          layer.chart.get_margin().left + ", " +
          layer.chart.get_margin().top + ")");
      layer.g.selectAll(".data_point")
    } else {
      layer.g
        .attr("transform", "translate(" + 
          layer.chart.get_margin().left + ", " +
          layer.chart.get_margin().top + ")");
    }
    return layer;
  }
  layer.updatePoints = function() {};
  layer.updatePointStyle = function() {
  	layer.get_dresser(layer.g.selectAll(".data_point"));
  	return layer;
  };
  layer.updatePointLocation = function() {};
  layer.findPoints = function() {return layer.g.select("___");}; //return empty selection	
	
	return layer;
}
