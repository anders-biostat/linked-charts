//put here short description for each example
var descrEx = [
"example1", "example2", "example3", "example4", "example5", "example6"
];
var lastEx = descrEx.length, currentEx = 1,
	showEx = d3.range(6).map(e => e + 1);

d3.select(".gallery")
	.style("position", "relative")
	.append("div")
		.attr("class", "aspect-ratio")
			.append("iframe");

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
			.text(descrEx[currentEx - 1]);

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
								});

	d3.select(".gallery")
		.select(".row")
			.selectAll("img")
				.attr("src", d => document.location.origin + "/gallery/ex" + d + "/image.png");
}

changeSlides();
changeThumb();