import { base } from "./base";
import { layerBase } from "./layerBase";
import { add_click_listener } from "./additionalFunctions";
import { legend } from "./legend";
import { panel } from "./panel";

//basic chart object
export function chartBase() {
	var chart = base()
		.add_property("width", 500)
		.add_property("height", 500)
		.add_property("plotWidth", 440)
		.add_property("plotHeight", 435)
		.add_property("margin", { top: 15, right: 10, bottom: 50, left: 50 })
		.add_property("title", "")
		.add_property("titleX", function() {return chart.width() / 2;})
		.add_property("titleY", function() {return d3.min([17, chart.margin().top * 0.9]);})
		.add_property("titleSize", function() {return d3.min([15, chart.margin().top * 0.8]);})
		.add_property("transitionDuration", 1000) //may be set to zero
		.add_property("markedUpdated", function() {})
		.add_property("showPanel", true); 
	
	chart.selectMode = false;
	chart.pan = {mode: false, down: undefined};
  chart.width("_override_", "plotWidth", function(){
  			return chart.get_width() - 
  				(chart.get_margin().right + chart.get_margin().left);
  });
/*  chart.plotWidth("_override_", "width", function(){
  			return chart.get_plotWidth() +
  				(chart.get_margin().right + chart.get_margin().left);
  }); */
  chart.margin("_override_", "plotWidth", function(){
  			return chart.get_width() - 
  				(chart.get_margin().right + chart.get_margin().left);
  });
  chart.height("_override_", "plotHeight", function(){
  			return chart.get_height() - 
  				(chart.get_margin().top + chart.get_margin().bottom);
  });
 /* chart.plotHeight("_override_", "height", function(){
  			return chart.get_plotHeight() +
  				(chart.get_margin().top + chart.get_margin().bottom);
  }); */
  chart.margin("_override_", "plotHeight", function(){
  			return chart.get_height() - 
  				(chart.get_margin().top + chart.get_margin().bottom);
  });

  chart.set_margin = function(margin){
  	if(typeof margin.top === "undefined")
  		margin.top = chart.margin().top;
  	if(typeof margin.bottom === "undefined")
  		margin.bottom = chart.margin().bottom;
  	if(typeof margin.left === "undefined")
  		margin.left = chart.margin().left;
  	if(typeof margin.right === "undefined")
  		margin.right = chart.margin().right;
  	
  	chart.margin(margin);
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
  							lsvg = d3.select(this).select("svg");
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
    				callback();
    			}
  			img.src = 'data:image/svg+xml; charset=utf8, '+encodeURIComponent(svgInnerHTML);
 				}

 				chart.svg.select(".panel_g")
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
 				chart.svg.select(".panel_g")
 					.style("display", undefined);
			});

			chart.panel.add_button("Save plot as svg", "#svg", function(chart){
 				chart.svg.select(".panel_g")
 					.style("display", "none");
 				var html;
  			if(chart.legend !== undefined){
  				var w, h = 0, lsvg, hlist;
  				html = "<g>" + chart.svg.node().innerHTML + "</g>";
  				chart.legend.location().selectAll("tr").each(function(){
  					w = 0;
  					hlist = [];
  					d3.select(this).selectAll("td").each(function(){
  						lsvg = d3.select(this).select("svg");
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

 				chart.svg.select(".panel_g")
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
					chart.selectMode = false;

				} else {
					button
						.classed("clicked", true)
						.attr("opacity", 1)
						.on("mouseout", function() {});
					chart.selectMode = true;
					var panButton = chart.panel.g.select("#b_pan");
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
					var selectButton = chart.panel.g.select("#b_selection");
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
					var pointPos = chart.get_position(e); 
					pos.x.push(pointPos[0]);
					pos.y.push(pointPos[1]);
				});
				var x_range = d3.extent(pos.x),
					y_range = d3.extent(pos.y);
				chart.zoom([x_range[0], y_range[0]], [x_range[1], y_range[1]]);
			});
		}

	}

	chart.mark = function(marked) {
		if(marked == "__clear__"){
			chart.svg.selectAll(".data_point.marked")
				.classed("marked", false);
			chart.svg.selectAll(".data_point")
				.attr("opacity", 1);
			chart.markedUpdated();
			return;
		}
		//marked can be either an array of IDs or a selection
		if(typeof marked.empty === "undefined") {
			marked = marked.map(function(e) {return lc.escapeRegExp(e).replace(/ /g, "_")});
			if(marked.length > 0){
				var marked = chart.svg.selectAll(
			 		"#" + marked.join(", #"));
			} else{
				var marked = chart.svg.select("_____");
			}
		}
		
		if(chart.svg.selectAll(".data_point.marked").empty())
			chart.svg.selectAll(".data_point")
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
		if(chart.svg.selectAll(".data_point.marked").empty())
			chart.svg.selectAll(".data_point")
				.attr("opacity", 1);

		chart.markedUpdated();
	}

	chart.get_marked = function(){
		var points = [];
		chart.svg.selectAll(".marked").each(function() {
			points.push(d3.select(this).datum());
		});
		return points;
	}

  chart.place = function( element ) {
    if( element === undefined )
      element = "body";
    if( typeof( element ) == "string" ) {
      var node = element;
      element = d3.select( node );
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
			chart.svg.select(".title").transition(t)
				.attr("font-size", chart.titleSize())
				.attr("x", chart.titleX())
				.attr("y", chart.titleY());
			chart.svg.select(".plotArea").transition(t)
				.attr("transform", "translate(" + chart.margin().left + 
															", " + chart.margin().top + ")");
		} else {
			chart.svg
				.attr("width", chart.width())
				.attr("height",	chart.height());
			chart.svg.select(".title")
				.attr("font-size", chart.titleSize())
				.attr("x", chart.titleX())
				.attr("y", chart.titleY());
			chart.svg.select(".plotArea")
				.attr("transform", "translate(" + chart.margin().left + 
															", " + chart.margin().top + ")");
		}
		if(chart.showPanel())
			chart.panel.updateSize();
		return chart;			
	}
	chart.updateTitle = function(){
		chart.svg.select(".title")
			.text(chart.title());		
	}

	chart.getPoints = function(data){
		data = data.map(function(e) {return lc.escapeRegExp(e).replace(/ /g, "_")});
		return chart.svg.selectAll("#p" + data.join(", #p"));
	}

	chart.update = function(){
		chart.updateSize();
		chart.updateTitle();
		return chart;
	}
  return chart;
}

export function layerChartBase(){
	var chart = chartBase()
		.add_property("activeLayer", undefined)
		.add_property("showLegend", true)
		.add_property("layerIds", function() {return Object.keys(chart.layers);})
		.add_property("layerType", function(id) {return chart.get_layer(id).type;});
	
	chart.legend = legend(chart);

	//Basic layer functionality
	chart.layers = {};
	var findLayerProperty = function(propname){
		return function() {
			if(chart.get_activeLayer()[propname])
				return chart.get_activeLayer()[propname].apply(chart, arguments)
			else {
				for(var i in chart.layers)
					if(chart.layers[i][propname])
						return chart.layers[i][propname].apply(chart, arguments);
				return;
			}
		}
	}
	chart.syncProperties = function(layer){
		for(var i = 0; i < layer.propList.length; i++)
			if(typeof chart[layer.propList[i]] === "undefined"){
				chart[layer.propList[i]] = findLayerProperty(layer.propList[i]);
				chart["get_" + layer.propList[i]] = findLayerProperty("get_" + layer.propList[i]);
			}
	}

	chart.get_nlayers = function() {
		return Object.keys(chart.layers).length;
	}
	chart.get_layer = function(id) {
		if(Object.keys(chart.layers).indexOf(id) == -1)
			throw "Error in 'get_layer': layer with id " + id +
				" is not defined";

		return chart.layers[id];
	}
	chart.create_layer = function(id) {
		if(typeof id === "undefined")
			id = "layer" + chart.get_nlayers();

		var layer = layerBase(id);
		layer.chart = chart;
		chart.layers[id] = layer;
		chart.activeLayer(chart.get_layer(id));

		return chart;
	}
	chart.add_layer = function(id) {
		if(typeof id === "undefined")
			id = "layer" + chart.get_nlayers();

		var type;
		try {
			type = chart.get_layerType(id);
		} catch (exc) {};
		if(typeof type === "undefined"){
			chart.create_layer(id);
		} else {
			if(type == "scatter")
				lc.scatterChart(id, chart);
			if(type == "xLine")
				lc.xLine(id, chart);
			if(type == "yLine")
				lc.yLine(id, chart);
			if(type == "paramCurve")
				lc.parametricCurve(id, chart);
			if(type == "bar")
				lc.barChart(id, chart);
		}
		return chart;
	}
	chart.remove_layer = function(id) {
		if( Object.keys(chart.layers).indexOf(id) == -1)
			return -1;
		//clean the legend
		for(i in chart.layers[id].legendBlocks)
			chart.legend.remove(i);
		try {
			chart.layers[id].g.remove();
		} catch(exc) {};
		delete chart.layers[id];

		return 0;
	}
	chart.select_layers = function(ids) {
		if(typeof ids === "undefined")
			ids = chart.layerIds();

		var layerSelection = {};
		layerSelection.layers = {};
		//extract or initialise all the requested layers
		for(var i = 0; i < ids.length; i++)
			if(chart.layerIds().indexOf(ids[i]) != -1) {
				if(typeof chart.layers[ids[i]] === "undefined"){
					chart.add_layer(ids[i]);
					chart.get_layer(ids[i]).put_static_content();
				}
				layerSelection.layers[ids[i]] = chart.get_layer(ids[i]);
			} else {
				ids.splice(i, 1);
				i--;
			}
		if(Object.keys(layerSelection.layers).length == 0){
			for(i in chart)
				layerSelection[i] = function() {return layerSelection};
			return layerSelection;
		}
		//construct generalised property functions
		//note, that only the properties shared between layers
		//can  be generalized
		var prop, flag, j;
		for(var j = 0; j < ids.length; j++)
			for(var i = 0; i < layerSelection.layers[ids[j]].propList.length; i++){
				prop = layerSelection.layers[ids[j]].propList[i];
				if(typeof layerSelection[prop] === "undefined")
					layerSelection[prop] = (function(prop) {return function(val){
						var vf;
						if(typeof val !== "function")
							vf = function() {return val;}
						else
							vf = val;
						for(var i = 0; i < ids.length; i++)
							if(typeof layerSelection.layers[ids[i]][prop] !== "undefined")
								layerSelection.layers[ids[i]][prop]( (function(id) {return function(){ 
									var args = []
									for(var j = 0; j < arguments.length; j++)
										args.push(arguments[j]);
									args.unshift(id);
									return vf.apply(undefined, args); 
								} })(ids[i]));
						return layerSelection;
					} })(prop);
			}
		if(layerSelection.length == 0)
			return chart;
		return layerSelection;
	}

	chart.get_marked = function(){
		var points = [];
		chart.svg.selectAll(".marked").each(function() {
			points.push([d3.select(this.parentNode).attr("id"), 
										d3.select(this).datum()]);
		});
		return points;
	}

	chart.findPoints = function(lu, rb){
		var selPoints = [];
		chart.svg.selectAll(".chart_g").each(function(){
			selPoints = selPoints.concat(
				chart.get_layer(d3.select(this).attr("id")).findPoints(lu, rb)
			);
		});
		return selPoints;
	}

	chart.get_position = function(id){
		return chart.get_layer(id[0]).get_position(id[1]);
	}

	chart.placeLayer = function(id){
		chart.get_layer(id).put_static_content();
		chart.get_layer(id).updateSize();
		chart.get_layer(id).update();
	}

	var inherited_put_static_content = chart.put_static_content;
	chart.put_static_content = function(element){
		inherited_put_static_content(element);
		chart.container
			.append("table")
				.append("tr")
					.append("td").node()
						.appendChild(chart.svg.node());
		//chart.svg.remove();
		chart.svg = chart.container.select("svg");

		//add a cell for the legend
		chart.legend.location(chart.container.select("tr")
													.append("td").attr("id", "legend"));

		add_click_listener(chart);
		for(var k in chart.layers)
			chart.get_layer(k).put_static_content();		
	}

	var inherited_update = chart.update;
	chart.update = function() {
		var ids = chart.layerIds(), type;
		for(var i = 0; i < ids.length; i++){
			if(typeof chart.layers[ids[i]] === "undefined")
				chart.add_layer(ids[i]);
//			if(typeof chart.layers[ids[i]].g === "undefined")
//				chart.placeLayer(ids[i]);
		}
		

		for(var k in chart.layers){
			if(ids.indexOf(k) == -1)
				chart.remove_layer(k)
			else {
				chart.get_layer(k).updatePoints();
				chart.get_layer(k).updatePointStyle();
			}	
		}
		
		inherited_update();
		if(chart.showLegend() && Object.keys(chart.legend.blocks).length > 0)
			chart.legend.update();
		return chart;
	}

	var inherited_updateSize = chart.updateSize;
	chart.updateSize = function(){
		inherited_updateSize();
		for(var k in chart.layers)
			chart.get_layer(k).updateSize();
	}

	return chart;
}

export function axisChart() {
	
	var chart = layerChartBase();
	
	chart.add_property("singleScaleX", true)
		.add_property("singleScaleY", true)
		.add_property("domainX")
		.add_property("domainY")
		.add_property("aspectRatio", null)
		.add_property("labelX")
		.add_property("labelY")
		.add_property("ticksX", undefined)
		.add_property("ticksY", undefined);

	chart.axes = {};
	
	//default getter for domain
	//tries to make domain fit data from all layers
	//for axis capital letters a supposed to be used
	var get_domain = function(axis) {
		return function() {
			var domain;
			//TODO: add possibility of adding several axises
			//(one for each plot.layer)
			if(chart["get_singleScale" + axis]()){
				//if all the layers use continuous scale, make the scale continuous
				//otherwise make it categorical
				var contScale = true;
				for(var k in chart.layers)
					contScale = contScale && chart.get_layer(k)["get_contScale" + axis]();

				if(contScale){//if resulting scale is continous, find minimun and maximum values
					for(var k in chart.layers)
						//some of the layers may not have domains at all (such as legends)
						if(typeof chart.get_layer(k)["get_layerDomain" + axis]() !== "undefined")
							if(typeof domain === "undefined") 
								domain = chart.get_layer(k)["get_layerDomain" + axis]()
							else {
								domain[0] = d3.min([domain[0], chart.get_layer(k)["get_layerDomain" + axis]()[0]]);
								domain[1] = d3.max([domain[1], chart.get_layer(k)["get_layerDomain" + axis]()[1]]);
							}
				} else { //if scale is categorical, find unique values from each layer
					for(var k in chart.layers)
						if(typeof chart.get_layer(k)["get_layerDomain" + axis]() !== "undefined")
							if(typeof domain === "undefined") 
								domain = chart.get_layer(k)["get_layerDomain" + axis]()
							else 
								domain = domain.concat(chart.get_layer(k)["get_layerDomain" + axis]()
									.filter(function(e){
										return domain.indexOf(e) < 0;
									}));
				}
			}
			return domain;
		}
	}

	chart.get_domainX = get_domain("X");
	chart.get_domainY = get_domain("Y");

	//redefine setters for axis domains
	chart.domainX = function(domain){
		//set default getter
		if(domain == "reset"){
			chart.domainX(chart.origDomainX);
			return chart;
		}
		//if user provided function, use this function
		if(typeof domain === "function")
			chart.get_domainX = domain;
		if(domain.splice)
			chart.get_domainX = function() {
				return domain;
			};
			
		return chart;
	}
	chart.domainY = function(domain){
		if(domain == "reset"){
			chart.domainY(chart.origDomainY);
			return chart;
		}
		if(typeof domain === "function")
			chart.get_domainY = domain;
		if(domain.splice)
			chart.get_domainY = function() {
				return domain;
			};
		
		return chart;
	}

	chart.zoom = function(lu, rb){
		if(lu[0] == rb[0] || lu[1] == rb[1])
			return;
    if(chart.axes.scale_x.invert)
    	chart.domainX([chart.axes.scale_x.invert(lu[0]), 
      	             chart.axes.scale_x.invert(rb[0])])
    else {
    	var newDomainX = [], domainX = chart.get_domainX(),
    		i = 0;
    	while(chart.axes.scale_x(domainX[i]) <= rb[0]){
				if(chart.axes.scale_x(domainX[i]) >= lu[0])
					newDomainX.push(domainX[i]);
				i++;    	
    	}
    	if(newDomainX.length > 0)
    		chart.domainX(newDomainX);
    }

    if(chart.axes.scale_y.invert)
	    chart.domainY([chart.axes.scale_y.invert(rb[1]),
                    chart.axes.scale_y.invert(lu[1])]);
    else {
    	var newDomainY = [], domainY = chart.get_domainY(),
    		i = 0;
    	while(chart.axes.scale_y(domainY[i]) <= rb[1]){
				if(chart.axes.scale_y(domainY[i]) >= lu[1])
					newDomainY.push(domainY[i]);
				i++;    	
    	}
    	if(newDomainY.length > 0)
    		chart.domainY(newDomainY);
    }

    chart.updateAxes();
  }
  chart.resetDomain = function(){
    chart.domainX("reset");
    chart.domainY("reset");
    chart.updateAxes();
  }

  var inherited_put_static_content = chart.put_static_content;
  chart.put_static_content = function( element ) {
    inherited_put_static_content( element );
		
		var g = chart.svg.append("g")
			.attr("class", "axes_g");

    chart.axes.x_g = g.append( "g" )
      .attr( "class", "x axis" );
    chart.axes.x_label = chart.axes.x_g.append( "text" )
      .attr( "class", "label" )
      .attr( "y", -6 )
      .style( "text-anchor", "end" );

    chart.axes.y_g = g.append( "g" )
      .attr( "class", "y axis" )
    chart.axes.y_label = chart.axes.y_g.append( "text" )
      .attr( "class", "label" )
      .attr( "transform", "rotate(-90)" )
      .attr( "y", 6 )
      .attr( "dy", ".71em" )
      .style( "text-anchor", "end" );

		var domainX = chart.get_domainX();
		if(domainX.length == 2 && typeof domainX[0] === "number")
			chart.axes.scale_x = d3.scaleLinear()
				.nice();
		else{
			chart.axes.scale_x = d3.scalePoint() 
				.padding(0.3);	
		}
		chart.origDomainX = chart.get_domainX;
		
		var domainY = chart.get_domainY();
		if(domainY.length == 2 && typeof domainY[0] === "number")
			chart.axes.scale_y = d3.scaleLinear()
				.nice();
		else
			chart.axes.scale_y = d3.scalePoint()
				.padding(0.3); 

		chart.origDomainY = chart.get_domainY;	
		if(chart.showPanel()) {
			chart.panel.add_button("Zoom in", "#zoomIn", function(chart){
				var xDomain = chart.axes.scale_x.domain(),
					yDomain = chart.axes.scale_y.domain();
				if(xDomain.length == 2 && typeof xDomain[0] == "number" && typeof xDomain[1])
					chart.domainX([(xDomain[0] * 4 + xDomain[1])/5, 
												(xDomain[0] + xDomain[1] * 4)/5])
				else {
					var removeElements = Math.ceil(xDomain.length * 0.1);
					xDomain.splice(0, removeElements);
					xDomain.splice(xDomain.length - removeElements);
					if(xDomain.length > 0)
						chart.domainX(xDomain);
				}
				if(yDomain.length == 2 && typeof yDomain[0] == "number" && typeof yDomain[1])
					chart.domainY([(yDomain[0] * 4 + yDomain[1])/5, 
												(yDomain[0] + yDomain[1] * 4)/5]);
				else {
					var removeElements = Math.ceil(yDomain.length * 0.1);
					yDomain.splice(0, removeElements);
					yDomain.splice(yDomain.length - removeElements );
					if(yDomain.length > 0)
						chart.domainY(yDomain);
				}
				chart.updateAxes();

			}, "Double click to return to original scales");
			chart.panel.add_button("Zoom out", "#zoomOut", function(chart){
				var xDomain = chart.axes.scale_x.domain(),
					yDomain = chart.axes.scale_y.domain();
				if(xDomain.length == 2 && typeof xDomain[0] == "number" && typeof xDomain[1])
					chart.domainX([(xDomain[0] * 6 - xDomain[1])/5, 
												(-xDomain[0] + xDomain[1] * 6)/5])
				else{
					var addElements = Math.ceil(xDomain.length * 0.1),
						origDomainX = chart.origDomainX(),
						start = origDomainX.indexOf(xDomain[0]),
						end = origDomainX.indexOf(xDomain[xDomain.length - 1]);
					for(var i = start - 1; i >= d3.max([0, start - addElements]); i--)
						xDomain.unshift(origDomainX[i]);
					for(var i = end + 1; i < d3.min([origDomainX.length, end + addElements + 1]); i++)
						xDomain.push(origDomainX[i]);
					chart.domainX(xDomain);
				}
				if(yDomain.length == 2 && typeof yDomain[0] == "number" && typeof yDomain[1])
					chart.domainY([(yDomain[0] * 6 - yDomain[1])/5, 
												(-yDomain[0] + yDomain[1] * 6)/5])
				else{
					var addElements = Math.ceil(yDomain.length * 0.1),
						origDomainY = chart.origDomainY(),
						start = origDomainY.indexOf(yDomain[0]),
						end = origDomainY.indexOf(yDomain[yDomain.length - 1]);
					for(var i = origDomainY[start - 1]; i >= d3.max([0, start - addElements]); i--)
						yDomain.unshift(origDomainY[i]);
					for(var i = end + 1; i < d3.min([origDomainY.length, end + addElements + 1]); i++)
						yDomain.push(origDomainY[i]);

					chart.domainY(yDomain);
				}
				chart.updateAxes();			
			}, "Double click to return to original scales");
		}
  }	
	
	var inherited_updateSize = chart.updateSize;
	chart.updateSize = function() {
		inherited_updateSize();

		if(chart.transitionDuration() > 0 && !chart.transitionOff){
			var t = d3.transition("size")
				.duration(chart.transitionDuration());
			chart.svg.select(".axes_g").transition(t)
				.attr("transform", "translate(" + chart.get_margin().left + 
								", " + chart.get_margin().top + ")");
			chart.axes.x_g.transition(t)
				.attr( "transform", "translate(0," + chart.get_plotHeight() + ")" );
			chart.axes.x_label.transition(t)
				.attr("x", chart.get_plotWidth());

		}	else {
			chart.svg.select(".axes_g")
				.attr("transform", "translate(" + chart.get_margin().left + 
								", " + chart.get_margin().top + ")");
			chart.axes.x_g
				.attr( "transform", "translate(0," + chart.get_plotHeight() + ")" );
			chart.axes.x_label
				.attr("x", chart.get_plotWidth());
		}
		chart.axes.scale_x.range([0, chart.get_plotWidth()]);
		chart.axes.scale_y.range([chart.get_plotHeight(), 0]);

		chart.updateAxes();

		return chart;
	};

	// This function takes two linear scales, and extends the domain of one of them to get  
	// the desired x:y aspect ratio 'asp'. 
	function fix_aspect_ratio( scaleX, scaleY, asp ) { 
	   var xfactor = ( scaleX.range()[1] - scaleX.range()[0] ) /  
	      ( scaleX.domain()[1] - scaleX.domain()[0] ) 
	   var yfactor = ( scaleY.range()[1] - scaleY.range()[0] ) /  
	      ( scaleY.domain()[1] - scaleY.domain()[0] ) 
	   var curasp = Math.abs( xfactor / yfactor )  // current aspect ratio 
	   if( curasp > asp ) {  // x domain has to be expanded 
	      var cur_dom_length = ( scaleX.domain()[1] - scaleX.domain()[0] ) 
	      var extension = cur_dom_length * ( curasp/asp - 1 ) / 2 
	      scaleX.domain( [ scaleX.domain()[0] - extension, scaleX.domain()[1] + extension ] )       
	   } else { // y domain has to be expanded 
	      var cur_dom_length = ( scaleY.domain()[1] - scaleY.domain()[0] ) 
	      var extension = cur_dom_length * ( asp/curasp - 1 ) / 2 
	      scaleY.domain( [ scaleY.domain()[0] - extension, scaleY.domain()[1] + extension ] )             
	   } 
	} 

	var get_ticks = function(axis){
		var ticks = {tickValues: null, tickFormat: null},
			tickArray = chart["ticks" + axis]();
		
		if(tickArray){
			//check if the ticks are set correctly
			if(typeof tickArray.splice === "undefined")
				throw "Error in 'get_ticks': new tick values and labels should be passed " +
							"as an array";
			if(typeof tickArray[0].splice === "undefined")
				tickArray = [tickArray];
			for(var i = 1; i < tickArray.length; i++)
				if(tickArray[0].length != tickArray[i].length)
					throw "Error in 'get_ticks': the amount of tick labels must be equal to the " +
								"amount of tick values";

			//if only tick values (not tick labels) then return 					
			ticks.tickValues = tickArray[0];
			if(tickArray.length == 1)
				return ticks;

			//if all the labels sets are identical, leave only one of them
			var ident = tickArray.length > 2, j = 1, i;
			while(ident && j < tickArray.length - 1){
				i = 0;
				while(ident && i < tickArray[j].length){
					ident = (tickArray[j][i] == tickArray[j + 1][i]);
					i++;
				}
				j++;
			}
			if(ident)
				tickArray.splice(2);
			
			//if we have several label sets, transform the labels into <tspan> blocks
			var tickLabels = [], value;
			if(tickArray.length > 2){
				for(var i = 0; i < tickArray[0].length; i++){
					value = "";
					for(var j = 1; j < tickArray.length; j++){
						//location
						value += "<tspan x = 0.5 dy = " + 1.1 + "em";
						//colour if any
						if(tickArray.colour) 
							value += " fill = '" + tickArray.colour[j - 1] + "'>"
						else
							value += ">";
						value += tickArray[j][i] + "</tspan>";
					}
					tickLabels.push(value);
				}
			} else {
				tickLabels = tickArray[1];
			}
			ticks.tickFormat = function(d) {return tickLabels[ticks.tickValues.indexOf(d)];};
		}
		
		return ticks;
	}

	chart.pan.move = function(p){
		var domainX = chart.axes.scale_x.domain(),
			domainY = chart.axes.scale_y.domain();
		if(chart.axes.scale_x.invert){
			var invPx = chart.axes.scale_x.invert(p[0]),
				moveX = invPx - chart.axes.scale_x.invert(chart.pan.down[0]);
			chart.pan.down[0] = p[0];
			chart.domainX([domainX[0] - moveX, domainX[1] - moveX]);
		} else {
			var moveX = p[0] - chart.pan.down[0],
				steps = Math.floor(Math.abs(moveX) / chart.axes.scale_x.step() * 2);
			if(steps > 0){
				chart.pan.down[0] += Math.sign(moveX) * steps * chart.axes.scale_x.step() /2;
				var origDomainX = chart.origDomainX(),
					start = origDomainX.indexOf(domainX[0]),
					end = origDomainX.indexOf(domainX[domainX.length - 1]);
				if(moveX < 0){
					domainX.splice(0, steps);
					domainX = domainX.concat(origDomainX.slice(end + 1, d3.min([origDomainX.length, end + steps + 1])));
				} else {
					domainX.splice(domainX.length - steps);
					domainX = origDomainX.slice(d3.max([0, start - steps]), start).concat(domainX);
				}
				if(domainX.length > 0) chart.domainX(domainX);
			}
		}

		if(chart.axes.scale_y.invert){
			var invPy = chart.axes.scale_y.invert(p[1]),
				moveY = invPy - chart.axes.scale_y.invert(chart.pan.down[1]);
			chart.pan.down[1] = p[1];
			chart.domainY([domainY[0] - moveY, domainY[1] - moveY]);
		} else {
			var moveY = p[1] - chart.pan.down[1],
				steps = Math.floor(Math.abs(moveY) / chart.axes.scale_y.step() * 2);
			if(steps > 0){
				chart.pan.down[1] += Math.sign(moveY) * steps * chart.axes.scale_y.step() / 2;
				var origDomainY = chart.origDomainY(),
					start = origDomainY.indexOf(domainY[0]),
					end = origDomainY.indexOf(domainY[domainY.length - 1]);
				if(moveY > 0){
					domainY.splice(0, steps);
					domainY = domainY.concat(origDomainY.slice(end + 1, d3.min([origDomainY.length, end + steps + 1])));
				} else {
					domainY.splice(domainY.length - steps);
					domainY = origDomainY.slice(d3.max([0, start - steps]), start).concat(domainY);
				}
				if(domainY.length > 0) chart.domainY(domainY);
			}
		}

		chart.updateAxes();
	}

	chart.updateAxes = function(){
    chart.axes.x_label
    	.text( chart.get_labelX());
		chart.axes.y_label
   		.text( chart.get_labelY() );
    chart.axes.scale_x.domain(chart.get_domainX());
		chart.axes.scale_y.domain(chart.get_domainY());
		if(chart.aspectRatio())
			fix_aspect_ratio(chart.axes.scale_x, chart.axes.scale_y, chart.get_aspectRatio());

		var ticksX = get_ticks("X"),
			ticksY = get_ticks("Y");

    if(chart.transitionDuration() > 0 && !chart.transitionOff) {
	    var t = d3.transition("axes")
	    	.duration(chart.transitionDuration());
	    d3.axisBottom()
	      .scale( chart.axes.scale_x )
	      .tickValues(ticksX.tickValues)
	      .tickFormat(ticksX.tickFormat)
	      ( chart.axes.x_g.transition(t) );

	    d3.axisLeft()
	      .scale( chart.axes.scale_y )
	      .tickValues(ticksY.tickValues)
	      .tickFormat(ticksY.tickFormat)
	      ( chart.axes.y_g.transition(t) );	
    } else {
	    d3.axisBottom()
	      .tickValues(ticksX.tickValues)
	      .tickFormat(ticksX.tickFormat)
	      .scale( chart.axes.scale_x )
	      ( chart.axes.x_g );

	    d3.axisLeft()
	      .scale( chart.axes.scale_y )
	      .tickValues(ticksY.tickValues)
	      .tickFormat(ticksY.tickFormat) 
	      ( chart.axes.y_g );    	
    }

    var updateX = function() {
    	chart.axes.x_g.selectAll(".tick").selectAll("text")
    		.html(ticksX.tickFormat)
    };
    if(ticksX.tickFormat)
    	if(chart.transitionDuration() > 0 && !chart.transitionOff)
    		setTimeout(updateX, chart.transitionDuration())
    	else
    		updateX();

    var updateY = function() {
    	chart.axes.y_g.selectAll(".tick").selectAll("text")
    		.html(ticksX.tickFormat)
    };
    if(ticksY.tickFormat)
    	if(chart.transitionDuration() > 0 && !chart.transitionOff)
    		setTimeout(updateY, chart.transitionDuration())
    	else
    		updateY();

    for(var k in chart.layers)
    	chart.get_layer(k).updatePointLocation();

    return chart;
	}

	return chart;
}