---
lang: "js"
---

Tables
======

The most simple type of charts, tables are designed to show content of any given JavaScript oject
(it can correctly display only properties with string or numeric values). The resulting table has 
two columns: one contains names of the properties and the other holds their values. This type of
charts has only one property ([record]()) that gets an object to display (besides some standart
ones like [width](chart) and [height]()). It doesn't have any interactivity and is generally
use, for example, to show some information about the clicked cell or point.

<pre class = "tiy" fitHeight = "true" 
  tiy-preload="../../src/linked-charts.min.js;../../src/data/inputdata.js;../../src/linked-charts.css">
d3.select("body").append("p")
	.text("Enter number form 0 to " + (inputData.length - 1));
d3.select("body")
	.append("input")
		.attr("type", "text")
		.attr("id", "index")
		.attr("value", 0)
		.attr("onchange", "update();");

//-----Precode end-----
var ind = 0;

var update = function() {
	console
	ind = document.getElementById("index").value;
	table.update();
}

var table = lc.table()
  .record(function() {return inputData[ind];})
  .place();
</pre>