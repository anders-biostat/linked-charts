var exampleList = [{
		link: "simpleExample.html",
		name: "A very simple Example"
	}, {
		link: "layers.html",
		name: "Adding layers"
	}, {
		link: "linesAndColour.html",
		name: "Lines and colour"
	}, {
		link: "labelsAndLegend.html",
		name: "Labels and legend"
	}, {
		link: "colourSlider.html",
		name: "Adding a colour slider"
	}, {
		link: "twoChannelsHeatmap.html",
		name: "Heatmap with two channels"
	}]

function showNavigationPanel(element, ind){

	function showList() {
		var divlist = element.select("#listDiv");
		if(divlist.empty()){
			divlist = element.append("div")
				.attr("id", "listDiv")
				.style("width", "300px")
				.style("height", (20*exampleList.length) + "px")
				.style("background", "#a3bfe3")
				.style("position", "absolute")
				.style("left", "100px")
				.style("top", "45px");
			for(var i = 0; i < exampleList.length; i++)
				divlist.append("div")
					.style("width", "300px")
					.style("height", "20px")
					.style("top", function() {return 20 * i + "px";})
					.style("position", "absolute")
					.style("background", function(){return i == ind ? "#93a2b5" : "#a3bfe3"})
					.on("mouseover", function(){
							if(i != ind) 
								return function() {d3.select(this).style("background", "#93a2b5");}
							else
								return function() {}
					}())
					.on("mouseout", function(){
							if(i != ind) 
								return function() {d3.select(this).style("background", "#a3bfe3");}
							else
								return function() {}
					}())
					.on("click", (function(i) {
						 return function() {window.open(exampleList[i].link, '_self', false)};
					})(i))
					.style("font-family", "Consolas, courier")
					.text("- " + exampleList[i].name);
		} else {
			divlist.remove();
		}
	}

	element.style("position", "absolute");
	var svg = element.append("svg")
		.attr("width", 375)
		.attr("height", 60);
	
	//left Triangle
	svg.append("polygon")
		.attr("class", "left")
		.attr("points", "40,10 40,50 10,30")
		.attr("fill", function() {return ind == 0 ? "#aaa" : "#2c7a47"})
		.on("mouseover", function(){
			if(ind != 0) element.selectAll(".left").attr("fill", "#111");
		})
		.on("mouseout", function(){
			if(ind != 0) element.selectAll(".left").attr("fill", "#2c7a47");
		})
		.on("click", function(){
			if(ind != 0) window.open(exampleList[ind - 1].link, '_self', false);
		});
	
	//left text
	var prText = svg.append("text")
		.attr("x", 55)
		.attr("y", 30)
		.attr("font-size", 20)
		.attr("class", "left")
		.attr("fill", function() {return ind == 0 ? "#aaa" : "#2c7a47"})
		.attr("font-family", "'Varela Round', sans-serif")
		.on("mouseover", function(){
			if(ind != 0) element.selectAll(".left").attr("fill", "#111");
		})
		.on("mouseout", function(){
			if(ind != 0) element.selectAll(".left").attr("fill", "#2c7a47");
		})
		.on("click", function(){
			if(ind != 0) window.open(exampleList[ind - 1].link, '_self', false);
		});		
	prText.append("tspan")
		.attr("dy", -5)
		.text("Previous");
	prText.append("tspan")
		.attr("dy", 20)
		.attr("dx", -40)
		.text("Example");
	
	//open all
	var openList = svg.append("text")
		.attr("x", 180)
		.attr("y", 30)
		.attr("font-size", 20)
		.attr("fill", "#14123b")
		.attr("font-family", "'Varela Round', sans-serif")
		.on("mouseover", function() {d3.select(this).attr("fill", "#4038d9");})
		.on("mouseout", function() {d3.select(this).attr("fill", "#14123b");})
		.on("click", showList);
	openList.append("tspan")
		.attr("dy", -5)
		.text("See");
	openList.append("tspan")
		.attr("dy", 20)
		.attr("dx", -30)
		.text("All");
	
	//righ text
	var prText = svg.append("text")
		.attr("x", 280)
		.attr("y", 30)
		.attr("class", "right")
		.attr("font-size", 20)
		.attr("fill", function() {return ind == exampleList.length - 1 ? "#aaa" : "#2c7a47"})
		.attr("font-family", "'Varela Round', sans-serif")
		.on("mouseover", function(){
			if(ind != exampleList.length - 1) element.selectAll(".right").attr("fill", "#111");
		})
		.on("mouseout", function(){
			if(ind != exampleList.length - 1) element.selectAll(".right").attr("fill", "#2c7a47");
		})
		.on("click", function(){
			if(ind != exampleList.length - 1) window.open(exampleList[ind + 1].link, '_self', false);
		});		
	prText.append("tspan")
		.attr("dy", -5)
		.text("Next");
	prText.append("tspan")
		.attr("dy", 20)
		.attr("dx", -95)
		.text("Example");

	//right triangle
	svg.append("polygon")
		.attr("points", "335,10 335,50 365,30")
		.attr("class", "right")
		.attr("fill", function() {return ind == exampleList.length - 1 ? "#aaa" : "#2c7a47"})
		.on("mouseover", function(){
			if(ind != exampleList.length - 1) element.selectAll(".right").attr("fill", "#111");
		})
		.on("mouseout", function(){
			if(ind != exampleList.length - 1) element.selectAll(".right").attr("fill", "#2c7a47");
		})
		.on("click", function(){
			if(ind != exampleList.length - 1) window.open(exampleList[ind + 1].link, '_self', false);
		});
}