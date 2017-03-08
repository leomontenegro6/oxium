<?php
class revisao extends abstractBusiness {
	
	public function getByUsuario($id_usuario){
		return $this->getByParameter("WHERE usuario = $id_usuario ORDER BY data");
	}
	
	public function getByDialogo($id_dialogo){
		return $this->getByParameter("WHERE dialogo = $id_dialogo ORDER BY data DESC");
	}
	
}