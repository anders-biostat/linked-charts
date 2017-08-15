var toc = initTOC({scope: ".article"});

var panel = d3.select("body").append("div")
	.attr("class", "navigationSide")
	.node()
		.appendChild(toc);
