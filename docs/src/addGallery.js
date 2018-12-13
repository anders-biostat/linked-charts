//put here short description for each example
var descrEx = [
		"Correlation heatmap, 57 RNA-Seq samples, 8000 genes", 
		"MA plot, tumor vs. normal tissue comparison. 57 RNA-Seq samples, ~60000 genes (datafile size is ~20MB, loading may take a while)", 
		"Single cell RNA-Seq, cord blood. 2000 cells, ~6000 genes (datafile size is ~20MB, loading may take a while)", 
		"Single cell RNA-Seq, cord blood. ~8000 cells with abundance of 13 protein markers.", 
		"example5", 
		"example6"
	],
	//links to the corresponding tutorial pages
	linkEx = [
		"rlc/tutorials/oscc.html", 
		"rlc/tutorials/oscc.html", 
		"rlc/tutorials/citeseq1.html", 
		"rlc/tutorials/citeseq2.html", 
		"", 
		""
	];
var lastEx = descrEx.length, currentEx = 1,
	showEx = d3.range(6).map(e => e + 1);

d3.select(".gallery")
	.append("div")
		.attr("class", "aspect-ratio")
			.append("iframe")
				.attr("frameBorder", 0);

d3.select(".gallery")
	.append("div")
		.attr("class", "numbertext");	

d3.select(".gallery")
	.selectAll("a").data([-1, 1])
		.enter()
			.append("a")
				.attr("class", d => d == -1 ? "prev" : "next")
				.on("click", function(d) {
					currentEx += d;
					if(currentEx == 0) currentEx = lastEx;
					if(currentEx > lastEx) currentEx = 1;
					changeSlides(d);
				})
				.text(d => d == -1 ? "<" : ">");

d3.select(".gallery")
	.append("div")
		.attr("class", "caption-container")
			.append("p")
				.attr("id", "caption");

d3.select(".gallery")
	.append("div")
		.attr("class", "row");

function changeSlides(shift) {
	d3.select(".gallery")
		.select("iframe")
			.attr("src", document.location.origin + "/gallery/ex" + currentEx + "/index.html");
	d3.select(".gallery")
		.select(".numbertext")
			.text(currentEx + "/" + lastEx);
	d3.select(".gallery")
		.select("#caption")
			.html(descrEx[currentEx - 1]);

	if(showEx.indexOf(currentEx) == -1) {
		showEx = showEx.map(e => (e + shift) % lastEx).map(e => e == 0 ? lastEx : e);
		changeThumb();
	}

	d3.select(".gallery")
		.selectAll(".demo")
			.classed("active", false)
			.filter(d => d == currentEx)
				.classed("active", true);
}

function changeThumb() {
	var imgs = d3.select(".gallery")
		.select(".row")
			.selectAll(".column")
				.data(showEx)
					.enter()
						.append("div")
							.attr("class", "column")
							.append("img")
								.attr("class", "demo cursor")
								.on("click", function(d) {
									currentEx = d;
									changeSlides();
								})
								.filter(d => d == 1)
									.classed("active", true);

	d3.select(".gallery")
		.select(".row")
			.selectAll("img")
				.attr("src", d => document.location.origin + "/gallery/ex" + d + "/image.png");
}

changeSlides();
changeThumb();

d3.select(".gallery")
	.append("div")
		.style("overflow", "hidden")
		.selectAll(".button")
			.data([0, 1, 2])
			.enter()
				.append("div")
					.attr("class", "button")
					.text(function (d) {
						if(d == 0)
							return "Get R code";
						if(d == 1)
							return "Get JS code";
						if(d == 2)
							return "Go to the tutorial";
					})
					.on("click", function(d) {
						if(d == 0)
							window.open(document.location.origin + "/gallery/ex" + currentEx + "/code_R.html", 
								"R code for the example", "width=600,height=600");
						if(d == 1)
							window.open(document.location.origin + "/gallery/ex" + currentEx + "/code_JS.html", 
								"JavaScript code for the example", "width=600,height=600");
						if(d == 2)
							window.open(document.location.origin + "/" + linkEx[currentEx - 1]);
					})
