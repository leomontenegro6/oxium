<?php
require_once("cabecalho.php");
require_once("menu.php");

$fonte = new fonte();

if(isset($_POST['acao'])){
	if ($_POST['acao'] == "cadastrar"){
		$retorno = $fonte->set($_POST);
		if($retorno === true){
			modal::retornar('Fonte cadastrada com sucesso!', 'fonte_lista.php', '', $ajax);
		} else {
			modal::retornar($retorno, 'fonte_lista.php', 'erro', $ajax);
		}
	} elseif ($_POST['acao'] == "editar"){
		$retorno = $fonte->update($_POST, $_POST['id']);
		if($retorno === true){
			modal::retornar('Fonte editada com sucesso!', 'fonte_lista.php', '', $ajax);
		} else {
			modal::retornar($retorno, 'fonte_lista.php', 'erro', $ajax);
		}
	} elseif ($_POST['acao'] == "excluir"){
		$retorno = $fonte->delete($_POST['id']);
		if($retorno === true){
			modal::retornar('Fonte excluída com sucesso!', 'fonte_lista.php', '', $ajax);
		} else {
			modal::retornar($retorno, 'fonte_lista.php', 'erro', $ajax);
		}
	}
}