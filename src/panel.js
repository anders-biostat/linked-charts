import { base } from "./base";

export function panel(chart) {
	var panel = base()
		.add_property("x", function(){
			return chart.width() - panel.buttonSize - 5;
		})
		.add_property("y", function(){
			return chart.margin().top * 0.05;
		})
		.add_property("orientation", "horizontal")
		.add_property("height", function(){
			if(panel.orientation() == "horizontal")
				return Math.ceil(panel.width() / panel.buttonSize) * 
					panel.buttonSize
			else
				return Math.floor(chart.height() - panel.y() / panel.buttonSize) * 
					panel.buttonSize;  
		})
		.add_property("widht", function() {
			if(panel.orientation() == "vertical")
				return Math.ceil(panel.height() / panel.buttonSize) * 
					panel.buttonSize
			else
				return Math.floor(chart.width() - panel.x() / panel.buttonSize) * 
					panel.buttonSize;
		});

	panel.chart = chart;
	panel.buttons = [];
	panel.buttonSize = 20;


	panel.put_static_content = function(){
		panel.g = panel.chart.svg.append("g")
			.attr("class", "panel_g")
			.lower();

		panel.initDefs();
		panel.g.append("use")
			.attr("xlink:href", "#toggleOff")
			.attr("id", "toggle")
			.attr("opacity", 0.7)
			.on("mouseover", function() {
				d3.select(this)
					.attr("opacity", 1);
			})
			.on("mouseout", function() {
				d3.select(this)
					.attr("opacity", 0.7);
			})
			.on("click", panel.show);
	}
	
	panel.updateSize = function() {
		panel.g
			.attr("transform", "translate(" + panel.x() + 
															", " + panel.y() + ")");
	}

	panel.add_button = function(name, icon, fun){

	}

	panel.show = function(){
		panel.g.select("#toggle")
			.attr("xlink:href", "#toggleOnHor")
			.attr("opacity", 1)
			.on("click", panel.hide)
			.on("mouseout", function() {});
	}

	panel.hide = function(){

	}

	panel.initDefs = function(){
		var defs = panel.g.append("def"),
			bs = panel.buttonSize;
		
		var d = defs.append("g")
			.attr("id", "toggleOff");
		d.append("rect")
			.attr("stroke-width", 2)
			.attr("width", bs)
			.attr("height", bs)
			.attr("fill", "#aaa")
			.attr("stroke", "#444");
		d.append("path")
			.attr("d", "M " + bs/2 + " " + Math.floor(bs/3) + 
									" L " + Math.ceil(bs * 2 / 3) + " " + Math.ceil(bs * 2 / 3) + 
									" H " + Math.floor(bs/3) + 
									" L " + bs/2 + " " + Math.floor(bs/3))
			.attr("fill", "#444")
			.attr("stroke-width", 0);			

		d = defs.append("g")
			.attr("id", "toggleOnHor");
		d.append("rect")
			.attr("stroke-width", 2)
			.attr("width", bs)
			.attr("height", bs)
			.attr("fill", "#aaa")
			.attr("stroke", "#444");
		d.append("path")
			.attr("d", "M " + Math.floor(bs/3) + " " + bs/2 + 
									" L " + Math.ceil(bs * 2 / 3) + " " + Math.floor(bs/3) + 
									" V " + Math.floor(bs * 2 / 3) + 
									" L " + Math.floor(bs/3) + " " + bs/2)
			.attr("fill", "#444")
			.attr("stroke-width", 0);			

		d = defs.append("g")
			.attr("id", "toggleOnVer");
		d.append("rect")
			.attr("stroke-width", 2)
			.attr("width", bs)
			.attr("height", bs)
			.attr("fill", "#aaa")
			.attr("stroke", "#444");
		d.append("path")
			.attr("d", "M " + bs/2 + " " + Math.ceil(bs * 2 / 3) + 
									" L " + Math.floor(bs/3) + " " + Math.floor(bs/3) + 
									" H " + Math.floor(bs * 2 / 3) + 
									" L " + bs/2 + " " + Math.ceil(bs * 2 / 3))
			.attr("fill", "#444")
			.attr("stroke-width", 0);
	}

	return panel;
}