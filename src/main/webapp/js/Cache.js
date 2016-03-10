

function Cache (initialSize) {
	this._cacheSize = initialSize;
	this._keys = [];
	this._values = {};

}

Cache.prototype.add = function(key, value) {
	if(this._cacheSize === 0) {
		return;
	}
	var index = this._keys.indexOf(key);
	if(index >= 0) {
		this._keys.splice(index, 1);
	}
	this._keys.push(key);
	this._values[key] = value;
	if(this._keys.length > this._cacheSize) {
		var toRemove = this._keys.shift();
		delete this._values[toRemove];
	}
};

Cache.prototype.get = function(key) {
	return this._values[key];
};


Cache.prototype.setSize = function(newSize) {
	if(typeof newSize !== "number") {
		throw "Trying to set cache size to a non-numeric value " + newSize;
	}
	var diff = this._keys.length - newSize;
	if(diff > 0) {
		var temp = this._keys.splice(diff);
		var toRemove = this._keys;
		this._keys = temp;
		//var toRemove = this._keys.splice(diff);
		for(var i = 0; i < toRemove.length; i++) {
			delete this._values[toRemove[i]];
		}
	}
	this._cacheSize = newSize;
};