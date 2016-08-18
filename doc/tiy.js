function tiy_button_run( id ) {
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

function tiy_button_reset( id ) {
  var textarea = d3.select( "textarea#" + id );
  textarea.property( "value", textarea.text() );
}

function tiy_insert_box( pre ) {
  console.log( pre );
  var id = "TIY_" + tiy_insert_box.count;
  tiy_insert_box.count += 1;
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
    '  <button onclick=\'tiy_button_reset("' + id + '")\'>Reset</button>' +
    '  <button onclick=\'tiy_button_run("' + id + '")\'>Run</button>' +
    '</td></tr></table>'
  );
}
tiy_insert_box.count = 0;

function tiy_make_boxes() {
  d3.selectAll("pre.tiy")
    .each( function( d, j, n ) { tiy_insert_box( d3.select(n[j]) ) } );
}

