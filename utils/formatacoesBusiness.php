<?php
class formatacoesBusiness {
	
	
	static function cpfGet($cpf) {
		return mensagens::encodeCpf($cpf);
	}	
	
	static function cpfSet($cpf) {
		return str_replace(array('.', '-'), '', $cpf);
	}
	
	static function currval($campo, $valor) {
		if($valor == 'currval' || $valor == 'CURRVAL') {
			
			//Transforma por exemplo a variavel $campo de 'avaliacao_objetiva' em 'avaliacaoObjetivaDao'
			//--
			$campo_rs = explode('_', $campo);
			
			$dao = '';
			foreach($campo_rs as $i => $campo_row) {
				$dao .= ($i == 0) ? $campo_row : ucfirst($campo_row);			
			}			
			$dao .= 'Dao';
			//--
			
			$dao = new $dao();
			
			$schema = $dao->getSchema();
			$tabela = $dao->getTabela();
			
			$schema_tabela = $schema . '.' . $tabela;
		} else {
			$schema_tabela = isset($valor['currval']) ? $valor['currval'] : $valor['CURRVAL'];
			
			$schema_tabela = str_replace(array(' ', '\\', "'", '"', '/'), '', $schema_tabela);
		}
		
		return "CURRVAL('{$schema_tabela}_id_seq')";
	}

	static function inteiroSet($valor) {
		if(is_numeric($valor)){
			return (int) $valor;
		} else {
			return 'NULL';
		}
	}

	static function textoSet($valor) {
		if((trim($valor) == '') || ($valor == "NULL") || ($valor == NULL)){
			return 'NULL';
		} else {
			return $valor;
		}
	}
	
	static function booleanoSet($valor) {

		$valor_verdadeiro = ($valor === true  || $valor == 'true'  || $valor == 'TRUE');
		$valor_falso	  = ($valor === false || $valor == 'false' || $valor == 'FALSE');
		
		if($valor_verdadeiro) {
			$valor_retornar = 'true';
		} elseif($valor_falso) {
			$valor_retornar = 'false';
		} else {
			$valor_retornar = 'null';
		}
		
		return $valor_retornar;
	}
	
	static function decimalSet($valor) {
		if (!is_numeric($valor)) {
			$valor = str_replace(",", ".", $valor);
			if (!is_numeric($valor)) {
				return "NULL";
			}
		}
		return $valor;
	}
	
	static function dataSet($valor) {
		
		if(empty($valor)) {
			return null;
		}
		
		if($valor == 'NOW()' || $valor == 'now()') {
			return $valor;
		}
		
		$data_hora = explode(' ', $valor);
		$data = $data_hora[0];
		$hora = isset($data_hora[1]) ? " {$data_hora[1]}" : '';
		
		list($dia, $mes, $ano) = explode('/', $data);

		return "$ano-$mes-$dia{$hora}";
	}	
	
	static function cepSet($valor) {
		
		if(is_string($valor)) {
			$valor = str_replace('-', '', $valor);
		}
		
		return $valor;
	}
}