import { chartBase } from "./chartBase";

export function simpleTable() {

  obj = d3.chartBase()
    .add_property( "record", {} )

  obj.put_static_content = function( element ) {
    obj.table = element.append( "table" )
      .attr( "border", 1 );
  }

  obj.update = function( ) {

    var sel = obj.table.selectAll( "tr" )
      .data( Object.keys( obj.get_record() ) );
    sel.exit()
      .remove();  
    sel.enter().append( "tr" )
    .merge( sel )
      .html( function(k) { return "<td>" + k + "</td><td>" 
         + obj.get_record()[k] + "</td>" } )

    return obj;
  };

  return obj;
}
