<?php
require_once("cabecalho.php");
require_once("menu.php");

$fonte = new fonte();
$jogo = new jogo();

$jogo_lista = (isset($_GET['jogo_lista'])) ? ($_GET['jogo_lista']) : ('');

if( isset($_POST['id']) ){
	$acao = "editar";
	$id = $_POST['id'];
	$fonte_row = $fonte->get($id);
	
	$id_jogo = $fonte_row['jogo'];
	$arquivo_fonte = $fonte_row['arquivo_fonte'];
	$arquivo_dialogo = $fonte_row['arquivo_dialogo'];
	$cor_chave = $fonte_row['cor_chave'];
	
	$tamanho_arquivo_fonte = filesize($arquivo_fonte) / 1024;
	$tamanho_arquivo_dialogo = filesize($arquivo_dialogo) / 1024;
	
	if(file_exists($arquivo_fonte)){
		$atributos_arquivo_fonte = "data-value='$arquivo_fonte' data-tamanho-arquivo='$tamanho_arquivo_fonte'";
	} else {
		$atributos_arquivo_fonte = '';
	}
	if(file_exists($arquivo_dialogo)){
		$atributos_arquivo_dialogo = "data-value='$arquivo_dialogo' data-tamanho-arquivo='$tamanho_arquivo_dialogo'";
	} else {
		$atributos_arquivo_dialogo = '';
	}
} else {
	$acao = 'cadastrar';
	$id = $id_jogo = $arquivo_fonte = $arquivo_dialogo = $cor_chave = '';
	$tamanho_arquivo_fonte = $tamanho_arquivo_dialogo = 0;
	
	$atributos_arquivo_fonte = $atributos_arquivo_dialogo = '';
}

$jogo_rs = $jogo->getForSelect();
?>
<div id="corpo" class="container-fluid">
	<form id="form_cadastro" name="form" class="form-horizontal" method="post" action="fonte_crud.php" onsubmit="return validaForm(this)" novalidate>
		<div class="caixa panel panel-default">
			<div class="legenda panel-heading">
				<h3 class="panel-title"><?php echo mensagens::capitaliza($acao); ?> Fonte</h3>
			</div>
			<div class="panel-body form">

				<div class="form-group">
					<label for="jogo" class="col-sm-3 control-label">Jogo*:</label>
					<div class="col-sm-7">
						<select id="jogo" name="jogo" class="form-control select" required autofocus>
							<option value="">Escolha um jogo</option>
							<?php foreach($jogo_rs as $jogo_row){
								if($jogo_row['id'] == $id_jogo){
									$selected = 'selected';
								} else {
									$selected = '';
								}
								?>
								<option value="<?php echo $jogo_row['id'] ?>" <?php echo $selected ?>><?php echo $jogo_row['descricao'] ?></option>
							<?php } ?>
						</select>
					</div>
				</div>
				<div class="form-group">
					<label for="arquivo_dialogo" class="col-sm-3 control-label">Arquivo do Diálogo*:</label>
					<div class="col-sm-7">
						<input type="file" id="arquivo_dialogo" name="arquivo_dialogo" class="fileuploader" data-formatos="png"
							data-tamanho-limite="2097152" <?php echo $atributos_arquivo_dialogo ?> required />
					</div>
				</div>
				<div class="form-group">
					<label for="arquivo_fonte" class="col-sm-3 control-label">Arquivo da Fonte*:</label>
					<div class="col-sm-7">
						<input type="file" id="arquivo_fonte" name="arquivo_fonte" class="fileuploader" data-formatos="png"
							data-tamanho-limite="2097152" <?php echo $atributos_arquivo_fonte ?> required
							data-onfilecomplete="toggleCamposCoresCRUDFontes(true); instanciarContaGotas('arquivo_fonte', 'previa_fonte', atualizarCorChaveCRUDFontes)"
							data-onfileremove="toggleCamposCoresCRUDFontes(false)" />
					</div>
				</div>
				<div class="campos_cores form-group" style='display: none'>
					<label for="cor_chave" class="col-sm-3 control-label">Cor Chave:</label>
					<div class="col-sm-7">
						<input type="text" id="cor_chave" name="cor_chave" class="form-control colorpicker" value="<?php echo $cor_chave ?>"
							data-formato="hex" placeholder="Escolha a cor aqui" />
					</div>
				</div>
				<div class="campos_cores form-group" style='display: none'>
					<div class="caption">Ou clique em uma cor da imagem abaixo:</div>
					<canvas id="previa_fonte" class='conta_gotas' style='display: none'></canvas>
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
				<button type="reset" class="btn btn-default">
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