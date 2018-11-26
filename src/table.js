import { chartBase } from "./chartBase";

export function table() {

  var chart = chartBase()
    .add_property( "record", {} )

  chart.showPanel(false);

  var inherited_put_static_content = chart.put_static_content;
  chart.put_static_content = function( element ) {
    inherited_put_static_content(element);
    chart.svg.remove();
    chart.table = chart.container.append( "table" );
  }

  chart.updateSize = function(){
    chart.table
      .style("width", chart.width());
    chart.table.selectAll("td")
      .style("height", chart.height()/Object.keys(chart.record()).length);

    return chart;
  }

  var inherited_update = chart.update;
  chart.update = function( ) {
    inherited_update();
    var sel = chart.table.selectAll( "tr" )
      .data( Object.keys( chart.record() ) );
    sel.exit()
      .remove();  
    sel.enter().append( "tr" )
    .merge( sel )
      .html( function(k) { return "<td>" + k + "</td><td>" 
         + chart.get_record()[k] + "</td>" } )

    chart.table.selectAll("td")
      .style("border-bottom", "1px solid #ddd");

    return chart;
  };

  return chart;
}

//used in R/linked-charts
export function html() {
  var chart = chartBase()
    .add_property("content", "");

  chart.width(0)
    .height(0)
    .paddings({top: 5, left: 5, bottom: 5, right: 5})
    .showPanel(false);

  var inherited_put_static_content = chart.put_static_content;
  chart.put_static_content = function( element ) {
    inherited_put_static_content(element);
    chart.svg.remove();
    chart.container
      .style("overflow", "auto");
  }

  chart.updateSize = function(){
    chart.container
      .style("width", chart.width() != 0 ? chart.width() : undefined)
      .style("height", chart.height() != 0 ? chart.height() : undefined)
      .style("padding-top", chart.paddings().top)
      .style("padding-left", chart.paddings().left)
      .style("padding-right", chart.paddings().right)
      .style("padding-bottom", chart.paddings().bottom);

    return chart;
  }

   
  var inherited_update = chart.update;
  chart.update = function( ) {
    inherited_update();
    chart.container.node().innerHTML = chart.content();
    return chart;
  };

  return chart;
}
