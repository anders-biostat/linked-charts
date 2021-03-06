import { chartBase } from "./chartBase";
import { xLine, yLine, parametricCurve} from "./lines";
import { scatter } from "./scatter";
import { beeswarm } from "./beeswarm";
import { barchart } from "./barchart";
import { layerBase } from "./layerBase";
import { add_click_listener, check } from "./additionalFunctions"

export function layerChart(){
	var chart = chartBase()
		.add_property("activeLayer", undefined)
		.add_property("layerIds", function() {return Object.keys(chart.layers);}, check("array", "layerIds"))
		.add_property("layerType", function(id) {return chart.get_layer(id).type;}, check("array_fun", "layerType"))
		.add_property("globalColourScale", true);

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
				scatter(id, chart);
			if(type == "xLine")
				xLine(id, chart);
			if(type == "yLine")
				yLine(id, chart);
			if(type == "paramCurve")
				parametricCurve(id, chart);
			if(type == "bar")
				barchart(id, chart);
			if(type == "beeswarm")
				beeswarm(id, chart);
		}
		return chart;
	}
	chart.remove_layer = function(id) {
		if( Object.keys(chart.layers).indexOf(id) == -1)
			return -1;
		//clean the legend
		for(var i in chart.layers[id].legendBlocks)
			chart.legend.removeBlock(chart.layers[id].legendBlocks[i]);
		try {
			chart.layers[id].g.remove();
			chart.layers[id].canvas.remove();
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
					if(chart.svg)
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

	var domains = {};
	chart.globalColourDomain = function(layerId, domain) {
		if(layerId !== undefined) 
			domains[layerId] = domain;

		var mainDomain = [];
		for(var d in chart.layers) {
			if(!domains[d])
				domains[d] = chart.get_layer(d).colourDomain();
			mainDomain = mainDomain.concat(domains[d]);
		}
		mainDomain.filter(function(el, ind, self) {
			return el !== undefined && self.indexOf(el) === ind;
		})

		return mainDomain;
	}

	chart.place_layer = function(id){
		chart.get_layer(id).put_static_content();
		//chart.get_layer(id).updateSize();
		chart.get_layer(id).update();
	}

	var inherited_put_static_content = chart.put_static_content;
	chart.put_static_content = function(element){
		inherited_put_static_content(element);

		add_click_listener(chart);
		for(var k in chart.layers)
			chart.get_layer(k).put_static_content();		
	}

	chart.findElements = function(lu, rb){
		var selElements = {};
		Object.keys(chart.layers).forEach(function(layerId){
			selElements[layerId] = chart.get_layer(layerId).findElements(lu, rb);
		});
		return selElements;
	}	

	chart.get_elements = function(ids){
		if(typeof ids !== "object")
			ids = [ids];
		if(Array.isArray(ids))
			if(chart.get_nlayers() == 1){
				var tmp = ids;
				ids = {};
				ids[Object.keys(chart.layers)[0]] = tmp;
			} else {
				throw "Error in 'get_elements': layerId is not defined";
			}
		
		var selectedIds = [], canv = {};
		for(var i in ids) {
			if(chart.get_layer(i).canvas && chart.get_layer(i).canvas.classed("active"))
				canv[i] = ids[i]
			else
				selectedIds = selectedIds
					.concat(ids[i].map(function(e) {
						if(typeof e === "object")
							e = e.join("_");
						return ("p" + i + "_" + e).replace(/[ .]/g, "_")
					}))
		}
		
		var points = (selectedIds.length == 0 ? d3.select("_______") : 
					chart.svg.selectAll(".chart_g").selectAll("#" + selectedIds.join(",#")));
		points.canvas = canv;
		return points;

	}

	chart.get_marked = function(){
		var elements = {};
		for(var layerId in chart.layers)
			elements[layerId] = chart.get_layer(layerId).get_marked();
		return elements;
	}


	var inherited_mark = chart.mark;
	chart.mark = function(marked, pe) {
		if(Array.isArray(marked)) {
			inherited_mark(marked, pe);
			return;
		}
		if(marked.empty && (!marked.canvas || Object.keys(marked.canvas) == 0)) {
			inherited_mark(marked, pe);
			return;
		}

		if(marked == "__clear__"){
			for(var layerId in chart.layers)
				chart.get_layer(layerId).mark(marked, pe);
			return;
		}
		
		if(marked.canvas)
			marked = marked.canvas;
		for(var layerId in marked)
			chart.get_layer(layerId).mark(marked[layerId], pe);
	}

	var inherited_update = chart.update;
	chart.update = function() {
		var ids = chart.layerIds(), type;
		for(var i = 0; i < ids.length; i++){
			if(typeof chart.layers[ids[i]] === "undefined")
				chart.add_layer(ids[i]);
//			if(typeof chart.layers[ids[i]].g === "undefined")
//				chart.place_layer(ids[i]);
		}
		

		for(var k in chart.layers){
			if(ids.indexOf(k) == -1)
				chart.remove_layer(k)
			else {
				chart.get_layer(k).updateStarted = true;
				chart.get_layer(k).updateElements();
				chart.get_layer(k).updateElementStyle();
				chart.get_layer(k).updateStarted = false;
			}	
		}
		
		inherited_update();
		return chart;
	}

	var inherited_updateSize = chart.updateSize;
	chart.updateSize = function(){
		inherited_updateSize();
		for(var k in chart.layers)
			chart.get_layer(k).canvas
				.style("left", (+chart.paddings().left + 3) + "px")
				.style("top", (+chart.paddings().top + 3) + "px")
				.attr("width", chart.plotWidth())
				.attr("height", chart.plotHeight());
	}

	return chart;
}