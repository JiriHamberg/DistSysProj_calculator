package DistSysProject.assignment3.app

import org.scalatra._
import scala.util.Try
import DistSysProject.assignment3.services._

import org.json4s.{DefaultFormats, Formats}
import org.scalatra.json._

class PlotterServlet extends CalculatorStack with JacksonJsonSupport {

  protected implicit val jsonFormats: Formats = DefaultFormats

  get("/image") {
    var expression = Try(params("expression")).toOption

    expression.map { expr =>
    	contentType = "image/png"
    	val stream = new java.io.ByteArrayInputStream(Plotter.getImage(expr))
      org.scalatra.util.io.copy(stream, response.getOutputStream)
    } getOrElse {
    	BadRequest(reason = "Invalid parameters")
    }
  }

  get("/coordinates") {
    //implicit val jsonFormats: Formats = DefaultFormats
    var expression = Try(params("expression")).toOption

    expression.map { expr =>
      contentType = formats("json")
      Plotter.getCoordinates(expr)
    } getOrElse {
      BadRequest(reason = "Invalid parameters")
    }

  }


}
