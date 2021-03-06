function $(query){
	return document.querySelector(query);
}
function $$(target, query) {
	return target.querySelector(query);
}
function $all(query){
	return Array.prototype.slice.call(document.querySelectorAll(query));
}
function $$all(target, query){
	return Array.prototype.slice.call(target.querySelectorAll(query));
}
function $ajax(method, url, options){
	options = options || {};

	return Q.promise(function(resolve, reject, notify){
		var req = new XMLHttpRequest();
		req.open(method, url);
		if(options.contentType){
			req.setRequestHeader("Content-Type", options.contentType);
		}
		req.addEventListener("load", function(){
			if(req.status == 200){ //TODO FIX SUCCESS CHECK : for 2xx eg. 201
				resolve({
					type : req.responseType,
					data : req.response,
					text : req.responseText,
					status : req.status
				});
			} else {
				reject(req.status);
			}
		});
		req.addEventListener("progress", function(evt){
			notify(evt.loaded / evt.total);
		});
		req.send(options.data);
	});
}
function $create(tagname, text){
	var newTag = document.createElement(tagname);

	if (text){
		newTag.appendChild(document.createTextNode(text));
	}
	return newTag;
}

function interval(step, time) {
	return function(value){
		var deferred = Q.defer();

		var dt = time/step;
		var count = 0;

		var onTimer = function(){
			count++;
			deferred.notify(count/step);
			if(count < step){
				setTimeout(onTimer, dt);
			} else {
				deferred.resolve(value);
			}
		}

		setTimeout(onTimer, dt);
		return deferred.promise;
	}
}

if (!('remove' in Element.prototype)) {
	Element.prototype.remove = function() {
		this.parentElement.removeChild(this);
	};
}
