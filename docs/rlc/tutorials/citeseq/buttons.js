var marker = 0;
red = "off";
green = "off";
blue = "off";

var cm = {};
for(var i = 0; i < data.markerNames.length; i++)
	cm[data.markerNames[i]] = data.countMatrix[i];

var tsne = lc.scatter()
	.x(i => data.tsne[i][0])
	.y(i => data.tsne[i][1])
	.size(1)
	.colour(i => "rgb(" + cm[red][i] + ", " +
												cm[green][i] + ", " +
												cm[blue][i] + ")")
	.place(d3.select("#top").select("#plot"));

var colours = ["red", "green", "blue"];
for(var i in colours)
	(function(colour) {
		lc.input()
			.type("radio")
			.width(100)
			.title(colour)
			.elementIds(data.markerNames)
			.on_change(value => {window[colour] = value; tsne.updateElementStyle()})
			.value("off")
			.place(d3.select("#top").select("#buttons_" + colour));
	})(colours[i]);
