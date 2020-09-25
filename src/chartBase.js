import { base } from "./base";
import { escapeRegExp, check } from "./additionalFunctions";
import { panel } from "./panel";
import { legend } from "./legend";

export function chartBase() {
	//add and set new properties
	var chart = base()
		.add_property("width", 500, check("number_nonneg", "width"))
		.add_property("height", 500, check("number_nonneg", "height"))
		.add_property("paddings", { top: 35, right: 10, bottom: 50, left: 50 }, 
			function(value) {
				if(typeof value === "function")
					return value;
				if(value.top === undefined)
					throw "Error in 'typeCheck' for property 'paddings': top-padding is not defined";
				if(value.left === undefined)
					throw "Error in 'typeCheck' for property 'paddings': left-padding is not defined";
				if(value.bottom === undefined)
					throw "Error in 'typeCheck' for property 'paddings': bottom-padding is not defined";
				if(value.right === undefined)
					throw "Error in 'typeCheck' for property 'paddings': right-padding is not defined";
				return value;
			})
		.add_property("title", "")
		.add_property("titleX", function() {return chart.width() / 2;}, check("number_nonneg", "titleX"))
		.add_property("titleY", function() {return d3.min([22, chart.paddings().top * 0.9]);}, check("number_nonneg", "titleY"))
		.add_property("titleSize", function() {return d3.min([20, chart.paddings().top * 0.8]);}, check("number_nonneg", "titleSize"))
		.add_property("transitionDuration", 1000, check("number_nonneg", "transitionDuration")) //may be set to zero
		.add_property("on_marked", function() {})
		.add_property("showPanel", true)
		.add_property("clickSingle", true)		
		.add_property("showLegend", true)
		.add_property("plotWidth", undefined, check("number_nonneg", "plotWidth"))
		.add_property("plotHeight", undefined, check("number_nonneg", "plotHeight")); 
	  
	chart.legend = legend(chart); 

	var plotHeight_default = function() {
			return chart.height() - (chart.paddings().top + chart.paddings().bottom);
		},
		plotWidth_default = function() {
			return chart.width() - (chart.paddings().right + chart.paddings().left);
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
			chart.get_plotHeight = plotHeight_default;
			return height.apply(chart, arguments);
		}
	});
	//if plotWidth or plotHeight is changed by user, width or height respectively
	//should be changed as well
	chart.wrapSetter("plotWidth", function(plotWidth){
		return function() {
			chart.get_width = function() {
				return plotWidth() + chart.paddings().left + chart.paddings().right;
			};
			return plotWidth.apply(chart, arguments);
		}
	});
	chart.wrapSetter("plotHeight", function(plotHeight){
		return function() {
			chart.get_height = function() {
				return plotHeight() + chart.paddings().top + chart.paddings().bottom;
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

	//setter and indicator for pan mode
	var pan = {mode: false, down: undefined};
	chart.pan = function(pr, value){
		if(value == undefined)
			return pan[pr];
		pan[pr] = value;
		return chart;
	} 

	//allows to change only some of the paddings
  chart.set_paddings = function(paddings){
  	if(typeof paddings.top === "undefined")
  		paddings.top = chart.paddings().top;
  	if(typeof paddings.bottom === "undefined")
  		paddings.bottom = chart.paddings().bottom;
  	if(typeof paddings.left === "undefined")
  		paddings.left = chart.paddings().left;
  	if(typeof paddings.right === "undefined")
  		paddings.right = chart.paddings().right;
  	
  	chart.paddings(paddings);
  	return chart;
  }

  function addPanel() {
		if(chart.panel == undefined){
			chart.panel = panel(chart);
			chart.panel.put_static_content();
		}

		chart.panel.add_button("Save plot as png", "#save", saveAsPng);
		chart.panel.add_button("Save plot as svg", "#svg", saveAsSvg);
		chart.panel.add_button("Select elements", "#selection", selection,
										 "You can also select elements by pressing 'Shift'");
		chart.panel.add_button("Togle pan mode", "#pan", panMode);
		chart.panel.add_button("Reset scales", "#home", function(chart){chart.resetDomain();},
											 "You can also use double click to reset scales");
		chart.panel.add_button("Fit selected", "#fitSelected", fitSelected);  	
  }

  //add all the static elements of the chart to a specified
  //container
  chart.put_static_content = function( element ) {
		//outer div that contains everything related to this chart
		chart.container = element.append("div")
			.style("position", "relative")
			.attr("class", "linked-charts");
		//prohibit standart dragging behaviour
		chart.container.node().ondragstart = function() { return false; };
		//container for all svg elements
		chart.svg =	chart.container
			.append("table")
				.attr("class", "mainTable")
				.append("tr")
					.append("td")
						.append("svg");

		//add a cell for the legend
		chart.legend.container(chart.container.selectAll("tr")
													.append("td").attr("id", "legend"));

		//information label
		chart.container.append("div")
			.attr("class", "inform hidden")
			.append("p")
				.attr("class", "value");
		//main title
		chart.svg.append("text")
			.attr("class", "title plainText")
			.attr("text-anchor", "middle");
		//here all the points (lines, cells etc.) will be placed
		chart.svg.append("svg")
			.attr("class", "plotArea");
		//add instrument panel if needed
		if(chart.showPanel()) addPanel();
	}

	//toggle selection for a provided list of elements
	chart.mark = function(marked, pe) {
		//deselect everything
		if(marked == "__clear__"){
			chart.svg.selectAll(".data_element.marked")
				.classed("marked", false);
			chart.svg.selectAll(".data_element")
				.attr("opacity", 1);
			if(!pe)
				chart.on_marked();
			return chart;
		}
		
		//marked can be either an array of IDs or a selection
		if(!marked.empty)
			marked = chart.get_elements(marked);
		
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

		if(!pe)
			chart.on_marked();

		return chart;
	}

  chart.place = function( element ) {
    //if no element is provided add the chart simply to the body of the page
    if( element === undefined )
      element = "body";
    if( typeof( element ) == "string" ) {
      var node = element;
      element = d3.selectAll( node );
      if( element.size() == 0 )
        throw "Error in function 'place': DOM selection for string '" +
          node + "' did not find a node."
  	}
  	//when the chart is updated for the first time, turn off the transition
  	chart.transitionOff = true;
		chart.put_static_content( element );
    chart.update();
    chart.transitionOff = false;
    
    return chart;
  }
	
	//update parts
	chart.updateSize = function() {
		
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
				.attr("x", chart.paddings().left)
				.attr("y", chart.paddings().top)
				.attr("width", chart.plotWidth())
				.attr("height", chart.plotHeight());
		} else {
			chart.svg
				.attr("width", chart.width())
				.attr("height",	chart.height());
			chart.svg.selectAll(".title")
				.attr("font-size", chart.titleSize())
				.attr("x", chart.titleX())
				.attr("y", chart.titleY());
			chart.svg.selectAll(".plotArea")
				.attr("x", chart.paddings().left)
				.attr("y", chart.paddings().top)
				.attr("width", chart.plotWidth())
				.attr("height", chart.plotHeight());
		}
		
		if(chart.showPanel())
			chart.panel.updateSize();

		return chart;			
	}
	chart.updateTitle = function(){
		chart.svg.selectAll(".title")
			.text(chart.title());

		return chart;		
	}

	chart.get_elements = function(data){
		if(!data.splice)
			data = [data];
		data = data.map(function(e) {return escapeRegExp(e).replace(/[ .]/g, "_")});
		return chart.svg.selectAll("#p" + data.join(", #p"));
	}

	chart.update = function(){
		chart.updateSize();
		chart.updateTitle();

		if(chart.showLegend() && chart.legend.get_nblocks() > 0)
			chart.legend.update();

		return chart;
	}

  return chart;
}

function saveAsPng(chart) {
	function drawInlineSVG(svgElement, ctx, callback, legend){
		var svgInnerHTML;
		if(legend !== undefined){
			var w, h = 0, lsvg, hlist;
			svgInnerHTML = "<g>" + svgElement.innerHTML + "</g>";
			legend.container().selectAll("tr").each(function(d, i){
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
    		ctx.drawImage(chart.canvas.node(), chart.paddings().left, chart.paddings().top);
    	callback();
    }
  	img.src = 'data:image/svg+xml; charset=utf8, '+encodeURIComponent(svgInnerHTML);
 	}

	var canvas = document.createElement('canvas');
	if(chart.legend === undefined){
		canvas.height = chart.svg.attr('height');
		canvas.width = chart.svg.attr('width');
	} else {
		canvas.height = d3.max([chart.height(), chart.legend.height()]);
		canvas.width = chart.width() + chart.legend.width();					
	}

	var ctx = canvas.getContext("2d");
	var actCanv = chart.container
		.selectAll("canvas")
			.filter(function() {return d3.select(this).classed("active")})
				.nodes();
	for(var i = 0; i < actCanv.length; i++) 
		ctx.drawImage(actCanv[i], chart.paddings().left, chart.paddings().top);

	chart.svg.selectAll("text").attr("fill", "black");

 	var ch = chart.svg.node().cloneNode(true);
 	for(var i = 0; i < ch.childNodes.length; i++)
 		if(ch.childNodes[i].classList[0] == "panel_g")
 			ch.removeChild(ch.childNodes[i]);	

	drawInlineSVG(ch, canvas.getContext("2d"), 
		function(){
			var dataURL = canvas.toDataURL('image/png');
			var data = atob(dataURL.substring('data:image/png;base64,'.length)),
	     								asArray = new Uint8Array(data.length);

			for (var i = 0, len = data.length; i < len; ++i)
	 			asArray[i] = data.charCodeAt(i);

			var blob = new Blob([asArray.buffer], {type: 'image/png'});
			saveAs(blob, 'export_' + Date.now() + '.png');
		}, chart.legend);
}

function saveAsSvg(chart){
 	//chart.svg.selectAll(".panel_g")
 	//	.style("display", "none");
 	
 	var ch = chart.svg.node().cloneNode(true);
 	for(var i = 0; i < ch.childNodes.length; i++)
 		if(ch.childNodes[i].classList[0] == "panel_g")
 			ch.removeChild(ch.childNodes[i]);

	if(!chart.container
			.selectAll("canvas")
				.filter(function() {return d3.select(this).classed("active")})
					.empty()) {
		chart.container.append("div")
			.attr("class", "hint")
			.attr("id", "errMessage")
			.style("left", (chart.width()/3) + "px")
			.style("top", (chart.height()/3) + "px")
			.style("width", (chart.width()/3) + "px")
			.text("Chart in canvas mode cannot be saved as SVG.");
		setTimeout(function() {chart.container.select("#errMessage").remove()}, 2000);
		return;
	}

	
 	var html;
  if(chart.legend !== undefined){
  	var w, h = 0, lsvg, hlist;
  	html = "<g>" + ch.innerHTML + "</g>";
  	chart.legend.container().selectAll("tr").each(function(){
	  	w = 0;
	  	hlist = [];
	  	d3.select(this).selectAll("td").each(function(){
	  		lsvg = d3.select(this).selectAll("svg");
	  		html += "<g transform='translate(" + (chart.width() + w) + ", " + h + ")'>" +
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

	//chart.svg.selectAll(".panel_g")
	//	.style("display", undefined);
}

function selection(chart, button){
	if(button.classed("clicked")){
		button
			.classed("clicked", false)
			.attr("opacity", 0.6)
			.on("mouseout", function() {
				d3.select(this).attr("opacity", 0.6);
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
}

function panMode(chart, button){
	if(button.classed("clicked")){
		button
			.classed("clicked", false)
			.attr("opacity", 0.6)
			.on("mouseout", function() {
				d3.select(this).attr("opacity", 0.6);
			});
		chart.pan("mode", false);
	} else {
		button
			.classed("clicked", true)
			.attr("opacity", 1)
			.on("mouseout", function() {});
		chart.pan("mode", true);
		var selectButton = chart.panel.g.selectAll("#b_selection");
		if(selectButton.classed("clicked"))
			selectButton.on("click").call(selectButton.node(), selectButton.datum());
	}
}

function fitSelected(chart){
	var marked = chart.get_marked();
	if(chart.layers) 
		marked = Object.keys(chart.layers).map(layerId => marked[layerId].map(el => [layerId, el])).flat();

	if(marked.length == 0)
		if(chart.layers)
			marked = Object.keys(chart.layers).map(layerId => chart.get_layer(layerId).elementIds().map(el => [layerId, el])).flat()
		else
			marked = chart.elementIds();
	
	var pos = {x: [], y: []};
	marked.map(function(e) {
		var elementPos = chart.get_position(e);
		if(elementPos){
			pos.x.push(elementPos[0]);
			pos.y.push(elementPos[1]);
		} 
	});
	var x_range = d3.extent(pos.x),
		y_range = d3.extent(pos.y);
	chart.zoom([x_range[0], y_range[0]], [x_range[1], y_range[1]]);
}