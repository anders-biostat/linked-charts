/////////////
//example 1//
/////////////

var a1 = lc.scatter()
	.x(iris.Sepal_Length)
	.y(iris.Petal_Length)
	.colourValue(iris.Species)
	.width(300)
	.height(300)
	.place(d3.select("#example1").select("#A1"));

var a2 = lc.scatter()
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
	.colour(["red", "#123456", "rgb(102, 204, 25)", "#aaa", "some_strange_colour"])
	.place("#example4");

/////////////
//example 5//
/////////////

lc.parametricCurve()
	.nelements(3)
	.paramRange([0, 6.5])
	.xFunction((t, d) => Math.cos(t) + d)
	.yFunction((t, d) => Math.sin(t) + d)
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
ex6.pointsY = d3.range(40).map(e => e > 19 ? ex6.pointsX[e]*3  + Math.random() - 0.5:  Math.random() * 3);

ex6.A1 = lc.pointRibbon()
	.x(ex6.x)
	.ymax(ex6.x.map(e => e * 2 + Math.abs(e - 0.5)))
	.ymin(ex6.x.map(e => e * 2 - Math.abs(e - 0.5)))
	.nsteps(ex6.x.length)
	.colourValue("c")
	.width(300)
	.height(300);

lc.scatter("points", ex6.A1)
	.x(ex6.pointsX)
	.y(ex6.pointsY)
	.colourValue(d3.range(40).map(e => e > 19 ? "b" : "a"));

lc.xLine("line", ex6.A1)
	.nelements(2)
	.lineFun((t, d) => d == 0 ? t*3 : t*2)
	.colourValue(["b", "c"])
	.addColourScaleToLegend(false)
	.place(d3.select("#example6").select("#A1"));

ex6.A2 = lc.pointRibbon()
	.x(ex6.x)
	.ymax(ex6.x.map(e => e* 2 + Math.abs(e - 0.5)))
	.ymin(ex6.x.map(e => e * 2 - Math.abs(e - 0.5)))
	.nsteps(ex6.x.length)
	.globalColourScale(false)
	.colourLegendTitle("ribbon")
	.colourValue("c")
	.width(300)
	.height(300);

lc.scatter("points", ex6.A2)
	.x(ex6.pointsX)
	.y(ex6.pointsY)
	.colourLegendTitle("scatter")
	.colourValue(d3.range(40).map(e => e > 19 ? "b" : "a"));

lc.xLine("line", ex6.A2)
	.nelements(2)
	.lineFun((t, d) => d == 0 ? t*3 : t*2)
	.colourValue(["b", "c"])
	.colourLegendTitle("lines")
	.place(d3.select("#example6").select("#A2"));

ex6.A1.legend.width(80).update();

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
	.size(iris.Sepal_Width.map(e => e * 2))
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
	.size(iris.Sepal_Width.map(e => e * 2))
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
	.nelements(10)
	.x(i => Math.random())
	.y(d3.range(10).map(e => Math.random()))
	.domainX([0, 1])
	.place("#example12");

//////////////
//example 13//
//////////////

var ex13 = {};
ex13.colours = ["#8DD3C7", "#FFFFB3", "#BEBADA", "#FB8072", "#80B1D3", "#FDB462", "#B3DE69", "#FCCDE5", "#D9D9D9", "#BC80BD"];
ex13.selCol = 0;

ex13.chart = lc.scatter()
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

ex14.chart = lc.scatter()
	.x(d3.range(10))
	.y(d3.range(10))
	.colour(i => ex14.colours[ex14.selCol])
	.on_mouseover(function(i) {
		ex14.selCol = i;
		ex14.chart.update();
	})
	.on_mouseout(function(i) {
		ex14.selCol = 10;
		ex14.chart.update();
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
		ex15.A2.mark("__clear__", true);
		ex15.A2.mark(ex15.A1.get_marked(), true);
	})
	.place(d3.select("#example15").select("#A1"));

ex15.A2 = lc.scatter()
	.x(iris.Sepal_Width)
	.y(iris.Petal_Width)
	.colourValue(iris.Species)
	.width(300)
	.height(300)
	.on_marked(function() {
		ex15.A1.mark("__clear__", true);
		ex15.A1.mark(ex15.A2.get_marked(), true);
	})
	.place(d3.select("#example15").select("#A2"));

//////////////
//example 16//
//////////////

lc.scatter()
	.x(random.x)
	.y(random.y)
	.size(1)
	.shiftX(d3.range(1500).map(e => Math.random() * 0.6 - 0.3))
	.width(300)
	.height(300)
	.place(d3.select("#example16").select("#A1"));

lc.scatter()
	.x(random.x)
	.y(random.y)
	.size(1)
	.shiftX(random.shift)
	.width(300)
	.height(300)
	.place(d3.select("#example16").select("#A2"));

//////////////
//example 17//
//////////////

lc.scatter()
	.x(d3.range(20).map(e => (e + 1) * 128/19))
	.y(d3.range(20).map(e => (e + 1) * 128/19))
	.logScaleY(2)
	.place("#example17");

//////////////
//example 18//
//////////////

var ex18 = {};
ex18.x1 = d3.range(40).map(e => Math.random() * 10);
ex18.x2 = d3.range(40).map(e => Math.random() * 10 - 5);

ex18.chart = lc.scatter()
	.x(ex18.x1)
	.y(ex18.x1.map(e => e * 3 + Math.random() * 5 - 2.5))
	.layerDomainX([3, 9])
	.domainY([0, 20]);

lc.scatter("red", ex18.chart)
	.x(ex18.x2)
	.y(ex18.x2.map(e => -e + Math.random() * 5 - 2.5))
	.colour("red")
	.place("#example18");

//////////////
//example 19//
//////////////

lc.scatter()
	.x(iris.Species)
	.y(iris.Sepal_Length)
	.shiftX(d3.range(150).map(e => Math.random() * 0.4 - 0.2))
	.colourValue(iris.Petal_Length)
	.domainX(["virginica", "something else", "setosa", "versicolor"])
	.place("#example19");

//////////////
//example 20//
//////////////

lc.scatter()
	.x(d3.range(10).map(e => e + 1))
	.y(d3.range(10).map(e => e + 1))
	.height(200)
	.aspectRatio(1)
	.place("#example20");

//////////////
//example 21//
//////////////

var ex21 = {};

ex21.values = iris.Sepal_Length.slice();

for(var i = 0; i < 10; i++)
	ex21.values[Math.floor(Math.random() * 150)] = 3;

lc.scatter()
	.x(iris.Species)
	.y(ex21.values)
	.ticksY([[3, 4, 5, 6, 7, 8], ["NA", 4, 5, 6, 7, 8]])
	.ticksRotateX(45)
	.axisTitleX("species")
	.axisTitleY("sepal length")
	.shiftX(d3.range(150).map(e => Math.random() * 0.4 - 0.2))
	.size(4)
	.colourValue(iris.Petal_Length)
	.place("#example21");

//////////////
//example 22//
//////////////

lc.scatter()
	.x(iris.Sepal_Length)
	.y(iris.Petal_Length)
	.colourValue(iris.Sepal_Width)
	.symbolValue(iris.Species)
	.showLegend(false)
	.showPanel(false)
	.width(600)
	.height(300)
	.set_paddings({left: 10})
	.place("#example22");

//////////////
//example 23//
//////////////

var ex23 = {};
ex23.selPoint = 0;

ex23.chart = lc.scatter()
	.x(pcaIris[0])
	.y(pcaIris[1])
	.colourValue(i => distIris[ex23.selPoint][i])
	.transitionDuration(0)
	.on_mouseover(function(i) {
		ex23.selPoint = i;
		ex23.chart.updateElementStyle();
	})
	.place("#example23");

//////////////
//example 24//
//////////////

lc.heatmap()
	.value(distIris)
	.nrows(150)
	.ncols(150)
	.rowLabel(iris.Species)
	.colLabel(iris.Species)
	.clusterRows(true)
	.clusterCols(true)
	.showDendogramRow(false)
	.place("#example24");

//////////////
//example 25//
//////////////
var ex25 = {};

ex25.chart = lc.heatmap()
	.nrows(150)
	.colIds(Object.keys(iris).filter(e => e != "Species"))
	.value((row, col) => iris[col][row])
	.rowLabel(iris.Species)
	.height(1000)
	.showValue(true)
	.rowTitle("Samples")
	.colTitle("Measurements")
	.on_labelClickRow(function(i) {
		ex25.chart.reorder("Row", (a, b) => corIris[i][b] - corIris[i][a])
	})
	.place("#example25");
