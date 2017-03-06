import { base } from "./base";
import { getEuclideanDistance } from "./additionalFunctions";

export function layerBase(id) {
	
	var layer = base()
    .add_property("npoints")
    .add_property("dataIds")
		.add_property("pointMouseOver", function() {})
		.add_property("pointMouseOut", function() {})
		.add_property("on_click", function() {})
		.add_property("layerDomainX")
		.add_property("layerDomainY")
		.add_property("contScaleX", true)
		.add_property("contScaleY", true)
    .add_property("colour", function(id) {
      return layer.colourScale(layer.get_colourValue(id));
    })
    .add_property("palette")
    .add_property("colourRange")
    .add_property("colourValue", "black")
		.add_property("dresser", function(){});

	layer.id = id;

  layer.dataIds( "_override_", "npoints", function(){
    return layer.get_dataIds().length;
  });
  layer.npoints( "_override_", "dataIds", function() {
    return d3.range( layer.get_npoints() );
  });

  layer.colourRange(function() {
    var ids = layer.get_dataIds();
    var range = [];
    for(var i = 0 ; i < ids.length; i++)
      //colour range can contain only unique values
      if(range.indexOf(layer.get_colourValue(ids[i])) == -1)
        range.push(layer.get_colourValue(ids[i]));

    return range;
  });

  layer.resetColourScale = function() {
    var range = layer.get_colourRange();

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
      if(layer.get_palette().length){
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
  }


	layer.update = function() {
    
    layer.updatePoints();
    layer.updatePointStyle();
    layer.updatePointLocation();

    return layer;
  };

	layer.put_static_content = function() {
    layer.g = layer.chart.svg.append("g")
      .attr("class", "chart_g")
      .attr("id", layer.id)
      .attr("clip-path", "url(#viewBox)");
    //layer.chart.svg.select(".clickPanel").raise();
	};
	
	layer.afterUpdate = function(){};
  
  layer.updateSize = function(){
    if(typeof layer.chart.transition !== "undefined"){
      layer.g.transition(layer.chart.transition)
        .attr("transform", "translate(" + 
          layer.chart.get_margin().left + ", " +
          layer.chart.get_margin().top + ")");
      layer.g.selectAll(".data_point")
    } else {
      layer.g
        .attr("transform", "translate(" + 
          layer.chart.get_margin().left + ", " +
          layer.chart.get_margin().top + ")");
    }
    return layer;
  }
  layer.updatePoints = function() {
  };
  layer.updatePointStyle = function() {
    layer.resetColourScale();
  	layer.get_dresser(layer.g.selectAll(".data_point"));
  	return layer;
  };
  layer.updatePointLocation = function() {};
  layer.findPoints = function() {return layer.g.select("___");}; //return empty selection	
	
	return layer;
}
