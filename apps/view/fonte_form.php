<?php
require_once("cabecalho.php");
require_once("menu.php");

$fonte = new fonte();
$jogo = new jogo();
$background = new background();

$jogo_lista = (isset($_GET['jogo_lista'])) ? ($_GET['jogo_lista']) : ('');

if( isset($_POST['id']) ){
	$acao = "editar";
	$id = $_POST['id'];
	$fonte_row = $fonte->get($id);
	
	$id_jogo = $fonte_row['jogo'];
	$arquivo_configuracao = $fonte_row['arquivo_configuracao'];
	$arquivo_fonte = $fonte_row['arquivo_fonte'];
	$arquivo_dialogo = $fonte_row['arquivo_dialogo'];
	$cor_chave = $fonte_row['cor_chave'];
	
	if(file_exists($arquivo_configuracao)){
		$tamanho_arquivo_configuracao = filesize($arquivo_configuracao) / 1024;
		$atributos_arquivo_configuracao = "data-value='$arquivo_configuracao' data-tamanho-arquivo='$tamanho_arquivo_fonte'";
	} else {
		$atributos_arquivo_configuracao = '';
	}
	if(file_exists($arquivo_fonte)){
		$tamanho_arquivo_fonte = filesize($arquivo_fonte) / 1024;
		$atributos_arquivo_fonte = "data-value='$arquivo_fonte' data-tamanho-arquivo='$tamanho_arquivo_fonte'";
	} else {
		$atributos_arquivo_fonte = '';
	}
	if(file_exists($arquivo_dialogo)){
		$tamanho_arquivo_dialogo = filesize($arquivo_dialogo) / 1024;
		$atributos_arquivo_dialogo = "data-value='$arquivo_dialogo' data-tamanho-arquivo='$tamanho_arquivo_dialogo'";
	} else {
		$atributos_arquivo_dialogo = '';
	}
	
	$arquivoEdital_rs = $background->getByEdicaoFonte($id);
} else {
	$acao = 'cadastrar';
	$id = $id_jogo = $arquivo_fonte = $arquivo_dialogo = $cor_chave = '';
	$tamanho_arquivo_fonte = $tamanho_arquivo_dialogo = 0;
	
	$atributos_arquivo_configuracao = $atributos_arquivo_fonte = $atributos_arquivo_dialogo = '';
	
	$background_rs = array();
}

$jogo_rs = $jogo->getForSelect();

$total_backgrounds = count($background_rs);
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
						<select id="jogo" name="fonte[jogo]" class="form-control select" required autofocus>
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
				
				<ul class="nav nav-tabs" role="tablist">
					<li role="presentation" class="active">
						<a href="#fonte" aria-controls="fonte" role="tab" data-toggle="tab">
							<i class="fa fa-font fa-lg"></i>
							Fonte
						</a>
					</li>
					<li role="presentation">
						<a href="#backgrounds" aria-controls="backgrounds" role="tab" data-toggle="tab">
							<i class="fa fa-vcard-o fa-lg"></i>
							<i>Backgrounds</i>
						</a>
					</li>
					<li role="presentation">
						<a href="#paletas" aria-controls="paletas" role="tab" data-toggle="tab">
							<i class="fa fa-eyedropper fa-lg"></i>
							Paletas
						</a>
					</li>
				</ul>

				<div class="tab-content">
					<div role="tabpanel" class="tab-pane active">
						
						<div class="form-group">
							<label for="arquivo_configuracao" class="col-sm-3 control-label">Arquivo de Configuração:</label>
							<div class="col-sm-7">
								<input type="file" id="arquivo_configuracao" name="fonte[arquivo_configuracao]" class="fileuploader"
									data-formatos="txt" data-tamanho-limite="2097152"
									<?php echo $atributos_arquivo_configuracao ?> />
							</div>
						</div>
						<div class="form-group">
							<label for="arquivo_dialogo" class="col-sm-3 control-label">Arquivo do Diálogo*:</label>
							<div class="col-sm-7">
								<input type="file" id="arquivo_dialogo" name="fonte[arquivo_dialogo]" class="fileuploader"
									data-formatos="png" data-tamanho-limite="2097152" <?php echo $atributos_arquivo_dialogo ?> required />
							</div>
						</div>
						<div class="form-group">
							<label for="coordenada_x" class="col-sm-3 control-label">Coordenadas dos Diálogos*:</label>
							<div class="col-sm-3">
								<input type="text" id="coordenada_x" name="fonte[coordenada_x]" class="spinner" required
									placeholder="X" />
							</div>
							<div class="col-sm-3">
								<input type="text" id="coordenada_y" name="fonte[coordenada_y]" class="spinner" required
									placeholder="Y" />
							</div>
						</div>
						<div class="form-group">
							<label for="arquivo_fonte" class="col-sm-3 control-label">Arquivo da Fonte*:</label>
							<div class="col-sm-7">
								<input type="file" id="arquivo_fonte" name="fonte[arquivo_fonte]" class="fileuploader" data-formatos="png"
									data-tamanho-limite="2097152" <?php echo $atributos_arquivo_fonte ?> required
									data-onfilecomplete="toggleCamposCoresCRUDFontes(true); instanciarContaGotas('arquivo_fonte', 'previa_fonte', atualizarCorChaveCRUDFontes)"
									data-onfileremove="toggleCamposCoresCRUDFontes(false)" />
							</div>
						</div>
						<div class="campos_cores form-group" style='display: none'>
							<label for="cor_chave" class="col-sm-3 control-label">Cor Chave:</label>
							<div class="col-sm-7">
								<input type="text" id="cor_chave" name="fonte[cor_chave]" class="form-control colorpicker"
									value="<?php echo $cor_chave ?>" data-formato="hex" placeholder="Escolha a cor-chave aqui" />
							</div>
						</div>
						<div class="campos_cores form-group" style='display: none'>
							<div class="caption">Ou clique em uma cor da imagem abaixo:</div>
							<canvas id="previa_fonte" class='conta_gotas' style='display: none'></canvas>
						</div>
						
					</div>
					<div role="tabpanel" class="tab-pane">
						<div class="form-group">
							<label for="arquivos_backgrounds" class="col-sm-3 control-label">Arquivos de <i>Background</i>:</label>
							<div class="col-sm-7">
								<input type="file" id="arquivos_backgrounds" name="arquivo" class="fileuploader"
									data-formatos="png" data-tamanho-limite="2097152" multiple
									data-onfilecomplete="adicionarBackgroundFonte(upl, arquivo_tr)" />
							</div>
						</div>
						<div class="row">
							<div class="col-xs-12">
								<table id="tabela_backgrounds" class="table table-bordered table-hover table-striped" style="width: 100%" data-iterador="<?php echo ($total_backgrounds - 1) ?>">
									<thead>
										<tr>
											<th><i>Background</i></th>
											<th width="200">Coordenadas</th>
											<th width="100">Operação</th>
											<th width="62">Ação</th>
										</tr>
									</thead>
									<tbody>
										<?php if($acao == 'editar'){ ?>
											<?php foreach($background_rs as $i=>$background_row){ ?>
											<tr>
												<td>
													<img class="thumbnail" src="<?php echo $background_row['arquivo'] ?>"
														style="display: inline-block; vertical-align: middle; max-width: 100%" />
												</td>
												<td>
													<input type="text" name="background[<?php echo $i ?>][coordenada_x]"
														placeholder="X" class="spinner" />
													<input type="text" name="background[<?php echo $i ?>][coordenada_y]"
														placeholder="X" class="spinner" />
												</td>
												<td class="operacao">Editar</td>
												<td class="acoes">
													<button type="button" title="Marcar para exclusão" onclick="marcarBackgroundParaExclusao(this)" class="btn btn-danger">
														<i class="fa fa-remove fa-lg"></i>
													</button>

													<input type="hidden" name="background[<?php echo $i ?>][acao]" class="acao" value="editar" />
													<input type="hidden" name="background[<?php echo $i ?>][id]" class="id" value="<?php echo $background_row['id'] ?>" />
													<input type="hidden" name="background[<?php echo $i ?>][tmp_name]" class="tmp_name" value="<?php echo $background_row['caminho'] ?>" />
													<input type="hidden" name="background[<?php echo $i ?>][extension]" class="extension" value="<?php echo $background_row['extensao'] ?>" />
												</td>
											</tr>
											<?php } ?>
										<?php } ?>
									</tbody>
								</table>
							</div>
						</div>
					</div>
					<div role="tabpanel" class="tab-pane">
						<div class="campo_multiplo" data-aceita-valores-duplicados='true'>
							<table class="conteiner">
								<tr>
									<td class="corpo"></td>
									<td class="acoes" valign="top">
										<button type="button" class="btn btn-default adicionar" title="Adicionar">
											<i class="fa fa-plus"></i>
										</button>
										<button type="button" class="btn btn-default remover" title="Remover">
											<i class="fa fa-minus"></i>
										</button>
									</td>
								</tr>
							</table>
							<div class="template">
								<div class="row">
									<div class="col-sm-6">
										<input type="text" data-nome='cor_entrada' id="paleta_{iterador}_cor_entrada"
											name="paletas[{iterador}][cor_entrada]" class="form-control colorpicker"
											data-formato="hex" data-cor-padrao="" placeholder="Escolha a cor de entrada" />
									</div>
									<div class="col-sm-6">
										<input type="text" data-nome='cor_saida' id="paleta_{iterador}_cor_saida"
											name="paletas[{iterador}][cor_saida]" class="form-control colorpicker"
											data-formato="hex" data-cor-padrao="" placeholder="Escolha a cor de saída" />
									</div>
								</div>
							</div>
							<div class="valores">
								[]
							</div>
						</div>
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