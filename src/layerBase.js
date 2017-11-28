import { base } from "./base";
import { getEuclideanDistance } from "./additionalFunctions";

export function layerBase(id) {
	
	var layer = base()
    .add_property("nelements")
    .add_property("elementIds")
    .add_property("elementLabel", function(i) {return i;})
		.add_property("elementMouseOver", function() {})
		.add_property("elementMouseOut", function() {})
		.add_property("on_click", function() {})
		.add_property("layerDomainX")
		.add_property("layerDomainY")
		.add_property("contScaleX", true)
		.add_property("contScaleY", true)
    .add_property("colour", function(id) {
      return layer.colourScale(layer.get_colourValue(id));
    })
    .add_property("addColourScaleToLegend", true)
    .add_property("palette")
    .add_property("colourDomain")
    .add_property("colourValue", undefined)
    .add_property("colourLegendTitle", function(){return "colour_" + layer.id})
    .add_property("opacity", 1)
		.add_property("dresser", function() {})
    .add_property("informText", function(id) {
      return "<b>ID:</b> " + layer.get_elementLabel(id);
    });

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
    if(layer.get_colourValue(ids[0]) !== undefined){
      var range = [];
      for(var i = 0 ; i < ids.length; i++)
        //colour range can contain only unique values
        if(range.indexOf(layer.get_colourValue(ids[i])) == -1)
          range.push(layer.get_colourValue(ids[i]));

      return range;
    }
  });

  layer.colourScale = function(){
    return "black";
  }

  layer.resetColourScale = function() {
    var range = layer.colourDomain();
    if(range === undefined)
      return;
    //first of all, let's check if the colour scale supposed to be
    //categorical or continuous
    var allNum = true;
    for(var i = 0; i < range.length; i++)
      allNum = allNum && typeof range[i] === "number";
    if(allNum)
      range.sort(function(a, b) {return a - b});
    if(allNum){
      //the scale is continuous
      //Now look at the palette
      if(typeof layer.get_palette() == "undefined")
        if(d3.interpolateSpectral)
          layer.palette(d3.interpolateSpectral)
        else
          layer.palette(["red", "yellow", "green", "blue"]);
      //if palette is an array of colors, make a linear colour scale using all
      //values of the palette as intermideate points
      if(layer.get_palette().splice){
        var palette = layer.get_palette();
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
        if(layer.get_palette().domain)
          pDomain = layer.get_palette().domain();

        layer.colourValueScale = d3.scaleLinear()
          .domain(range)
          .range(pDomain);
        layer.colourScale = function(val) {
          return layer.get_palette(layer.colourValueScale(val));
        }
      }
    } else {
      //the colour scale is categorical
      if(typeof layer.get_palette() === "undefined")
        layer.palette(["#000"].concat(d3.schemeCategory10));
      if(layer.get_palette().length){
        var palette = layer.get_palette();
        //just make sure that palette has enough elements to provide
        //colour to each object type
        var paletteLength = palette.length;
        for(var i = 0; i < range.length - paletteLength; i++)
          palette.push(palette[i % paletteLength]);

        layer.colourValueScale = d3.scaleOrdinal()
          .domain(range)
          .range(palette);      
        layer.colourScale = function(val) {
          return layer.colourValueScale(val);
        }
      } else {
        var pDomain = [0, 1];
        if(layer.get_palette().domain)
          pDomain = layer.get_palette().domain();

        layer.colourValueScale = d3.scalePoint()
          .domain(range)
          .range(pDomain);        
        layer.colourScale = function(val) {
          return layer.get_palette(layer.colourValueScale(val));
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
    
    layer.updateElements();
    layer.updateElementStyle();
    layer.updateElementPosition();

    return layer;
  };

	layer.put_static_content = function() {
    layer.g = layer.chart.svg.selectAll(".plotArea").append("g")
      .attr("class", "chart_g")
      .attr("id", layer.id)
      .attr("clip-path", "url(#" + layer.chart.svg.selectAll("clipPath").attr("id") + ")");
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
  layer.findElements = function() {return d3.select("_______");}; //return empty selection	
	layer.get_position = function(id) {return undefined;}

  //default hovering behaviour
  layer.elementMouseOver(function(d){
    var pos = d3.mouse(layer.chart.container.node());
    //change colour and class
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
    d3.select(this)
      .attr("fill", function(d) {
        return layer.get_colour(d);
      })
      .classed("hover", false);
    layer.chart.container.selectAll(".inform")
      .classed("hidden", true);
  });

	return layer;
}
