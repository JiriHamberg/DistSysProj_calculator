var Calculator = (function() {

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
	}

	function evaluate(expression, result_callback) {
		switch(expression.type) {
			case "plot":
				Plotter.plot(expression.value);
				break;
			case "simple":
				result_callback(expression.value);
				break;
			case "long":
				evaluate_atoms(expression.value, result_callback);
				break;
			default:
				throw "Invalid expression type: " + expression.type;
		}
	}


	function calculate_serverside(arg1, arg2, op, callback) {

		var key = JSON.stringify({arg1: arg1, arg2: arg2, op: op});
		var cached = cache.get(key);

		if(cached !== undefined) {
			callback(cached);
		} else {
			$.ajax({
				url: App.contextPath + '/calculator',
				data: {
					op: op,
					arg1: arg1,
					arg2: arg2
				}
			}).done(function(data) {
				var result = parseFloat(data);
				var key = JSON.stringify({arg1: arg1, arg2: arg2, op: op});
				cache.add(key, result);
				callback(result);
			});
		}
	}

	function evaluate_atoms(atoms, result_callback) {
		if(atoms.length <= 1) {
			return;
		}
		var arg1 = atoms.shift();
		var op = atoms.shift();
		var arg2 = atoms.shift();	

		/*$.ajax({
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

			atoms.unshift(result);
			evaluate_atoms(atoms, result_callback);
		});*/
		calculate_serverside(arg1, arg2, op, function(result) {
			var resultText = arg1 + " " + op + " "  + arg2 + " = " + result;
			result_callback(resultText);
			atoms.unshift(result);
			evaluate_atoms(atoms, result_callback);
		});

	}

	function approximateSine() {
		var pending = 0;
		var step = 0.1;
		var i = 0;
		var coordinates = [];

		for(var x=-Math.PI; x <= Math.PI; x += step) {
			pending += 1;
		}

		for(var x=-Math.PI; x <= Math.PI; x += step) {	
			calculateSineCoordinate(x, i, function(result, x, i) {
				coordinates[i] = [x, result];
				pending -= 1;
				if(pending === 0) {
					//console.log(coordinates);
					Plotter.clientSidePlot(coordinates);
				}
			});
			i++;
		}

	}

	/** Taylor series approximation to calculate sine.
	 *	 sin(x) ~ x - 1/3! x^3 + 1/5! x^5 - 1/7! x^7
	 *
	 *  Welcome to the callback hell.
	 */
	function calculateSineCoordinate(x, i, callback) {
		var coeffs = [1, 3, 5, 7];
		power_sum(0, x, coeffs, function(result) {
			callback(result, x, i);
		});
	}

	function power(state, x, order, callback) {
		var arg1 = state;
		var arg2 = x;
		var op = "*";

		calculate_serverside(arg1, arg2, op, function(result) {
			if(order <= 1) {
				callback(result);
			} else {
				power(result, x, order - 1, callback);
			}
		});
	}

	function factorial(state, n, callback) {
		var arg1 = state;
		var arg2 = n;
		var op = "*";

		calculate_serverside(arg1, arg2, op, function(result) {
			if(n <= 1) {
				callback(result);
			} else {
				factorial(result, n - 1, callback);
			}
		});
	}

	function taylor_term(x, order, callback) {
		power(1, x, order, function(pow) {
			factorial(1, order, function(fact) {
				calculate_serverside(1, fact, "/", function(div) {
					calculate_serverside(pow, div, "*", function(result) {
						//terms of order 3, 7, 11, 15, ... are negative
						if(order % 4 === 3) {
							callback(-result);
						} else {
							callback(result);
						}
						});
				});
			});
		});
	}

	function power_sum(state, x, coeffs, callback) {
		var order = coeffs.shift();

		taylor_term(x, order, function(term) {
			calculate_serverside(state, term, "+", function(result) {
				if(coeffs.length === 0) {
					callback(result);
				} else {
					power_sum(result, x, coeffs, callback);
				}
			});
		});
	}



	function setCacheSize(newValue) {
		newValue = parseInt(newValue);
		cache.setSize(newValue);
	};

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
		approximateSine: approximateSine,
		parse: parse,
		evaluate: evaluate,
		setCacheSize: setCacheSize,
		simplify: simplify
	};
})();