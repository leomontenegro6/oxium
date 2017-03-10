<?php
$_GET['ajax'] = true;
require_once("cabecalho.php");

$termoDicionario = new termoDicionario();
$jogo = new jogo();

if( isset($_POST['id']) ){
	$acao = "editar";
	$id = $_POST['id'];
	$termoDicionario_row = $termoDicionario->get($id);
	
	$id_jogo = $termoDicionario_row['jogo'];
	$termo_original = $termoDicionario_row['termo_original'];
	$termo_traduzido = $termoDicionario_row['termo_traduzido'];
} else {
	$acao = 'cadastrar';
	
	if(!isset($_POST['jogo'])){
		modal::notificar('Jogo não fornecido!', 'aviso', $ajax);
		exit;
	}
	
	$id_jogo = $_POST['jogo'];
	$id = $termo_original = $termo_traduzido = '';
}

$descricao_jogo = $jogo->getDescricao($id_jogo);
?>
<form id="form_cadastro" name="form" class="form-horizontal" method="post" action="termo_dicionario_crud.php" onsubmit="return validaForm(this)" data-ajax="true" novalidate>
	<div class="caixa_modal panel panel-default">
		<div class="legenda panel-heading">
			<h3 class="panel-title"><?php echo mensagens::capitaliza($acao); ?> Termo de Dicionário</h3>
		</div>
		<div class="panel-body form">

			<div class="form-group">
				<label for="jogo" class="col-sm-2 col-sm-offset-2 control-label">Jogo:</label>
				<div class="col-sm-6"><?php echo $descricao_jogo ?></div>
			</div>
			<div class="form-group">
				<label for="termo_original" class="col-sm-2 col-sm-offset-2 control-label">Termo Original*:</label>
				<div class="col-sm-6">
					<input type="text" id="termo_original" name="termo_original" class="form-control" required autofocus value="<?php echo $termo_original ?>" />
				</div>
			</div>
			<div class="form-group">
				<label for="termo_traduzido" class="col-sm-2 col-sm-offset-2 control-label">Termo Traduzido:</label>
				<div class="col-sm-6">
					<input type="text" id="termo_traduzido" name="termo_traduzido" class="form-control" value="<?php echo $termo_traduzido ?>" />
				</div>
			</div>

			<div class="aviso_obrigatorio">* Campos Obrigatórios</div>
		</div>
		<div class="panel-footer botoes">
			<input type="hidden" name="acao" value="<?php echo $acao ?>" />
			<input type="hidden" name="id" value="<?php echo $id ?>" />
			<input type="hidden" name="jogo" value="<?php echo $id_jogo ?>" />

			<button type="button" class="btn btn-default" onclick="limparCampos('form_cadastro')">
				<i class="fa fa-recycle fa-lg"></i>
				Limpar
			</button>
			<button type="submit" class="btn btn-primary">
				<i class="fa fa-save fa-lg"></i>
				Salvar
			</button>
		</div>
	</div>
</form>