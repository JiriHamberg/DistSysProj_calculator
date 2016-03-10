

/* Entrypoint of the application. Links Calculator and Plotter
 * to relevant events.
 *
 */
var App = (function() { 

	//var number = new RegExp(/-?[0-9]+(\.[0-9]+)?/);
	//var operator = new RegExp(/[+\-*/]/);

	//var validExpression = new RegExp("^( *" + number.source  + " *" + operator.source + ")* *" + number.source + " *$");
	//var subExpression =  new RegExp( "(" + operator.source + ")(" + number.source + ")", 'g');

	var contextPath = $("head").data("context-path") || "";


	function init() {
		Calculator.setCacheSize($(":input[name='cache']")[0].value);
		$(":input[name='cache']").on('input', function() {
			Calculator.setCacheSize($(this).val());
		});
		$("form[name='calculator']")
			.removeAttr('onsubmit')
			.submit(function(event) {
				event.preventDefault();
				var input = $("form[name='calculator'] :input[name='expression']").val();
				var expression = Calculator.parse(input, report_error);
				if(expression) {
					Calculator.evaluate(expression, report_result);
				}
			});
		$("button#simplify").click(function(event) {
			event.preventDefault();
			var input = $("form[name='calculator'] :input[name='expression']");
			input.val(Calculator.simplify(input.val()));
		});

		$("form[name='plotter']")
			.removeAttr('onsubmit')
			.submit(function(event) {
				event.preventDefault();
				var expression = $("form[name='plotter'] :input[name='expression']").val();
				Plotter.serverSidePlot(expression);
			});

		$("#server-side-plot").click(function() {
			var expression = "sine";
			Plotter.serverSidePlot(expression);
		});

		$("#client-side-plot").click(function() {
			var expression = "sine";
			var coordinates = [];
			var step = 0.01;
			for(var x=-Math.PI; x <= Math.PI; x += step) {
				coordinates.push([x, Math.sin(x)]);
			}
			Plotter.clientSidePlot(coordinates);
		});	

		$("#cooperative-plot").click(function() {
			$.ajax({
				url: contextPath + '/plotter/coordinates?expression=sine',
			}).done(function(data) {
				Plotter.clientSidePlot(data);
			});
		});
	}

/*	function parse_all(str) {
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

	function parse(expression) {
		if(!validExpression.test(expression)) {
			report_error(expression, "Invalid expression");
			return;
		}
		expression = expression.replace(/ /g, "");
		var atoms = parse_all(expression);
		return atoms;
	}

	function evaluate(atoms) {
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
			report_result(op, arg1, arg2, parseFloat(data));
			atoms.unshift(parseFloat(data));
			evaluate(atoms);
		});
	}*/

	function report_result(resultText) {
		//var resultText = arg1 + " " + op + " "  + arg2 + " = " + result;
		console.log(resultText);
		$("#calculator-result").append("<li>" + resultText + "</li>");
		$("#calculator-container").scrollTop(function(){
			return this.scrollHeight;
		});
		$("form[name='calculator'] :input[name='expression']").val("");
	}

	function report_error(expression, message) {
		console.log(message);
		$("#calculator-result").append("<li>" + message + ": " + expression + "</li>");
		$("#calculator-container").scrollTop(function() {
			return this.scrollHeight;
		});
		$("form[name='calculator'] :input[name='expression']").val("");
	}

	/*function serverSidePlot(expression) {
		clearPlot();
		$("#plot").css("background-image", "url(plotter/image?expression=" + encodeURIComponent(expression) + ")" );
		$("#plot").css("background-size", "100% 100%" );
	}*/



	/*
	Plot a list of coordinates using a canvas.
	Coordinates is a list of x,y-pairs, eg.
	[[x1, y1], [x2, y2], ..., [x_n, y_n]]
	*/
	/*function clientSidePlot(coordinates) {
		clearPlot();
		var canvas = $("#plot")[0];
		var context = canvas.getContext('2d');
		var plotPadding = 20;
		var canvasRange = [-Math.PI, Math.PI, -1, 1];

		var scaleY = function(y) {
			return (canvas.height / 2.0) - (y / (canvasRange[3] - canvasRange[2])) * (canvas.height - 2 * plotPadding);
		};

		var scaleX = function(x) {
			return (canvas.width / 2.0)  + (x / (canvasRange[1] - canvasRange[0])) * (canvas.width - 2 * plotPadding);
		};

		for(var i = 0; i < coordinates.length; i++) {
			context.fillStyle = "red";
			context.fillRect(scaleX(coordinates[i][0]), scaleY(coordinates[i][1]), 1, 1);
		}
		
		context.fillStyle = "black";
		context.rect(plotPadding, plotPadding, canvas.width - 2 * plotPadding, canvas.height - 2 * plotPadding);
		context.stroke();
		context.font = "75% Arial";

		for(var y =-1.0; y <= 1.0; y += 0.25) {
			var x = -Math.PI;
			context.fillText(y.toFixed(2), scaleX(x) - plotPadding / 2.0, scaleY(y));
		}

		for(var x = -Math.PI; x <= Math.PI; x += 1.0) {
			var y = -1.0;
			context.fillText(x.toFixed(2), scaleX(x), scaleY(y) + plotPadding / 2.0);
		}
		
		context.font = "175% Arial";
		context.fillText("sin(x)", 100, 100);
	}

	function clearPlot() {
		$("#plot").css("background-image", '');
		var canvas = $("#plot")[0];
		canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
	}*/

	return {
		contextPath: contextPath,
		init: init
	};
})();
