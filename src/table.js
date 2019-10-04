import { chartBase } from "./chartBase";
import { check } from "./additionalFunctions";


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

export function input() {
  var chart = html()
    .add_property("type", "text", function(value) {
      if(["text", "radio", "checkbox", "button", "range"].indexOf(value) == -1)
        throw "Error in 'typeCheck' for property 'type'"+ 
        ": the supported types are 'text', 'radio', 'checkbox', 'button', 'range'."
        
      return value;        
    })
    .add_property("label", d => d, check("array_fun", "label"))
    .add_property("elementIds", [""], check("array", "elementIds"))
    .add_property("value", function() {}, check("array_fun", "value"))
//    .add_property("orientation", "vertical") may be later...
    .add_property("on_change", function() {});
  
  chart.value(d => chart.type() == "text" ? "" : d);
  chart.name = "n" + Math.random().toString(36).substring(5);
  chart.width(200);

  var inherited_put_static_content = chart.put_static_content;
  chart.put_static_content = function( element ) {
    inherited_put_static_content(element);
    chart.container
      .style("display", "grid")
      .style("grid-template-columns", "fit-content(500px) 1fr");
  }

  var get_value = function(element) {
    if(chart.type() == "button" || chart.type() == "radio")
      return element.value;

    if(chart.type() == "checkbox")
      return d3.select(element.parentNode)
        .selectAll("input")
          .nodes()
            .map(node => node.checked);

    var state = {};
    if(chart.type() == "range" || chart.type() == "text")
      d3.select(element.parentNode)
        .selectAll("input")
          .nodes()
            .forEach(function(node) {state[node.id] = node.value});
    return state;
  }

  var inherited_update = chart.update;
  chart.update = function( ) {
    inherited_update();

    chart.container
      .selectAll("p")
      .data([chart.title()])
      .enter()
        .append("p")
          .style("grid-row", 1)
          .style("grid-column", 1/3)
          .style("text-align", "center")
          .style("font-weight", "bold");;

    chart.container.selectAll("p")
      .text(d => d);
    var inputs = chart.container
      .selectAll("input")
        .data(chart.elementIds());
    var labels = chart.container
      .selectAll("label")
        .data(chart.elementIds());

    inputs.enter()
      .append("input")
        .attr("type", chart.type())
        .attr("name", chart.name)
        .style("grid-row", (d, i) => i + 2)
        .style("grid-column", (chart.type() == "text" || chart.type() ==  "range") ? 2 : 1)
        .attr("id", d => d)
        .attr("value", d => chart.type() == "radio" ? d : chart.get_value(d))
        .style("width", chart.type() == "text" ? "100%" : undefined)
        .on(chart.type() == "button" ? "click" : "change", function() {
          chart.get_on_change(get_value(this));
        });
    if(chart.type() == "radio") 
      chart.container
        .selectAll("input")
          .filter(function() {return this.id == chart.value()})
            .attr("checked", true);

    inputs.exit()
      .remove();
    if(chart.type() != "button") {
      labels.enter()
        .append("label")
          .attr("for", d => d)
          .text(d => chart.get_label(d))
          .style("grid-row", (d, i) => i + 2)
          .style("grid-column", (chart.type() == "text" || chart.type() ==  "range") ? 1 : 2);
      labels.exit()
        .remove();      
    }

    return chart;
  };



 return chart;

}