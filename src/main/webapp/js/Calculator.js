var Calculator = (function() {

	var cacheSize = 0;
	var cache = [];

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
			url: 'calculator',
			data: {
				op: op,
				arg1: arg1,
				arg2: arg2
			}
		}).done(function(data) {
			var resultText = arg1 + " " + op + " "  + arg2 + " = " + parseFloat(data);
			result_callback(resultText);
			//result_callback(op, arg1, arg2, parseFloat(data));
			//report_result(op, arg1, arg2, parseFloat(data));
			atoms.unshift(parseFloat(data));
			evaluate_atoms(atoms, result_callback);
		});
	}


	function setCacheSize(newValue) {
		newValue = parseInt(newValue);
		if(typeof newValue !== "number") {
			throw "Trying to set cache size to a non-numeric value " + newValue;
		}
		var diff = cache.length - newValue;
		if(diff > 0) {
			cache = cache.slice(diff);
		}
		cacheSize = newValue;
		//console.log(newValue);
	};

	function simplify(input) {
		var atoms = parse(input);
	}

	return {
		parse: parse,
		evaluate: evaluate,
		setCacheSize: setCacheSize,
		simplify: simplify
	};
})();