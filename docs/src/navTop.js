var pages = {
	js: {
		index: "Linked Charts",
		api: "API",
		types:{
			heatmap: "Heatmaps",
			scatter: "Scatter plots",
			lines: "Lines",
			barchart: "Barcharts",
			beeswarm: "Beeswarm",
			table: "Tables"
		},
		tutorials: {
			properties: "Properties",
			types: "Types of charts",
			legends: "Legends",
			layers: "Layers",
			data: "Data input"
		},
		examples: {
			simpleExample: "A very simple example",
			layers: "Adding layers",
			linesAndColour: "Lines and Colour",
			labelsAndLegend: "Labels and Legend",
			colourSlider: "Adding an interactive colour slider",
			markPoints: "Recalculate correlation values",
			twoChannelsHeatmap: "A heatmap with two colour channels",
			newType: "Defining a new layer type"
		}
	},
	rlc: {
		index: "Linked Charts",
		api: "API",
		tutorials: {
			oscc: "Understanding RNA-Seq data",
			citeseq1: "Exploring single-cell data",
			citeseq2: "Multicoloured t-SNE plot",
			props: "Customising your chart"
		}
	}
}

//add all panels for the main menu
var menuCells = d3.select(".page-header").append("ul")
	.attr("class", "navigationTop")
	.selectAll("li")
		.data(Object.keys(pages[lang]))
			.enter().append("li")
				.attr("class", function(d, i){
					//home-button
					if(i == 0)
						return "index";
					//dropdown lists
					if(typeof pages[lang][d] !== "string")
						return "dropdown";
				});

//each list element contains a link
menuCells.append("a")
	.attr("class", function(d){
		if(typeof pages[lang][d] !== "string")
			return "drop";
	})
	.attr("href", function(d){
		if(typeof pages[lang][d] !== "string")
			return "javascript:void(0)";

		return document.location.origin + "/linked-charts/" + lang + "/" + d + ".html";
	})
	.text(function(d){
		if(typeof pages[lang][d] === "string")
			return pages[lang][d]
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
			return Object.keys(pages[lang][d]).map(function(e){return [d, e]});
		})
			.enter().append("a")
				.attr("href", function(d){
					return document.location.origin + "/linked-charts/" + lang + "/"+ d[0] + "/" + d[1] + ".html";
				})
				.text(function(d){
					return pages[lang][d[0]][d[1]];
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

d3.select(".page-header")
	.append("div")
		.attr("id", "buttons")
		.style("margin-bottom", "15px")
		.selectAll(".lang-button")
			.data(["rlc", "js"])
			.enter()
				.append("div")
					.attr("class", d => d == lang ? "lang-button active" : "lang-button")
					.text(d => d == "rlc" ? "R" : "JavaScript")
					.on("click", function(d) {
						localStorage.setItem("lang", d);
						window.open(document.location.origin + "/linked-charts/" + d, "_self")
					});

d3.select(".page-header")
	.select("#buttons")
		.append("div")
			.attr("class", "github-button")
			.text("View on GitHub")
			.on("click", function () {
				window.open(lang == "rlc" ? "https://github.com/anders-biostat/rlc" : "https://github.com/anders-biostat/linked-charts")
			})


	