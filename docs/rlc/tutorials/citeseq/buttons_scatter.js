lc.scatter()
	.x(i => data.tsne[i][0])
	.y(i => data.tsne[i][1])
	.size(1)
	.colour(i => "rgb(" + cm["off"][i] + ", " +
								 cm["off"][i] + ", " +
								 cm["off"][i] + ")")
	.place("#black");


lc.scatter()
	.x(i => data.tsne[i][0])
	.y(i => data.tsne[i][1])
	.size(1)
	.colour(i => "rgb(" + cm["CD3"][i] + ", " +
								 cm["CD19"][i] + ", " +
								 cm["off"][i] + ")")
	.place("#notBlack");
