

/* Entrypoint of the application. Links Calculator and Plotter
 * to relevant events.
 *
 */
var App = (function() { 

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
				var input = $("form[name='calculator'] :input[name='expression']");
				input.val(Calculator.simplify(input.val()));
				var expression = Calculator.parse(input.val(), report_error);
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

	function report_result(resultText) {
		$("#calculator-result").append("<li>" + resultText + "</li>");
		$("#calculator-container").scrollTop(function(){
			return this.scrollHeight;
		});
		$("form[name='calculator'] :input[name='expression']").val("");
	}

	function report_error(expression, message) {
		$("#calculator-result").append("<li>" + message + ": " + expression + "</li>");
		$("#calculator-container").scrollTop(function() {
			return this.scrollHeight;
		});
		clearInput();
	}


	function clearInput() {
		$("form[name='calculator'] :input[name='expression']").val("");
	}

	return {
		contextPath: contextPath,
		clearInput: clearInput,
		init: init
	};
})();
