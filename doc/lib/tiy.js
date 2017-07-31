var tiy = {};
tiy.mirrors = {};

tiy.button_run = function( id ) {

  var rightDiv = d3.select( "div#"+id );
  rightDiv.selectAll("iframe").remove();
  var iframe = rightDiv.append("iframe")
    .style( "width", "100%" )
    .style( "height", d3.select("table#"+id).style("height") )
    .attr( "frameBorder", "0" );
  iframe = iframe.node();
  var idocument = ( iframe.contentWindow || iframe.contentDocument ).document;
  var ihead = d3.select( idocument.head );
  var ibody = d3.select( idocument.body );
  console.log( tiy.parse_preload( d3.select( "textarea#" + id ).attr( "tiy-preload" ) ) );
  ihead.append("script").attr("src", "https://d3js.org/d3.v4.min.js")
    .on( "load", function () {
      ibody.append("script").text( "\n" + tiy.mirrors[id].doc.getValue() );
    } );
}

tiy.button_reset = function( id ) {
  var textarea = d3.select( "textarea#" + id );
  tiy.mirrors[id].doc.setValue(textarea.text());
}

tiy.parse_preload = function( preloadString ) {
  if( preloadString == null || preloadString == "") {
    return []; 
  } 
  try {
     return preloadString.split(";").map(function(x) { 
        var a = x.split(":"); 
        return [ a[0], a.slice(1).join(":") ] } );
  } catch( e ) {
     throw "Cannot parse 'tiy-preload' attribute: " + preloadString;
  }
}

tiy.insert_box = function( pre ) {
  
  // The box ID is simply made by counting
  var id = "TIY_" + tiy.insert_box.count;
  pre.attr( "id", id );
  tiy.insert_box.count += 1;

  // Get everything we need from 'pre' before removing the node
  var code = pre.text();
  var table = d3.select(pre.node().parentNode).insert( "table", "pre#"+id );
  var height = pre.attr( "height" );
  var preloadAttr = pre.attr( "tiy-preload" );
  if( preloadAttr == null ) 
    preloadAttr = "";

  // Default height. (Maybe I should get this from CSS.)
  //if( height == null )
  //  height = 300;

  // Remove pre, add the table
  pre.remove();
  table
    .attr( "class", "tiy" )
    .style( "height", height ).
    attr( "id", id );

  // Fill the table
  table.html(
    '<tr>' +
    '  <td style="vertical-align:top; height:100%">' +
    '     <textarea class="tiy-leftbox" style="height:100%" id="' + id + '" tiy-preload="' + preloadAttr + '">' +
             code +
    '     </textarea>' +
    '  </td>' +
    '  <td rowspan=2 class="tiy-rightbox" style="vertical-align:top">' +
    '     <div id="'+id+'"></div>' +
    '  </td>' +
    '</tr>' +
    '<tr><td style="text-align:right; vertical-align:bottom">' + 
    '  <button onclick=\'tiy.button_reset("' + id + '")\'>Reset</button>' +
    '  <button onclick=\'tiy.button_run("' + id + '")\'>Run</button>' +
    '</td></tr>'
  );
  tiy.mirrors[id] = CodeMirror.fromTextArea(d3.select("textarea#" + id).node(),
                      {lineNumbers: true, 
                        tabSize: 2});
}
tiy.insert_box.count = 0;

tiy.make_boxes = function() {
  d3.selectAll("pre.tiy")
    .each( function( d, j, n ) { tiy.insert_box( d3.select(n[j]) ) } );
}

