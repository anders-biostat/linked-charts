import { chartBase } from "./chartBase";

export function simpleTable() {

  var chart = chartBase()
    .add_property( "record", {} )

  var inherited_put_static_content = chart.put_static_content;
  chart.put_static_content = function( element ) {
    inherited_put_static_content(element);
    chart.table = chart.container.append( "table" )
      .attr( "border", 1 );
  }

  var inherited_update = chart.update;
  chart.update = function( ) {

    inherited_update();
    var sel = chart.table.selectAll( "tr" )
      .data( Object.keys( obj.get_record() ) );
    sel.exit()
      .remove();  
    sel.enter().append( "tr" )
    .merge( sel )
      .html( function(k) { return "<td>" + k + "</td><td>" 
         + chart.get_record()[k] + "</td>" } )

    return chart;
  };

  return chart;
}
