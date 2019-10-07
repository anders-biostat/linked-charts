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

    chart.container
      .select("table")
        .remove();
    chart.container
      .select("div")
        .remove();
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

   
  chart.inherited_update = chart.update;
  chart.update = function( ) {
    chart.inherited_update();

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
    .add_property("nelements", 1, check("number_nonneg", "nelements"))
    .add_property("elementIds", undefined, check("array", "elementIds"))
    .add_property("value", function() {}, check("array_fun", "value"))
    .add_property("min", 0, check("array_fun", "min")) //all this stuff is for ranges
    .add_property("max", 100, check("array_fun", "max"))
    .add_property("step", 1, check("array_fun", "step"))
//    .add_property("orientation", "vertical") may be later...
    .add_property("on_change", function() {});
  
  //if number of elements is set, define their IDs
  chart.wrapSetter("nelements", function(oldSetter){
    return function() {
      chart.get_elementIds = function(){
        return d3.range(oldSetter());
      };
      return oldSetter.apply(chart, arguments);
    }
  });
  //if element IDs are set, define their number
  chart.wrapSetter("elementIds", function(oldSetter){
    return function() {
      chart.get_nelements = function(){
        return oldSetter().length;
      };
      return oldSetter.apply(chart, arguments);
    }
  });

  chart.value(d => {switch(chart.type()) {
      case "text":
        return "";
      case "button":
        return d;
      case "range":
        return undefined;
      case "radio":
        return undefined;
      case "checkbox":
        return false;
    }
  });
  chart.name = "n" + Math.random().toString(36).substring(5);
  chart.width(200);

  var inherited_put_static_content = chart.put_static_content;
  chart.put_static_content = function( element ) {
    inherited_put_static_content(element);
    chart.container
      .style("display", "grid")
      .style("grid-template-columns", "fit-content(500px) 1fr fit-content(20px)")
      .style("column-gap", "9px")
      .append("p")
        .style("grid-row", 1)
        .style("grid-column", "1/4")
        .style("text-align", "center")
        .style("font-weight", "bold")
        .attr("id", "title");

    return chart;
  }

  chart.updateTitle = function() {
    chart.container
      .select("#title")
      .text(chart.title());

    return chart;
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
            .forEach(function(node) {state[node.id] = (+node.value ? +node.value : node.value)});
    return state;
  }

  chart.updateElements = function() {
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
        .attr("id", d => "in_" + d)
        .attr("value", d => chart.type() == "radio" ? d : undefined)
        .style("width", chart.type() == "text" ? "100%" : undefined)
        .on(chart.type() == "button" ? "click" : "change", function() {
          chart.get_on_change(get_value(this));
        });
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
    } else {
      chart.container
        .selectAll("input")
          .attr("value", d => chart.get_label(d))
    }
    
    if(chart.type() == "range") {
      var cvs = chart.container
        .selectAll(".currentValue")
          .data(chart.elementIds());
      cvs.enter()
        .append("p")
          .attr("class", "currentValue")
          .attr("id", d => "in_" + d)
          .style("grid-row", (d, i) => i + 2)
          .style("grid-column", 3)
          .style("margin-top", 0)
          .style("margin-bottom", 0);
      cvs.exit()
        .remove();
      chart.container
        .selectAll("input")
          .on("input", function(d) {
            chart.container
              .select(".currentValue#" + this.id)
                .text(this.value);
          })
    } else {
      chart.container
        .selectAll(".currentValue")
          .remove();
    }

    return chart;
  }

  chart.updateState = function() {
    if(chart.type() == "radio") 
      chart.container
        .selectAll("input")
          .filter(function() {return this.id == chart.value()})
            .attr("checked", true);

    if(chart.type() == "checkbox")
      chart.container
        .selectAll("input")
          .attr("checked", d => chart.get_value(d) ? "true" : undefined);

    if(chart.type() == "text")
      chart.container
        .selectAll("input")
          .attr("value", d => chart.get_value(d));

    if(chart.type() == "range") {
      chart.container
        .selectAll("input")
          .attr("max", d => chart.get_max(d))
          .attr("min", d => chart.get_min(d))
          .attr("step", d => chart.get_step(d))
          .nodes()
            .forEach((el, i) => {el.value = chart.get_value(chart.elementIds()[i])});
      chart.container
        .selectAll(".currentValue")
          .text(d => chart.get_value(d));      
    } 

    return chart;
  }

  chart.update = function( ) {
    chart.inherited_update();

    chart.updateElements();
    chart.updateState();
      
    return chart;
  };

 return chart;

}