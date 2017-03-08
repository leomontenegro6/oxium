<?php
class alfabeto extends abstractBusiness {
	
	public function getByFonte($id_fonte){
		return $this->getByParameter("WHERE fonte = $id_fonte ORDER BY caractere");
	}
	
}