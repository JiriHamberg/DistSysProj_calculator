package DistSysProject.assignment3.app

import scala.util.Try
import org.scalatra._
import DistSysProject.assignment3.services._


class CalculatorServlet extends CalculatorStack {

  get("/") {
    contentType = "text/html"
    ssp("/base", "layout" -> "", "contextPath" -> request.getContextPath())
  }

  get("/calculator") {
  	val (arg1, arg2, op) = (
  		Try(params("arg1").toDouble).toOption,
  		Try(params("arg2").toDouble).toOption,
  		Try(params("op")).toOption
	)

	if(Seq(arg1, arg2, op).forall(p => p.isDefined)) {
		val result: Option[Double] = Calculator.calculate(op.get, arg1.get, arg2.get)
		if (result.isDefined) {
			contentType = "text/plain"
			result.get.toString
		} else {
			BadRequest(reason="Arithmetic error or invalid operator")
		}
	} else {
		BadRequest(reason="Bad parameters")
	} 	
  }


}
