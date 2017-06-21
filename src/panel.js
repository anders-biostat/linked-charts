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
			if(panel.orientation() == "vertical")
				return Math.floor(chart.height() - panel.y() / panel.buttonSize) * 
					panel.buttonSize
			else
				return undefined;
		})
		.add_property("width", function() {
			if(panel.orientation() == "horizontal")
				return Math.floor(chart.width() - panel.x() / panel.buttonSize) * 
					panel.buttonSize
			else
				return undefined;
		});

	panel.chart = chart;
	panel.buttons = [];
	panel.buttonSize = 30;


	panel.put_static_content = function(){
		panel.g = panel.chart.svg.append("g")
			.attr("class", "panel_g");

		panel.initDefs();
		
		panel.g.append("use")
			.attr("xlink:href", "#toggleOff")
			.attr("id", "toggle")
			.attr("opacity", 0.7)
			.attr("title", "Click to show instrument panel")
			.on("mouseover", function() {
				d3.select(this)
					.attr("opacity", 1);
			})
			.on("mouseout", function() {
				d3.select(this)
					.attr("opacity", 0.7);
			})
			.on("click", panel.show)
			.append("title")
				.text("Click to show instrument panel");

		panel.g.append("g")
			.attr("id", "buttonPanel")
			.attr("class", "hidden");		
	}
	
	panel.updateSize = function() {
		var layout = panel.placeButtons();
		if(panel.orientation() == "vertical"){
			panel.g.attr("transform", "translate(" + panel.x() + 
																", " + panel.y() + ")");
			panel.g.select("#toggle")
				.attr("transform", "translate(0, 0)");
			panel.g.select("#buttonPanel")
				.attr("transform", "translate(0, " + panel.buttonSize + ")");
		} else {
			panel.g
				.attr("transform", "translate(" + 
														(panel.x() - panel.buttonSize * panel.buttons.length) + 
																", " + panel.y() + ")");
			panel.g.select("#toggle")
				.attr("transform", "translate(" + (panel.buttonSize * panel.buttons.length) + ", 0)");
			panel.g.select("#buttonPanel")
				.attr("transform", "translate(0, 0)");			
		}

	}

	panel.placeButtons = function() {
		var rowLength;
		if(panel.orientation()  == "horizontal"){
				rowLength = panel.optimizeSize(panel.buttons.length, panel.width(), panel.height());
				panel.g.selectAll(".button")
					.attr("transform", function(d, i){
						return "translate(" + (i % rowLength * panel.buttonSize) + ", " +
							(Math.floor(i / rowLength) * panel.buttonSize) + ")";
					})
		} else {
				rowLength = panel.optimizeSize(panel.buttons.length, panel.height(), panel.width());
				panel.g.selectAll(".button")
					.attr("transform", function(d, i){
						return "translate(" + (Math.floor(i / rowLength) * panel.buttonSize) + ", " 
							+ ((i % rowLength + 1) * panel.buttonSize) + ")";
					})
		}
	}
	panel.optimizeSize = function(n, width, height){
		var rows, size;
		if(height){
			size = d3.min([width, height]);
			rows = 1;
			while(Math.floor(width / size) * rows < n){
				rows++;
				size = d3.min([height / rows, size]);
			}
			panel.buttonSize = size;
		} else {
			size = panel.buttonSize;
			rows = Math.ceil(width / size);
		}
		if(panel.orientation() == "horizontal"){
			panel.width(size * Math.floor(width / size));
			//panel.height(size * rows)
		} else {
			panel.height(size * Math.floor(width / size));
			//panel.width(size * rows);
		}

		return Math.floor(width / size);
	}


	panel.add_button = function(name, icon, fun, hint){
		//if hint is defined, modify the provided f
		var hintFired = false;
		var wrapped = function(chart, button){
			if(!hintFired){
				panel.showHint(hint); //hints are showed just once if defined
				hintFired = true;
			}
			fun(chart, button);
		}

		panel.buttons.push({
			name: name,
			icon: icon,
			fun: wrapped
		});

		var buttons = panel.g.select("#buttonPanel")
			.selectAll(".button").data(panel.buttons, function(d) {return d.name;});
		buttons.enter().append("use")
			.attr("opacity", 0.6)
			.attr("class", "button")
			.attr("xlink:href", function(d) {return d.icon})
			.on("click", function(d) {d.fun(panel.chart, d3.select(this))})
			.on("mouseover", function() {
				d3.select(this)
					.attr("opacity", 1);
			})
			.on("mouseout", function() {
				d3.select(this)
					.attr("opacity", 0.6);
			})
			.append("title")
				.text(function(d) {return d.name});		
	}

	panel.showHint = function(hint) {
		if(hint){
			chart.container.append("div")
				.attr("class", "hint")
				.style("left", (panel.chart.width() - 105) + "px")
				.style("top", (panel.y() + panel.g.node().getBBox().height) + "px")
				.text(hint);
		}
	}

	panel.show = function(){
		panel.g.select("#toggle")
			.attr("opacity", 1)
			.on("click", panel.hide)
			.on("mouseout", function() {})
			.select("title")
				.text("Click to hide instrument panel");
		if(panel.orientation() == "horizontal")
			panel.g.select("#toggle")
				.attr("xlink:href", "#toggleOnHor")
		else
			panel.g.select("#toggle")
				.attr("xlink:href", "#toggleOnVer");

		panel.g.select("#buttonPanel")
			.classed("hidden", false);

	}

	panel.hide = function(){
		panel.g.select("#toggle")
			.attr("xlink:href", "#toggleOff")
			.attr("opacity", 0.7)
			.on("click", panel.show)
			.on("mouseout", function() {
				d3.select(this)
					.attr("opacity", 0.7);
			})
			.select("title")
				.text("Click to show instrument panel");
		panel.g.select("#buttonPanel")
			.classed("hidden", true);

	}

	panel.initDefs = function(){
		var defs = panel.g.append("def"),
			bs = panel.buttonSize - 10;
		
		var d = defs.append("g")
			.attr("id", "toggleOff");
		d.append("rect")
			.attr("stroke-width", 2)
			.attr("width", bs)
			.attr("height", bs)
			.attr("fill", "#aaa")
			.attr("stroke", "#444");
		d.append("path")
			.attr("d", "M " + bs/2  + " " + Math.floor(bs/3) + 
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

		d = defs.append("g")
			.attr("id", "save");
		d.append("rect")
			.attr("stroke-width", 0)
			.attr("width", bs)
			.attr("height", bs)
			.attr("fill", "#444")
			.attr("rx", bs/10)
			.attr("ry", bs/10);
		d.append("path")
			.attr("d", "M " + Math.floor(4 * bs / 5) + " 0" + 
									" H " + bs + 
									" V " + Math.ceil(bs/5) + 
									" L " + Math.floor(4 * bs / 5) + " 0")
			.attr("fill", "#fff")
			.attr("stroke-width", 0);
		d.append("rect")
			.attr("x", Math.floor(bs/3))
			.attr("height", Math.floor(bs/3))
			.attr("width", Math.ceil(bs * 2 / 5))
			.attr("fill", "#fff")
			.attr("stroke-width", 0);
		d.append("rect")
			.attr("x", Math.floor(44 * bs / 75))
			.attr("width", Math.ceil(2 * bs / 25))
			.attr("height", Math.ceil(bs/4))
			.attr("fill", "#444")
			.attr("stroke-width", 0);
		d.append("rect")
			.attr("x", Math.floor(bs/4))
			.attr("width", Math.ceil(5 * bs / 12))
			.attr("y", bs/2)
			.attr("height", bs/2)
			.attr("rx", bs/10)
			.attr("ry", bs/10)
			.attr("fill", "#fff")
			.attr("stroke-width", 0);

		d = defs.append("g")
			.attr("id", "svg");
		d.append("text")
			.attr("font-size", bs * 1.5)
			.attr("textLength", bs)
			.attr("lengthAdjust", "spacingAndGlyphs")
			.attr("fill", "#444")
			.attr("y", bs)
			.attr("font-weight", 900)
			.attr("font-family", "Verdana")
			.text("SVG");
		
		d = defs.append("g")
			.attr("id", "selection");
		d.append("rect")
			.attr("fill-opacity", 0)
			.attr("width", Math.floor(bs * 2 / 3))
			.attr("height", Math.floor(bs * 2 / 3))
			.attr("x", Math.ceil(bs/3))
			.attr("stroke", "#444")
			.attr("stroke-width", 1)
			.attr("stroke-dasharray", 2);
		d.append("path")
			.attr("fill", "#444")
			.attr("stroke-width", 0)
			.attr("stroke", "#444")
			.attr("d", "M " + Math.ceil(bs/3) + " " + Math.floor(bs * 2 / 3) + 
								" L 0 " + Math.ceil(3 * bs / 4) + 
								" l " + bs/12 + " " + bs/12 + 
								" L 0 " + (9 * bs / 10) +
								" L " + bs/10 + " " + bs +
								" L " + (11 * bs / 60) + " " + (11 * bs / 12) + 
								" L " + Math.floor(bs/4) + " " + bs + 
								" L " + Math.ceil(bs/3) + " " + Math.floor(bs * 2 / 3));
		d.append("circle")
			.attr("cx", Math.floor(bs/5))
			.attr("cy", Math.floor(bs/5))
			.attr("r", 2)
			.attr("fill", "#444");
		d.append("circle")
			.attr("cx", Math.floor(4 * bs / 5))
			.attr("cy", Math.floor(4 * bs / 5))
			.attr("r", 2)
			.attr("fill", "#444");
		d.append("circle")
			.attr("cx", Math.floor(2 * bs / 3))
			.attr("cy", Math.floor(bs / 3))
			.attr("r", 3)
			.attr("fill", "#111");

		d = defs.append("g")
			.attr("id", "zoomIn");
		d.append("path")
			.attr("fill", "#444")
			.attr("d", "M " + (2 * bs / 5) + " 0" + 
								" h " + bs/5 + 
								" v " + (2 * bs / 5) + 
								" h " + (2 * bs / 5) +
								" v " + bs/5 +
								" h -" + (2 * bs / 5) +
								" v " + (2 * bs / 5) +
								" h -" + bs/5 + 
								" v -" + (2 * bs / 5) +
								" h -" + (2 * bs / 5) +
								" v -" + bs/5 + 
								" h " + (2 * bs / 5) +
								" v -"+ (2 * bs / 5));

		d = defs.append("g")
			.attr("id", "zoomOut");
		d.append("rect")
			.attr("y", 3 * bs / 8)
			.attr("height", bs/4)
			.attr("width", bs)
			.attr("fill", "#444");

		d = defs.append("g")
			.attr("id", "home");
		d.append("rect")
			.attr("x", bs/5)
			.attr("y", 2 * bs / 5)
			.attr("width", 3 * bs / 5)
			.attr("height", 3 * bs / 5)
			.attr("fill", "#444");
		d.append("rect")
			.attr("x", bs * 2 / 5)
			.attr("y", bs * 3 / 5)
			.attr("width", bs/5)
			.attr("height", bs/5)
			.attr("fill", "#fff");
		d.append("path")
			.attr("fill", "#444")
			.attr("d", "M 0 " + (2 * bs / 5) + 
								" L " + bs/2 + " 0" +
								" L " + bs + " " + (2 * bs / 5));
		d.append("path")
			.attr("stroke", "#fff")
			.attr("stroke-width", 1)
			.attr("d", "M 0 " + (2 * bs / 5) +
								" L " + bs + " " + (2 * bs / 5));

		defs.selectAll("rect")
			.attr("transform", "translate(5, 5)");
		defs.selectAll("path")
			.attr("transform", "translate(5, 5)");
		defs.selectAll("text")
			.attr("transform", "translate(5, 5)");
		defs.selectAll("circle")
			.attr("transform", "translate(5, 5)");
	}

	return panel;
}