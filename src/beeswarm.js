import { axesChart } from "./axesChart";
import { scatter } from "./scatter";

export function beeswarm(id, chart) {

	if(chart === undefined)
		chart = axesChart();
	if(id === undefined)
		id = "layer" + chart.get_nlayers();

  scatter(id, chart);
  
  var layer = chart.get_layer(id);
  layer.add_property("valueAxis", "y", function(value){
    if(value != "x" && value != "y" && typeof value != "function")
      throw "Error in 'typeCheck' for 'valueAxis': axis name" +
            "should be 'x' or 'y'";
    return value;
  });
	chart.syncProperties(layer);
  layer.type = "beeswarm";

  var inherited_updateElementPosition = layer.updateElementPosition;
  layer.updateElementPosition = function(){
    var orientation = (layer.valueAxis() == "y" ? "vertical" : "horizontal");
    var swarm = d3.beeswarm()
      .data(layer.elementIds().filter(function(el) {
        var axis = layer.valueAxis() == "x" ? "y" : "x";
        return layer.chart.axes["scale_" + axis](layer["get_" + axis](el)) !== undefined
      })
        .sort(function(a, b){
          return layer["get_" + layer.valueAxis()](a) - layer["get_" + layer.valueAxis()](b); 
        }))
      .distributeOn(function(d){
        return layer.chart.axes["scale_" + layer.valueAxis()](layer["get_" + layer.valueAxis()](d));
      })
      .axis(function(d){
        if(layer.valueAxis() == "x")
          return layer.chart.axes.scale_y(layer.get_y(d))
        else
          return layer.chart.axes.scale_x(layer.get_x(d))
      })
      .radius(layer.size())
      .arrange();

    swarm.res = {};
    for(var i = 0; i < swarm.length; i++)
      swarm.res[swarm[i].datum] = swarm[i];

    if(layer.valueAxis() == "y")
      layer.get_scaledShiftX = function(id) {
        return swarm.res[id] ? swarm.res[id].axis - swarm.res[id].y : -10;
      }
    else
      layer.get_scaledShiftY = function(id) {
        return swarm.res[id] ?swarm.res[id].axis - swarm.res[id].y : -10;
      };

    return inherited_updateElementPosition();
  }

  return chart;
}