var Calculator = (function() {

	/*var cacheSize = 0;
	var cache = [];
	*/

	var cache = new Cache(0);

	var number = new RegExp(/-?[0-9]+(\.[0-9]+)?/);
	var operator = new RegExp(/[+\-*/]/);

	var longExpression = new RegExp("^( *" + number.source  + " *" + operator.source + ")* *" + number.source + " *$");
	var sineExpression = new RegExp("^ *sin\\( *x *\\) *$");
	var simpleExpression = new RegExp("^ *" + number.source  + " *$");

	var validExpression = new RegExp(longExpression.source + "|" + sineExpression.source + "|" + simpleExpression.source);
	var subExpression =  new RegExp( "(" + operator.source + ")(" + number.source + ")", 'g');

	function parse_atoms(str) {
		var res = [];
		while(true) {
			var matchNum = str.match(number);
			if(!matchNum) {
				return null;
			}
			res.push(parseFloat(matchNum[0]));
			str = str.substring(matchNum[0].length);

			var matchOp = str.match(operator);
			if(!matchOp) {
				break;
			}
			res.push(matchOp[0])
			str = str.substring(matchOp[0].length);
		}
		return res;
	}

	function parse(expression, error_callback) {
		if(!validExpression.test(expression)) {
			error_callback(expression, "Invalid expression");
			return;
		}
		expression = expression.replace(/ /g, "");
		if(sineExpression.test(expression)) {
			return {
				type: "plot",
				value: expression
			};
		} else if(simpleExpression.test(expression)) {
			return {
				type: "simple",
				value: expression
			};
		} else {
			return {
				type: "long",
				value: parse_atoms(expression)
			};
		}
		//expression = expression.replace(/ /g, "");
		//return parse_atoms(expression);
	}

	function evaluate(expression, result_callback) {
		switch(expression.type) {
			case "plot":
				//Plotter.plot(expression.value);
				console.log("PLOT");
				break;
			case "simple":
				result_callback(expression.value + " = " + expression.value);
				break;
			case "long":
				evaluate_atoms(expression.value, result_callback);
				break;
			default:
				throw "Invalid expression type: " + expression.type;
		}
	}

	function evaluate_atoms(atoms, result_callback) {
		if(atoms.length <= 1) {
			return;
		}
		var arg1 = atoms.shift();
		var op = atoms.shift();
		var arg2 = atoms.shift();	

		$.ajax({
			url: App.contextPath + '/calculator',
			data: {
				op: op,
				arg1: arg1,
				arg2: arg2
			}
		}).done(function(data) {
			var result = parseFloat(data);
			var resultText = arg1 + " " + op + " "  + arg2 + " = " + result;
			result_callback(resultText);

			var key = JSON.stringify({arg1: arg1, arg2: arg2, op: op});
			cache.add(key, result);
			//result_callback(op, arg1, arg2, parseFloat(data));
			//report_result(op, arg1, arg2, parseFloat(data));
			atoms.unshift(result);
			evaluate_atoms(atoms, result_callback);
		});
	}


	function setCacheSize(newValue) {
		newValue = parseInt(newValue);
		/*if(typeof newValue !== "number") {
			throw "Trying to set cache size to a non-numeric value " + newValue;
		}
		var diff = cache.length - newValue;
		if(diff > 0) {
			cache = cache.slice(diff);
		}
		cacheSize = newValue;*/
		//console.log(newValue);
		cache.setSize(newValue);
	};

	/*function cachePut(arg1, arg2, op, value) {
		var key = JSON.stringify({arg1: arg1, arg2: arg2, op: op});
		cache.add(key, value);
	}*/

	function simplify(input) {

		var expression = parse(input);

		if(expression.type !== "long") {
			return expression.value;
		}

		var atoms = expression.value;

		while(atoms.length > 1) {
			var arg1 = atoms.shift();
			var op = atoms.shift();
			var arg2 = atoms.shift();
			var key = JSON.stringify({arg1: arg1, arg2: arg2, op: op});
			var cached = cache.get(key);

			if(cached !== undefined) {
				atoms.unshift(cached);	
			} else {
				atoms.unshift(arg2);
				atoms.unshift(op);
				atoms.unshift(arg1);
				break;
			}
		}

		return atoms.join(" ");
	}

	return {
		parse: parse,
		evaluate: evaluate,
		setCacheSize: setCacheSize,
		simplify: simplify
	};
})();