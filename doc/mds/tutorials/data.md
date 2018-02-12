Data input
==========

To work with the _linked-charts_ library you firt need to get your data as one or several JavaScript
variables. There are no specifict requirements for the data format, provided that you know how to
get or calculate each of the requested values. The main trick is to make your web page see the data,
and here we describe several ways of doing it.

## Importing data

The problem of reading in data is important not only for the _linked-charts_ library, but also
for any JavaScript applications, made for visualising or processing big data sets. Here, we will
show examples of the approaches, that we consider to be the best ones, but clearly you can use
any other tutorial like, for example [this](http://learnjsdata.com/read_data.html) one. It
doesn't matter, how you got your data in for the _linked-charts_. 

### Insert data in the code

The easiest, but may be not the most beatufil way, is just to convert your data
into [JSON](#JSON) format and then copy-paste the result into your code like this
<pre class = "tiy" runnable="false">
var data = PASTE_YOUR_DATA_HERE;
</pre>
After that you can alredy access the <code>data</code> variable as an
ordinary JavaScript object (check [this](../examples/simpleExample.html) example).

This approach is the most simple, but requires from you to make the convertion
and copy-pasting each time, your data changes. It also overburdens your code with
data. Yet it's the best option if you want your plots to be on one self-suffcient page
that is easy to send, can work without any Internet connection and doesn't depend on
any external files.

It is also possible to insert content of a CSV file inside your code, but this will
still require some processing as described [bellow](#CSV) and you will need to
mind the quotation marks, since all your data will be at first treated as a single
string.

If you don't mind having several files, you can also have the data inside a .js file
that is linked to your page.

### Reading from URL

JavaScript also have functionality to read external files, if they are located on
some server. Some nice ways to do that are offered by the [d3](https://d3js.org/) library.
[d3-request](https://github.com/d3/d3-request) module includes functions to load and
parse [HTML](https://github.com/d3/d3-request#html), [JSON](https://github.com/d3/d3-request#json),
[TSV](https://github.com/d3/d3-request#tsv), [XML](https://github.com/d3/d3-request#xml) and
[plain text](https://github.com/d3/d3-request#text) files. It also has some in-built 
functionality to parse [CSV](https://github.com/d3/d3-dsv#csvParse) and any other
[delimiter-separated](https://github.com/d3/d3-dsv#dsvFormat) files.

We won't go deep into the ways of using these functions, since it is is already
described on the d3 web-page. Instead we will just show and explain examples of 
generating a plot for the Iris dataset, reading the data from an external 
[JSON](../src/data/iris.json) file and a [CSV](../src/data/iris.csv) file.

<pre class = "tiy" height=500 
  tiy-preload="../src/linked-charts.min.js;../src/linked-charts.css">
d3.json("https://kloivenn.github.io/linked-charts/src/data/iris.json",
  function(data){
    var scatterplot = lc.scatter()
      .x(function(k) {return data[k].sepalLength})
      .y(function(k) {return data[k].petalLength})
      .size(function(k) {return data[k].sepalWidth * 2})
      .colourValue(function(k) {return data[k].petalWidth})
      .symbolValue(function(k) {return data[k].species})
      .place();
  }
);
</pre>

You probably have already noticed the main difference from our usual way of
generating linked charts. All the code is now inside a callback function that
is an argument of <code>d3.json</code>. The reason for this is that file reading
in JavaScript is asynchronous. The browser starts reading the file and immediately
goes on executing further code. So if you try to create a plot after calling 
<code>d3.json</code>, your data may be not loade by the time the plot is rendered
and you'll get an error. The callback fucntion, from the other hand, is called
only after the data is loaded.

If you want, you don't need to keep put all your code inside the callback function.
Just make sure that there you have all the methods that require the data being 
already loaded (such as [place](chart), [update](chart), [cluster](heatmap)).

<pre class = "tiy" height=500 
  tiy-preload="../src/linked-charts.min.js;../src/linked-charts.css">
var data;
d3.text("https://kloivenn.github.io/linked-charts/src/data/iris.csv",
  function(text){
    data = d3.csvParse(text);
    scatterplot.place();
  }
);

var scatterplot = lc.scatter()
  .x(function(k) {return +data[k].sepal_length})
  .y(function(k) {return +data[k].petal_length})
  .size(function(k) {return +data[k].sepal_width * 2})
  .colourValue(function(k) {return +data[k].petal_width})
  .symbolValue(function(k) {return data[k].species});	
</pre>

Keep in mind, that <code>d3.csvParse</code> treat all the columns as strings and therefore
one may need to convert them to numbers (note all the <code>+</code> when defining plot's
properties). Other option is to convert all necessary values to numbers during parsing
the following way:

<pre class = "tiy" runnable="false">
data = d3.csvParse(text, function(d){
	return {
	  sepal_length: +d.sepal_length,
	  petal_length: +d.petal_length,
	  sepal_width: +d.sepal_width,
	  petal_width: +d.petal_width,
	  species: d.species
  }
);
</pre>

Inside this function you can also rename columns, perform some simple calculations or 
save only necessary columns.

#### Load data upon request

If you have your data stored in several big files, you can load them on request rather then
getting all the data in when the page is loading. Let's imagine that we have three data sets
<code>[data1.json](../src/data/data1.json)</code>, <code>[data2.json](../src/data/data2.json)</code>
and <code>[data3.json](../src/data/data3.json)</code>. For this simple example these are just
sets of coordinates for a hundred points each.

<pre class = "tiy" fitHeight=true 
  tiy-preload="../src/linked-charts.min.js;../src/linked-charts.css">
d3.select("body").append("div")
  .attr("id", "scatter");
var radio = d3.select("body").append("div");
for(var i = 1; i < 4; i++) {
  radio.append("input")
    .attr("type", "radio")
    .attr("name", "data")
    .attr("value", "data" + i)
    .attr("id", "data" + i)
    .attr("onchange", "loadData();");

  radio.append("label")
    .attr("for", "data" + i)
    .text("Dataset " + i);
}
//-----Precode end-----
var data = {};
//this function will be called each time a radio button
//state is changed
var loadData = function() {
  //get all radio buttons
  var radios = document.getElementsByName("data");
  //find which one is checked and save the name of
  //the required file
  var name;
  for(var i = 0; i < radios.length; i++)
    if(radios[i].checked)
      name = radios[i].value + ".json";
  //read the file and update the scatter plot
  d3.json("https://kloivenn.github.io/linked-charts/src/data/" + name,
    function(d){
      data = d;
      scatter.update();
    }
  )
}
//define the scatter plot
//Note that it's empty when placed since "data" is an empty object
var scatter = lc.scatter()
  .x(function(k) {return data[k][0];})
  .y(function(k) {return data[k][1];})
  .size(4)
  .place("#scatter");
</pre>

Yet, this approach doesn't allow you to read only a certain part of the file,
it still can help to save time and memory, when it comes to very big data sets.

### Reading from a local file

For security reasons JavaScript cannot acess local files as freely, as the ones on some server.
One way to deal with this problem is to create an input form for the user to load a data file
manually. To this end, you can use the [input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input)
element of type [file](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file) in  
combination with the [FileReader](https://developer.mozilla.org/en-US/docs/Web/API/FileReader) interface.

<code>FileReader</code> has a [readAsText](https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsText)
method and its output can be parsed by [d3.csvParse](https://github.com/d3/d3-dsv#csvParse), 
[JSON.parse](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)
or any other parser of your choice.

For the next example download [this CSV file](../src/data/iris.csv) and then open it using the
provided form.

<pre class = "tiy" fitHeight=true 
  tiy-preload="../src/linked-charts.min.js;../src/linked-charts.css">
//add an input form
d3.select("body").append("input")
  .attr("type", "file")
  .attr("id", "file")
  .attr("onchange", "loadData();");

var data = {};
//this function will be called each time a new file is selected
function loadData() {
//load the file as text
  reader.readAsText(document.getElementById("file").files[0]);
}
//create a new FileReader
var reader = new FileReader();
//when the file is loaded, parse it and update the plot
reader.onload = function() {
  data = d3.csvParse(reader.result);
  scatter.update()
}

var scatter = lc.scatter()
  .x(function(k) {return +data[k].sepal_length})
  .y(function(k) {return +data[k].petal_length})
  .size(function(k) {return +data[k].sepal_width * 2})
  .colourValue(function(k) {return +data[k].petal_width})
  .symbolValue(function(k) {return data[k].species})
  .place();
</pre>

## Input formats

The _linked-charts_ library doesn't have any in-built format-converting functionality.
It always assumes that you already have variables that contain your data and it 
doesn't really matter how you get them.

Yet there are plenty of other libraries that can easily do the job with just few lines
of code and therefore there is no point for us to rewrite what others have already 
done. In this section we will ennumerate some libraries and methods that can read and
parse various data formats. You can find examples of their usage on the pages of these
libraries/interfaces or on this page.

Of course, you can also use any other library of your choosing. Anything that can 
read data in JavaScript arrays of objects works.

### JSON

JSON (or JavaScript Object Notation) is closely related to JavaScript format of data.
Generally, data in JSON format is a valid JavaScript array or object that you can just
copy-paste into the code and assign to some variable. It can also be read as text and 
parsed afterwards.

Various methods, both JavaScript native and implemented in external libraries, can read
and/or parse JSON format. Some of them are: 
[JSON.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse),
[d3.json](https://github.com/d3/d3-request/blob/master/README.md#json), 
[jQuery.getJSON](http://api.jquery.com/jquery.getjson/), [jQuery.parseJSON](http://api.jquery.com/jquery.parsejson/)
and probably some other implementations.

There are also quite a few tools to convert your data to JSON format. For example, 
[jsonlite](https://cran.r-project.org/web/packages/jsonlite/index.html) R package can tranform
lists, dataframes, matrices and arrays into JSON string.

An example of reading data from a JSON file you can find in [this](#Reading-from-URL) section.

<pre class = "tiy" runnable=false
	subscr="An example of data in JSON format">
{
  "firstName": "John",
  "lastName": "Smith",
  "isAlive": true,
  "age": 27,
  "address": {
    "streetAddress": "21 2nd Street",
    "city": "New York",
    "state": "NY",
    "postalCode": "10021-3100"
  },
  "phoneNumbers": [
    {
      "type": "home",
      "number": "212 555-1234"
    },
    {
      "type": "office",
      "number": "646 555-4567"
    },
    {
      "type": "mobile",
      "number": "123 456-7890"
    }
  ],
  "children": [],
  "spouse": null
}
</pre>

### CSV

CSV (or Comma-Separated Values) is a very common way to keep the data. It is a table
with columns separated by comma and is generally parsed as an array of rows, where each
row is converted into an object with column names as its properties.

We recomend to use [d3.csvParse](https://github.com/d3/d3-dsv#csvParse) to convert
CSV-formatted data into JavaScript library. Another possible option is
[jquery-csv](https://github.com/evanplaice/jquery-csv/) library. For both of them
you first need to read your file as text and only then parse it. This can be done
by [d3.text](https://github.com/d3/d3-request/blob/master/README.md#text) function
(see the second example in [this](#Reading-from-URL) section), by 
[FileReader.readAsText](https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsText)
method (see example in [this](#Reading-from-a-local-file) section) or by 
[XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)
class and its value 
[XMLHttpRequest.responseText](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseText).

D3 library also allows you to parse any other delimiter-separated files, using 
[d3.tsv](https://github.com/d3/d3-request/blob/master/README.md#tsv) to read and parse tab-separated values
or [d3.dsvFormat](https://github.com/d3/d3-dsv/blob/master/README.md#dsvFormat) to parse any
delimiter-separated values.

In most cases, the ability to read and parse CSV (or other delimiter-separated files) is
enough, since there exist dozens if not hundred converters from various formats to CSV and
most of data analysis softfware provides a way to export data as CSV.

Yet if you think you need to import something else without using CSV as an intermediate step,
try to google for it. It may happen that someone has already wrote a JavaScript parser.

## Data access time (unfinished)

After the data is loaded there is still one thing you may need to take care.
Keep in mind, that the plots in the _linked-charts_ library will try to access 
each instance of the data multiple times during the update, so for performance sake
you need to make sure, that it doesn't take too much time.

There are two functions in the _linked-charts_ library that can help you with that.

### separateBy

<code>separateBy</code> is a data transforming function that allows you to avoid 
exessive filtering.

Imagine you have data in the [narrow](https://en.wikipedia.org/wiki/Wide_and_narrow_data) format.

### cache