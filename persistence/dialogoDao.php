<?php
class dialogoDao extends abstractDao {

	protected $campos = array(
		'bloco' => array('tipo' => 'inteiro'),
		'script' => array('tipo' => 'inteiro'),
		'texto_original' => array('tipo' => 'texto', 'obrigatorio' => true, 'normalizar'=>false),
		'texto_traduzido' => array('tipo' => 'texto', 'normalizar' => false),
		'data_traducao' => array('tipo' => 'data', 'padrao' => 'NOW()'),
		'fonte' => array('tipo' => 'inteiro')
	);		
	
	public function __construct() {
		parent::__construct('oxium', 'dialogos');
	}
}