export function beeswarm(id, chart) {

	if(chart === undefined)
		chart = lc.axisChart();
	if(id === undefined)
		id = "layer" + chart.get_nlayers();

  lc.scatterChart(id, chart);
  var layer = chart.get_layer(id);
  layer.add_property("valueAxis", "y")
    .add_property("x_raw")
    .add_property("y_raw");
	chart.syncProperties(layer);
  layer.type = "beeswarm";

  var inherited_updatePointLocation = layer.updatePointLocation;
  layer.updatePointLocation = function(){
    inherited_updatePointLocation();

    var orientation = (layer.valueAxis() == "y" ? "vertical" : "horizontal");
    var swarm = d3.beeswarm()
      .data(layer.dataIds().sort(function(a, b){
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

    for(var i = 0; i < swarm.length; i++)
      swarm[swarm[i].datum] = swarm[i];

    if(layer.chart.transitionDuration() > 0 && !layer.chart.transitionOff){
      layer.g.selectAll(".data_point").transition("pointLocation")
        .attr("transform", function(d){
          if(layer.valueAxis() == "x")
            return "translate(" + layer.chart.axes.scale_x( layer.get_x(d) ) +
                    ", " + swarm[d].x + ")"
          else
          return "translate(" + swarm[d].y +
                  ", " + layer.chart.axes.scale_y( layer.get_y(d) ) + ")";
        });
    } else {
      layer.g.selectAll(".data_point")
        .attr("transform", function(d){
          if(layer.valueAxis() == "x")
            return "translate(" + layer.chart.axes.scale_x( layer.get_x(d) ) +
                    ", " + swarm[d].x + ")"
          else
          return "translate(" + swarm[d].y +
                  ", " + layer.chart.axes.scale_y( layer.get_y(d) ) + ")";
        });
    }

  }

  return chart;
}