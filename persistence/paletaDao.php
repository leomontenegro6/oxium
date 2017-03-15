<?php
class paletaDao extends abstractDao {

	protected $campos = array(
		'fonte' => array('tipo' => 'inteiro', 'obrigatorio' => true),
		'cor_entrada' => array('tipo' => 'texto', 'obrigatorio' => true),
		'cor_saida' => array('tipo' => 'texto', 'obrigatorio' => true)
	);		
	
	public function __construct() {
		parent::__construct('oxium', 'paletas');
	}
}