<?php
require_once("cabecalho.php");
require_once("menu.php");

$termoDicionario = new termoDicionario();

if(isset($_POST['acao'])){
	if ($_POST['acao'] == "cadastrar"){
		$retorno = $termoDicionario->set($_POST);
		if($retorno === true){
			modal::retornar('Termo de dicionário cadastrado com sucesso!', 'termo_dicionario_lista.php', '', $ajax);
		} else {
			modal::retornar($retorno, 'termoDicionario_lista.php', 'erro', $ajax);
		}
	} elseif ($_POST['acao'] == "editar"){
		$retorno = $termoDicionario->update($_POST, $_POST['id']);
		if($retorno === true){
			modal::retornar('Termo de dicionário editado com sucesso!', 'termo_dicionario_lista.php', '', $ajax);
		} else {
			modal::retornar($retorno, 'termoDicionario_lista.php', 'erro', $ajax);
		}
	} elseif ($_POST['acao'] == "excluir"){
		$retorno = $termoDicionario->delete($_POST['id']);
		if($retorno === true){
			modal::retornar('Termo de dicionário excluído com sucesso!', 'termo_dicionario_lista.php', '', $ajax);
		} else {
			modal::retornar($retorno, 'termoDicionario_lista.php', 'erro', $ajax);
		}
	}
}