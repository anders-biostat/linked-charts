import { base } from "./base";
import { getEuclideanDistance, check } from "./additionalFunctions";

export function layerBase(id) {
	
	var layer = base()
    .add_property("nelements", undefined, check("number_nonneg", "nelements"))
    .add_property("elementIds", undefined, check("array", "elementIds"))
    .add_property("label", function(i) {return i;}, check("array_fun", "label"))
		.add_property("on_mouseover", function() {})
		.add_property("on_mouseout", function() {})
    .add_property("mode", "svg")
		.add_property("on_click", function() {})
		.add_property("layerDomainX", undefined, check("array", "layerDomainX"))
		.add_property("layerDomainY", undefined, check("array", "layerDomainY"))
		.add_property("contScaleX", function() {
      var domain = layer.layerDomainX();
      if(domain === undefined)
        return true
      else
        return domain.length == 2 && typeof domain[0] === "number" && typeof domain[1] === "number";
    })
		.add_property("contScaleY", function() {
      var domain = layer.layerDomainY();
      if(domain === undefined)
        return true
      else
        return domain.length == 2 && typeof domain[0] === "number" && typeof domain[1] === "number";
    })
    .add_property("colour", function(id) {
      return layer.colourScale(layer.get_colourValue(id));
    }, check("array_fun", "colour"))
    .add_property("addColourScaleToLegend", true)
    .add_property("palette", undefined, check("array", "palette"))
    .add_property("colourDomain", check("array", "colourDomain"))
    .add_property("colourValue", undefined, check("array_fun", "colourValue"))
    .add_property("colourLegendTitle", "")
    .add_property("opacity", 1, check("array_fun", "opacity"))
		.add_property("dresser", function() {})
    .add_property("on_marked", function() {layer.chart.on_marked();})
    .add_property("informText", function(id) {
      return "<b>ID:</b> " + layer.get_label(id);
    }, check("array_fun", "opacity"));

  layer.propList = layer.propList.concat(["updateElementStyle", "updateElements", "updateElementPosition"]);
	layer.id = id;
  layer.marked = [];
  
  //if number of elements is set, define their IDs
  layer.wrapSetter("nelements", function(oldSetter){
    return function() {
      layer.get_elementIds = function(){
        return d3.range(oldSetter());
      };
      return oldSetter.apply(layer, arguments);
    }
  });
  //if element IDs are set, define their number
  layer.wrapSetter("elementIds", function(oldSetter){
    return function() {
      layer.get_nelements = function(){
        return oldSetter().length;
      };
      return oldSetter.apply(layer, arguments);
    }
  });

  layer.wrapSetter("colour", function(colour) {
    return function(){
      layer.addColourScaleToLegend(false);
      return colour.apply(layer, arguments);
    }
  })

  layer.colourDomain(function() {
    var values = layer.elementIds().map(el => layer.get_colourValue(el));
    if(values.length == 0)
      return;
    if(values.length == 1)
      return values[0] === undefined ? [] : values;
    
    var i = -1, range;

    if(typeof values[1] === "number" && typeof values[2] === "number") {
      range = values[1] > values[0] ? [values[0], values[1]] : [values[1], values[0]];
      i = 2;
      while(i < values.length && (typeof values[i] === "number" || lc.isNaN(values[i]))){
        if(range[0] > values[i]) range[0] = values[i];
        if(range[1] < values[i]) range[1] = values[i];
        i++;
      }
    }
    // then colour scale should be discrete
    if(i < values.length) {
      range = [];
      for(var i = 0 ; i < values.length; i++)
        //colour range can contain only unique values
        if(range.indexOf(values[i]) == -1 && values[i] !== undefined)
          range.push(values[i]);
    }

    return range;
  });

  layer.colourScale = function(){
    return "black";
  }

  layer.resetColourScale = function() {
    var range = layer.colourDomain();
    if(range === undefined || range.length == 0)
      return;

    if(layer.chart.globalColourScale()) {
      range = layer.chart.globalColourDomain(layer.id, range);
      var l;
      for(var layerId in layer.chart.layers){
        l = layer.chart.get_layer(layerId);
        if(layerId != layer.id && !l.globalScaleUpdate){
          l.globalScaleUpdate = true;
          let us = l.updateStarted;
          l.updateStarted = true;
          l.updateElementStyle();
          l.updateStarted = us;
          l.globalScaleUpdate = false;
        }
      }
    }

    //first of all, let's check if the colour scale supposed to be
    //categorical or continuous
    var allNum = true;
    range = range.filter(el => !lc.isNaN(el));
    for(var i = 0; i < range.length; i++)
      allNum = allNum && typeof range[i] === "number";
    if(allNum) {
      range.sort(function(a, b) {return a - b});
    }
    var palette = layer.palette();    
    
    if(allNum){
      range = range.filter(function(el) {return el != "Infinity"});
      //the scale is continuous
      //Now look at the palette
      if(palette == undefined)
        if(d3.interpolateSpectral)
          palette = d3.interpolateSpectral
        else
          palette = ["red", "yellow", "green", "blue"];
      //if palette is an array of colors, make a linear colour scale using all
      //values of the palette as intermideate points
      if(Array.isArray(palette)){
        palette = palette.map(el => /^#[0-9a-fA-F]{8,8}$/.test(el) ? el.substring(0, 7) : el);
        if(palette.length != range.length)
          range = [d3.min(range), d3.max(range)];
        if(palette.length == 1)
          palette.push(palette[0]);
        if(palette.length > range.length){
          var newRange = [];
          for(var i = 0; i < palette.length; i++)
            newRange.push(range[0] + i*(range[1] - range[0]) / (palette.length - 1));
          range = newRange; 
        }
        //now palette and range have exactly the same number of elements
        layer.colourValueScale = d3.scaleLinear()
          .domain(range)
          .range(palette);
        layer.colourScale = function(val) {
          return layer.colourValueScale(val);
        }
      } else {
        //palette is a d3.scale or d3.interpolator
        range = [d3.min(range), d3.max(range)];
        //if palette has a domain - use it, otherwise set a domain to
        //[0, 1] (used in d3. interpolators)
        var pDomain = [0, 1];
        if(palette.domain)
          pDomain = palette.domain();

        layer.colourValueScale = d3.scaleLinear()
          .domain(range)
          .range(pDomain);
        layer.colourScale = function(val) {
          return val === null || val === undefined ? "#999" :
                  palette(layer.colourValueScale(val));
        }
      }
    } else {
      //the colour scale is categorical
      //range = range.sort()
      if(palette === undefined)
        palette = d3.schemeCategory10;
      if(palette.length){
        //just make sure that palette has enough elements to provide
        //colour to each object type
        var paletteLength = palette.length;
        for(var i = 0; i < range.length - paletteLength; i++)
          palette.push(palette[i % paletteLength]);

        layer.colourValueScale = d3.scaleOrdinal()
          .domain(range)
          .range(palette)
          .unknown("black");      
        layer.colourScale = function(val) {
          return layer.colourValueScale(val);
        }
      } else {
        var pDomain = [0, 1];
        if(palette.domain)
          pDomain = palette.domain();

        layer.colourValueScale = d3.scalePoint()
          .domain(range)
          .range(pDomain);        
        layer.colourScale = function(val) {
          return val === null || val === undefined ? "#999" :
                  palette(layer.colourValueScale(val));
        }
      } 
    }

    layer.colourScale.domain = layer.colourValueScale.domain;
    
    if(layer.chart.showLegend() && layer.addColourScaleToLegend()){
      var tObj = {};
      tObj[layer.id + "_colour"] = layer.colourLegendTitle();
      layer.chart.legend.set_title(tObj);
      layer.addLegendBlock(layer.colourScale, "colour", layer.id + "_colour");
    }
  }

  layer.legendBlocks = [];

  layer.addLegendBlock = function(scale, type, id){
    layer.chart.legend.add_block(scale, type, id, layer);
    if(layer.legendBlocks.indexOf(id) == -1)
      layer.legendBlocks.push(id);

    return layer; 
  }

	layer.update = function() {
    
    layer.updateStarted = true;
    layer.updateElements();
    layer.updateElementStyle();
    layer.updateElementPosition();
    layer.updateStarted = false;

    return layer;
  };

  var get_mode = function() {
    if(layer.mode() == "default")
      return layer.nelements() > 2500 ? "canvas" : "svg";
    return layer.mode();
  }

	layer.put_static_content = function() {
    layer.g = layer.chart.svg.selectAll(".plotArea").append("g")
      .attr("class", "chart_g")
      .attr("id", layer.id);

    layer.canvas = layer.chart.container.append("canvas")
      .style("position", "absolute")
      .style("z-index", -5)
      .attr("id", layer.id);

    (get_mode() == "svg") ? layer.g.classed("active", true) : 
                            layer.canvas.classed("active", true);  

    //layer.chart.svg.select(".clickPanel").raise();
	};
  
  layer.updateElements = function() {
  };
  layer.updateElementStyle = function() {
    layer.resetColourScale();
  	layer.get_dresser(layer.g.selectAll(".data_element"));

    if(layer.get_marked().length != 0)
      layer.colourMarked();

  	return layer;
  };

  layer.updateElementPosition = function() {};
  layer.findElements = function() {return [];}; //return empty selection	
	layer.get_position = function(id) {return undefined;}

  //default hovering behaviour
  layer.on_mouseover(function(event, d){
    var rect = layer.chart.container.node().getBoundingClientRect(),
      pos = [d3.max([d3.min([event.clientX - rect.left, layer.chart.plotWidth()]), 0]), 
            d3.max([d3.min([event.clientY - rect.top, layer.chart.plotHeight()]), 0])]; 

    //change colour and class
    if(!this || !this.prev_time)
      d3.select(this)
        .attr("fill", function(d) {
          return d3.rgb(layer.get_colour(d)).darker(0.5);
        })
        .classed("hover", true);
    //show label
    layer.chart.container.selectAll(".inform").data([d])
        .style("left", (pos[0] + 10) + "px")
        .style("top", (pos[1] + 10) + "px")
        .select(".value")
          .html(layer.get_informText(d));  
    layer.chart.container.selectAll(".inform")
      .classed("hidden", false);
  });
  layer.on_mouseout(function(d){
    if(!this.propList){
      var mark = layer.get_marked().length > 0;

      d3.select(this)
        .attr("fill", function(d) {
          return mark ^ d3.select(this).classed("marked") ?
                  "#aaa": layer.get_colour(d);
        })
        .classed("hover", false);
    }
    layer.chart.container.selectAll(".inform")
      .classed("hidden", true);
  });

  layer.get_marked = function() {
    if(get_mode() == "svg") 
      return layer.g.selectAll(".data_element")
        .filter(function() {return d3.select(this).classed("marked")})
        .data()
    else
      return layer.marked;
  }

  layer.checkMode = function(){
    if((get_mode() == "svg") && (layer.canvas.classed("active"))) {
      layer.canvas.classed("active", false);
      layer.g.classed("active", true);
      layer.canvas.node().getContext("2d")
        .clearRect(0, 0, layer.chart.plotWidth(), layer.chart.plotHeight());

      if(layer.updateStarted)
        return true;
      else{     
        layer.update();
        //layer.mark(layer.marked.map(function(e) {return "p" + e.join("_-sep-_")}));
        //layer.marked = [];
        return false;
      }
    }
    if((get_mode() == "canvas") && layer.g.classed("active")){
      layer.canvas.classed("active", true);
      //layer.marked = layer.g.selectAll(".marked").data();
      layer.g.classed("active", false);
      while (layer.g.node().firstChild) 
        layer.g.node().removeChild(layer.g.node().firstChild);
    }
    return true;
  }

  layer.mark = function(marked, pe) {
    if(get_mode() == "svg") {
      if(marked == "__clear__"){
        layer.g.selectAll(".data_element.marked")
          .classed("marked", false);
        layer.g.selectAll(".data_element")
          .attr("opacity", 1);
        if(!pe)
          layer.on_marked();
        layer.colourMarked();

        return layer.chart;
      }
    
      //marked can be either an array of IDs or a selection
      if(!marked.empty){
        var obj = {};
        obj[layer.id] = marked;
        marked = layer.chart.get_elements(obj);
      }
    
      if(marked.empty())
        return layer.chart;

      if(marked.size() == 1)
        marked.classed("marked", !marked.classed("marked"))
      else
        marked.classed("marked", true);

      layer.colourMarked();
    } else {
      if(marked == "__clear__")
        layer.marked = []
      else {
        var ids = layer.marked.map(function(e) {return Array.isArray(e) ? e.join("_") : e}),
          ind;

        for(var i = 0; i < marked.length; i++){
          if(marked[i].join)
            ind = ids.indexOf(marked[i].join("_"))
          else
            ind = ids.indexOf(marked[i]);

          if(ind == -1)
            layer.marked.push(marked[i])
          else {
            if(marked.length == 1)
              layer.marked.splice(ind, 1);
          }
        }
      }
      layer.updateCanvas();      
    }
    if(!pe)
      layer.on_marked();
  }

  layer.colourMarked = function() {
    if(get_mode() == "svg") {
      var marked = {};
      marked[layer.id] = layer.get_marked();
      marked = layer.chart.get_elements(marked);
    
      if(marked.empty())
        layer.g.selectAll(".data_element")
          .attr("fill", function(d) {return layer.get_colour(d)});
      else {
        layer.g.selectAll(".data_element")
          .attr("fill", function(d) {
            return d3.select(this).classed("marked") ? layer.get_colour(d) : "#aaa";
          })
      }

    }
  }

	return layer;
}
