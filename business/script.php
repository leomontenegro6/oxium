<?php
class script extends abstractBusiness {
	
	public function getByJogo($id_jogo){
		return $this->getByParameter("WHERE jogo = $id_jogo ORDER BY nome");
	}
	
}