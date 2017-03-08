<?php
class dialogo extends abstractBusiness {
	
	public function getByBloco($id_bloco){
		return $this->getByParameter("WHERE bloco = $id_bloco ORDER BY id");
	}
	
	public function getByScript($id_script, $temBloco=true){
		if($temBloco){
			$dialogo_rs = $this->getFieldsByParameter("d.*", "d
					JOIN blocos b ON (d.bloco = b.id)
				WHERE b.script = $id_script
				ORDER BY d.id");
		} else {
			$dialogo_rs = $this->getByParameter("WHERE script = $id_script ORDER BY id");
		}
		
		return $dialogo_rs;
	}
	
}