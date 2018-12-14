---
usePrism: true
title: 'rlc API'
---
# Add a default layout to the opened web page

* `addDefaultLayout`


## Description

`addDefaultLayout` adds a layout that can be later used to arrange charts on the page (by
 default each new chart is added to the bottom of the page).


## Usage

```r
addDefaultLayout(layoutName)
```


## Arguments

Argument      |Description
------------- |----------------
`layout`     |     Type of the layout. See 'Details' for more information.


## Details

Currently the only supported type
 of a default layout is table with arbitrary number of rows and columns.
 To use it set the layout argument to `tableMxN` , where `N` is the
 number of rows and `M` is the number of columns. Each cell will get an ID that consists of
 a letter (inticating the row) and a number (indicating the column) (e.g. `B3` is an ID of
 the second row and third column).


## Examples

```r
addDefaultLayout("table3x2")
```


# Close page

* `closePage`


## Description

Close an opened web page and clear the list of charts.


## Usage

```r
closePage()
```


## Examples

```r
openPage(useViewer = F)
closePage()
```


# Link data to the chart

* `dat`


## Description

`dat` allows to link variables from the current environment to chart's properties.
 On every [`updateCharts`](#updatecharts) call all the data, provided via the `dat` function,
 will be automatically reevaluated and the chart will be changed accordingly. One can also
 put properties outside of the `dat` function, if they are going to be constant.


## Usage

```r
dat(...)
```


## Arguments

Argument      |Description
------------- |----------------
`...`     |     List of name values pair to define the properties.


## Examples

```r
lc_scatter(dat(x = rnorm(30)), y = rnorm(30))
#note that the Y values remain the same after each updateCharts call
updateCharts()
```


# Get currently marked elements

* `getMarked`


## Description

`getMarked` returns indices of the chart's elements that are currently
 marked. To mark elements select them with you mouse while pressing the Shift key.
 Double click on the chart while pressing the Shift key will unmark all the
 elements.


## Usage

```r
getMarked(chartId = NULL, layerId = NULL)
```


## Arguments

Argument      |Description
------------- |----------------
`chartId`     |     An ID of the chart.
`layerId`     |     An ID of the layer. This argument is required, if the chart has more than one layer.


## Value

a vector of indices or, in case of heatmaps, an n x 2 matrix were first and
 second columns contain, respectively, row and colunm indices of the marked cells.


## Examples

```r
data(iris)

lc_scatter(dat(x = iris$Sepal.Length, y = iris$Petal.Length))

#now mark some points by selecting them with your mouse with Shift pressed

getMarked("Chart1")
```


# Create a barplot

* `lc_bars`


## Description

`lc_bars` creates a new barplot and adds it on the page
 as a new chart or as a new layer of an existing chart.


## Usage

```r
lc_bars(data = list(), place = NULL, ..., id = NULL,
  layerId = NULL, addLayer = F)
```


## Arguments

Argument      |Description
------------- |----------------
`data`     |     Name value pairs of properties, passed through the [`dat`](#dat) function. These properties will be reevaluated on each [`updateCharts`](#updatecharts) call.
`place`     |     An ID of a container, where to place the chart. Will be ignored if the chart already exists. If not defined, the chart will be placed directly in the body of the opened page.
`...`     |     Name value pairs of properties that can be evaluated only once and then will remain constant. These properties can still be changed later using the [`setProperties`](#setproperties) function
`id`     |     An ID for the chart. All charts must have unique IDs. If a chart with the same ID already exists, a new layer will be added to it. If you want to replace one chart with another, use [`removeChart`](#removechart)  first. If not defined, the ID will be set to `ChartN` , where `N - 1` is the number of currently existing charts.
`layerId`     |     An ID for the new layer. All layers within one chart must have different IDs. If a layer with the same ID already exists, it will be replaced. If not defined, will be set to `LayerN` , where `N - 1`  is the number of currently existing layers in this chart.
`addLayer`     |     whether to add a new layer or to replace the existing one. This argument influences the chart only if it has only one layer and the `layerId` is not defined.


## Available Properties

You can read more about different properties
 [here](https://anders-biostat.github.io/linked-charts/rlc/tutorials/props.html) .
 
  

*   `value` - heights of bars/stacks. 

*   `stackIds` - IDs for all stacks (if necessary). Must be the same size as `values` . 

*   `barIds` - IDs for all bars (if necessary). Must be the same size as `values` . 

*   `groupIds` - IDs for all groups (if necessary). Must be the same size as `values` . 

*   `groupWidth` - ratio of width of a group of bars to the space, available to the group. 
 
 Style settings
  

*   `opacity` - opacity of each bar|stack in the range from 0 to 1. 

*   `colour` - colour of each bar|stack. Must be a colour name or hexidecimal code. 

*   `colourValue` - grouping values for different colours. Can be numbers or charachters. 

*   `colourDomain` - vector of all possible values for discrete colour scales or range of all possible colour values for the continuous ones. 

*   `palette` - vector of colours to construct the colour scale. 

*   `colourLegendTitle` - title for the colour legend. 

*   `addColourScaleToLegend` - whether or not to show colour legend for the current layer. 

*   `globalColourScale` - whether or not to use one colour scale for all the layers. 

*   `stroke` -  stroke colour of each bar|stack. Must be a colour name or hexidecimal code. 

*   `strokeWidth` - width of the strokes of each bar|stack. 
 
 Axes settings
  

*   `logScaleX, logScaleY` - a base of logarithm for logarithmic scale transformation. If 0 or `FALSE` no transformation will be performed. 

*   `layerDomainX, layerDomainY` - default axes ranges for the given layer. 

*   `domainX, domainY` - default axes ranges for the entire chart. If not defined, is automatically set to include all layer domains. 

*   `contScaleX, consScaleY` - whether or not the axis should be continuous. 

*   `aspectRatio` - aspect ratio. 

*   `axisTitleX, axisTitleY` - axes titles. 

*   `ticksRotateX, ticksRotateY` - degrees of angle to rotate ticks. Must be between 0 (horisontal ticks, default) and 90 (vertical ticks). 

*   `ticksX, ticksY` - set of ticks for the axes. 
 
 Interactivity settings
  

*   `on_click` - function, to be called, when one of the bars is clicked. Gets an index of the clicked bar as an argument. 

*   `on_mouseover` - function, to be called, when mouse hovers over one of the bars. Gets an index of the clicked bar as an argument. 

*   `on_mouseout` - function, to be called, when mouse moves out of one of the bars. 

*   `on_marked` - function, to be called, when any of the bars are selected (marked) or deselected. Use [`getMarked`](#getmarked) function to get the IDs of the currently marked bars. 
 
 Global chart settings
  

*   `width` - width of the chart in pixels. 

*   `heigth` - height of the chart in pixels. 

*   `plotWidth` - width of the plotting area in pixels. 

*   `plotHeight` - height of the plotting area in pixels. 

*   `paddings` - paddings size in pixels. Must be a list with all the following fields: `"top", "bottom", "left", "right"` . 

*   `title` - title of the chart. 

*   `titleX, titleY` - coordinates of the chart title. 

*   `titleSize` - font-size of the chart title. 

*   `showLegend` - whether or not to show the legend. 

*   `showPanel` - whether of not to show the tools panel. 

*   `transitionDuration` - duration of the transtions between any two states of the chart. If 0, no animated transition is shown. It can be useful to turn the transition off, when lots of frequent changes happen to the chart.


## Examples

```r
data("esoph")

lc_bars(dat(value = tapply(esoph$ncases, esoph$agegp, sum),
title = "Number of cases per age group",
axisTitleX = "Age group",
axisTitleY = "Number of esophageal cases"))

lc_bars(dat(value = c(tapply(esoph$ncases, esoph$agegp, sum), tapply(esoph$ncontrols, esoph$agegp, sum)),
stackIds = c(rep("case", 6), rep("control", 6))))

#It is ease to put data in a convenient form for barplots using tidyverse
library(tidyverse)

esoph %>%
gather(type, cases, (ncases:ncontrols)) %>%
mutate(type = str_sub(type, 2, -2)) %>%
group_by(agegp, alcgp, type) %>%
summarise(ncases = sum(cases)) -> newData

lc_bars(dat(value = newData$ncases,
stackIds = newData$type,
barIds = newData$alcgp,
groupIds = newData$agegp))
```


# Add a colour slider

* `lc_colourSlider`


## Description

Colour slider provides an easy way to change any continuous colour scale
 interactively. If your chart uses a continuous colour scale, you can just
 link a colour slider and it will be automatically synchronized with your
 chart's colour scale.


## Usage

```r
lc_colourSlider(data = list(), place = NULL, ..., id = NULL)
```


## Arguments

Argument      |Description
------------- |----------------
`data`     |     Name value pairs of properties, passed through the [`dat`](#dat) function. These properties will be reevaluated on each [`updateCharts`](#updatecharts) call.
`place`     |     An ID of a container, where to place the chart. Will be ignored if the chart already exists. If not defined, the chart will be placed directly in the body of the opened page.
`...`     |     Name value pairs of properties that can be evaluated only once and then will remain constant. These properties can still be changed later using the [`setProperties`](#setproperties) function
`id`     |     An ID for the chart. All charts must have unique IDs. If a chart with the same ID already exists, a new layer will be added to it. If you want to replace one chart with another, use [`removeChart`](#removechart)  first. If not defined, the ID will be set to `ChartN` , where `N - 1` is the number of currently existing charts.


## Available Properties

You can read more about different properties
 [here](https://anders-biostat.github.io/linked-charts/rlc/tutorials/props.html) .
 
  

*   `chart` - id of the chart whose colour scale should be linked to the colour slider. 

*   `layer` - id of the layer whose colour scale should be linked to the colour slider. If chart has only one layer, this property can be omitted. 
 
 Global chart settings
  

*   `width` - width of the chart in pixels. 

*   `heigth` - height of the chart in pixels. 

*   `paddings` - paddings size in pixels. Must be a list with all the following fields: `"top", "bottom", "left", "right"` . 

*   `title` - title of the chart. 

*   `titleX, titleY` - coordinates of the chart title. 

*   `titleSize` - font-size of the chart title.


## Examples

```r
data("iris")
lc_scatter(dat(x = iris$Sepal.Length,
y = iris$Petal.Length,
colourValue = iris$Petal.Width,
symbolValue = iris$Species),
title = "Iris dataset",
axisTitleY = "Petal Length",
axisTitleX = "Sepal Length",
colourLegendTitle = "Petal Width",
symbolLegendTitle = "Species",
showLegend = F,
id = "scatter")

lc_colourSlider(chart = "scatter")
```


# Create a heatmap

* `lc_heatmap`


## Description

`lc_heatmap` creates a new heatmaps. Unlike charts with axes, heatmaps do not have
 any layers.


## Usage

```r
lc_heatmap(data = list(), place = NULL, ..., id = NULL,
  pacerStep = 50)
```


## Arguments

Argument      |Description
------------- |----------------
`data`     |     Name value pairs of properties, passed through the [`dat`](#dat) function. These properties will be reevaluated on each [`updateCharts`](#updatecharts) call.
`place`     |     An ID of a container, where to place the chart. Will be ignored if the chart already exists. If not defined, the chart will be placed directly in the body of the opened page.
`...`     |     Name value pairs of properties that can be evaluated only once and then will remain constant. These properties can still be changed later using the [`setProperties`](#setproperties) function
`id`     |     An ID for the chart. All charts must have unique IDs. If a chart with the same ID already exists, a new layer will be added to it. If you want to replace one chart with another, use [`removeChart`](#removechart)  first. If not defined, the ID will be set to `ChartN` , where `N - 1` is the number of currently existing charts.
`pacerStep`     |     Time in ms between to consequentive calls of onmouseover event. Prevents overqueuing in case of cumbersome computations. May be important when the chart works in canvas mode.


## Available Properties

You can read more about different properties
 [here](https://anders-biostat.github.io/linked-charts/rlc/tutorials/props.html) .
 
  

*   `value` - matrix of values. 

*   `rowLabel, colLabel` - vector of labels for all rows or columns. 

*   `showDendogramRow, showDendogramCol` - whether to show dendograms when rows or columns are clustered. Even if these properties are set to `FALSE` , rows and columns can still be clustered. 

*   `clusterRows, clusterCols` - whether rows or columns should be clustered. If these properties are set to `FALSE` , rows and columns can still be clustered later using the instrument panel. 

*   `mode` - one of `"default", "svg", "canvas"` . Defines, whether to display heatmap as an SVG or Canvas object. `"default"` mode switches between the two, turning heatmap into Canvas image, when there are too many cell, and into SVG object otherwise. 

*   `heatmapRow, heatmapCol` - default order of rows and columns of the heatmap. 

*   `showValue` - if `TRUE` , than in the values will be shown as text in each cell. 
 
 Style settings
  

*   `rowTitle, colTilte` - titles of rows and columns. 

*   `palette` - vector of colours to construct the colour scale. 

*   `colourDomain` - domain of the colour scale. All values outside it will be clamped to its edges. 
 
 Interactivity settings
  

*   `on_click` - function, to be called, when one of the cells is clicked. Gets row and column idices of the clicked cell as its arguments. 

*   `on_mouseover` - function, to be called, when mouse hovers over one of the cells. Gets row and column indices of the clicked cell as its arguments. 

*   `on_mouseout` - function, to be called, when mouse moves out of one of the cells. 

*   `on_marked` - function, to be called, when any of the cells are selected (marked) or deselected. Use [`getMarked`](#getmarked) function to get the IDs of the currently marked cells. 
 
 Global chart settings
  

*   `width` - width of the chart in pixels. 

*   `heigth` - height of the chart in pixels. 

*   `plotWidth` - width of the plotting area in pixels. 

*   `plotHeight` - height of the plotting area in pixels. 

*   `paddings` - paddings size in pixels. Must be a list with all the following fields: `"top", "bottom", "left", "right"` . 

*   `title` - title of the chart. 

*   `titleX, titleY` - coordinates of the chart title. 

*   `titleSize` - font-size of the chart title. 

*   `showLegend` - whether or not to show the legend. 

*   `showPanel` - whether of not to show the tools panel. 

*   `transitionDuration` - duration of the transtions between any two states of the chart. If 0, no animated transition is shown. It can be useful to turn the transition off, when lots of frequent changes happen to the chart.


## Examples

```r
#create a test matrix
test <- cbind(sapply(1:10, function(i) c(rnorm(10, mean = 1, sd = 3),
rnorm(6, mean = 5, sd = 2),
runif(14, 0, 8))),
sapply(1:10, function(i) c(rnorm(10, mean = 3, sd = 2),
rnorm(6, mean = 1, sd = 2),
runif(14, 0, 8))))
test[test < 0] <- 0
rownames(test) <- paste0("Gene", 1:30)
colnames(test) <- paste0("Sample", 1:20)

lc_heatmap(dat(value = test))

# when you want to cluster rows or columns, it can be
# a good idea to make bottom and right paddings larger to
# fit labels
lc_heatmap(dat(value = test),
clusterRows = T,
clusterCols = T,
paddings = list(top = 50, left = 30, bottom = 75, right = 75))

lc_heatmap(dat(value = cor(test),
colourDomain = c(-1, 1),
palette = RColorBrewer::brewer.pal(11, "RdYlBu")))
```


# Histograms and density plots

* `lc_hist`
* `lc_dens`


## Description

These functions make either a histogram or a density plot of the given data
 and either add them as a new layer to an existing chart or create a new chart.


## Usage

```r
lc_hist(data = list(), place = NULL, ..., id = NULL,
  layerId = NULL, addLayer = F)
lc_dens(data = list(), place = NULL, ..., id = NULL,
  layerId = NULL, addLayer = F)
```


## Arguments

Argument      |Description
------------- |----------------
`data`     |     Name value pairs of properties, passed through the [`dat`](#dat) function. These properties will be reevaluated on each [`updateCharts`](#updatecharts) call.
`place`     |     An ID of a container, where to place the chart. Will be ignored if the chart already exists. If not defined, the chart will be placed directly in the body of the opened page.
`...`     |     Name value pairs of properties that can be evaluated only once and then will remain constant. These properties can still be changed later using the [`setProperties`](#setproperties) function
`id`     |     An ID for the chart. All charts must have unique IDs. If a chart with the same ID already exists, a new layer will be added to it. If you want to replace one chart with another, use [`removeChart`](#removechart)  first. If not defined, the ID will be set to `ChartN` , where `N - 1` is the number of currently existing charts.
`layerId`     |     An ID for the new layer. All layers within one chart must have different IDs. If a layer with the same ID already exists, it will be replaced. If not defined, will be set to `LayerN` , where `N - 1`  is the number of currently existing layers in this chart.
`addLayer`     |     whether to add a new layer or to replace the existing one. This argument influences the chart only if it has only one layer and the `layerId` is not defined.


## Functions

*   `lc_hist` : makes a histogram. It is an extension of [`lc_bars`](#lcbars) .  

*   `lc_dens` : makes a density plot. Is an extension of [`lc_line`](#lcline) .


## Available Properties

*   `value` - vector of data. 

*   `nbins` - (only for `lc_hist` ) number of bins. 
 
 These functions are extensions of [`lc_line`](#lcline) ( `lc_dens` ) or [`lc_bars`](#lcbars) 
 ( `lc_hist` ) and therefore can also understand their properties.


## Examples

```r
lc_hist(dat(value = rnorm(1000), nbins = 30, height = 300))
lc_dens(dat(value = rnorm(1000), height = 300))
```


# Add HTML code to the page

* `lc_html`


## Description

`lc_html` adds a block with HTML code. It uses [`hwrite`](#hwrite) function
 to transform some data structures (e.g. data frames) to HTML tables.


## Usage

```r
lc_html(data = list(), place = NULL, ..., id = NULL)
```


## Arguments

Argument      |Description
------------- |----------------
`data`     |     Name value pairs of properties, passed through the [`dat`](#dat) function. These properties will be reevaluated on each [`updateCharts`](#updatecharts) call.
`place`     |     An ID of a container, where to place the chart. Will be ignored if the chart already exists. If not defined, the chart will be placed directly in the body of the opened page.
`...`     |     Name value pairs of properties that can be evaluated only once and then will remain constant. These properties can still be changed later using the [`setProperties`](#setproperties) function
`id`     |     An ID for the chart. All charts must have unique IDs. If a chart with the same ID already exists, a new layer will be added to it. If you want to replace one chart with another, use [`removeChart`](#removechart)  first. If not defined, the ID will be set to `ChartN` , where `N - 1` is the number of currently existing charts.


## Available Properties

You can read more about different properties
 [here](https://anders-biostat.github.io/linked-charts/rlc/tutorials/props.html) .
 
  

*   `content` - HTML code to display on the page. Can also be a vector, data.frame or any other structure, that can be transformed by [`hwrite`](#hwrite) . 
 
 Global chart settings
  

*   `width` - width of the chart in pixels. By default, the entire content will be displayed. If width is defined and it's smaller than content's width, scrolling will be possible. 

*   `heigth` - height of the chart in pixels. By default, the entire content will be displayed. If height is defined and it's smaller than content's height, scrolling will be possible. 

*   `paddings` - paddings size in pixels. Must be a list with all the following fields: `"top", "bottom", "left", "right"` . 

*   `title` - title of the chart. 

*   `titleX, titleY` - coordinates of the chart title. 

*   `titleSize` - font-size of the chart title.


## Examples

```r
lc_html(content = "Some <b>HTML</b> <br> <i>code</i>.")
lc_html(dat(content = matrix(1:12, nrow = 4)))
data(iris)
lc_html(content = iris, height = 200)
```


# Lines and ribbons

* `lc_line`
* `lc_path`
* `lc_ribbon`
* `lc_abLine`
* `lc_hLine`
* `lc_vLine`


## Description

These functions create different kind of lines. They connect observations or
 create filled area, bordered by a line. Each layer may have one or several lines.


## Usage

```r
lc_line(data = list(), place = NULL, ..., id = NULL,
  layerId = NULL, addLayer = F)
lc_path(data = list(), place = NULL, ..., id = NULL,
  layerId = NULL, addLayer = F)
lc_ribbon(data = list(), place = NULL, ..., id = NULL,
  layerId = NULL, addLayer = F)
lc_abLine(data = list(), place = NULL, ..., id = NULL,
  layerId = NULL, addLayer = F)
lc_hLine(data = list(), place = NULL, ..., id = NULL,
  layerId = NULL, addLayer = F)
lc_vLine(data = list(), place = NULL, ..., id = NULL,
  layerId = NULL, addLayer = F)
```


## Arguments

Argument      |Description
------------- |----------------
`data`     |     Name value pairs of properties, passed through the [`dat`](#dat) function. These properties will be reevaluated on each [`updateCharts`](#updatecharts) call.
`place`     |     An ID of a container, where to place the chart. Will be ignored if the chart already exists. If not defined, the chart will be placed directly in the body of the opened page.
`...`     |     Name value pairs of properties that can be evaluated only once and then will remain constant. These properties can still be changed later using the [`setProperties`](#setproperties) function
`id`     |     An ID for the chart. All charts must have unique IDs. If a chart with the same ID already exists, a new layer will be added to it. If you want to replace one chart with another, use [`removeChart`](#removechart)  first. If not defined, the ID will be set to `ChartN` , where `N - 1` is the number of currently existing charts.
`layerId`     |     An ID for the new layer. All layers within one chart must have different IDs. If a layer with the same ID already exists, it will be replaced. If not defined, will be set to `LayerN` , where `N - 1`  is the number of currently existing layers in this chart.
`addLayer`     |     whether to add a new layer or to replace the existing one. This argument influences the chart only if it has only one layer and the `layerId` is not defined.


## Functions

*   `lc_line` : connects points in the order of variables on the x axis.  

*   `lc_path` : connects points in the order they are given.  

*   `lc_ribbon` : displays a filled area, defined by `ymax` and `ymin` values.  

*   `lc_abLine` : creates straight lines by intercept and slope values  

*   `lc_hLine` : creates horisontal lines by y-intercept values  

*   `lc_vLine` : creates vertical lines by x-intercept values


## Available Properties

You can read more about different properties
 [here](https://anders-biostat.github.io/linked-charts/rlc/tutorials/props.html) .
 
  

*   `x, y` - vector of x and y coordinates of the points to connect. Can be vectors for a single line or `m x n` matrix for `n` lines. 

*   `ymax, ymin` - (only for `lc_ribbon` ) vectors of maximal and minimal values of the ribbon. 

*   `a, b` - (only for `lc_abLine` ) vectors of slope and intercept values respectively. 

*   `v` - (only for `lc_vLine` ) vector of x-intercepts. 

*   `h` - (only for `lc_hLine` ) vector of y-intercepts. 

*   `lineWidth` - width of each line. 

*   `opacity` - opacity of the lines in the range from 0 to 1. 

*   `label` - vector of text labels for each line. 

*   `dasharray` - defines pattern of dashes and gaps for each line. 
 
 Colour settings
  

*   `colour` - colour of the lines. Must be a colour name or hexidecimal code. For `lc_ribbon` this property defined the colour of the ribbon, not the strokes. 

*   `fill` - colour with wich to fill area inside the line. Must be a colour name or hexidecimal code. 

*   `colourValue` - grouping values for different colours. Can be numbers or charachters. 

*   `colourDomain` - vector of all possible values for discrete colour scales or range of all possible colour values for the continuous ones. 

*   `palette` - vector of colours to construct the colour scale. 

*   `colourLegendTitle` - title for the colour legend. 

*   `addColourScaleToLegend` - whether or not to show colour legend for the current layer. 

*   `globalColourScale` - whether or not to use one colour scale for all the layers. 

*   `stroke` - (only for `lc_ribbon` ) stroke colour for each ribbon. Must be a colour name or hexidecimal code. 

*   `strokeWidth` - (only for `lc_ribbon` ) width of the strokes for each ribbon. 
 
 Axes settings
  

*   `logScaleX, logScaleY` - a base of logarithm for logarithmic scale transformation. If 0 or `FALSE` no transformation will be performed. 

*   `layerDomainX, layerDomainY` - default axes ranges for the given layer. 

*   `domainX, domainY` - default axes ranges for the entire chart. If not defined, is automatically set to include all layer domains. 

*   `contScaleX, consScaleY` - whether or not the axis should be continuous. 

*   `aspectRatio` - aspect ratio. 

*   `axisTitleX, axisTitleY` - axes titles. 

*   `ticksRotateX, ticksRotateY` - degrees of angle to rotate ticks. Must be between 0 (horisontal ticks, default) and 90 (vertical ticks). 

*   `ticksX, ticksY` - set of ticks for the axes. 
 
 Interactivity settings
  

*   `on_click` - function, to be called, when one of the lines is clicked. Gets an index of the clicked line as an argument. 

*   `on_mouseover` - function, to be called, when mouse hovers over one of the lines. Gets an index of the clicked line as an argument. 

*   `on_mouseout` - function, to be called, when mouse moves out of one of the lines. 

*   `on_marked` - function, to be called, when any of the lines are selected (marked) or deselected. Use [`getMarked`](#getmarked) function to get the IDs of the currently marked lines. 
 
 Global chart settings
  

*   `width` - width of the chart in pixels. 

*   `heigth` - height of the chart in pixels. 

*   `plotWidth` - width of the plotting area in pixels. 

*   `plotHeight` - height of the plotting area in pixels. 

*   `paddings` - paddings size in pixels. Must be a list with all the following fields: `"top", "bottom", "left", "right"` . 

*   `title` - title of the chart. 

*   `titleX, titleY` - coordinates of the chart title. 

*   `titleSize` - font-size of the chart title. 

*   `showLegend` - whether or not to show the legend. 

*   `showPanel` - whether of not to show the tools panel. 

*   `transitionDuration` - duration of the transtions between any two states of the chart. If 0, no animated transition is shown. It can be useful to turn the transition off, when lots of frequent changes happen to the chart.


## Examples

```r
x <- seq(0, 8, 0.2)
lc_line(dat(x = x, y = cbind(cos(x), sin(x)),
aspectRatio = 1,
colour = c("blue", "red"),
dasharray = c("5", "1 5 5")))

points <- seq(0, 6.5, 0.1)
x <- cos(points)
y <- sin(points)
lc_path(dat(x = sapply(0:2, function(i) x + i),
y = sapply(0:2, function(i) y + i),
fill = c("blue", "red", "black"),
opacity = c(0.3, 0.5, 0.7)))

x <- seq(0, 5, 0.1)
y <- x*3 + rnorm(length(x), sd = 2)
fit <- lm(y ~ x)
pred <- predict(fit, data.frame(x = x), se.fit = T)
lc_ribbon(dat(ymin = pred$fit - 1.96 * pred$se.fit,
ymax = pred$fit + 1.96 * pred$se.fit,
x = x,
colour = "#555555"), id = "ribbonTest")
lc_scatter(dat(x = x, y = y), size = 2, id = "ribbonTest")
lc_abLine(dat(a = fit$coefficients[2], b = fit$coefficients[1]), id = "ribbonTest")

lc_hLine(dat(h = seq(1, 9, 1), domainX = c(0, 10), domainY = c(0, 10)), id = "grid")
lc_vLine(dat(v = seq(1, 9, 1)), id = "grid")
```


# Visualize a set of points

* `lc_scatter`
* `lc_beeswarm`


## Description

These functions plot a set of points with known coordinates that can be either categorical,
 or continuous.


## Usage

```r
lc_scatter(data = list(), place = NULL, ..., id = NULL,
  layerId = NULL, addLayer = F, pacerStep = 50)
lc_beeswarm(data = list(), place = NULL, ..., id = NULL,
  layerId = NULL, addLayer = F, pacerStep = 50)
```


## Arguments

Argument      |Description
------------- |----------------
`data`     |     Name value pairs of properties, passed through the [`dat`](#dat) function. These properties will be reevaluated on each [`updateCharts`](#updatecharts) call.
`place`     |     An ID of a container, where to place the chart. Will be ignored if the chart already exists. If not defined, the chart will be placed directly in the body of the opened page.
`...`     |     Name value pairs of properties that can be evaluated only once and then will remain constant. These properties can still be changed later using the [`setProperties`](#setproperties) function
`id`     |     An ID for the chart. All charts must have unique IDs. If a chart with the same ID already exists, a new layer will be added to it. If you want to replace one chart with another, use [`removeChart`](#removechart)  first. If not defined, the ID will be set to `ChartN` , where `N - 1` is the number of currently existing charts.
`layerId`     |     An ID for the new layer. All layers within one chart must have different IDs. If a layer with the same ID already exists, it will be replaced. If not defined, will be set to `LayerN` , where `N - 1`  is the number of currently existing layers in this chart.
`addLayer`     |     whether to add a new layer or to replace the existing one. This argument influences the chart only if it has only one layer and the `layerId` is not defined.
`pacerStep`     |     Time in ms between to consequentive calls of onmouseover event. Prevents overqueuing in case of cumbersome computations. May be important when the chart works in canvas mode.


## Functions

*   `lc_scatter` : creates a scatterplot and adds it as a new layer to an existing chart or creates a new one.  

*   `lc_beeswarm` : creates a special kind of scatterplot, where the points are spread along one of the axes to avoid overlapping.


## Available Properties

You can read more about different properties
 [here](https://anders-biostat.github.io/linked-charts/rlc/tutorials/props.html) .
 
  

*   `x, y` - vector of x and y coordinates of the points. 

*   `size` - sizes of the points. Default size is 6. 

*   `opacity` - opacity of the points in the range from 0 to 1. 

*   `label` - vector of text labels for each point. 

*   `valueAxis` - (for `lc_beeswarm` only) defines, values along which of the axes should not be changed. Must be `"x"` or `"y"` . 
 
 Colour and shape settings
  

*   `colour` - colour of the points. Must be a colour name or hexidecimal code. 

*   `colourValue` - grouping values for different colours. Can be numbers or charachters. 

*   `colourDomain` - vector of all possible values for discrete colour scales or range of all possible colour values for the continuous ones. 

*   `palette` - vector of colours to construct the colour scale. 

*   `colourLegendTitle` - title for the colour legend. 

*   `addColourScaleToLegend` - whether or not to show colour legend for the current layer. 

*   `globalColourScale` - whether or not to use one colour scale for all the layers. 

*   `symbol` - shape of each point. Must be one of `"Circle", "Cross", "Diamond", ` . 

*   `symbolValue` - grouping values for different symbols. 

*   `symbolLegendTitle` - title for the symbol value. 

*   `stroke` - stroke colour for each element. Must be a colour name or hexidecimal code. 

*   `strokeWidth` - width of the strokes for each point. 
 
 Axes settings
  

*   `logScaleX, logScaleY` - a base of logarithm for logarithmic scale transformation. If 0 or `FALSE` no transformation will be performed. 

*   `jitterX, jitterY` - amount of random variation to be added to the position of the points along one of the axes. 0 means no variation. 1 stands for distance between `x` and `x + 1` for linear scale, `x` and `b*x` for logarithmic scale ( `b` is a base of the logarithm), and between neighbouring ticks for categorical scale. 

*   `shiftX, shiftY` - shift for each poitn from its original position along one of the axes. 0 means no shift. 1 stands for distance between `x` and `x + 1` for linear scale, `x` and `b*x` for logarithmic scale ( `b` is a base of the logarithm), and between neighbouring ticks for categorical scale. 

*   `layerDomainX, layerDomainY` - default axes ranges for the given layer. 

*   `domainX, domainY` - default axes ranges for the entire chart. If not defined, is automatically set to include all layer domains. 

*   `contScaleX, consScaleY` - whether or not the axis should be continuous. 

*   `aspectRatio` - aspect ratio. 

*   `axisTitleX, axisTitleY` - axes titles. 

*   `ticksRotateX, ticksRotateY` - degrees of angle to rotate ticks. Must be between 0 (horisontal ticks, default) and 90 (vertical ticks). 

*   `ticksX, ticksY` - set of ticks for the axes. 
 
 Interactivity settings
  

*   `on_click` - function, to be called, when one of the points is clicked. Gets an index of the clicked point as an argument. 

*   `on_mouseover` - function, to be called, when mouse hovers over one of the points. Gets an index of the clicked point as an argument. 

*   `on_mouseout` - function, to be called, when mouse moves out of one of the points. 

*   `on_marked` - function, to be called, when any of the points are selected (marked) or deselected. Use [`getMarked`](#getmarked) function to get the IDs of the currently marked points. 
 
 Global chart settings
  

*   `width` - width of the chart in pixels. 

*   `heigth` - height of the chart in pixels. 

*   `plotWidth` - width of the plotting area in pixels. 

*   `plotHeight` - height of the plotting area in pixels. 

*   `paddings` - paddings size in pixels. Must be a list with all the following fields: `"top", "bottom", "left", "right"` . 

*   `title` - title of the chart. 

*   `titleX, titleY` - coordinates of the chart title. 

*   `titleSize` - font-size of the chart title. 

*   `showLegend` - whether or not to show the legend. 

*   `showPanel` - whether of not to show the tools panel. 

*   `transitionDuration` - duration of the transtions between any two states of the chart. If 0, no animated transition is shown. It can be useful to turn the transition off, when lots of frequent changes happen to the chart.


## Examples

```r
data("iris")
lc_scatter(dat(x = iris$Sepal.Length,
y = iris$Petal.Length,
colourValue = iris$Petal.Width,
symbolValue = iris$Species),
title = "Iris dataset",
axisTitleY = "Petal Length",
axisTitleX = "Sepal Length",
colourLegendTitle = "Petal Width",
symbolLegendTitle = "Species")

lc_beeswarm(dat(x = iris$Species,
y = iris$Sepal.Length,
colourValue = iris$Sepal.Width),
title = "Iris dataset",
axisTitleY = "Sepal Length",
axisTitleX = "Species",
colourLegendTitle = "Sepal Width")
```


# List all existing charts and layers

* `listCharts`


## Description

`listCharts` prints a list of IDs of all existing charts and layers.


## Usage

```r
listCharts()
```


## Examples

```r
noise <- rnorm(30)
x <- seq(-4, 4, length.out = 30)

lc_scatter(dat(x = x,
y = sin(x) + noise,
colourValue = noise),
id = "plot", layerId = "points")
lc_line(dat(x = x, y = sin(x)), id = "plot")
lc_colourSlider(chart = "plot", layer = "points")

listCharts()
```


# Mark elements of a chart

* `mark`


## Description

`mark` selects a set of elements in a given chart. It is equivalent to
 selecting elemnts interactively by drawing a rectangle with the mouse
 while holding the `Shift` key.


## Usage

```r
mark(elements, chartId = NULL, layerId = NULL, preventEvent = T)
```


## Arguments

Argument      |Description
------------- |----------------
`elements`     |     numeric vector of indices of the elements to select.
`chartId`     |     ID of the chart where to select elements (can be omitted if there is only one chart).
`layerId`     |     ID of the layer where to select elements (can be omitted if the chart has only one layer).
`preventEvent`     |     if `TRUE` , `on_marked` function will not be called.


## Examples

```r
data("iris")
openPage(F, layout = "table1x2")

lc_scatter(dat(
x = iris$Sepal.Length,
y = iris$Petal.Length,
colourValue = iris$Species,
on_marked = function() {
mark(getMarked("A1"), "A2")
}
), "A1")

lc_scatter(dat(
x = iris$Sepal.Width,
y = iris$Petal.Width,
colourValue = iris$Species,
on_marked = function() {
mark(getMarked("A2"), "A1")
}
), "A2")
```


# Open a new empty page

* `openPage`


## Description

`openPage` creates a server, establishes a websocket connection between it and the current
 R session and loads linked-charts JS library with all the dependencies. If there is already an
 opened page, it will be automatically closed.


## Usage

```r
openPage(useViewer = T, rootDirectory = NULL, startPage = NULL,
  layout = NULL)
```


## Arguments

Argument      |Description
------------- |----------------
`useViewer`     |     If `TRUE` , the page will be opened in the RStudio Viewer. If `FALSE`  a default web browser will be used.
`rootDirectory`     |     A path to the root directory of the server. If `rootDirectory` is not defined, the `http_root` in the package directory will be used as a root directory.
`startPage`     |     A path to the HTML file that should be opened, when the server is initialised. This can be an absolute path to a local file, or it can be relative from the `rootDirectory`  or to the current R working directory. If `startPage` is not defined, this function opens an empty HTML page. The file must have .html extension.
`layout`     |     Adds one of the defaults layouts to the page. Currently, only tables of arbitrary size are supported. To add a table set this parameter to `tableNxM` , where `N` is the number of rows and `M` is the number of columns. Each cell will get an ID that consists of a letter (inticating the row) and a number (indicating the column) (e.g. `B3` is an ID of the second row and third column).


## Examples

```r
openPage()

openPage(useViewer = F, layout = "table2x3")
```


# Remove cahrt from the page

* `removeChart`


## Description

Removes an existing chart.


## Usage

```r
removeChart(id)
```


## Arguments

Argument      |Description
------------- |----------------
`id`     |     A vector of IDs of the charts to be removed.


## Examples

```r
lc_scatter(dat(x = 1:10, y = 1:10 * 2), id = "scatter")
removeChart("scatter")
```


# Set properties of the chart

* `setProperties`


## Description

Changes already defined properties or sets the new ones for an
 existing chart.


## Usage

```r
setProperties(data, id, layerId = NULL)
```


## Arguments

Argument      |Description
------------- |----------------
`data`     |     Set of properties to be redefined for this layer or chart. Created by [`dat`](#dat)  function.
`id`     |     ID of the chart, whose properties you want to redefine.
`layerId`     |     ID of the layer, whose properties you want to redefine. If the chart has a single layer or doesn't have layers, default value (which is NULL) can be used.


## Examples

```r
data("iris")
lc_scatter(dat(x = iris$Sepal.Length, y = iris$Sepal.Width), id = "irisScatter")
setProperties(dat(symbolValue = iris$Species, y = iris$Petal.Length), id = "irisScatter")
updateCharts("irisScatter")

lc_line(dat(x = iris$Sepal.Length, y = iris$Petal.Length), id = "irisScatter", layerId = "line")
setProperties(dat(colour = "red"), id = "irisScatter", layerId = "line")
updateCharts("irisScatter")
```


# Update a chart

* `updateCharts`


## Description

`updateCharts` redraws a chart or a single layer of the chart to make it up
 to date with the current state of the environment.


## Usage

```r
updateCharts(id = NULL, layerId = NULL, updateOnly = NULL)
```


## Arguments

Argument      |Description
------------- |----------------
`id`     |     An ID of the chart to be updated (or vector of IDs). If NULL then all the existing charts will be updated.
`layerId`     |     An ID of the layer to be updated (or vector of IDs). If NULL of the layers of the selected charts will be updated. To update only the selected layers of multiple charts the lengths of `id` and `layerId` must be the same.
`updateOnly`     |     To improve performance it may be useful to change only certain aspects of the chart (e.g. location of the points, colour of the heatmap cells, etc.). This argument can specify which part of chart to update. Possible options are `Elements` , `ElementPosition` , `ElementStyle` , `Axes` , `Labels` , `Cells` , `Texts` , `LabelPosition` , `CellPosition` , `TextPosition` , `LabelText` , `CellColour` , `TextValues` , `Canvas` , `Size` . See details for more information.


## Details

Linked charts of the rlc package are based on the idea that variables
 used to define the chart are not constant, but can change as a result of user's
 actions. Each time the `updateCharts` is called, all the properties passed
 via [`dat`](#dat) function are reevaluated and cahrt is changed in accordance with the
 new state.


## Update Types

To improve performance you can update only a certain part of the chart (e.g. colours,
 size, etc.). This can be done by setting the `updateOnly` argument. Here are all
 possible values for this argument.
 
 These are valid for all the charts:
  

*   `Size` changes the size of the chart (and consequently the location of all its elements). 

*   `Title` changes the title of the chart. 

*   `Canvas` If number of elements is too high the charts switch to the canvas mode and istead of multiple SVG point or cells a single Canvas image is generated. This type of update redraws the Canvas image. It is not recommended to use this function.  
 
 These can be updated only in heatmaps ( [`lc_heatmap`](#lcheatmap) ):
  

*   `Labels` adds new row and column labels and removes those that are no longer needed. Also updates `Cells` . 

*   `Cells` adds new cells and removes those that are no longer needed. Also updates `Texts` if necessary. 

*   `Texts` adds or remove text inside cells where needed. 

*   `LabelPosition` updates coordinates of all existing row and column labels. Also updates `CellPosition` . 

*   `CellPosition` updates coordinates of all existing cells. Also updates `TextPosition` if necessary. 

*   `LabelText` updates text of all existing labels. 

*   `CellColour` updates colour of all existing cells. Also updates `TextValues` if necessary. 

*   `TextValues` updates text inside cells to make it up to date with current data values. 
 
 These aspects are present in all the charts with axes.
  

*   `Axes` updates axes of the chart and changes positions of all the elements accordingly. 

*   `Elements` updates (add or removes) all the elements of the layer. 

*   `ElementPosition` updates positions of all the elements in the layer. 

*   `ElementStyle` updates the style (colour, opacity, etc.) of all the elements of the layer.


## Examples

```r
data(iris)

#store some properties in global variables
width <- 300
height <- 300
colour <- iris$Sepal.Width
#create a chart
lc_scatter(dat(x = iris$Sepal.Length, y = iris$Petal.Length, colourValue = colour,
width = width, height = height), id = "iris")

#change the variables
height <- 400
colour <- iris$Petal.Width

#this will change colour of points and chart height
updateCharts("iris")
#this will change only height
updateCharts("iris", updateOnly = "Size")

#add another property
setProperties(dat(symbolValue = iris$Species), "iris")
#this will change only colour and symbols
updateCharts("iris", updateOnly = "ElementStyle")
```


