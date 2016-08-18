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
  var div = d3.select(pre.node().parentNode).insert( "div", "pre#"+id );
  pre.remove();
  div.html(
    '<table class="tiy"><tr>' +
    '  <td style="vertical-align:top"><textarea id="' + id + '">' +
         code +
    '  </textarea></td>' +
    '<td rowspan=2 style="vertical-align:top">' +
    '   <iframe id="' + id + '"></iframe></td></tr>' +
    '<tr><td style="text-align:right; vertical-align:bottom">' + 
    '  <button onclick=\'tiy.button_reset("' + id + '")\'>Reset</button>' +
    '  <button onclick=\'tiy.button_run("' + id + '")\'>Run</button>' +
    '</td></tr></table>'
  );
}
tiy.insert_box.count = 0;

tiy.make_boxes = function() {
  d3.selectAll("pre.tiy")
    .each( function( d, j, n ) { tiy.insert_box( d3.select(n[j]) ) } );
}

