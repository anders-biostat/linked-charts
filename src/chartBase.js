import { base } from "./base";
import { escapeRegExp } from "./additionalFunctions";
import { panel } from "./panel";

export function chartBase() {
	//add and set new properties
	var chart = base()
		.add_property("width", 500)
		.add_property("height", 500)
		.add_property("margins", { top: 15, right: 10, bottom: 50, left: 50 })
		.add_property("title", "")
		.add_property("titleX", function() {return chart.width() / 2;})
		.add_property("titleY", function() {return d3.min([17, chart.margins().top * 0.9]);})
		.add_property("titleSize", function() {return d3.min([15, chart.margins().top * 0.8]);})
		.add_property("transitionDuration", 1000) //may be set to zero
		.add_property("markedUpdated", function() {})
		.add_property("showPanel", true)
		.add_property("plotWidth")
		.add_property("plotHeight"); 
	  
 
	var plotHeight_default =  function() {
			return chart.height() - (chart.margins().top + chart.margins().bottom);
		},
		plotWidth_default = function() {
			return chart.width() - (chart.margins().right + chart.margins().left);
		};

	chart.plotWidth(plotWidth_default)
		.plotHeight(plotHeight_default);

	//if width or height is changed by user, plotWidth or plotHeight respectively
	//should be changed as well
	chart.wrapSetter("width", function(width) {
		return function() {
			chart.get_plotWidth = plotWidth_default;
			return width.apply(chart, arguments);
		}
	});
	chart.wrapSetter("height", function(height) {
		return function() {
			chart.get_plotHeight = plotHeight;
			return height.apply(chart, arguments);
		}
	});
	//if plotWidth or plotHeight is changed by user, width or height respectively
	//should be changed as well
	chart.wrapSetter("plotWidth", function(plotWidth){
		return function() {
			chart.get_width = function() {
				return plotWidth() + chart.margins().left + chart.margins().right;
			};
			return plotWidth.apply(chart, arguments);
		}
	});
	chart.wrapSetter("plotHeight", function(plotHeight){
		return function() {
			chart.get_height = function() {
				return plotHeight() + chart.margins().top + chart.margins().bottom;
			};
			return plotHeight.apply(chart, arguments);
		}
	});

	//if this is true, select elements when they are clicked
	var selectMode = false;
	chart.selectMode = function(value) {
		if(value == undefined)
			return selectMode;

		value = (value == true);
		selectMode = value;
		return chart;
	}

	chart.pan = {mode: false, down: undefined};


  chart.set_margin = function(margins){
  	if(typeof margins.top === "undefined")
  		margins.top = chart.margins().top;
  	if(typeof margins.bottom === "undefined")
  		margins.bottom = chart.margins().bottom;
  	if(typeof margins.left === "undefined")
  		margins.left = chart.margins().left;
  	if(typeof margins.right === "undefined")
  		margins.right = chart.margins().right;
  	
  	chart.margins(margins);
  	return chart;
  }

  chart.put_static_content = function( element ) {
		chart.container = element.append("div")
			.style("position", "relative");
		chart.container.node().ondragstart = function() { return false; };
		chart.svg = chart.container.append("svg");
		chart.viewBox = chart.svg.append("defs")
			.append("clipPath")
				.attr("id", "viewBox" + Math.random().toString(36).substring(2, 6))
				.append("rect");
		chart.container.append("div")
			.attr("class", "inform hidden")
			.append("p")
				.attr("class", "value");
		chart.svg.append("text")
			.attr("class", "title plainText")
			.attr("text-anchor", "middle");
		chart.svg.append("g")
			.attr("class", "plotArea");
		if(chart.showPanel()){
			chart.panel = panel(chart);
			chart.panel.put_static_content();

			chart.panel.add_button("Save plot as png", "#save", function(chart){
				function drawInlineSVG(svgElement, ctx, callback, legend){
  				var svgInnerHTML;
  				if(legend !== undefined){
  					var w, h = 0, lsvg, hlist;
  					svgInnerHTML = "<g>" + svgElement.innerHTML + "</g>";
  					legend.location().selectAll("tr").each(function(d, i){
  						w = 0;
  						hlist = [];
  						d3.select(this).selectAll("td").each(function(dtd, itd){
  							lsvg = d3.select(this).selectAll("svg");
  							svgInnerHTML += "<g transform='translate(" + (legend.chart.width() + w) + ", "+ h + ")'>" +
  											lsvg.node().innerHTML + "</g>"
  							hlist.push(lsvg.attr("height"));
  							w += +lsvg.attr("width");
  						});
  						h += +d3.max(hlist);
  					});
  					svgInnerHTML = "<svg xmlns='http://www.w3.org/2000/svg'>" + svgInnerHTML + "</svg>";
  				} else
  					svgInnerHTML = new XMLSerializer().serializeToString(svgElement);
  				var img  = new Image();
  				img.onload = function(){
    				ctx.drawImage(this, 0,0);
    				if(chart.canvas && chart.canvas.classed("active"))
    					ctx.drawImage(chart.canvas.node(), 
    												chart.margins().left, chart.margins().top);
    				callback();
    			}
  			img.src = 'data:image/svg+xml; charset=utf8, '+encodeURIComponent(svgInnerHTML);
 				}

 				chart.svg.selectAll(".panel_g")
 					.style("display", "none");

				var canvas = document.createElement('canvas');
				if(chart.legend === undefined){
					canvas.height = chart.svg.attr('height');
					canvas.width = chart.svg.attr('width');
				} else {
					canvas.height = d3.max([chart.height(), chart.legend.height()]);
					canvas.width = chart.width() + chart.legend.width();					
				}

				chart.svg.selectAll("text").attr("fill", "black");
				drawInlineSVG(chart.svg.node(), canvas.getContext("2d"), 
					function(){
						var dataURL = canvas.toDataURL('image/png');
						var data = atob(dataURL.substring('data:image/png;base64,'.length)),
		        								asArray = new Uint8Array(data.length);

						for (var i = 0, len = data.length; i < len; ++i)
		    			asArray[i] = data.charCodeAt(i);

						var blob = new Blob([asArray.buffer], {type: 'image/png'});
						saveAs(blob, 'export_' + Date.now() + '.png');
					}, chart.legend);
 				chart.svg.selectAll(".panel_g")
 					.style("display", undefined);
			});

			chart.panel.add_button("Save plot as svg", "#svg", function(chart){
 				chart.svg.selectAll(".panel_g")
 					.style("display", "none");
 				var html;
  			if(chart.legend !== undefined){
  				var w, h = 0, lsvg, hlist;
  				html = "<g>" + chart.svg.node().innerHTML + "</g>";
  				chart.legend.location().selectAll("tr").each(function(){
  					w = 0;
  					hlist = [];
  					d3.select(this).selectAll("td").each(function(){
  						lsvg = d3.select(this).selectAll("svg");
  						html += "<g transform='translate(" + (chart.width() + w) + ", "+ h + ")'>" +
  											lsvg.node().innerHTML + "</g>"
  						hlist.push(lsvg.attr("height"));
  						w += +lsvg.attr("width");
  					});
  					h += +d3.max(hlist);
  				});
  				html = "<svg xmlns='http://www.w3.org/2000/svg'>" + html + "</svg>";
  				} else
						html = chart.svg
		    	    .attr("xmlns", "http://www.w3.org/2000/svg")
		      	  .node().parentNode.innerHTML;

		    var blob = new Blob([html], {type: "image/svg+xml"});
				saveAs(blob, 'export_' + Date.now() + '.svg');

 				chart.svg.selectAll(".panel_g")
 					.style("display", undefined);
			});

			chart.panel.add_button("Select elements", "#selection", function(chart, button){
				if(button.classed("clicked")){
					button
						.classed("clicked", false)
						.attr("opacity", 0.6)
						.on("mouseout", function() {
							d3.select(this)
								.attr("opacity", 0.6);
						});
					chart.selectMode(false);

				} else {
					button
						.classed("clicked", true)
						.attr("opacity", 1)
						.on("mouseout", function() {});
					chart.selectMode(true);
					var panButton = chart.panel.g.selectAll("#b_pan");
					if(panButton.classed("clicked"))
						panButton.on("click").call(panButton.node(), panButton.datum());					
				}
			}, "You can also select elements by pressing 'Shift'");
			chart.panel.add_button("Togle pan mode", "#pan", function(chart, button){
				if(button.classed("clicked")){
					button
						.classed("clicked", false)
						.attr("opacity", 0.6)
						.on("mouseout", function() {
							d3.select(this)
								.attr("opacity", 0.6);
						})
					chart.pan.mode = false;
				} else {
					button
						.classed("clicked", true)
						.attr("opacity", 1)
						.on("mouseout", function() {});
					chart.pan.mode = true;
					var selectButton = chart.panel.g.selectAll("#b_selection");
					if(selectButton.classed("clicked"))
						selectButton.on("click").call(selectButton.node(), selectButton.datum());
				}
			});
			chart.panel.add_button("Reset scales", "#home", function(chart){
				chart.resetDomain();
			}, "You can also use double click to reset scales");
			chart.panel.add_button("Fit selected", "#fitSelected", function(chart){
				var marked = chart.get_marked();
				if(marked.length == 0)
					return;
				var pos = {x: [], y: []};
				marked.map(function(e) {
					var elementPos = chart.get_position(e); 
					pos.x.push(elementPos[0]);
					pos.y.push(elementPos[1]);
				});
				var x_range = d3.extent(pos.x),
					y_range = d3.extent(pos.y);
				chart.zoom([x_range[0], y_range[0]], [x_range[1], y_range[1]]);
			});
		}

	}

	chart.mark = function(marked) {
		if(marked == "__clear__"){
			chart.svg.selectAll(".data_element.marked")
				.classed("marked", false);
			chart.svg.selectAll(".data_element")
				.attr("opacity", 1);
			chart.markedUpdated();
			return;
		}
		//marked can be either an array of IDs or a selection
		if(typeof marked.empty === "undefined") {
			marked = marked.map(function(e) {return escapeRegExp(e).replace(/ /g, "_")});
			if(marked.length > 0){
				var marked = chart.svg.selectAll(
			 		"#" + marked.join(", #"));
			} else{
				var marked = chart.svg.select("_____");
			}
		}
		
		if(chart.svg.selectAll(".data_element.marked").empty())
			chart.svg.selectAll(".data_element")
				.attr("opacity", 0.5);
		marked.classed("switch", true);
		if(marked.size() < 2)
			marked.filter(function() {return d3.select(this).classed("marked");})
				.classed("switch", false)
				.classed("marked", false)
				.attr("opacity", 0.5);
		marked.filter(function() {return d3.select(this).classed("switch");})
			.classed("marked", true)
			.classed("switch", false)
			.attr("opacity", 1);
		if(chart.svg.selectAll(".data_element.marked").empty())
			chart.svg.selectAll(".data_element")
				.attr("opacity", 1);

		chart.markedUpdated();
	}

	chart.get_marked = function(){
		var elements = [];
		chart.svg.selectAll(".marked").each(function() {
			elements.push(d3.select(this).datum());
		});
		return elements;
	}

  chart.place = function( element ) {
    if( element === undefined )
      element = "body";
    if( typeof( element ) == "string" ) {
      var node = element;
      element = d3.selectAll( node );
      if( element.size() == 0 )
        throw "Error in function 'place': DOM selection for string '" +
          node + "' did not find a node."
  	}
  	chart.transitionOff = true;
		chart.put_static_content( element );
    chart.update();
    chart.transitionOff = false;
    return chart;
  }
	
	//update parts
	chart.updateSize = function(){
		chart.viewBox
			.attr("x", -5) //Let's leave some margin for a view box so that not to cut
			.attr("y", -5) //points that are exactly on the edge
			.attr("width", chart.plotWidth() + 10) 
			.attr("height", chart.plotHeight() + 10);
		if(chart.transitionDuration() > 0 && !chart.transitionOff){
			var t = d3.transition("size")
				.duration(chart.transitionDuration());
			chart.svg.transition(t)
				.attr("width", chart.width())
				.attr("height", chart.height());
			chart.svg.selectAll(".title").transition(t)
				.attr("font-size", chart.titleSize())
				.attr("x", chart.titleX())
				.attr("y", chart.titleY());
			chart.svg.selectAll(".plotArea").transition(t)
				.attr("transform", "translate(" + chart.margins().left + 
															", " + chart.margins().top + ")");
		} else {
			chart.svg
				.attr("width", chart.width())
				.attr("height",	chart.height());
			chart.svg.selectAll(".title")
				.attr("font-size", chart.titleSize())
				.attr("x", chart.titleX())
				.attr("y", chart.titleY());
			chart.svg.selectAll(".plotArea")
				.attr("transform", "translate(" + chart.margins().left + 
															", " + chart.margins().top + ")");
		}
		if(chart.showPanel())
			chart.panel.updateSize();
		return chart;			
	}
	chart.updateTitle = function(){
		chart.svg.selectAll(".title")
			.text(chart.title());		
	}

	chart.getElements = function(data){
		data = data.map(function(e) {return escapeRegExp(e).replace(/ /g, "_")});
		return chart.svg.selectAll("#p" + data.join(", #p"));
	}

	chart.update = function(){
		chart.updateSize();
		chart.updateTitle();
		return chart;
	}
  return chart;
}