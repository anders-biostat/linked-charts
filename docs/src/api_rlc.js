var nav = d3.select(".tocContainer");
nav.append("ul");

d3.select("#content")
	.selectAll("h1")
		.each(function() {
			var hTitle = d3.select(this).attr("id");
			d3.select(this.nextSibling.nextSibling)
				.selectAll("li").each(function() {
					nav.select("ul")
						.append("li")
							.append("a")
								.attr("id", d3.select(this).select("code").text())
								.attr("href", "#" + hTitle)
								.html(d3.select(this).html());
				})
		})

var navOffset = nav.node().offsetTop;

window.onscroll = function() {
	if(window.pageYOffset >= navOffset)
		nav
			.style("position", "fixed")
			.style("top", "0")
	else 
		nav
			.style("position", "absolute")
			.style("top", undefined);
}
