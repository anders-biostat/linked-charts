var nav = d3.select(".tocContainer")
	.append("ul");

d3.select("#content")
	.selectAll("h1")
		.each(function() {
			var hTitle = d3.select(this).attr("id");
			d3.select(this.nextSibling.nextSibling)
				.selectAll("li").each(function() {
					nav
						.append("li")
							.append("a")
								.attr("id", d3.select(this).select("code").text())
								.attr("href", "#" + hTitle)
								.html(d3.select(this).html());
				})
		})