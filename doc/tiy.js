var tiy = {};

tiy.button_run = function( id ) {
  var iframe = d3.select( "iframe#" + id ).node();
  var idocument = ( iframe.contentWindow || iframe.contentDocument ).document;
  var ihead = d3.select( idocument.head );
  var ibody = d3.select( idocument.body );
  ibody.html("");
  ihead.html("");
  ihead.append("script").attr("src", "https://d3js.org/d3.v4.min.js");
  window.onload( function () {
      ibody.append("script").text( d3.select( "textarea#" + id ).property('value') );
    } );
}

tiy.button_reset = function( id ) {
  var textarea = d3.select( "textarea#" + id );
  textarea.property( "value", textarea.text() );
}

tiy.insert_box = function( pre ) {
  var id = "TIY_" + tiy.insert_box.count;
  pre.attr( "id", id );
  tiy.insert_box.count += 1;
  var code = pre.text();
  var table = d3.select(pre.node().parentNode).insert( "table", "pre#"+id );
  var height = pre.attr( "height" );
  if( height == null )
    height = 300;
  pre.remove();
  table.attr( "class", "tiy" );
  table.style( "height", height );
  table.html(
    '<tr>' +
    '  <td style="vertical-align:top; height:100%">' +
    '     <textarea style="height:100%" id="' + id + '">' +
             code +
    '     </textarea>' +
    '  </td>' +
    '  <td rowspan=2 style="vertical-align:top">' +
    '     <iframe id="' + id + '" height="100%"></iframe>' +
    '  </td>' +
    '</tr>' +
    '<tr><td style="text-align:right; vertical-align:bottom">' + 
    '  <button onclick=\'tiy.button_reset("' + id + '")\'>Reset</button>' +
    '  <button onclick=\'tiy.button_run("' + id + '")\'>Run</button>' +
    '</td></tr>'
  );
}
tiy.insert_box.count = 0;

tiy.make_boxes = function() {
  d3.selectAll("pre.tiy")
    .each( function( d, j, n ) { tiy.insert_box( d3.select(n[j]) ) } );
}

