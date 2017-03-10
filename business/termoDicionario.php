<?php
class termoDicionario extends abstractBusiness {
	
	public function getByJogo($id_jogo){
		return $this->getByParameter("WHERE jogo = $id_jogo ORDER BY termo_original");
	}
	
	private function formataSQLByListagem($id_jogo, $termo_original){
		$array_sql = array(
			'sql'=>'TRUE',
			'parametros'=>array()
		);
		
		$array_sql['sql'] .= ' AND jogo = :jogo';
		$array_sql['parametros']['jogo'] = $id_jogo;
		
		if(!empty($termo_original)){
			$termo_original = str_replace(' ', '%', $termo_original);
			$termo_original = trim($termo_original);
			
			$array_sql['sql'] .= ' AND termo_original LIKE :termo_original';
			$array_sql['parametros']['termo_original'] = "%$termo_original%";
		}
		
		return $array_sql;
	}
	
	public function getTotalByListagem($id_jogo, $termo_original){
		$array_sql = $this->formataSQLByListagem($id_jogo, $termo_original);
		
		return $this->getTotal("WHERE {$array_sql['sql']}", $array_sql['parametros']);
	}
	
	public function getByListagem($id_jogo, $termo_original, $ordenacao='nome', $filtragem='ASC', $limit=15, $offset=0){
		$array_sql = $this->formataSQLByListagem($id_jogo, $termo_original);
		
		return $this->getFieldsByParameter("termo_original, termo_traduzido, id", "WHERE {$array_sql['sql']}
			ORDER BY $ordenacao $filtragem
			LIMIT $limit OFFSET $offset", $array_sql['parametros']);
	}
	
}