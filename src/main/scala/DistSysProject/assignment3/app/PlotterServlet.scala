package DistSysProject.assignment3.app

import org.scalatra._
import org.json4s.{DefaultFormats, Formats}
import org.scalatra.json._

import scala.util.Try
import DistSysProject.assignment3.services._


class PlotterServlet extends CalculatorStack with JacksonJsonSupport {

  protected implicit val jsonFormats: Formats = DefaultFormats

  get("/image") {
    var expression = Try(params("expression")).toOption

    expression.map { expr =>
    	contentType = "image/png"
      Plotter.getImage(expr).map { byteArray =>
        val stream = new java.io.ByteArrayInputStream(byteArray)
        org.scalatra.util.io.copy(stream, response.getOutputStream)
      }.getOrElse {
        BadRequest(reason = "Invalid parameters")
      }
    } getOrElse {
    	BadRequest(reason = "Invalid parameters")
    }
  }

}
