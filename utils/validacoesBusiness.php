<?php
class validacoesBusiness {


	static function data($campo, $valor, $checkObrigatorio) {
		
		if($valor == 'NOW()' || $valor == 'now()') {
			return true;
		}
		
		if(empty($valor)){
			if($checkObrigatorio){
				return "Campo '$campo' Obrigatório!";
			} else {
				return true;
			}
		}
		
		$data_hora = explode(' ', $valor);
		if(!isset($data_hora[1])) {
			$valor .= ' 00:00:00';
		}
		
		$formato = 'd/m/Y H:i:s';
		
		$date = DateTime::createFromFormat($formato, $valor);
		
		$checkDataValida = ($date && $date->format($formato) == $valor);
		
		if($checkDataValida) {
			return true;
		} else {
			return "A data informada no campo '$campo' é inválida!";
		}
	}
	
	static function decimal($campo, $valor, $checkObrigatorio) {
		
		$null = ($valor === null || $valor === 'null' || $valor === 'NULL');
		
		if($checkObrigatorio && $null) {
			return "Campo '$campo' obrigatório!";
		}
		if($null) {
			return true;
		}
		if(!is_numeric($valor)) {
			return "O valor '$valor' não é válido!";
		}
		
		return true;
	}	

	static function booleano($campo, $valor, $checkObrigatorio) {
		
		$valor_nulo = ($valor === null || $valor == 'null' || $valor == 'NULL' || $valor == '');
		if($checkObrigatorio) {
			if($valor_nulo) {
				return "Campo '$campo' Obrigatório!";
			}
		}
		
		$valor_verdadeiro = ($valor == 'true'  || $valor == 'TRUE');
		$valor_falso	  = ($valor == 'false' || $valor == 'FALSE');
		
		$valido = (is_bool($valor) || $valor_nulo || $valor_falso || $valor_verdadeiro);
		
		if(!$valido) {
			return "O valor informado no campo '$campo' é inválido!";
		} else {
			return true;
		}
	}
	
	static function currval($valor, $tipo) {
		if($tipo == 'inteiro') {
			if(is_string($valor) && ($valor == 'currval' || $valor == 'CURRVAL')){
				return true;
			}
		}
		
		if(is_array($valor) && (!empty($valor['currval']) || !empty($valor['CURRVAL']))) {
			return true;
		}
		
		return false;
	}

	static function texto($campo, $valor, $checkObrigatorio) {
		if($checkObrigatorio) {
			if(empty($valor)) {
				return "Campo '$campo' Obrigatório!";
			}
		}
		
		return true;
	}
	
	static function inteiro($campo, $valor, $checkObrigatorio) {
		
		$checkValorInformado = ($valor !== NULL && $valor != '');
		if($checkObrigatorio) {
			if(!$checkValorInformado) {
				return "Campo '$campo' Obrigatório!";
			}
		}	
				
		if($checkValorInformado && !is_numeric($valor)) {
			return "O parâmetro passado no campo '$campo' não é um inteiro!";
		}
		
		return true;
	}
	
	static function percentual($valor) {
				
		if($valor > 0 && $valor <= 100) {
			return true;
		} else {
			return 'O valor deve ser maior que zero e menor ou igual a 100!';
		}
	}
	
	// Validação de campos de tipo 'cor'
	static function cor($campo, $valor, $checkObrigatorio) {
		if($checkObrigatorio) {
			if(empty($valor)) {
				return "Campo '$campo' Obrigatório!";
			}
		}
		
		$checaCorValida = mensagens::checaCorValida($valor);
		if(!$checaCorValida){
			return "A cor fornecida para o campo '$campo' é inválida!";
		}
		
		return true;
	}
	
}