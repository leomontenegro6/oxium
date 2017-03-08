<?php
class jogo extends abstractBusiness {
	
	public function getAll(){
		return $this->getByParameter("ORDER BY nome");
	}
	
}