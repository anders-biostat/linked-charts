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
			inputs: "Getting input from the web page",
			props: "Customising your chart"
		}
	},
	none: {
		index: "Linked Charts",
		rlc: "R version",
		js: "JavaScript version"
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
				})
				.on("click", function(d) {
					if(d === "rlc" || d ==="js") {
						localStorage.setItem("lang", d);
						window.open(document.location.origin + "/linked-charts/" + d, "_self")
					}
				})

//each list element contains a link
menuCells.append("a")
	.attr("class", function(d){
		if(typeof pages[lang][d] !== "string")
			return "drop";
	})
	.attr("href", function(d){
		if(typeof pages[lang][d] !== "string" || d === "js" || d === "rlc")
			return "javascript:void(0)";
		
		return d === "index" ? document.location.origin + "/linked-charts/" + d + ".html" :
			document.location.origin + "/linked-charts/" + lang + "/" + d + ".html";
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

menuCells.on("click", function(event, d){
	var hide = false;
	if(d3.select(this).selectAll(".dropdown-content").style("display") != "none")
		hide = true;

	d3.selectAll(".dropdown-content")
		.style("display", "none");
	event.stopPropagation();	
		
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

if(lang === "rlc" || lang === "js") {
	var github = d3.select(".navigationTop")
		.append("li")
			.style("float", "right")
			.append("a")
				.attr("href", lang == "rlc" ? "https://github.com/anders-biostat/rlc" : "https://github.com/anders-biostat/linked-charts")
				.attr("target", "_blank")
				.style("padding-top", "0px")
				.style("padding-bottom", "0px");

	github.append("img")
		.style("vertical-align", "middle")
		.attr("src", document.location.origin + "/linked-charts/src/img/github_icon.png")
		.attr("width", "58px");

	github.append("span")
		.text("Check us on GitHub");
}
