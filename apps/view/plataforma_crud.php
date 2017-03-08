<?php
require_once("cabecalho.php");
require_once("menu.php");

$plataforma = new plataforma();

if(isset($_POST['acao'])){
	if ($_POST['acao'] == "cadastrar"){
		$retorno = $plataforma->set($_POST);
		if($retorno === true){
			modal::retornar('Plataforma cadastrada com sucesso!', 'plataforma_lista.php', '', $ajax);
		} else {
			modal::retornar($retorno, 'plataforma_lista.php', 'erro', $ajax);
		}
	} elseif ($_POST['acao'] == "editar"){
		$retorno = $plataforma->update($_POST, $_POST['id']);
		if($retorno === true){
			modal::retornar('Plataforma editada com sucesso!', 'plataforma_lista.php', '', $ajax);
		} else {
			modal::retornar($retorno, 'plataforma_lista.php', 'erro', $ajax);
		}
	} elseif ($_POST['acao'] == "excluir"){
		$retorno = $plataforma->delete($_POST['id']);
		if($retorno === true){
			modal::retornar('Plataforma excluída com sucesso!', 'plataforma_lista.php', '', $ajax);
		} else {
			modal::retornar($retorno, 'plataforma_lista.php', 'erro', $ajax);
		}
	}
}