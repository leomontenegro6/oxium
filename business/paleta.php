<?php
class paleta extends abstractBusiness {
	
	public function getByFonte($id_fonte){
		return $this->getByParameter("WHERE fonte = $id_fonte ORDER BY id");
	}
	
}