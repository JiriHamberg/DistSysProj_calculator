package DistSysProject.assignment3.services

import scala.util.Try

object Calculator {

	def calculate(op: String, arg1: Double, arg2: Double): Option[Double] = {
		(op match {
			case "+" => Try(arg1 + arg2).toOption
			case "-" => Try(arg1 - arg2).toOption
			case "*" => Try(arg1 * arg2).toOption
			case "/" => Try(arg1 / arg2).toOption
			case _ => None
		}) /* flatMap {
			case num if !num.isInfinite && !num.isNaN => Some(num)
			case _ => None
		}*/
	}	
}