<?php
class plataforma extends abstractBusiness {
	
	public function getAll(){
		$plataforma_rs = $this->getByParameter("ORDER BY sigla");
		
		foreach($plataforma_rs as $i=>$plataforma_row){
			$sigla = mensagens::upper($plataforma_row['sigla']);
			$nome = $plataforma_row['nome'];
			
			$plataforma_rs[$i]['descricao'] = "[$sigla] $nome";
		}
		
		return $plataforma_rs;
	}
	
	public function getTotalByListagem($nome){
		$nome = str_replace(' ', '%', $nome);
		$nome = trim($nome);
		
		return $this->getTotal("WHERE nome LIKE :nome", array('nome'=>"%$nome%"));
	}
	
	public function getByListagem($nome, $ordenacao='nome', $filtragem='ASC', $limit=15, $offset=0){
		$nome = str_replace(' ', '%', $nome);
		$nome = trim($nome);
		
		$parametros = array('nome'=>"%$nome%");
		return $this->getFieldsByParameter("nome, sigla, id", "WHERE nome LIKE :nome ORDER BY $ordenacao $filtragem LIMIT $limit OFFSET $offset", $parametros);
	}
	
}