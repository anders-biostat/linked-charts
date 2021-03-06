---
title: "R/LinkedCharts Tutorial"
usePrism: true
useLC: true
---

<!-- From the parent directory only! -->
<!-- knitr::knit("props/props.Rmd", "props.md") -->

## R/LinkedCharts Tutorial
# Customising your chart

Here, we show how one can use various built-in properties to customise charts.
The main goal of this tutorial is to give overview of the adjuststable apects in R/LinkedCharts, 
(colours, axes, labels, etc.). Therefore we are going to use well known example data sets
such as [Iris](https://en.wikipedia.org/wiki/Iris_flower_data_set) flower data set or randomly 
generated data. 


```r
data("iris") # load Iris data set
head(iris)
```

```
##   Sepal.Length Sepal.Width Petal.Length Petal.Width Species
## 1          5.1         3.5          1.4         0.2  setosa
## 2          4.9         3.0          1.4         0.2  setosa
## 3          4.7         3.2          1.3         0.2  setosa
## 4          4.6         3.1          1.5         0.2  setosa
## 5          5.0         3.6          1.4         0.2  setosa
## 6          5.4         3.9          1.7         0.4  setosa
```

We assume that you are already familiar with R/LinkedCharts and its main ideas and principles
and you want to explore more possibilities of the library. Otherwise, we recommend first to 
go through [this](oscc.html) tutorial.


```r
library(rlc) # load the library
```

## Colour

This section describes the following properties:
- `colourValue`
- `colourDomain`
- `palette`
- `colour`
- `fill`
- `stroke`
- `colourLegendTitle`
- `globalColourScale`
- `addColourScaleToLegend`

The simplest way to colour elements of a chart is to use the `colourValue` property.
It takes numbers or strings for each point (line, bar, etc.) and based on that generates
a continuous or categorical colour scale.


```r
openPage(layout = "table1x2")

# a scatter plot with a categorical colour scale
lc_scatter(dat(x = iris$Sepal.Length,
               y = iris$Petal.Length,
               colourValue = iris$Species),
           width = 300, height = 300, # change width and height of the chart to 300px
           place = "A1")

# a scatter plot with a continuous colour scale
lc_scatter(dat(x = iris$Sepal.Length,
               y = iris$Petal.Length,
               colourValue = iris$Petal.Width),
           width = 300, height = 300,
           place = "A2")
```
<script src="props/iris.js"></script>
<div id="example1">
  <table><tr><td id ="A1"></td><td id="A2"></td></tr></table>
</div>

To further specify colours one can use `palette` and `colourDomain` properties. 

In case of categorical colour scale `colourDomain` is a set of all possible colour values.
Thus for the chart on the left by default `colourDomain = c("setosa", "versicolor", "virginica")`.
If a value is not included in colourDomain, corresponding points will be black.

For continuous colour scales, `colourDomain` defines the range in wich colour values can change. All values
outside this range will produce colours that correspond to maximal or to minimal value of the `colourDomain`.

To illustrate all this, let's add `colourDomain` to our example.


```r
openPage(layout = "table1x2")

# a scatter plot with a categorical colour scale
lc_scatter(dat(x = iris$Sepal.Length,
               y = iris$Petal.Length,
               colourValue = iris$Species,
               colourDomain = c("setosa", "something else", "virginica")),
           width = 300, height = 300,
           place = "A1")

# a scatter plot with a continuous colour scale
lc_scatter(dat(x = iris$Sepal.Length,
               y = iris$Petal.Length,
               colourValue = iris$Petal.Width,
               colourDomain = c(-1, 1)),
           width = 300, height = 300,
           place = "A2")
```
<div id="example2">
  <table><tr><td id = "A1"></td><td id = "A2"></td></tr></table>
</div>

On the left plot, all the "versicolor" points are now black, since this value is no longer present in
`colourDomain`. At the same time, orange colour is reserved for "something else". On the plot to the right,
colour scale now varies between -1 and 1. All the points with `colourValue` greater than 1 are just purple.

Finally, `palette` defines what colours are used. It is always a vector of colours (their 
[names](http://www.stat.columbia.edu/~tzheng/files/Rcolor.pdf) or
[hexadecimal](https://en.wikipedia.org/wiki/Web_colors#HTML_color_names) codes). For categorical colour scale,
`palette` must have a colour for each element from `colourDomain`. For continous scales, `palette` is a set of
"reference points" for the colour scale. By default, they are spread evenly withing `colourDomain`, but one can
also specify intermediate points.


```r
openPage(layout = "table1x2")

# a scatter plot with a categorical colour scale
lc_scatter(dat(x = iris$Sepal.Length,
               y = iris$Petal.Length,
               colourValue = iris$Species,
               colourDomain = c("setosa", "something else", "virginica", "versicolor")),
               palette = c("gold", "hotpink", "dodgerblue"),
           width = 300, height = 300,
           place = "A1")

# a scatter plot with a continuous colour scale
lc_scatter(dat(x = iris$Sepal.Length,
               y = iris$Petal.Length,
               colourValue = iris$Petal.Width,
               colourDomain = c(0, 0.3, 2.6),
               palette = c("red", "grey", "black")),
           width = 300, height = 300,
           place = "A2")
```
<div id="example3">
  <table><tr><td id = "A1"></td><td id = "A2"></td></tr></table>
</div>

Now chart to the left has more elements in `colourDomain` than colours in `palette` and therefore colours are repeated, 
starting from the first element in `palette`. For the chart to the right we've provided `palette` with three colours
and also we've added an intermediate point in `colourDomain`. This tells R/LinkedCharts to interpolate colours from red to grey
between 0 and 0.3 and from grey to black between 0.3 and 2.6.

Intead of using `colourValue` and `palette` one can also assign colours directly. `colour` is similar to `colourValue`, 
but it assigns colours without generating a colour scale. Here is an example. Note how the fifth circle is coloured black,
since `some_strange_colour` doesn't correspond to any colour.



```r
lc_scatter(dat(x = 1:5,  # x-coordinates of the points are 1, 2, 3, 4, 5
               y = rep(1, 5), # all 5 points has 1 as their y-coordinates
               size = 15, # Let's have big points! (Default point size is 6)
               width = 350, # Our chart will be 350px wide...
               height = 200, # ...and 200px high.
               colour = c("red", "#123456", rgb(0.4, 0.8, 0.1), "#aaa", "some_strange_colour"))
          )
```
<div id = "example4"></div>

Besides that you can also change stroke colour (`stroke`) in scatters, bar charts and ribbons and `fill` lines (`lc_line`, 
`lc_abLine`, etc.) with some colour. These two properties work the same way as `colour`.


```r
openPage(layout = "table1x2")

# some filled lines
points <- seq(0, 6.5, 0.1)
x <- cos(points)
y <- sin(points)

lc_path(dat(x = sapply(0:2, function(i) x + i), # coordinates for three circles
            y = sapply(0:2, function(i) y + i),
            lineWidth = 5, # make lines thicker
            fill = c("blue", "red", "black"),
            # colour of the elements (in this case - lines)
            colour = c("cornflowerblue", "coral", "grey")),
        width = 300, height = 300,
        place = "A1")

# same plot, but using lc_scatter
lc_scatter(dat(x = 0:2, y = 0:2, size = 55, # three huge points instead of circles
               # change default axes limits to those of the chart to the left
               domainX = c(-1, 3), domainY = c(-1, 3),
               strokeWidth = 5, # make strokes thicker
               stroke = c("blue", "red", "black"),
               # colour of the elements (in this case - points)
               colour = c("cornflowerblue", "coral", "grey")),
           width = 300, height = 300,
           place = "A2")
```
<div id="example5">
  <table><tr><td id = "A1"></td><td id = "A2"></td></tr></table>
</div>

`colourLegendTitle` allows to give a meaningfull name to your legend.
`globalColourScale` can be useful, when your chart has several layers with coloured elements. If `globalColourScale` is 
`TRUE` (default value) a single global scale is created for all the layers. Otherwise, each layer gets its own colour
scale.
`addColourScaleToLegend` (by default, `TRUE`) defines whether or not display legend for the colour scale of this layer.

Imagine, we have three types data samples. Samples of type "a" are randomly scattered, samples of types "b" and "c" are
distributed along some lines, but for type "c" we don't have any points only the area, where they are likely to be found.
This artificial example can help us illustrate the meaning of having a global colour scale. So we are going to have a chart
with three layers: one with points of type "a" and "b", another for lines along which type "b" and "c" samples are scattered, 
and one more to highlight the area of most likely location for type "c" samples.


```r
# generate 20 randomly distributed points, and 20 that
# are scattered along y = 3 * x line
pointsX <- runif(40)
pointsY <- c(runif(20, 0, 3), pointsX[21:40] * 3 + rnorm(20, sd = 0.2))

x <- seq(0, 1, 0.05)

openPage(layout = "table1x2")
# first we add filled area first to put it under all other elements
lc_ribbon(dat(
    x = x,
    # lc_ribbon fills area between ymax and ymin values
    ymax = x * 2 + abs(x - 0.5), 
    ymin = x * 2 - abs(x - 0.5),
    colourValue = "c",
    # properties that influence the entire chart can be
    # set in any of its layers
    width = 300, height = 300),
  place = "A1")

lc_scatter(dat(
    x = pointsX,
    y = pointsY,
    # first 20 points are of class "a"
    # the other 20 are of class "b"
    colourValue = c(rep("a", 20), rep("b", 20))),
    # to add a layer one need either define "lyaerId"
    # or set "addLayer = TRUE"
  place = "A1", addLayer = T)

lc_abLine(dat(
    # we can add 'n' lines by defining 'n' values
    # of slope ('a') and intercept ('b')
    a = c(3, 2), b = c(0, 0),
    colourValue = c("b", "c"),
    addColourScaleToLegend = F),
  place = "A1", addLayer = T)

# The same chart but without global colour scale
lc_ribbon(dat(
    x = x,
    ymax = x * 2 + abs(x - 0.5),
    ymin = x * 2 - abs(x - 0.5),
    colourValue = "c",
    globalColourScale = F,
    colourLegendTitle = "ribbon",
    width = 300, height = 300),
  place = "A2")

lc_scatter(dat(
    x = pointsX,
    y = pointsY,
    colourLegendTitle = "scatter",
    colourValue = c(rep("a", 20), rep("b", 20))),
  place = "A2", addLayer = T)

lc_abLine(dat(
    a = c(3, 2),
    b = c(0, 0),
    colourLegendTitle = "lines",
    colourValue = c("b", "c")),
  place = "A2", addLayer = T)
```
<div id="example6">
  <table><tr><td id = "A1"></td><td id = "A2"></td></tr></table>
</div>

Note, how on the cahrt to the left all three layers use exactly the same colour for the three data types.
On the left one, where we didn't use global colour scale (`globalColourScale = F`), each layer has its own
`colourDomain` and the same default `palette`. `lc_ribbon` has only one element and its type is "c", so it
uses the first colour of the default `palette` (which is blue) for this type. `lc_abLine` has types "b" and "c",
but it has no idea, that blue has already been used for type "c". "b" comes first in the data and it gets the
first colour (blue), and "c" is now orange. In a similar manner colours are defined for `lc_scatter`.
You make chart to the right look like the one to the left by adding to each layer `colourDomain = c("a", "b", "c")`.

R/LinkedCharts shows colour legend for each layer. It is useful for the chart to the right, where meaning of each colour
changes from layer to layer, but doesn't make sence for a chart to the left. It shows to legends, because we've hidden
one with `addColourScaleToLegend = F`. It is probably a good idea to do the same for one more layer (doesn't matter which
one).

So far we didn't mention heatmaps (`lc_heatmap`), but their colouring is defined by the already mentioned `palette` and
`colourDomain` properties the same way it happens for all other charts. It can also be interesting to use an interactive
`lc_colourSlider` instead of static colour scale.


```r
# if you want to plot 150x150 correlation matrix, it's better to 
# use your browser instead of RStudio Viewer.
openPage(useViewer = F)

lc_heatmap(dat(
  values = cor(t(iris[, 1:4])),
  colourDomain = c(-1, 1),
  palette = RColorBrewer::brewer.pal(11, "RdBu"),
  # if we use colour slider, we don't need the static legend
  showLegend = F
))

lc_colourSlider(chart = "Chart1")
```
<div id="example7"></div>

## Shape

This section describes the following properties:
- `symbol`
- `symbolValue`
- `symbolLegendTitle`
- `size`
- `strokeWidth`
- `lineWidth`
- `opacity`
- `dasharray`

Scatters and beeswarms in R/LinkedCharts can display points as one of seven standard d3 
[symbols](https://bl.ocks.org/d3indepth/bae221df69af953fb06351e1391e89a0). `symbolValue`,
which is similar to `colourValue`, generates a scale that converts some user-provided values
to one of the symbols. `symbol` property directly assigns symbol types to each element.
Possible symble types are `"Circle", "Cross", "Diamond", "Square", "Star", "Triangle", "Wye"`.
`symbolLegendTitle` adds a title to the symbol legend.


```r
openPage(layout = "table1x2")

lc_scatter(dat(x = iris$Sepal.Length,
               y = iris$Petal.Length,
               symbolLegendTitle = "Species",
               symbolValue = iris$Species),
           width = 300, height = 300,
           place = "A1")

lc_scatter(dat(x = iris$Sepal.Length,
               y = iris$Petal.Length,
               symbol = ifelse(iris$Species == "setosa", "Star", "Cross")),
           width = 300, height = 300,
           place = "A2")
```
<div id="example8">
  <table><tr><td id = "A1"></td><td id = "A2"></td></tr></table>
</div>

On the left chart R/LinkedCharts automatically puts a symbol for each of the present species
`symbolValue = iris$Species`. On the chart to the right we do it manualy 
`symbol = ifelse(iris$Species == "setosa", "Star", "Cross")` (for the sake of simplicity, we only distinguish
"setosa" from everything else).

We can also change `size` of the points (default is 6), `opacity` (value from 0 to 1), or `strokeWidth` (by default, 
`0.1 * size`).


```r
lc_scatter(dat(x = iris$Sepal.Length,
               y = iris$Petal.Length,
               size = iris$Sepal.Width * 2,
               colourValue = iris$Petal.Width,
               strokeWidth = 3,
               opacity = runif(150))
           )
```
<div id="example9"></div>

Lines can have different width (`lineWidth`, default is 1.5) and dashes pattern (`dasharray`). `dasharray` is defined
the same way as CSS [stroke-dasharray](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray)
attribute. It is a list of numbers that specify legnth of alternating dashes and gaps. First number is length
of the first dash, second - of the first gap, third - of the second dash, and so on, and so forth.


```r
lc_hLine(dat(
  h = 1:5,
  lineWidth = 1:5 * 2,
  dasharray = c("", "10", "10 2", "15 3 8", "3 6 9 12"),
  domainY = c(0, 6)
))
```
<div id="example10"></div>

## Titles and labels
This section describes the following properties:
- `label`
- `title`
- `titleSize`
- `titleX`/`titleY`
- `axisTitleX`/`axisTitleY`
- `colourLegendTitle`
- `symbolLegendTitle`

`label` defines text that you see when hovering mouse over some element. If vectors that specify `x` or `y` coordinates
have names, these names will be used as labels. Otherwise, element's index is used as its label (note, that indices start 
from 0). One can also define the main `title` of a plot, its size (`titleSize`) and position. `titleX` specifies horisontal
position of title midpoint, while `titleY` is vertical position of its bottom. 
`axisTitleX` and `axisTitleY` set title to x and y axes respectively. `colourLegendTitle` and `symbolLegendTitle` have 
already been mentioned in the sections above - they specify titles for colour and symbol legends.


```r
lc_scatter(dat(
  x = iris$Sepal.Length,
  y = iris$Petal.Length,
  size = iris$Sepal.Width * 2,
  colourValue = iris$Petal.Width,
  symbolValue = iris$Species,
  title = "Iris dataset",
  titleX = 100,
  titleY = 500,
  titleSize = 30,
  axisTitleX = "Sepal Length",
  axisTitleY = "Petal Length",
  colourLegendTitle = "Petal Width",
  symbolLegendTitle = "Species"
))
```
<div id="example11"></div>

## Interactivity
This section describes the following properties:
- `on_click`
- `on_mouseover`
- `on_mouseout`
- `on_marked`

R/LinkedCharts is designed as an easy-to-use framework to create sets of interactive linked charts. 
From [this](oscc.html) tutorial you can already get a pretty good idea of how it 
works, but let's quickly go through it again here.

All the interactivity in R/LinkedCharts is based on the two main ideas. 

First is the `dat()` function.
Properties, defined inside this function (e.g. `dat(x = somePoints$x, y = somePoints$y)`) can be reevaluated 
any moment by calling the `updateCharts()` function and the chart will be changed accordingly. For example, if
`somePoints` is changed, then `updateCharts()` will make the points move to new positions.


```r
lc_scatter(dat(x = rnorm(10)), 
           y = rnorm(10))
updateCharts()
```
<div id="example12"></div>
<input type = "button" onclick = "ex12.chart.update();" value = "updateCharts();">

Note, how each time you call `updateCharts()`, points are moved along the x-axis to some new randomly 
generated locations. At the same time y-coordinates of each point remain unchanged.

Second is a system of callback functions. Whenever something happens on the opened web page (e.g. a point is clicked)
a user-defined function is called. The most simple way to use this function, is to change some global variable that the
charts depends on and then call `updateCharts`. Of course, you can also run calculations, print some information to console,
make static plots or whatever else you want.

So here is a basic example with reaction to click (`on_click`). In this example we have a set of ten colours and a 
scatter plot with ten points. When any of the points is clicked, all of them change colour and index of the clicked
point is printed in the console. To do this we create a variable that stores currently selected colour `selColor` and
then use it to set `colour` property. When a point is clicked, the function assigned to the `on_click` property is called.
It gets index of the clicked point and prints it (`print(i)`). It also changes `selColour` and updates chart. Note, that 
inside this function we use global assignment operator `<<-` instead of usual `<-`. `<-` will just create a local variable 
`selColour` inside the function.


```r
colours <- RColorBrewer::brewer.pal(10, "Set3")
selColour <- 1

lc_scatter(dat(
  x = 1:10,
  y = 1:10,
  colour = colours[selColour],
  on_click = function(i) {
    print(i)
    selColour <<- i
    updateCharts()
  }
))
```
<div id="example13"></div>

`on_mouseover` and `on_mouseout` specify, what happens when user moves mouse over and out an element. `on_mouseover` like 
`on_click` gets an index of the point (line, cell, etc.), `on_mouseout` doesn't get anything. Here is example similar to
the one above, but now, instead of clicking on a point, one can just move the mouse over it. When mouse moves out all points
become black.


```r
colours <- c(RColorBrewer::brewer.pal(10, "Set3"), "black")
selColour <- 1

lc_scatter(dat(
  x = 1:10,
  y = 1:10,
  colour = colours[selColour],
  on_mouseover = function(i) {
    selColour <<- i
    updateCharts()
  },
  on_mouseout = function() {
    selColour <<- 11
    updateCharts()
  }
))
```
<div id="example14"></div>

In any chart you can select elements by drawing a rectangle with the mouse or by clicking on the 
element while holding the `Shift` key. Double mouse click with the `Shift` key pressed will deselect
all the elements. Whenever any element is selected or deselected, function assigned to the `on_marked` property is 
called. At any moment you can get indices of currently selected elements of any chart by calling `getMarked`.
Let's make a brushing example. When on_marked event is triggered for one of the charts, we get indices of selected
points (`getMarked("A1")`) and select them on the other chart (`mark(getMarked("A1"), "A2")`). Note, that when 
we use `mark` function `on_marked` is not called to prevent creating infinite stack of calls. You can change that
by setting `preventEvent = FALSE`.


```r
openPage(layout = "table1x2")

lc_scatter(dat(
    x = iris$Sepal.Length,
    y = iris$Petal.Length,
    colourValue = iris$Species,
    on_marked = function() {
      mark(getMarked("A1"), "A2")
    }
  ), "A1", width = 300, height = 300)

lc_scatter(dat(
    x = iris$Sepal.Width,
    y = iris$Petal.Width,
    colourValue = iris$Species,
    on_marked = function() {
      mark(getMarked("A2"), "A1")
    }
  ), "A2", width = 300, height = 300)
```
<div id="example15">
  <table><tr><td id = "A1"></td><td id = "A2"></td></tr></table>
</div>
Try it by selecting points on one of the charts (the `Shift` key must be pressed in order to select points).

If you want to see more use cases of these properties, check [this](citeseq1.html) tutorial.

## Axes Settings
This section describes the following properties:
- `shiftX`/`shiftY`
- `jitterX`/`jitterY`
- `logScaleX`/`logScaleY`
- `layerDomainX`/`layerDomainY`
- `domainX`/`domainY`
- `aspectRatio`
- `axisTitleX`/`axisTitleY`
- `ticksRotateX`/`ticksRotateY`
- `ticksX`/`ticksY`

When you want to put too many points on a scatter plot, overplotting can become an annoying issue. It means that several
points have the same (or almost the same) coordinates and are plotted on top of each other. In this case it's impossible
to say, how many points are there at some coordinates. What seems to be one point can be two, or ten, or hundred.
One way to address this problem is to make points transperent (e.g. `opacity = 0.4`). Another is to add noise along one
of the axes, which can be especially helpful when one of the axes is categorical or discrete and there are noticeable gaps
between agglomeration of points.

`shiftX`, `shiftY`, `jitterX`, `jitterY` can add this noise. `jitterX` and jitterY` are numbers that specify 
amplitude of the random noise that will be added to each point along one of the axes. 0 stands for no noise, 1 is 
distance between `x` and `x + 1` for linear scale, `x` and `b*x` for logarithmic scale (where `b` is a base of the 
logarithm), and between neighbouring ticks for categorical scale. `shiftX` and `shiftY` specify shift for each 
point separately. `jitterX = 0.3` is equivalent to `shiftX = runif(length(x), -0.3, 0.3)`.

This example demonstrate how `jitterX` works and also shows how one can use `shiftX` to create a violine plot. 
We generate 1500 points devided into three groups `"a", "b"` and `"c"`. Y-values are normaly distributed within 
each group, but with different means.


```r
x <- rep(c("a", "b", "c"), each = 500)
y <- c(rnorm(500), rnorm(500, 3), rnorm(500, 7))

openPage(useViewer = F, layout = "table1x2")

# scatterplot with jitter
lc_scatter(dat(
    x = x, 
    y = y,
    jitterX = 0.3,
    size = 2.5
  ), "A1")

# simple function to scale a vector into unitary range
rescale <- function(x, min = 0, max = 1) {
  (x - min(x)) / (max(x) - min(x)) * (max - min) + min
}

# generate random noise that is proportional to ker
shift <- unlist(tapply(y, x, function(points) { # for every group of points
  d <- density(points) # calculate density distribution of y-values
  runif(length(points), -0.3, 0.3) * # multiply random noise
    rescale(approx(d$x, d$y, xout = points)$y) # by value from 0 to 1 proportional 
                                    # to density at this point
}))

# use generated noise as shift along x-axis
lc_scatter(dat(
  x = x, 
  y = y,
  shiftX = shift,
  size = 2.5
), "A2")
```
<div id="example16">
  <table><tr><td id = "A1"></td><td id = "A2"></td></tr></table>
</div>

You can make your x or y axis logarithmic by setting `logScaleX` and `logScaleY` respectively to the base of the
desired logarithm.


```r
lc_scatter(dat(x = seq(1, 128, length.out = 20),
               y = seq(1, 128, length.out = 20),
               logScaleY = 2))
```
<div id="example17"></div>

By default, limits of the axes are set so that to include all the user-provided values. One can change them simply by
changing `domainX` or `domainY`. If an axis is continuous, correspoinding domain should be a vector with minimal and
maximal value to display. Domain for a logarithmic scale must contain only positive values. Domain for a categorical 
axis is a vector of all possible values to display. One can also specify domain not for the entire chart, but only 
for a given layer using `layerDomainX` and `layerDomainY`. The resulting domain then will be something that includes
domains of all the layers.

No matter how you set the axes limits, they define only the initial state of the chart. Afterwards you can alway zoom in
or out. Just draw a rectangle with your mouse and the chart will zoom in the selected area. Double click will return chart
to its original scale. You can also use `+` and `-` buttons on the tools pannel (click on the grey triangle in the 
left upper corner) to zoom in or out.


```r
x1 <- runif(40, 0, 10)
x2 <- runif(40, -5, 5)

lc_scatter(dat(
    x = x1,
    y = x1 * 3 + rnorm(40),
    layerDomainX = c(3, 9),
    domainY = c(0, 20)),
  id = "chart")

lc_scatter(x = x2, y = -x2  + rnorm(40), 
          colour = "red", 
          id = "chart", 
          addLayer = T) # new scatter plot will be added as a new layer
```
<div id="example18"></div>

When the first scatter plot is generated, it uses `c(3, 9)` as limits for x-axis and `c(0, 20)` - for y-axis. There is no difference between
using `domainX` and `layerDomainX`, when chart has only one layer. Then we add another layer that has points outside the limits of both
axes. And now x-axis changes to fit all the new (red) points, while y-axis remains the same. That is the difference between the two properties. 
`domainY` specify limits of the y-axis for the entire chart, no matter what else will be there. `layerDomainX` on the other hand is combined with
other layers' domains to define the final limits of the axis.

And here is how domain works for categorical axes.


```r
lc_scatter(dat(
  x = iris$Species,
  y = iris$Sepal.Length,
  jitterX = 0.2,
  colourValue = iris$Petal.Length,
  domainX = c("virginica", "something else", "setosa", "versicolor")
))
```
<div id="example19"></div>

`domainX = c("virginica", "something else", "setosa", "versicolor")` not only specifies order of ticks, but also tells the chart to 
expect `"something else"` as one of the species, even thoug there is no points with this x-value.

`aspectRatio` allows to control the aspect ratio of the axes. Note, that it's possible only if both axes are linear and
continuous. In all other cases this property will be ignored.


```r
lc_scatter(x = 1:10, y = 1:10,
           height = 200, # make the chart wide
           aspectRatio = 1)
```
<div id="example20"></div>

`axisTitleX` and `axisTitleY` set titles of the axes. `ticksRotateX` and `ticksRotateY` allow to rotate ticks. The angle of rotation must be
set in degrees and lie between 0 and 90. Any values outside this range will be put into it. It is also possible to define what ticks to show
and to replace their lables with something esle. To this end, `ticksX` and `ticksY` one should set to one or several columns of values. The
first column is always where to put ticks. Next columns are optional and they allow to specify with what to replace tick values (one tick
can be replaced with several values simultaneously, as if you have several axes at the same time).

Imagine now in the Iris dataset some values are missing. By default these points are moved to the left upper corner of the plot, but what if
we want to show them as well? We can replace NAs with some numerc value that is smaller than all our real values and then change tick labels to
indicate that.


```r
values <- iris$Sepal.Length
#add some NAs
values[sample(length(values), 10)] <- NA 

values[is.na(values)] <- 3

lc_scatter(dat(
  x = iris$Species,
  y = values,
  ticksY = cbind(3:8, c("NA", 4:8)),
  ticksRotateX = 45,
  axisTitleX = "species",
  axisTitleY = "sepal length",
  jitterX = 0.2,
  size = 4,
  colourValue = iris$Petal.Length
))
```
<div id="example21"></div>


## Global chart Settings
This section describes the following properties:
- `width`
- `height`
- `paddings`
- `showLegend`
- `showPanel`
- `transitionDuration`
- `mode`

`width` and `height` specify size of the chart in pixels (default value for both is 500). It is possible to change default `paddings` that are
used for axes, titles, labels and dendograms (for heatmaps). `paddings` must be a list with at least one of the following four elements: 
`"top", "right", "bottom"` and `"left"`. `showLegend` is a boolean property, which specifies whether or not to show any legend at all. In similar 
manner with `showPanel` one can show or hide instrument panel (grey triangle in the right upper corner).


```r
lc_scatter(dat(
  x = iris$Sepal.Length,
  y = iris$Petal.Length,
  colourValue = iris$Sepal.Width,
  symbolValue = iris$Species,
  showLegend = F, 
  showPanel = F,
  width = 600,
  height = 300,
  paddings = list(left = 10)
))
```
<div id="example22"></div>
As you can see, this chart has no instrument panel or legend, it's wider than a default-sized one, and its left paddin is too small for
the y-axis ticks.

You could have noticed by now that when you update a chart, zoom in or zoom out, there is an animated transion between the states that allows you,
for example, to track the movement of each point. The duration of this transition is defined by `transitionDuration` property (in ms). If it is 
set to 0 there will be no transition effect, which can considerably save performance time in case of cumbersome calculations. It is also 
useful to turn the transition off, if you plan to make rapid changes to the chart. For example, you can change colour of the points depending
on which point the mouse is hovering right now.


```r
pca <- prcomp(iris[, 1:4]) #get principle components

#fucntion that calculates a distance from a given pint to
#all other points
getDinstance <- function(p) {
  sqrt(rowSums(t((t(iris[, 1:4]) - unlist(iris[p, 1:4])))^2))
}

selPoint <- 1

lc_scatter(dat(
  x = pca$x[, 1],
  y = pca$x[, 2],
  colourValue = getDinstance(selPoint),
  transitionDuration = 0,
  on_mouseover = function(i) {
    selPoint <<- i
    updateCharts(updateOnly = "ElementStyle")
  }
))
```
<div id="example23"></div>

This example allows to check how well a dimentionality reduction approach (in this case, PCA) preserves the original distance. As it usually 
happens we plot the first two principal components. The points are coloured by the distance from the selected one (`selPoint`). When user 
moves the mouse over one of the points a mouseover event fires. When it happens, we change the selected point (`selPoint <<- i`) and call the 
`updateCharts` function. `updateOnly = "ElementStyle"` tells is to change only style of the points and nothing else. In case of many points this
may save some performance.

Scatters, beeswarms and heatmaps can also work in either "svg", or "canvas" mode. In "svg" mode each point or cell is a separate element whick allows
you to be more effective, when you want to change only some of them or only a specific aspect of a chart (e.g. change colour of the points 
without changing their location). Yet if you have too many points, rendering each of them as a separate element can require too much memory and 
considerably slows down you browser or RStudio Viewer. An alternative to SVG is HTML-Canvas. In "canvas" mode all the points or cells are 
parts of a single image. It makes rendering much faster, but any change of the plot, no matter how small, requires the image to be completely 
redrawn. No transition effect is available for the "canvas" mode. It also can't be used in RStudio Viewer. If you want to use "canvas" mode,
you need first to open a page in your browser (`openPage(useViewer = FALSE)`). There are three options available for the `mode` property:
`"svg"` and `"canvas"` specifies the mode and `"default"` allows chart to select the mode automatically.

## Heatmaps
This section describes the following properties:
- `rowLabel`/`colLabel`
- `clusterRows`/`clusterCols`
- `showDendogramRow`/`showDendogramCol`
- `rankRows`/`rankCols`
- `on_labelClickRow`/`on_labelClickCol`
- `rowTitle`/`colTitle`
- `showValue`

Each row and column of heatmap has labels that are shown next to the row or column and on the label that apears when mouse hovers onel of the cells.
This labels can be automatically picked from column and row names of the `value` matrix, or you can specify them using `colLabel` and `rowLabel`. 
When neither is available, numbers are used instead. `clusterRows` and `clusterCols` specify, whether rows and columns should be clustered when the
heatmap is generated. Even if these two are set to `FALSE`, you can always cluster rows and columns later, using the instrument panel (click on the
grey triangle in the upper-left corner to open/hide the instrument panel). Note, that hierarchical clustering is slow and it may cause 
the page to go down. When rows or columns are clustered, an interective dendogram appears on the top or to the left from the heatmap. You can 
click on a branch of the, for example, row dendogram to cluster columns, using only rows of the selected branch as features.


```r
openPage(useViewer = F)

lc_heatmap(dat(
  value = as.matrix(dist((iris[1:4]))),
  rowLabel = iris$Species, # labels do not have to be unique
  colLabel = iris$Species,
  clusterRows = T, # we cluster rows and columns
  clusterCols = T,
  showDendogramRow = F # but hide row dendogram
))
```
<div id="example24"></div>

If `showValue` is true, then when user moves the mouse over a cell, instead of a label with column and row IDs and the corresponding value,
only the value will be shown directly inside the cell. This may be useful for small heatmaps with large cells. `rowTitle` and `colTitle` work like
axes title, but for heatmaps.

By default, rows and columns are ordered as they are given. If `clusterRows` or `clusterCols` is `TRUE`, then rows or columns are ordered 
according to the hierarchical clustering. It is also possible to set row and column order by setting `rankRows` and `rankCols` properties.
You may have noticed by now, that clicking on a row label causes columns to rearange themselves so that cells in the clicked row are sorted 
by their values. The same goes for column lables Now, we are going to replace that with a different kind of behaviour. When a row label is clicked,
it will be placed on top of the heatmap and all other rows will be ordered by correlation with the selected one.


```r
openPage(useViewer = F)
rnk <- 1:nrow(iris) # initial rank of rows

lc_heatmap(dat(
  value = iris[, 1:4],
  rowLabel = iris$Species,
  colLabel = colnames(iris),
  height = 1000,
  rankRows = rnk,
  showValue = T,
  rowTitle = "Samples",
  colTitle = "Measurements",
  on_labelClickRow = function(i) {
    rnk <<- rank(-cor(unlist(iris[i, 1:4]), t(iris[, 1:4])))
    updateCharts()
  }
))
```

```
## Warning in setProperties(c(data, nonEv), id, layerId): In chart 'Chart1':
## Property 'rankRows' doesn't exist.
```
<div id="example25"></div>
<script src="props/examples.js"></script>
