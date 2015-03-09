var Q = require("q");
var url = require("url");
var nfs = require("./nfs");
var markdown = require("./markdown");

var config = require("../config");
var LINKS = ".links";
var BACKLINKS = ".backlinks";
var ENCODING = "utf8";

var NEWLINE = /\r\n|\n\r|\n|\r/g;
var CRLF = "\r\n";

exports.get = function(wikipath){
	return nfs.readFile(resolveBacklinkPath(wikipath), ENCODING).then(function(data){
		return data.split(NEWLINE).filter(not(""));
	}).fail(function(err){
		if(err.code == "ENOENT"){
			return [];
		} else {
			throw err;
		}
	});
}
exports.update = function(wikipath, data){
	return removeBacklinks(wikipath).then(function(){
		return markdown.links(data).map(resolveUrl).map(function(to){
			return addBacklink(wikipath, to).thenResolve(to);
		});
	}).all().then(function(links){
		return nfs.writeFile(resolveLinkIndexPath(wikipath), links.join(CRLF), ENCODING);
	});

	function resolveUrl(path){
		return url.resolve(wikipath.toString(), path);
	}
}
function removeBacklinks(wikipath){
	return nfs.readFile(resolveLinkIndexPath(wikipath), ENCODING).then(function(data){
		return data.split(NEWLINE).filter(not(""));
	}).fail(function(err){
		if(err.code == "ENOENT"){
			return [];
		} else {
			throw err;
		}
	}).then(function(links){
		return links.map(resolveBacklinkPath).map(function(path){
			return nfs.readFile(path, ENCODING).then(function(data){
				var lines = data.split(NEWLINE);
				if(lines.some(equal(wikipath))){
					return nfs.writeFile(path, lines.filter(not(wikipath)).filter(not("")).join(CRLF), ENCODING);
				} else {
					return null; //or Q();
				}
			}).fail(function(err){
				if(err.code == "ENOENT"){
					return null;
				} else {
					throw err;
				}
			});
		});
	}).all();
}
function addBacklink(from, to){
	return nfs.appendFile(resolveBacklinkPath(to), from + CRLF, ENCODING);
}
function resolveBacklinkPath(wikipath){
	return nfs.join(config.wikiDir, wikipath, BACKLINKS);
}
function resolveLinkIndexPath(wikipath){
	return nfs.join(config.wikiDir, wikipath, LINKS)
}
function not(val){
	return function(v){
		return v !== val;
	}
}
function equal(val){
	return function(v){
		return v === val;
	}
}
