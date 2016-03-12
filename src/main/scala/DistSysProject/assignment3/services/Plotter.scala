package DistSysProject.assignment3.services

import scala.util.Try
import scala.sys.process._
import java.io._
import scala.math._

object Plotter {

	def getImage(expression: String): Option[Array[Byte]] = {
		expression match {
			case "sin(x)" => Some(gnuplot(expression))
			case _ => None
		}
	}

	private def gnuplot(expression: String): Array[Byte] = {
		val outStream = new ByteArrayOutputStream
		(Seq("gnuplot", "-e", s"set encoding default; set term png; set xrange[-pi:pi]; plot ${expression}") #> outStream).!
		outStream.toByteArray
	}

}