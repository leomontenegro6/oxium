<?php
class termoDicionario extends abstractBusiness {
	
	public function getByJogo($id_jogo){
		return $this->getByParameter("WHERE jogo = $id_jogo ORDER BY termo_original");
	}
	
}