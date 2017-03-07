<?php
class autocomplete{	
	
	public static function interpretarDados($get){
		$busca = (isset($get['q'])) ? (str_replace(' ', '%', $get['q'])) : ('');
		$numero_pagina = (isset($get['page']) && !empty($get['page'])) ? ($get['page']) : (1);
		$limit = (isset($get['page_limit']) && !empty($get['page_limit'])) ? ($get['page_limit']) : (15);
		if($numero_pagina > 1){
			$offset = (string)(($numero_pagina - 1) * $limit);
		} else {
			$offset = '0';
		}
		return array(
			'busca'=>$busca,
			'limit'=>$limit,
			'offset'=>$offset
		);
	}
	
	public static function encodarRetornoJSON($json, $total_consulta, $sql='', $limit='', $offset=''){
		$ambiente = mensagens::getAmbienteDesenvolvimento();
		$array_retorno = array(
			'items'=>$json,
			'total'=>$total_consulta
		);
		$array_retorno = self::gerarInformacoesDepuracao($array_retorno, $sql, $limit, $offset);
		return json_encode($array_retorno);
	}
	
	public static function gerarInformacoesDepuracao($array_retorno, $sql, $limit, $offset){
		$ambiente = mensagens::getAmbienteDesenvolvimento();
		if($ambiente == 'D' || $ambiente == 'H'){
			$array_retorno['_sql'] = $sql;
			$array_retorno['_limit'] = $limit;
			$array_retorno['_offset'] = $offset;
		}
		return $array_retorno;
	}
	
}