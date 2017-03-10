<?php
class termoDicionarioDao extends abstractDao {

	protected $campos = array(
		'jogo' => array('tipo' => 'inteiro', 'obrigatorio' => true),
		'termo_original' => array('tipo' => 'texto', 'obrigatorio' => true, 'normalizar'=>false),
		'termo_traduzido' => array('tipo' => 'texto', 'normalizar'=>false)
	);		
	
	public function __construct() {
		parent::__construct('oxium', 'termos_dicionarios');
	}
}