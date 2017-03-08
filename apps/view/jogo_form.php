<?php
require_once("cabecalho.php");
require_once("menu.php");

$jogo = new jogo();
$plataforma = new plataforma();

if( isset($_POST['id']) ){
	$acao = "editar";
	$id = $_POST['id'];
	$jogo_row = $jogo->get($id);
	
	$nome = $jogo_row['nome'];
	$sigla = $jogo_row['sigla'];
	$icone = $jogo_row['icone'];
	$id_plataforma = $jogo_row['plataforma'];
	$tamanho_arquivo = filesize($icone) / 1024;
	
	if(file_exists($icone)){
		$atributos_arquivo = "data-value='$icone' data-tamanho-arquivo='$tamanho_arquivo'";
	} else {
		$atributos_arquivo = '';
	}
} else {
	$acao = 'cadastrar';
	$id = $nome = $sigla = $icone = $id_plataforma = '';
	$tamanho_arquivo = 0;
	
	$atributos_arquivo = '';
}

$plataforma_rs = $plataforma->getAll();
?>
<div id="corpo" class="container-fluid">
	<form id="form_cadastro" name="form" class="form-horizontal" method="post" action="jogo_crud.php" onsubmit="return validaForm(this)" novalidate>
		<div class="caixa panel panel-default">
			<div class="legenda panel-heading">
				<h3 class="panel-title"><?php echo mensagens::capitaliza($acao); ?> Jogo</h3>
			</div>
			<div class="panel-body form">

				<div class="form-group">
					<label for="nome" class="col-sm-3 control-label">Nome*:</label>
					<div class="col-sm-7">
						<input type="text" id="nome" name="nome" class="form-control" required value="<?php echo $nome ?>" />
					</div>
				</div>
				<div class="form-group">
					<label for="sigla" class="col-sm-3 control-label">Sigla*:</label>
					<div class="col-sm-7">
						<input type="text" id="sigla" name="sigla" class="form-control" required value="<?php echo $sigla ?>" />
					</div>
				</div>
				<div class="form-group">
					<label for="icone" class="col-sm-3 control-label">Ícone:</label>
					<div class="col-sm-7">
						<input type="file" id="icone" name="icone" class="fileuploader" data-formatos="jpg,jpeg,png,gif"
							data-tamanho-limite="2097152" <?php echo $atributos_arquivo ?> />
					</div>
				</div>
				<div class="form-group">
					<label for="plataforma" class="col-sm-3 control-label">Plataforma:</label>
					<div class="col-sm-7">
						<select id="plataforma" name="plataforma" class="form-control select">
							<option value="">Selecione uma plataforma</option>
							<?php foreach($plataforma_rs as $plataforma_row){
								if($plataforma_row['id'] == $id_plataforma){
									$selected = 'selected';
								} else {
									$selected = '';
								}
								?>
								<option value="<?php echo $plataforma_row['id'] ?>" <?php echo $selected ?>><?php echo $plataforma_row['descricao'] ?></option>
							<?php } ?>
						</select>
					</div>
				</div>

				<div class="aviso_obrigatorio">* Campos Obrigatórios</div>
			</div>
			<div class="panel-footer botoes">
				<input type="hidden" name="acao" value="<?php echo $acao ?>" />
				<input type="hidden" name="id" value="<?php echo $id ?>" />
				
				<button type="button" class="btn btn-default" onclick="history.back()">
					<i class="fa fa-arrow-left fa-lg"></i>
					Voltar
				</button>
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
</div>
<?php
require_once("rodape.php");
?>