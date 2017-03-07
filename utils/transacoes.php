<?php
class transacoes {
	
	private static $transacoes = array();
	private static $lastInsertId_rs = array();
	
	
	public static function get() {
		return self::$transacoes;
	}
	
	/** Retorna os ids inseridos na ultima transação na tabela informada.
		* @param String $tabela
		* @return Array de ids
	 */
	public static function getIdsInseridos($tabela) {
		$lastInsertId_rs = self::$lastInsertId_rs;
		
		if(empty($lastInsertId_rs[$tabela])) {
			return array();
		} else {
			return $lastInsertId_rs[$tabela];
		}
	}

	/** Retorna o ultimo id inserido na tabela, na ultima transação
		* @param String $tabela
		* @return Int
	 */		
	public static function getUltimoIdInserido($tabela) {
		
		$id_rs = self::getIdsInseridos($tabela);
		
		if(empty($id_rs)) {
			return null;
		} else {
			$ultimo_chave = count($id_rs) - 1;
			return $id_rs[$ultimo_chave];
		}	
	}	
	
	public static function set($acao, $dados, $parametro, $parametro_valores, $schema, $tabela, $campos) {
		
		$dados_formatados = array();
		foreach($dados as $campo => $valor) {
			if($campo == 'id') {
				$tipo = 'inteiro';
			} else { 
				$tipo = $campos[$campo]['tipo'];
			}
			if($acao == 'DELETE') {
				$dados_formatados['campo'] = $campo;
				$dados_formatados['tipo']  = $tipo;
				$dados_formatados['valor'] = $valor;
			} else {
				$is_currval = validacoesBusiness::currval($valor, $tipo);
				$valor = ($is_currval) ? formatacoesBusiness::currval($campo, $valor) : $valor;
				
				$dados_formatados[$campo]['tipo']    = $tipo;
				$dados_formatados[$campo]['valor']   = $valor;
				$dados_formatados[$campo]['currval'] = $is_currval;
			}
		}
				
		array_push(self::$transacoes, array('acao' => $acao, 'schema' => $schema, 'tabela' => $tabela, 'dados' => $dados_formatados, 'parametro' => $parametro, 'parametro_valores' => $parametro_valores));		
	}

	public static function setUltimoIdInserido($tabela, $id) {		
		self::$lastInsertId_rs[$tabela][] = $id;
	}
	
	public static function limpar() {
		self::$transacoes = array();
	}
	
	public static function limparLastInsertIds() {
		self::$lastInsertId_rs = array();
	}
}