var pages = {
	main: "Linked Charts",
	api: "API",
	types:{
		heatmap: "Heatmaps",
		scatter: "Scatter plots",
		lines: "Lines"
	},
	tutorials: {
		properties: "Properties in the Linked-charts",
		types: "Types of charts"
	},
	examples: {
		simpleExample: "A very simple example",
		layers: "Adding layers",
		linesAndColour: "Lines and Colour"
	}
}

//add all panels for the main menu
var menuCells = d3.select("body").append("ul")
	.attr("class", "navigationTop")
	.selectAll("li")
		.data(Object.keys(pages))
			.enter().append("li")
				.attr("class", function(d, i){
					//home-button
					if(i == 0)
						return "main";
					//dropdown lists
					if(typeof pages[d] !== "string")
						return "dropdown";
				});

//each list element contains a link
menuCells.append("a")
	.attr("class", function(d){
		if(typeof pages[d] !== "string")
			return "drop";
	})
	.attr("href", function(d){
		if(typeof pages[d] !== "string")
			return "javascript:void(0)";

		return "../pages/" + d + ".html";
	})
	.text(function(d){
		if(typeof pages[d] === "string")
			return pages[d]
		else
			return d.charAt(0).toUpperCase() + d.slice(1);
	});
//select only dropdown lists
menuCells = menuCells.filter(function(){
	return d3.select(this).classed("dropdown");
})
menuCells.selectAll("a")
	.append("b")
		.attr("class", "caret");

//add divs with the content of dropdown lists
menuCells.append("div")
	.attr("class", "dropdown-content")
	.selectAll("a")
		.data(function(d){
			return Object.keys(pages[d]).map(function(e){return [d, e]});
		})
			.enter().append("a")
				.attr("href", function(d){
					return "../"+ d[0] + "/" + d[1] + ".html";
				})
				.text(function(d){
					return pages[d[0]][d[1]];
				})

menuCells.on("click", function(){
	var hide = false;
	if(d3.select(this).selectAll(".dropdown-content").style("display") != "none")
		hide = true;

	d3.selectAll(".dropdown-content")
		.style("display", "none");
	d3.event.stopPropagation();	
	
	if(!hide){
		d3.select(this).selectAll(".dropdown-content")
			.style("display", "block");
		
		d3.select("body")
			.on("click", function(){
				d3.selectAll(".dropdown-content")
					.style("display", "none");
				d3.select("body").on("click", undefined);
			}, false);
	}
})