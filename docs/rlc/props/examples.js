/////////////
//example 1//
/////////////

lc.scatter()
	.x(iris.Sepal_Length)
	.y(iris.Petal_Length)
	.colourValue(iris.Species)
	.width(300)
	.height(300)
	.place(d3.select("#example1").select("#A1"));

lc.scatter()
	.x(iris.Sepal_Length)
	.y(iris.Petal_Length)
	.colourValue(iris.Petal_Width)
	.width(300)
	.height(300)
	.place(d3.select("#example1").select("#A2"));

/////////////
//example 2//
/////////////

lc.scatter()
	.x(iris.Sepal_Length)
	.y(iris.Petal_Length)
	.colourValue(iris.Species)
	.colourDomain(["setosa", "something else", "virginica"])
	.width(300)
	.height(300)
	.place(d3.select("#example2").select("#A1"));

lc.scatter()
	.x(iris.Sepal_Length)
	.y(iris.Petal_Length)
	.colourValue(iris.Petal_Width)
	.colourDomain([-1, 1])
	.width(300)
	.height(300)
	.place(d3.select("#example2").select("#A2"));

/////////////
//example 3//
/////////////

lc.scatter()
	.x(iris.Sepal_Length)
	.y(iris.Petal_Length)
	.colourValue(iris.Species)
	.colourDomain(["setosa", "something else", "virginica", "versicolor"])
	.palette(["gold", "hotpink", "dodgerblue"])
	.width(300)
	.height(300)
	.place(d3.select("#example3").select("#A1"));

lc.scatter()
	.x(iris.Sepal_Length)
	.y(iris.Petal_Length)
	.colourValue(iris.Petal_Width)
	.colourDomain([0, 0.3, 2.6])
	.palette(["red", "grey", "black"])
	.width(300)
	.height(300)
	.place(d3.select("#example3").select("#A2"));

/////////////
//example 4//
/////////////

lc.scatter()
	.x(d3.range(5).map(e => e + 1))
	.y(d3.range(5).map(e => 1))
	.size(15)
	.width(350)
	.height(200)
	.colour(["red", "#123456", rgb(102, 204, 25), "#aaa", "some_strange_colour"])
	.place("#example4");

/////////////
//example 5//
/////////////

lc.pointLine()
	.nelements(3)
	.paramRange([0, 6.5])
	.x((t, d) => Math.cos(t) + d)
	.y((t, d) => Math.sin(t) + d)
	.lineWidth(5)
	.fill(["blue", "red", "black"])
	.colour(["cornflowerblue", "coral", "grey"])
	.width(300)
	.height(300)
	.place(d3.select("#example5").select("#A1"));

lc.scatter()
	.x(d3.range(3))
	.y(d3.range(3))
	.size(55)
	.domainX([-1, 3])
	.domainY([-1, 3])
	.strokeWidth(5)
	.stroke(["blue", "red", "black"])
	.colour(["cornflowerblue", "coral", "grey"])
	.width(300)
	.height(300)
	.place(d3.select("#example5").select("#A2"));

/////////////
//example 6//
/////////////

var ex6 = {};
ex6.x = d3.range(21).map(e => e/20);
ex6.pointsX = d3.range(40).map(e => Math.random());
ex6.pointsY = d3.range(40).map(e => e > 20 ? e*3 + Math.random()/5 : Math.random() * 3);

ex6.A1 = lc.pointRibbon()
	.x(ex6.x)
	.ymax(ex6.x.map(e => e * 2 + Math.abs(e - 0.5)))
	.ymin(ex6.x.map(e => e * 2 + Math.abs(e - 0.5)))
	.colourValue("c")
	.width(300)
	.height(300);

lc.scatter("points", ex6.A1)
	.x(pointsX)
	.y(pointsY)
	.colourValue(d3.range(40).map(e => e > 20 ? "b" : "a"));

lc.xLine("line", ex6.A2)
	.nelements(2)
	.lineFun((t, d) => d == 0 ? t*3 : t*2)
	.colourValue(["b", "c"])
	.addColourScaleToLegend(false)
	.place(d3.select("#example6").select("#A1"));

ex6.A2 = lc.pointRibbon()
	.x(ex6.x)
	.ymax(ex6.x.map(e => e * 2 + Math.abs(e - 0.5)))
	.ymin(ex6.x.map(e => e * 2 + Math.abs(e - 0.5)))
	.globalColourScale(false)
	.colourLegendTitle("ribbon")
	.colourValue("c")
	.width(300)
	.height(300);

lc.scatter("points", ex6.A1)
	.x(pointsX)
	.y(pointsY)
	.colourLegendTitle("scatter")
	.colourValue(d3.range(40).map(e => e > 20 ? "b" : "a"));

lc.xLine()
	.nelements(2)
	.lineFun((t, d) => d == 0 ? t*3 : t*2)
	.colourValue(["b", "c"])
	.colourLegendTitle("lines")
	.place(d3.select("#example6").select("#A1"));

/////////////
//example 7//
/////////////

var ex7 = {};

ex7.chart = lc.heatmap()
	.nrows(150)
	.ncols(150)
	.value(corIris)
	.colourDomain([-1, 1])
	.palette(["#67001F", "#B2182B", "#D6604D", "#F4A582", "#FDDBC7", "#F7F7F7", "#D1E5F0", "#92C5DE", "#4393C3", "#2166AC", "#053061"])
	.showLegend(false)
	.place("#example7");

lc.colourSlider()
	.linkedChart(ex7.chart)
	.place("#example7");

/////////////
//example 8//
/////////////

lc.scatter()
	.x(iris.Sepal_Length)
	.y(iris.Petal_Length)
	.symbolLegendTitle("Species")
	.symbolValue(iris.Species)
	.width(300)
	.height(300)
	.place(d3.select("#example8").select("#A1"));

lc.scatter()
	.x(iris.Sepal_Length)
	.y(iris.Petal_Length)
	.symbol(iris.Species.map(e => e == "setosa" ? "Star" : "Cross"))
	.width(300)
	.height(300)
	.place(d3.select("#example8").select("#A2"));

/////////////
//example 9//
/////////////

lc.scatter()
	.x(iris.Sepal_Length)
	.y(iris.Petal_Length)
	.size(iris.Sepal_Width.map(e => e*2))
	.colourValue(iris.Petal_Width)
	.strokeWidth(3)
	.opacity(d3.range(150).map(e => Math.random()))
	.place("#example9");

//////////////
//example 10//
//////////////

lc.xLine()
	.nelements(5)
	.lineFun((t, d) => d)
	.lineWidth(d3.range(5).map(e => (e + 1) * 2))
	.dasharray(["", "10", "10 2", "15 3 8", "3 6 9 12"])
	.domainY([0, 6])
	.place("#example10");

//////////////
//example 11//
//////////////

lc.scatter()
	.x(iris.Sepal_Length)
	.y(iris.Petal_Length)
	.size(iris.Sepal_Width * 2)
	.colourValue(iris.Petal_Width)
	.symbolValue(iris.Species)
	.title("Iris dataset")
	.titleX(100)
	.titleY(500)
	.titleSize(30)
	.axisTitleX("Sepal Length")
	.axisTitleY("Petal Length")
	.colourLegendTitle("Petal Width")
	.symbolLegendTitle("Species")
	.place("#example11");

//////////////
//example 12//
//////////////

var ex12 = {};

ex12.chart = lc.scatter()
	.x(i => Math.random())
	.y(d3.range(10).map(e => Math.random()))
	.place("#example12");

//////////////
//example 13//
//////////////

var ex13 = {};
ex13.colours = ["#8DD3C7", "#FFFFB3", "#BEBADA", "#FB8072", "#80B1D3", "#FDB462", "#B3DE69", "#FCCDE5", "#D9D9D9", "#BC80BD"];
ex13.selCol = 0;

lc.scatter()
	.x(d3.range(10))
	.y(d3.range(10))
	.colour(i => ex13.colours[ex13.selCol])
	.on_click(function(i) {
		ex13.selCol = i;
		ex13.chart.update();
	})
	.place("#example13");

//////////////
//example 14//
//////////////

var ex14 = {};
ex14.colours = ["#8DD3C7", "#FFFFB3", "#BEBADA", "#FB8072", "#80B1D3", "#FDB462", "#B3DE69", "#FCCDE5", "#D9D9D9", "#BC80BD", "black"];
ex14.selCol = 0;

lc.scatter()
	.x(d3.range(10))
	.y(d3.range(10))
	.colour(i => ex14.colours[ex14.selCol])
	.on_mouseover(function(i) {
		ex13.selCol = i;
		ex13.chart.update();
	})
	.on_mouseout(function(i) {
		ex13.selCol = 10;
		ex13.chart.update();
	})
	.place("#example14");

//////////////
//example 15//
//////////////

var ex15 = {};

ex15.A1 = lc.scatter()
	.x(iris.Sepal_Length)
	.y(iris.Petal_Length)
	.colourValue(iris.Species)
	.width(300)
	.height(300)
	.on_marked(function() {
		ex15.A2.mark(ex15.A1.get_marked());
	})
	.place(d3.select("#example15").select("#A1"));

ex15.A2 = lc.scatter()
	.x(iris.Sepal_Width)
	.y(iris.Petal_Width)
	.colourValue(iris.Species)
	.width(300)
	.height(300)
	.on_marked(function() {
		ex15.A1.mark(ex15.A2.get_marked());
	})
	.place(d3.select("#example15").select("#A2"));

//////////////
//example 16//
//////////////

lc.scatter()
	.x(iris.Sepal_Length)
	.y(iris.Petal_Length)
	.colourValue(iris.Species)
	.width(300)
	.height(300)
	.on_marked(function() {
		ex15.A2.mark(ex15.A1.get_marked());
	})
	.place(d3.select("#example15").select("#A1"));

lc.scatter()
	.x(iris.Sepal_Width)
	.y(iris.Petal_Width)
	.colourValue(iris.Species)
	.width(300)
	.height(300)
	.on_marked(function() {
		ex15.A1.mark(ex15.A2.get_marked());
	})
	.place(d3.select("#example15").select("#A2"));
