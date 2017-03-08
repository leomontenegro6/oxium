<?php
class plataforma extends abstractBusiness {
	
	public function getAll(){
		return $this->getByParameter("ORDER BY nome");
	}
	
}