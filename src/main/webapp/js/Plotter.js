var Plotter = (function() {


	function serverSidePlot(expression) {
		clearPlot();
		$("#plot").css("background-image", "url(" + App.contextPath + "/plotter/image?expression=" + encodeURIComponent(expression) + ")" );
		$("#plot").css("background-size", "100% 100%" );
	}

	/*
	Plot a list of coordinates using a canvas.
	Coordinates is a list of x,y-pairs, eg.
	[[x1, y1], [x2, y2], ..., [x_n, y_n]]
	*/
	function clientSidePlot(coordinates) {
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
	}

	return {
		serverSidePlot: serverSidePlot,
		clearCanvas: clearPlot,
		clientSidePlot: clientSidePlot
	};
})()