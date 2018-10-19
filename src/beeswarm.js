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
    inherited_updateElementPosition();

    var orientation = (layer.valueAxis() == "y" ? "vertical" : "horizontal");
    var swarm = d3.beeswarm()
      .data(layer.elementIds().sort(function(a, b){
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

    if(layer.chart.transitionDuration() > 0 && !layer.chart.transitionOff){
      layer.g.selectAll(".data_element").transition("elementPosition")
        .attr("transform", function(d){
          if(layer.valueAxis() == "x")
            return "translate(" + layer.chart.axes.scale_x( layer.get_x(d) ) +
                    ", " + swarm.res[d].x + ")"
          else
          return "translate(" + swarm.res[d].y +
                  ", " + layer.chart.axes.scale_y( layer.get_y(d) ) + ")";
        });
    } else {
      layer.g.selectAll(".data_element")
        .attr("transform", function(d){
          if(layer.valueAxis() == "x")
            return "translate(" + layer.chart.axes.scale_x( layer.get_x(d) ) +
                    ", " + swarm.res[d].x + ")"
          else
          return "translate(" + swarm.res[d].y +
                  ", " + layer.chart.axes.scale_y( layer.get_y(d) ) + ")";
        });
    }

  }

  return chart;
}