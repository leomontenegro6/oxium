<?php
class modal{	
	public static function retornar($texto, $retorno, $tipo='', $ajax=false){
		if($ajax === true){
			if($tipo != 'aviso' && $tipo != 'erro' && (preg_match("/^Erro/", $texto) || preg_match("/^Já existe um/", $texto) || preg_match("/está sendo usad/", $texto))){
				$texto = str_replace("Erro ao inserir! \\n", "", $texto);
				$texto = str_replace("Erro ao atualizar! \\n", "", $texto);
				$tipo = 'erro';
			}
			$array = array(
				"tipo_modal"=>$tipo,
				"msg_modal"=>$texto,
				"pagina"=>$retorno
			);
			echo json_encode($array);
		} else {
			switch($tipo){
				case "aviso":
					echo "<script language='javascript'>$(function(){ jAlert(\"$texto\", 'Aviso', function(){location.href='$retorno';}); })</script>";
					break;
				case "erro":
					echo "<script language='javascript'>$(function(){ jError(\"$texto\", 'Erro!', function(){location.href='$retorno';}); })</script>";
					break;
				default:
					// Caso não for especificado o tipo de janela modal, detectar se o texto começa com "Erro ao".
					// Se sim, então exibir o modal de erro. Se não, exibir como padrão o modal de informação.
					if(preg_match("/^Erro/", $texto) || preg_match("/^Já existe um/", $texto) || preg_match("/está sendo usad/", $texto)){
						$texto = str_replace("Erro ao inserir! \\n", "", $texto);
						$texto = str_replace("Erro ao atualizar! \\n", "", $texto);
						echo "<script language='javascript'>$(function(){ jError(\"$texto\", 'Erro!', function(){location.href='$retorno';}); })</script>";
					} else {
						echo "<script language='javascript'>$(function(){ jInfo(\"$texto\", 'Informação', function(){location.href='$retorno';}); })</script>";
					}
					break;
					//echo "<script language='javascript'>$(function(){ jInfo(\"$texto\", 'Informação', function(){location.href='$retorno';}); })</script>";
					//break;
				}
		}
        exit;
	}
    
    public static function notificar($texto, $tipo="", $ajax=false){
		if($ajax){
			if($tipo == 'aviso'){
				$titulo = 'Aviso';
				$icone = 'fa-warning text-warning';
				$classe_cor = '';
			} elseif($tipo == 'erro'){
				$titulo = 'Erro';
				$icone = 'fa-error text-danger';
				$classe_cor = '';
			} else {
				$titulo = 'Informação';
				$icone = 'fa-info-circle text-success';
			}
			?>
			<div class="caixa_modal panel panel-default">
				<div class="legenda panel-heading">
					<h3 class="panel-title"><?php echo $titulo ?></h3>
				</div>
				<div class="panel-body">
					<h4 class="text-center">
						<i class="fa <?php echo $icone ?> fa-2x"></i>
						<?php echo $texto ?>
					</h4>
				</div>
			</div>
			<?php
		} else {
			switch($tipo){
				case "aviso":
					echo "<script language='javascript'>$(function(){ jAlert(\"$texto\", 'Aviso'); } ) </script>";
				break;
				case "erro":
					echo "<script language='javascript'>$(function(){ jError(\"$texto\", 'Erro'); } )</script>";
				break;
				default:
					echo "<script language='javascript'>$(function(){ jInfo(\"$texto\", 'Informação'); } )</script>";
				break;
			}
		}
	}

	public static function confirmar($id,$retorno){
		echo "<script language=\"javascript\">$(function(){ confirma('$retorno','id=".$id."') })</script>";
		exit;
	}
	
	public static function sessaoExpirada(){
		echo "<script language=\"javascript\">$(function(){ modal.sessaoExpirada() })</script>";
		exit;
	}
}