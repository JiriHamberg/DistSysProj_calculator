package DistSysProject.assignment3.services

import scala.util.Try
import scala.sys.process._
import java.io._
import scala.math._

object Plotter {

	def getImage(expression: String): Array[Byte] = {
		expression match {
			case "sine" => gnuplot("sin(x)")			
		}
	}

	def getCoordinates(expression: String): List[List[Double]] = {
		expression match { case "sine" =>
			val range = (-Math.PI to Math.PI by 0.01).toList  
			(range zip ( range map SineTaylor.compute )) map { case (x, y) =>
				List(x, y) //Map("x" -> x, "y" -> y)
			}
		}
		
	}

	private def gnuplot(expression: String): Array[Byte] = {
		val outStream = new ByteArrayOutputStream
		(Seq("gnuplot", "-e", s"set encoding default; set term png; set xrange[-pi:pi]; plot ${expression}") #> outStream).!
		outStream.toByteArray
	}

	private object SineTaylor {
		val coeffs: List[(Int, Double)] = List(
			(1, 1.0), 
			(3, -1/6.0), 
			(5, 1/120.0), 
			(7, -1/5040.0), 
			(9, 1/362880.0),  
			(11, -1/39916800.0)
		)

		//silly requirements are silly...
		private def mypow(x: Double, ord: Int) = {
			var res = 1.0
			(1 to ord).foreach { i=> 
				res *= x
			}
			res
		}

		def compute(x: Double): Double = {
			coeffs.foldLeft(0.0) { case (current, (order, coeff)) =>
				current + mypow(x, order) * coeff
			}
		}
	}

}