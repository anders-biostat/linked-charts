//before running this make sure that all the necessary folders exist

var fs = require("fs"),
	cheerio = require("cheerio"),
	nrc = require("node-run-cmd"),
	path = require("path"),
	readline = require("readline");

var html = fs.readFileSync('./mds/api.html','utf-8'),
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
		$(this).find("a").each(function(){
			list[id].push($(this).text());
			$(this).attr("name", id + "_" + $(this).text());
		})
		toc[id].push($(this).text());
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

fs.writeFile("mds/pages/api.html", $.html())

var p = "mds/";


fs.readdir(p, function(err, files) {
	if(err)
		throw err;

	files.map(function(file) {
		return path.join(p, file);
	}).filter(function(file){
		return fs.statSync(file).isDirectory();
	}).forEach(function(dir){
		
		fs.readdir(dir, function(err, files){
			files.map(function(file) {
				return path.join(dir, file);
			}).filter(function(file){
				return fs.statSync(file).isFile();
			}).forEach(function(file){
				//if a file is a markdown, use a template and convert the links
				if(path.extname(file) == ".md"){	
					var spl = file.split(".");
					spl[spl.length - 1] = "html";
					var newFile = spl.join(".");
					nrc.run("pandoc " + file + ' -f markdown -t html -o ' + newFile).then(function(){
						var content = fs.readFileSync(newFile, 'utf-8');
						fs.unlink(newFile);
						var html = fs.readFileSync("mds/template.html", 'utf-8');
						var $ = cheerio.load(html);
						$("#content").html(content);
						replaceLinks($("a"));
						newFile = newFile.split("/").splice(1).join("/");
						fs.writeFile("documentation/" + newFile, $.html().replace(/&quot;/g, '"'));		
					})
				}
				//if a file is htm - it is an example
				if(path.extname(file) == ".htm"){
					var html = fs.readFileSync("mds/template_example.html", 'utf-8');
					var $ = cheerio.load(html);
					var rd = readline.createInterface({
					  input: fs.createReadStream(file),
					  console: false
					});

					var layout = "";

					rd.on('line', function(line) {
    				line = line.trim();
    				if(line.indexOf("///") != -1){
    					line = line.split("///");
    					if(line[1] == "input"){
    						$(".input").attr("src", line[0]);
    						return;
    					}
    					var id = line[1].split("/")[0],
    						language = (line[1].split("/")[1] == "html" ? "html" : "javascript");
    					$("pre").append('<x-expl id = "' + id + '"></x-expl><code class = "language-' + 
    													language +'">' + line[0].replace(/</g, "&lt;") + '</code>' + "\n")

    					if(line[1].split("/")[2] == "layout")
    						layout += line[0];

    					if(line[1].split("/")[1] == "ms")
    						$(".code").append(line[0] + "\n");
    				}				
					});

					rd.on("close", function(){
						$(".layout").html(layout);

						var html = fs.readFileSync(file, 'utf-8');
						var content = cheerio.load(html);

						$(".description").append(content(".description").html());
						$(".comments").append(content(".comments").html());

						replaceLinks($("a"));
						var newFile = file.split("/").splice(1).join("/") + "l";
						fs.writeFile("documentation/" + newFile, $.html().replace(/&quot;/g, '"'));					

					})

				}

				//if a file is html, just convert the links
				if(path.extname(file) == ".html"){
					html = fs.readFileSync(file,'utf-8'),
					$ = cheerio.load(html);
					replaceLinks($("a"));
					file = file.split("/").splice(1).join("/");
					fs.writeFile("documentation/" + file, $.html());		
				}
			})
		})
	});

})

//fs.unlink("_mds/pages/api.html");


//look for links and replace them
var replaceLinks = function(links){
	links.each(function(){
		var link, text, resLink = "../pages/api.html#", flag = false;
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

		if(resLink.slice(0, 18) == "../pages/api.html#" && 
				$(this).parent(".method").length == 0){
			var text = $(this).text();
			$(this).text("");
			$(this).append("<code>" + text + "</code>");
		}

		$(this)
		 .attr("href", resLink);
	});
}




