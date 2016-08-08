import {divChartBase} from "./chartBase";

export function heatmapChart(){
	
	//user set parameters
	var obj = divChartBase()
			.add_property("nrows")
			.add_property("ncols")
			.add_property("value");
	
	//optional parameters with possible default values
	obj.add_property("mode", "default")
		.add_property("height", 1000)
		.add_property("width", 1000)
		.add_property("margin", {top: 100, bottom: 50, left: 100, right: 20})
		.add_property("colLabels", function(i) {return i;})
		.add_property("rowLabels", function(i) {return i;})
		.add_property("colIds", function() {return d3.range(obj.get_ncols());})
		.add_property("rowIds", function() {return d3.range(obj.get_nrows());})
		.add_property("colour", function(val) {return obj.colourScale(val);})
		.add_property("heatmapRow", function(rowId){return rowId;})
		.add_property("heatmapCol", function(colId) {return colId;})
		.add_property("palette", ["#0000FF", "#002FFF", "#005FFF", "#008FFF", "#00BFFF", 
			"#3FCFFF", "#7FDFFF", "#BFEFFF", "#FFFFFF", "#FDFDF3", "#FCFCE8", "#FBFBDD",
			"#FAFAD2", "#F7DBBD", "#F4BDA9", "#F29E94", "#F08080", "#F35F5F", "#F74040",
			"#FB1F1F", "#FF0000"]);
		
	//returns maximum and minimum values of the data
	obj.dataRange = function(){
		var i = 0, range, newRange;
		do{
			newRange = d3.extent(obj.get_colIds(), 
				function(col) {return obj.get_value(obj.get_rowIds()[i], col);});
			if(typeof range === "undefined")
				range = newRange;
			if(newRange[0] < range[0])
				range[0] = newRange[0];
			if(newRange[1] > range[1])
				range[1] = newRange[1];
			i++;
		}while (i < obj.get_nrows())
			
		return range;
	}

	//reset a colourScale
	//in cases like zooming and filtering we, probably, need to
	//use previously stored colourScale, so it will be reset only
	//when user tells it to
	obj.resetColourScale = function(){
		//create colorScale
		obj.colourScale = d3.scaleQuantile()
			.domain(obj.dataRange())
			.range(obj.get_palette());	
	}	
	
	var inherited_put_static_content = obj.put_static_content;
	obj.put_static_content = function(element){
		
		inherited_put_static_content(element);
		
		obj.real_div.style("position", "relative");
		
		obj.svg = obj.real_div.append("svg");
		
		//create main parts of the heatmap
		obj.svg.append("g")
			.attr("class", "row label_panel");
		obj.svg.append("g")
			.attr("class", "col label_panel");
		obj.svg.append("g")
			.attr("class", "legend_panel");

		obj.resetColourScale();
	}
	
	obj.update_not_yet_called = true;
	
	obj.updateSVG = function(cellSize, transition) {
	
		//if there is any canvas object, remove it
		obj.svg.selectAll("canvas").remove();
		
		//append or resize heatmap bode
		var heatmapBody = obj.svg.selectAll(".heatmap_body").data(["x"]);
		heatmapBody.enter()
			.append("g")
			.attr("class", "heatmap_body")
			.merge(heatmapBody).transition(transition)
				.attr("transform", "translate(" + obj.get_margin().left + ", " +
					obj.get_margin().top + ")");
		heatmapBody = obj.svg.select(".heatmap_body");
		//add cells	
		var cells = heatmapBody.selectAll(".datapoint").data(obj.data);
		cells.exit()
			.remove();
		cells.enter()
			.append("rect")
				.attr("class", "cell datapoint")
				.attr("width", cellSize.width)
				.attr("height", cellSize.height)
			.merge(cells).transition(transition)
				.attr("x", function(d){
					return obj.get_heatmapCol(d.col) * cellSize.width;
				})
				.attr("y", function(d){
					return obj.get_heatmapRow(d.row) * cellSize.height;
				})
				.attr("fill", function(d) {
					return obj.get_colour(obj.get_value(d.row, d.col));
				});

	}
	obj.updateCanvas = function() {
		
		//if there is a g object for heatmap body, remove it
		obj.svg.selectAll(".heanapBody").remove();
		
		//create a canvas object
		var heatmapBody = obj.real_div.append("canvas")
			.style("position", "absolute")
			.style("left", obj.get_margin().left + "px")
			.style("top", obj.get_margin().top + "px")
			.property("width", obj.get_width())
			.property("height", obj.get_height())
			.node().getContext("2d");
		
		//create an array to store information on each cell of a heatmap
		var pixelData = new Uint8ClampedArray(4 * obj.get_ncols() * obj.get_nrows());
		//store colour of each cell
		var rgbColour, position;
		for(var i = 0; i < obj.get_rowIds().length; i++)
			for(var j = 0; j < obj.get_colIds().length; j++) {
					rgbColour = d3.rgb(obj.get_colour(obj.get_value(obj.get_rowIds()[i], 
																													obj.get_colIds()[j])));
					position = obj.get_heatmapRow(obj.get_rowIds()[i]) * obj.get_ncols() * 4 +
						obj.get_heatmapCol(obj.get_colIds()[i]) * 4;
					pixelData[position] = rgbColour.r;
					pixelData[position + 1] = rgbColour.g;
					pixelData[position + 2] = rgbColour.b;
			}
		//set opacity of all the pixels to 1
		for(var i = 0; i < obj.get_ncols() * obj.get_nrows(); i++)
			pixelData[i * 4 + 3] = 255;
		
		var heatmapImage = {
			width: obj.get_ncols(),
			height: obj.get_nrows(),
			data: pixelData
		}
		
		heatmapBody.putImageData(heatmapImage, 0, 0, 0, 0, obj.get_width(), obj.get_height())
	}
	
	obj.update = function() {
		
		var transition;
		if(obj.update_not_yet_called){
			transition = d3.transition(0);
			obj.update_not_yet_called = false;
		} else {
			transition = d3.transition(1000);
		}

		//update sizes of all parts of the chart
		obj.real_div.transition(transition)
			.style("width", (obj.get_width() + obj.get_margin().left + obj.get_margin().right) + "px")
			.style("height", (obj.get_height() + obj.get_margin().top + obj.get_margin().bottom) + "px");

		obj.svg.transition(transition)
			.attr("height", obj.get_height() + obj.get_margin().top + obj.get_margin().bottom)
			.attr("width", obj.get_width() + obj.get_margin().left + obj.get_margin().right);
		
		obj.svg.selectAll(".label_panel").transition(transition)
			.attr("transform", "translate(" + obj.get_margin().left + ", " +
				obj.get_margin().top + ")");
		
		obj.svg.select(".legend_panel").transition(transition)
			.attr("transform", "translate(" + obj.get_margin().left + 
				", " + (obj.get_height() + obj.get_margin().top)  + ")");
			
		//calculate cell size
		var cellSize = {
			width: obj.get_width() / obj.get_ncols(),
			height: obj.get_height() / obj.get_nrows()
		}

		obj.data = [];
		for(var i = 0; i < obj.get_rowIds().length; i++)
			for(var j = 0; j < obj.get_colIds().length; j++)
				obj.data.push({
					row: obj.get_rowIds()[i],
					col: obj.get_colIds()[j],
				});
				
		//add column labels
		var colLabels = obj.svg.select(".col").selectAll(".label")
				.data(obj.get_colIds());
		colLabels.exit()
			.remove();
		colLabels.enter()
			.append("text")
				.attr("class", "label")
				.attr("transform", "rotate(-90)")
				.style("text-anchor", "start")
			.merge(colLabels).transition(transition)
				.attr("font-size", cellSize.width)
				.attr("dy", function(d) {return cellSize.width * (obj.get_heatmapCol(d) + 1);})
				.attr("dx", 2)
				.text(function(d) {return obj.get_colLabels(d);});		
		
		//add row labels
		var rowLabels = obj.svg.select(".row").selectAll(".label")
				.data(obj.get_rowIds());
		rowLabels.exit()
			.remove();
		rowLabels.enter()
			.append("text")
				.attr("class", "label")
				.style("text-anchor", "end")
			.merge(rowLabels).transition(transition)
				.attr("font-size", cellSize.height)
				.attr("dy", function(d) {return cellSize.height * (obj.get_heatmapRow(d) + 1);})
				.attr("dx", -2)
				.text(function(d) {return obj.get_rowLabels(d)});

		//add legend
		var legendStep = (obj.colourScale.domain()[1] - obj.colourScale.domain()[0]) / 
				(obj.get_palette().length - 1),
			legendScale = [], legendElementWidth = 20,
			legendElementHeight = 10;
		//if default legend elements are to wide, make them shorter
		if(legendElementWidth * obj.get_palette().length > obj.get_width())
			legendElementWidth = obj.get_width() / obj.get_palette().length;

		for(var i = 0; i < obj.get_palette().length; i++)
			legendScale.push((obj.colourScale.domain()[0] + i * legendStep).toPrecision(2));

		var legendBlocks = obj.svg.select(".legend_panel")
			.selectAll(".legend").data(legendScale);	
		legendBlocks.enter()
			.append("g")
				.attr("class", "legend")
				.attr("num", function(d, i){return i;});
		legendBlocks = obj.svg.select(".legend_panel").selectAll(".legend");
		legendBlocks.append("rect");
		legendBlocks.append("text");
	
		legendBlocks
			.attr("transform", function(d, i){
				return "translate(" + legendElementWidth * i + ", 0)"
			});
		legendBlocks.selectAll("rect")
			.attr("y", legendElementHeight * 1.2)
			.attr("width", legendElementWidth)
			.attr("height", legendElementHeight)
			.attr("fill", function(){
				return obj.colourScale(d3.select(this.parentNode).datum());
			});
		legendBlocks.selectAll("text")
			.text(function() {
				if(d3.select(this.parentNode).attr("num") % 2 == 0)
					return d3.select(this.parentNode).datum();
			})
			.attr("dy", legendElementHeight * 4)
			.attr("font-size", d3.min([legendElementHeight * 1.5 - 1, legendElementWidth * 1.5]));

	
		if(obj.get_mode() == "default")
			obj.get_ncols * obj.get_nrows > 5000 ? obj.mode("canvas") : obj.mode("svg");
		if(obj.get_mode() == "canvas") {
			obj.updateCanvas(cellSize);
			return obj;
		}
		if(obj.get_mode() == "svg") {
			obj.updateSVG(cellSize, transition	);
			return obj;
		}
		throw "Error in function 'heatmapChart.update': mode did not correspond to any " +
			"existing type ('canvas', 'svg' or 'default')";
	}
	
	return obj;
}