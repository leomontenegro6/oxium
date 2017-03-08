<?php
class paleta extends abstractBusiness {
	
	public function getByAlfabeto($id_alfabeto){
		return $this->getByParameter("WHERE alfabeto = $id_alfabeto ORDER BY id");
	}
	
}