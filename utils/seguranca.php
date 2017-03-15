<?php
class seguranca{	
	public static function antiInjection($array){
		while($valor = current($array)){
			if(is_array($valor)){
				self::antiInjection($valor);
				next($array);
			} else {
				$chave = key($array);
				//$valor = preg_replace("/(from|select|insert|delete|union|drop|drop table|show tables|#|--|\\\\)/i","",$valor);
				//$valor = preg_replace("/(FROM|SELECT|INSERT|DELETE|UNION|DROP|DROP TABLE|SHOW TABLES|#|--|\\\\)/i","",$valor);
				$valor = trim($valor);
				$array[$chave] = addslashes($valor);
				next($array);
			}
		}
		return $array;
	}
}