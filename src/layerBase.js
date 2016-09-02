import { base } from "./base";

export function layerBase() {
	
	var layer = base()
		.add_property("domainX")
		.add_property("domainY")
		.add_property("contScaleX", true)
		.add_property("contScaleY", true)
		.add_property("on_click", function() {});
		
	return layer;
}