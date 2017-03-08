<?php
class bloco extends abstractBusiness {
	
	public function getByScript($id_script){
		return $this->getByParameter("WHERE script = $id_script ORDER BY id");
	}
	
}