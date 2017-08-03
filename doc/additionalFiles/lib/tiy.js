var tiy = {};
tiy.mirrors = {};
tiy.precode = {};

tiy.button_run = function( id ) {

  var rightDiv = d3.select( "div#"+id );
  rightDiv.selectAll("iframe").remove();
  var width = d3.select( "textarea#" + id ).attr( "width" ),
    height = d3.select( "textarea#" + id ).attr( "height" );
  var iframe = rightDiv.append("iframe")
    .style( "width", width + (width.includes("%") ? "" : "px"))
    .style( "height", height + (height.includes("%") ? "" : "px"))
    .attr( "frameBorder", "0" );
  iframe = iframe.node();
  var idocument = ( iframe.contentWindow || iframe.contentDocument ).document;
  var ihead = d3.select( idocument.head );
  var ibody = d3.select( idocument.body );
  
  var preload = d3.select( "textarea#" + id ).attr( "tiy-preload" ).split(";");
  var i = 0;
  while(i < preload.length){
    if(preload[i].includes(".css")){
      ihead.append("link")
        .attr("rel", "stylesheet")
        .attr("type", "text/css")
        .attr("href", preload[i]);
      preload.splice(i, 1);
    } else
      i++;
  }
  
  var loaded = 0,
    code = "\n" + tiy.mirrors[id].doc.getValue();


  ihead.selectAll("script").data(preload)
    .enter()
      .append("script")
        .attr("src", function(d){return d})
        .on("load", function(){
          loaded++;
          if(loaded == preload.length){
            ibody.append("script").text( tiy.precode[id] + code );
            if(d3.select( "table#" + id ).select(".tiy-result").attr( "fitWidth" ) == "true")
              d3.select(iframe)
                .style("width", ibody.node().scrollWidth + "px");
            if(d3.select( "table#" + id ).select(".tiy-result").attr( "fitHeight" ) == "true")
              d3.select(iframe)
                .style("height", ibody.node().scrollHeight + "px");
          }
        });

  if(d3.select( "textarea#" + id ).attr( "showCode" ) == "false")
     d3.select("table#"+id).selectAll("tr")
      .filter(function() {return !d3.select(this).classed("tiy-result") &&
                                  !d3.select(this).classed("tiy-text")})
        .remove();
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
  var loadOnStart = pre.attr( "loadOnStart" );
  var showCode = pre.attr( "showCode" );
  var fitWidth = pre.attr( "fitWidth" );
  var fitHeight = pre.attr( "fitHeight" );
  var width = pre.attr( "width" );
  var subscr = pre.attr( "subscr" );


  if( preloadAttr == null ) 
    preloadAttr = "";
  if( loadOnStart == null )
    loadOnStart = true;
  if( showCode == null )
    showCode = true;
  if( fitWidth == null)
    fitWidth = false;
  if( fitHeight == null )
    fitHeight = false;
  if( width == null)
    width = "100%";
  if( subscr == null )
    subscr = "";
  // Default height. (Maybe I should get this from CSS.)
  if( height == null )
    height = 150;

  if(!showCode) loadOnStart = true;

  // Remove pre, add the table
  pre.remove();
  table
    .attr( "class", "tiy" )
    .attr( "id", id );

  if(code.includes("//-----Precode end-----")){
    tiy.precode[id] = code.split("//-----Precode end-----")[0];
    code = code.split("//-----Precode end-----")[1];
  } else
    tiy.precode[id] = "";

  var tableHTML = 
    '<tr>' +
    '  <td style="vertical-align:top; height:100%; position:relative" class="tiy-code">' +
    '     <textarea class="tiy-leftbox" style="height:100%" id="' + id + '" tiy-preload="' + preloadAttr + '" ' + 
            'showCode="' + showCode + '" width="' + width + '" height="' + height + '">' +
             code +
    '     </textarea>' +
    '  </td>' +
    '</tr>' + 
    '<tr style="vertical-align:top" class="tiy-result" fitHeight="' + fitHeight + '" fitWidth="' + fitWidth + '">' +
    '  </td>' +
    '  <td class="tiy-rightbox" style="vertical-align:top">' +
    '     <div id="'+id+'"></div>' +
    '  </td>' +
    '</tr>' +
    '<tr class="tiy-text"><td>' +
    '  <div class="tiy-text">' + subscr + '</div>' +
    '</td></tr>';

  // Fill the table
  table.html(tableHTML);

  tiy.mirrors[id] = CodeMirror.fromTextArea(d3.select("textarea#" + id).node(),
                      {lineNumbers: true, 
                        tabSize: 2,
                        lineWrapping: true,
                        theme: "mdn-like"});

      var x = table.select(".tiy-code").select(".CodeMirror")
        .node().getBoundingClientRect().right - 15;
    
      table.select(".tiy-code")
        .selectAll("img").data(["reset", "run"]).enter()
          .append("img")
          .style("position", "absolute")
          .style("z-index", 10)
          .style("right", function(d){
            return (d == "run" ? 25 : 60) + "px"; 
          })
          .style("top", "15px")
          .attr("width", "30px")
          .attr("height", "30px")
          .on("click", function(d) {tiy["button_" + d](id);})
          .on("mouseover", function(d){
            d3.select(this)
              .attr("src", function(d){
                return "lib/src/" + d + "_hover.svg"
              });
          })
          .on("mouseout", function(d){
            d3.select(this)
              .attr("src", function(d){
                return "lib/src/" + d + ".svg"
              });            
          })
          .attr("src", function(d){
            return "lib/src/" + d + ".svg";
          })
          .attr("title", function(d){
            return d == "run" ? "Run code" : "Reset code";
          });
    
      if(loadOnStart)
        tiy.button_run(id);
    }
    tiy.insert_box.count = 0;
    
  tiy.make_boxes = function() {
     d3.selectAll("pre.tiy")
      .each( function( d, j, n ) { tiy.insert_box( d3.select(n[j]) ) } );
}

