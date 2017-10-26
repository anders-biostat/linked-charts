var fs = require("fs"),
	cheerio = require("cheerio"),
	pandoc = require('node-pandoc');

var html = fs.readFileSync('./pages/api.html','utf-8'),
	$ = cheerio.load(html),
	list = {}, toc = {};

var id;
//make a list of all methods and properties and put anchors
$(".info").each(function() {
	id = $(this).attr("id");
	list[id] = [];
	toc[id] = [];
	$(this).find("h2").attr("id", id);

	$(this).find(".method").each(function(){
		list[id].push($(this).find("a").text());
		toc[id].push($(this).text());
		$(this).find("a").attr("name", id + "_" + $(this).find("a").text());
	});
});

//add table of contents
$("#toc").append("<ul></ul>");
var el;
for(var i in toc){
	$("#toc > ul").append("<li id='" + i + "'></li>");
	el = $("#toc > ul > #" + i);
	el.append("<a href='#" + i + "'>" + i + "</a>");
	el.append("<ul></ul>");
	for(var j = 0; j < toc[i].length; j++){
		el.find("ul")
			.append("<li><a href='#" + i + "_" + list[i][j] + "'>" + toc[i][j] + "</a></li>");
	}
}

//look for links and replace them
$("a").each(function(){
	var link, text, resLink = "#", flag = false;
	link = $(this).attr("href");
	text = $(this).text();

	link = link || "";
	if(link.localeCompare("") == 0)
		link = text;

	if(list[link]){
		flag = true;
		resLink += link;
		if(list[link].indexOf(text) != -1)
			resLink += "_" + text;
	}
	
	for(var i in list)
		if(list[i].indexOf(link) != -1){
			flag = true;
			resLink += i + "_" + link;
			break;
		}

	if(link.localeCompare("tutorials") * 
			link.localeCompare("examples") * 
			link.localeCompare("types") == 0){
		flag = true;
		resLink = "../" + link + "/" + text + ".html";
	}

	if(link.split("_").length == 2 && 
			list[link.split("_")[0]] &&
			list[link.split("_")[0]].indexOf(link.split("_")[1])){
		flag = true;
		resLink += link;
	}
	if(!flag)
		resLink = link;
	
	$(this).attr("href", resLink);
});

fs.writeFile("result.html", $.html())

