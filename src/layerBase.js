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
		.add_property("contScaleY", true);;

	layer.id = id;
	layer.update = function(){};
	layer.put_static_content = function() {
    layer.g = layer.chart.svg.append("g")
      .attr("class", "chart_g")
      .attr("id", layer.id);
    layer.chart.svg.select(".clickPanel").raise();
	};
	layer.afterUpdate = function(){};
	layer.updateSize = function(){};
		
	return layer;
}
