import { base } from "./base";

export function panel(chart) {
	var panel = base()
		.add_property("x", function(){
			return chart.width() - panel.buttonSize() - 5;
		})
		.add_property("y", function(){
			return chart.margins().top * 0.05;
		})
		.add_property("orientation", "horizontal")
		.add_property("height", function(){
			if(panel.orientation() == "vertical")
				return Math.floor(panel.y() / panel.buttonSize()) * 
					panel.buttonSize();
		})
		.add_property("width", function() {
			if(panel.orientation() == "horizontal")
				return Math.floor(panel.x() / panel.buttonSize()) * 
					panel.buttonSize();
		})
		.add_property("buttonSize", 30);

	panel.chart = chart;
	var layout = {},
		buttons = [];

	panel.wrapSetter("orientation", function(orientation) {
		return function() {
			if(["vertical", "horizontal"].indexOf(orientation()) == -1)
				throw "Error in 'panel.orientation': value " + orientation() +
					" is not allowed for this property. Possible values are 'horizontal' or" +
					" 'vertical'."
			return orientation.apply(panel, arguments);
		}
	});

	panel.put_static_content = function(){
		panel.g = panel.chart.svg.append("g")
			.attr("class", "panel_g");

		initDefs();
		
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

		placeButtons();
		if(panel.orientation() == "vertical"){
			panel.g.attr("transform", "translate(" + panel.x() + 
																", " + panel.y() + ")");
			panel.g.select("#toggle")
				.attr("transform", "translate(0, 0)");
			panel.g.select("#buttonPanel")
				.attr("transform", "translate(0, " + panel.buttonSize() + ")");
		} else {
			panel.g
				.attr("transform", "translate(" + 
														(panel.x() - layout.width) + 
																", " + panel.y() + ")");
			panel.g.select("#toggle")
				.attr("transform", "translate(" + layout.width + ", 0)");
			panel.g.select("#buttonPanel")
				.attr("transform", "translate(0, 0)");			
		}

	}

	function placeButtons() {
		var rowLength;
		if(panel.orientation()  == "horizontal"){
				optimizeSize(buttons.length, panel.width(), panel.height());
				panel.g.selectAll(".button")
					.attr("transform", function(d, i){
						return "translate(" + (i % layout.rowLength * panel.buttonSize()) + ", " +
							(Math.floor(i / layout.rowLength) * panel.buttonSize()) + ")";
					})
		} else {
				optimizeSize(buttons.length, panel.height(), panel.width());
				panel.g.selectAll(".button")
					.attr("transform", function(d, i){
						return "translate(" + (Math.floor(i / layout.rowLength) * panel.buttonSize()) + ", " 
							+ ((i % layout.rowLength + 1) * panel.buttonSize()) + ")";
					})
		}
	}
	function optimizeSize(n, width, height) {
		var rows, size;
		if(height){
			size = d3.min([width, height]);
			rows = 1;
			while(Math.floor(width / size) * rows < n){
				rows++;
				size = d3.min([height / rows, size]);
			}
			panel.buttonSize(size);
		} else {
			size = panel.buttonSize();
			rows = Math.ceil(width / size);
		}
		layout = {width: panel.width(),
							height: panel.height(),
							rowLength: d3.min([Math.floor(width / size), buttons.length])};
		if(panel.orientation() == "horizontal"){
			layout.width  = size * layout.rowLength;
			//panel.height(size * rows)
		} else {
			layout.height = size * layout.rowLength;
			//panel.width(size * rows);
		}
	}


	panel.add_button = function(name, icon, fun, hint){
		//if hint is defined, modify the provided f
		var hintFired = false;
		var wrapped = function(chart, button){
			if(!hintFired){
				showHint(hint); //hints are showed just once if defined
				hintFired = true;
			}
			fun(chart, button);
		}

		buttons.push({
			name: name,
			icon: icon,
			fun: wrapped
		});

		var buttonsSVG = panel.g.select("#buttonPanel")
			.selectAll(".button").data(buttons, function(d) {return d.name;});
		buttonsSVG.enter().append("use")
			.attr("opacity", 0.6)
			.attr("class", "button")
			.attr("id", function(d) {return "b_" + d.icon.substr(1)})
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

	function showHint(hint) {
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

	function initDefs() {
		var defs = panel.g.append("def"),
			bs = panel.buttonSize() - 10;
		
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

		d = defs.append("g")
			.attr("id", "pan");
		d.append("path")
			.attr("fill", "#444")
			.attr("d", "M 0 " + bs/2 + 
								" l " + bs/5 + " -" + bs/5 + 
								" v " + bs/10 + 
								" h " + bs/5 + 
								" v -" + bs/5 +
								" h -" + bs/10 +
								" L " + bs/2 + " 0" + 
								" l " + bs/5 + " " + bs/5 +
								" h -" + bs/10 +
								" v " + bs/5 + 
								" h " + bs/5 +
								" v -" + bs/10 +
								" L " + bs + " " + bs/2 +
								" l -" + bs/5 + " " + bs/5 +
								" v -" + bs/10 + 
								" h -" + bs/5 +
								" v " + bs/5 +
								" h " + bs/10 +
								" L " + bs/2 + " " + bs +
								" l -" + bs/5 + " -" + bs/5 +
								" h " + bs/10 + 
								" v -" + bs/5 +
								" h -" + bs/5 +
								" v " + bs/10 + 
								" L 0 " + bs/2);
		d = defs.append("g")
			.attr("id", "fitSelected");
		d.append("rect")
			.attr("x", bs/5)
			.attr("y", bs/5)
			.attr("width", 3 * bs / 5)
			.attr("height", 3 * bs / 5)
			.attr("fill", "#fff")
			.attr("stroke", "#444")
			.attr("stroke-width", 1)
			.attr("stroke-dasharray", 2);
		d.append("circle")
			.attr("cx", bs/5 - 3)
			.attr("cy", bs/2)
			.attr("r", 2)
			.attr("fill", "#444");
		d.append("circle")
			.attr("cx", 3 * bs / 5)
			.attr("cy", bs/5 -3)
			.attr("r", 2)
			.attr("fill", "#444");
		d.append("circle")
			.attr("cx", 4 * bs / 5 + 3)
			.attr("cy", 2 * bs / 5)
			.attr("r", 2)
			.attr("fill", "#444");
		d.append("circle")
			.attr("cx", 2 * bs / 5)
			.attr("cy", 4 * bs / 5 + 3)
			.attr("r", 2)
			.attr("fill", "#444");
		d.append("circle")
			.attr("cx", 4 * bs / 5 - 3)
			.attr("cy", bs / 5 + 3)
			.attr("r", 3)
			.attr("fill", "#111");
		d.append("circle")
			.attr("cx", bs / 5 + 3)
			.attr("cy", 4 * bs / 5 - 3)
			.attr("r", 3)
			.attr("fill", "#111");

		d = defs.append("g")
			.attr("id", "clusterRows");
		d.append("rect")
			.attr("x", bs * 2 / 5)
			.attr("width", bs * 3 / 5)
			.attr("height", bs)
			.attr("fill", "#444");
		d.append("rect")
			.attr("stroke", "#444")
			.attr("stroke-width", 1)
			.attr("fill", "#fff")
			.attr("y", bs/5)
			.attr("height", bs/2)
			.attr("width", bs * 2 / 5);
		d.append("rect")
			.attr("stroke", "#444")
			.attr("stroke-width", 1)
			.attr("fill", "#fff")
			.attr("y", bs/10)
			.attr("x", bs/5)
			.attr("height", bs/5)
			.attr("width", bs/5);
		d.append("rect")
			.attr("stroke", "#444")
			.attr("stroke-width", 1)
			.attr("fill", "#fff")
			.attr("x", bs/10)
			.attr("y", bs/2)
			.attr("height", bs * 3 / 10)
			.attr("width", bs * 3 / 10);
		d.append("rect")
			.attr("stroke", "#444")
			.attr("stroke-width", 1)
			.attr("fill", "#fff")
			.attr("x", bs/5)
			.attr("y", bs * 7 / 10)
			.attr("height", bs/5)
			.attr("width", bs/5);
		d.append("path")
			.attr("stroke", "#fff")
			.attr("stroke-width", 1)
			.attr("d", "M " + bs * 2 / 5 + " " + bs/5 + 
								" L " + bs + " " + bs/5);
		d.append("path")
			.attr("stroke", "#fff")
			.attr("stroke-width", 1)
			.attr("d", "M " + bs * 2 / 5 + " " + bs * 2 / 5 + 
								" L " + bs + " " + bs * 2 / 5);			
		d.append("path")
			.attr("stroke", "#fff")
			.attr("stroke-width", 1)
			.attr("d", "M " + bs * 2 / 5 + " " + bs * 3 / 5 + 
								" L " + bs + " " + bs * 3 / 5);
		d.append("path")
			.attr("stroke", "#fff")
			.attr("stroke-width", 1)
			.attr("d", "M " + bs * 2 / 5 + " " + bs * 4 / 5 + 
								" L " + bs + " " + bs * 4 / 5);

		d = defs.append("g")
			.attr("id", "clusterCols");
		d.append("rect")
			.attr("y", bs * 2 / 5)
			.attr("height", bs * 3 / 5)
			.attr("width", bs)
			.attr("fill", "#444");
		d.append("rect")
			.attr("stroke", "#444")
			.attr("stroke-width", 1)
			.attr("fill", "#fff")
			.attr("x", bs/5)
			.attr("width", bs/2)
			.attr("height", bs * 2 / 5);
		d.append("rect")
			.attr("stroke", "#444")
			.attr("stroke-width", 1)
			.attr("fill", "#fff")
			.attr("x", bs/10)
			.attr("y", bs/5)
			.attr("width", bs/5)
			.attr("height", bs/5);
		d.append("rect")
			.attr("stroke", "#444")
			.attr("stroke-width", 1)
			.attr("fill", "#fff")
			.attr("y", bs/10)
			.attr("x", bs/2)
			.attr("width", bs * 3 / 10)
			.attr("height", bs * 3 / 10);
		d.append("rect")
			.attr("stroke", "#444")
			.attr("stroke-width", 1)
			.attr("fill", "#fff")
			.attr("y", bs/5)
			.attr("x", bs * 7 / 10)
			.attr("width", bs/5)
			.attr("height", bs/5);
		d.append("path")
			.attr("stroke", "#fff")
			.attr("stroke-width", 1)
			.attr("d", "M " + bs/5 + " " + bs * 2 / 5 + 
								" L " + bs/5 + " " + bs);
		d.append("path")
			.attr("stroke", "#fff")
			.attr("stroke-width", 1)
			.attr("d", "M " + bs * 2 / 5 + " " + bs * 2 / 5 + 
								" L " + bs * 2 / 5 + " " + bs);			
		d.append("path")
			.attr("stroke", "#fff")
			.attr("stroke-width", 1)
			.attr("d", "M " + bs * 3 / 5 + " " + bs * 2 / 5 + 
								" L " + bs * 3 / 5 + " " + bs);
		d.append("path")
			.attr("stroke", "#fff")
			.attr("stroke-width", 1)
			.attr("d", "M " + bs * 4 / 5 + " " + bs * 2 / 5 + 
								" L " + bs * 4 / 5 + " " + bs);

		d = defs.append("g")
			.attr("id", "restoreOrder");
		d.append("text")
			.attr("font-size", bs * 1.5)
			.attr("textLength", bs)
			.attr("lengthAdjust", "spacingAndGlyphs")
			.attr("fill", "#444")
			.attr("y", bs)
			.attr("font-weight", 900)
			.attr("font-family", "Verdana")
			.text("123");	

		defs.selectAll("rect")
			.attr("transform", "translate(5, 5)");
		defs.selectAll("path")
			.attr("transform", "translate(5, 5)");
		defs.selectAll("text")
			.attr("transform", "translate(5, 5)");
		defs.selectAll("circle")
			.attr("transform", "translate(5, 5)");
		defs.selectAll("g").append("rect")
			.attr("fill", "transparent")
			.attr("width", panel.buttonSize())
			.attr("height", panel.buttonSize())
			.lower();
	}

	return panel;
}