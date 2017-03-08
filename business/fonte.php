<?php
class fonte extends abstractBusiness {
	
	public function getByJogo($id_jogo){
		return $this->getByParameter("WHERE jogo = $id_jogo ORDER BY id");
	}
	
}