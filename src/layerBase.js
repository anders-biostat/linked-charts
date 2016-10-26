import { base } from "./base";

export function layerBase() {
	
	var layer = base()
		.add_property("layerDomainX")
		.add_property("layerDomainY")
		.add_property("contScaleX", true)
		.add_property("contScaleY", true)
		.add_property("on_click", function() {});
		
	return layer;
}