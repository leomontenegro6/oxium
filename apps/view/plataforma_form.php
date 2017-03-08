<?php
$_GET['ajax'] = true;
require_once("cabecalho.php");

$plataforma = new plataforma();

if( isset($_POST['id']) ){
	$acao = "editar";
	$id = $_POST['id'];
	$plataforma_row = $plataforma->get($id);
	
	$nome = $plataforma_row['nome'];
	$sigla = $plataforma_row['sigla'];
} else {
	$acao = 'cadastrar';
	$id = $nome = $sigla = '';
}
?>
<form id="form_cadastro" name="form" class="form-horizontal" method="post" action="plataforma_crud.php" onsubmit="return validaForm(this)" data-ajax="true" novalidate>
	<div class="caixa_modal panel panel-default">
		<div class="legenda panel-heading">
			<h3 class="panel-title"><?php echo mensagens::capitaliza($acao); ?> Plataforma</h3>
		</div>
		<div class="panel-body form">

			<div class="form-group">
				<label for="nome" class="col-sm-3 col-sm-offset-1 control-label">Nome*:</label>
				<div class="col-sm-6">
					<input type="text" id="nome" name="nome" class="form-control" required value="<?php echo $nome ?>" />
				</div>
			</div>
			<div class="form-group">
				<label for="sigla" class="col-sm-3 col-sm-offset-1 control-label">Sigla*:</label>
				<div class="col-sm-6">
					<input type="text" id="sigla" name="sigla" class="form-control" required value="<?php echo $sigla ?>" />
				</div>
			</div>

			<div class="aviso_obrigatorio">* Campos Obrigatórios</div>
		</div>
		<div class="panel-footer botoes">
			<input type="hidden" name="acao" value="<?php echo $acao ?>" />
			<input type="hidden" name="id" value="<?php echo $id ?>" />

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