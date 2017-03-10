<?php
require_once("cabecalho.php");
require_once("menu.php");

$jogo = new jogo();

$jogo_lista = (isset($_GET['jogo_lista'])) ? ($_GET['jogo_lista']) : ('');
$termo_original_lista = (isset($_GET['termo_original_lista'])) ? ($_GET['termo_original_lista']) : ('');

$jogo_rs = $jogo->getForSelect();
?>
<div id="corpo" class="container-fluid">
	<form id="form" name="form" class="form-horizontal" onsubmit="return validaForm(this)" novalidate>
		<div class="caixa panel panel-default">
			<div class="legenda panel-heading">
				<h3 class="panel-title">Listar Termos de Dicionário</h3>
			</div>
			<div class="panel-body form">
				
				<div class="form-group">
					<label for="jogo_lista" class="col-sm-2 col-sm-offset-2 control-label">Jogo*:</label>
					<div class="col-sm-6">
						<select id="jogo_lista" name="jogo_lista" class="form-control select" required autofocus>
							<option value="">Escolha um jogo</option>
							<?php foreach($jogo_rs as $jogo_row){
								if($jogo_row['id'] == $jogo_lista){
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
					<label for="termo_original_lista" class="col-sm-2 col-sm-offset-2 control-label">Termo Original:</label>
					<div class="col-sm-6">
						<input type="text" id="termo_original_lista" name="termo_original_lista" class="form-control" value="<?php echo $termo_original_lista ?>" />
					</div>
				</div>
				
			</div>
			<div class="panel-footer botoes">
				<a href="inicio.php" class="btn btn-default">
					<i class="fa fa-arrow-left fa-lg"></i>
					Voltar
				</a>
				<button type="reset" class="btn btn-default">
					<i class="fa fa-recycle fa-lg"></i>
					Limpar
				</button>
				<button type="submit" class="btn btn-default">
					<i class="fa fa-search-plus fa-lg"></i>
					Pesquisar
				</button>
			</div>
		</div>
	</form>
	
	<?php
	// Tabela de listagem
	if(is_numeric($jogo_lista)){
		$oculta = false;
	} else {
		$oculta = true;
	}
	tabela::instanciar('termo_dicionario_tabela.php', "jogo_lista=$jogo_lista&termo_original_lista=$termo_original_lista", $oculta, 'tabela');
	?>
</div>
<?php include('rodape.php');?>