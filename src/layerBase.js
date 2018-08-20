import { base } from "./base";
import { getEuclideanDistance, check } from "./additionalFunctions";

export function layerBase(id) {
	
	var layer = base()
    .add_property("nelements", undefined, check("number_nonneg", "width"))
    .add_property("elementIds", undefined, check("array", "elementIds"))
    .add_property("elementLabel", function(i) {return i;}, check("array_fun", "elementLabel"))
		.add_property("elementMouseOver", function() {})
		.add_property("elementMouseOut", function() {})
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
    .add_property("colourLegendTitle", function(){return "colour_" + layer.id})
    .add_property("opacity", 1, check("number_nonneg", "opacity"))
		.add_property("dresser", function() {})
    .add_property("informText", function(id) {
      return "<b>ID:</b> " + layer.get_elementLabel(id);
    });

  layer.propList = layer.propList.concat(["updateElementStyle", "updateElements", "updateElementPosition"]);
	layer.id = id;

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
    var ids = layer.elementIds();
    if(ids.length == 0)
      return;
    //if(layer.get_colourValue(ids[0]) !== undefined){
      var range = [];
      for(var i = 0 ; i < ids.length; i++)
        //colour range can contain only unique values
        if(range.indexOf(layer.get_colourValue(ids[i])) == -1)
          range.push(layer.get_colourValue(ids[i]));

      var undi = range.indexOf(undefined);
      if(undi > -1)
        range.splice(undi, 1);

      return range;
    //}
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
          l.updateElementStyle();
        }

      }
    }

    //first of all, let's check if the colour scale supposed to be
    //categorical or continuous
    var allNum = true;
    for(var i = 0; i < range.length; i++)
      allNum = allNum && typeof range[i] === "number";
    if(allNum)
      range.sort(function(a, b) {return a - b});
    var palette = layer.palette();    
    
    if(allNum){
      //the scale is continuous
      //Now look at the palette
      if(palette == undefined)
        if(d3.interpolateSpectral)
          palette = d3.interpolateSpectral
        else
          palette = ["red", "yellow", "green", "blue"];
      //if palette is an array of colors, make a linear colour scale using all
      //values of the palette as intermideate points
      if(palette.splice){
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
          return palette(layer.colourValueScale(val));
        }
      }
    } else {
      //the colour scale is categorical
      range = range.sort()
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
          return palette(layer.colourValueScale(val));
        }
      } 
    }

    layer.colourScale.domain = layer.colourValueScale.domain;
    
    if(layer.chart.showLegend() && layer.addColourScaleToLegend())
      layer.addLegendBlock(layer.colourScale, "colour", layer.colourLegendTitle());
  }

  layer.legendBlocks = [];

  layer.addLegendBlock = function(scale, type, id){
    layer.chart.legend.add_block(scale, type, id, layer);
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

  	return layer;
  };

  layer.updateElementPosition = function() {};
  layer.findElements = function() {return [];}; //return empty selection	
	layer.get_position = function(id) {return undefined;}

  //default hovering behaviour
  layer.elementMouseOver(function(d){
    var rect = layer.chart.container.node().getBoundingClientRect(),
      pos = [d3.max([d3.min([d3.event.clientX - rect.left, layer.chart.plotWidth()]), 0]), 
            d3.max([d3.min([d3.event.clientY - rect.top, layer.chart.plotHeight()]), 0])]; 

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
  layer.elementMouseOut(function(d){
    if(!this.propList)
      d3.select(this)
        .attr("fill", function(d) {
          return layer.get_colour(d);
        })
        .classed("hover", false);
    layer.chart.container.selectAll(".inform")
      .classed("hidden", true);
  });

  layer.checkMode = function(){
    if((get_mode() == "svg") && (layer.canvas.classed("active"))) {
      layer.canvas.classed("active", false);
      layer.g.classed("active", true);
      lyaer.canvas.node().getContext("2d")
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


	return layer;
}
