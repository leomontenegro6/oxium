<?php
session_start();
if(isset($_GET['ajax']) || isset($_POST['ajax'])){
	if((isset($_GET['ajax']) && $_GET['ajax'] == 'true') || (isset($_POST['ajax']) && $_POST['ajax'] == 'true')){
		$ajax = true;
	} else {
		$ajax = false;
	}
} else {
	$ajax = false;
}
if(!isset($_SESSION['login'])){
	if($ajax === true){
		$array = array(
			"tipo_modal"=>"erro",
			"msg_modal"=>"Sessão expirada!<br /><br />Por questão de segurança, o tempo de sessão é definido em 10 (dez) minutos a partir de sua última ação.",
			"pagina"=>"index.php"
		);
		echo json_encode($array);
	} else {
		header("Location: proibido.php");
	}
	exit;
}
require_once '../../utils/autoload.php';

$iduser = $_SESSION["iduser"];
$login = $_SESSION["login"];
$nome_exibicao = $_SESSION["nome"];

$ambiente = mensagens::getAmbienteDesenvolvimento();
if(!$ajax){
	$endereco = mensagens::getEnderecoPagina();
	?>
<!DOCTYPE html>
<html>
	<head>
		<title>Oxium Scriptsium</title>
		<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
		<meta http-equiv="content-type" content="text/html;charset=utf-8" />
		<link rel="icon" type="image/png" href="../common/images/favicon-32x32.png" sizes="32x32" />
		<link rel="icon" type="image/png" href="../common/images/favicon-16x16.png" sizes="16x16" />
		
		<?php // CARREGAMENTO DE ARQUIVOS CSS ?>
		<?php // Bootstrap ?>
		<link rel="stylesheet" href="../common/css/bootstrap.min.css">
		<link rel="stylesheet" href="../common/css/bootstrap-submenu.min.css">
		<?php // jQuery Datatables, com suporte a dispositivos móveis ?>
		<link rel="stylesheet" href="../common/css/dataTables.bootstrap.min.css">
		<link rel="stylesheet" href="../common/css/responsive.bootstrap.min.css">
		<link rel="stylesheet" href="../common/css/buttons.dataTables.min.css">
		<?php // Select2, com autocomplete ?>
		<link rel="stylesheet" href="../common/css/select2.min.css">
		<?php // Bootstrap Datepicker, para calendários ?>
		<link rel="stylesheet" href="../common/css/bootstrap-datetimepicker.min.css">
		<?php // Awesome Bootstrap Checkbox, para checkboxes e radiobuttons ?>
		<link rel="stylesheet" href="../common/css/font-awesome.min.css">
		<link rel="stylesheet" href="../common/css/awesome-bootstrap-checkbox.css">
		<?php // jQuery Bootstrap Touchspin, para campos de texto com spinner ?>
		<link rel="stylesheet" href="../common/css/jquery.bootstrap-touchspin.css">
		<?php // Bootstrap Colorpicker, para campos de seleção de cores ?>
		<link rel="stylesheet" href="../common/css/bootstrap-colorpicker.min.css">
		
		<?php // Arquivos CSS padrões do sistema ?>
		<link rel="stylesheet" href="../common/css/layout.css?<?php echo filemtime('../common/css/layout.css') ?>">
		<link rel="stylesheet" href="../common/css/layout-xs.css?<?php echo filemtime('../common/css/layout-xs.css') ?>">
		
		<?php // CARREGAMENTO DE ARQUIVOS JS ?>
		<?php // jQuery ?>
		<script src="../common/js/jquery-1.11.0.min.js"></script>
		<script src="../common/js/jquery.mobile.touch.events.min.js"></script>
		<script src="../common/js/jquery-funcoes.js?<?php echo filemtime('../common/js/jquery-funcoes.js') ?>"></script>
		<?php // Bootstrap ?>
		<script src="../common/js/bootstrap.min.js"></script>
		<?php // Suporte a submenus e efeito de exibição em hover ?>
		<script src="../common/js/bootstrap-hover-dropdown.min.js"></script>
		<script src="../common/js/bootstrap-submenu.min.js"></script>
		<?php // jQuery Datatables, com suporte a dispositivos móveis e integração ao Bootstrap e suporte a exportar em PDF e XLS ?>
		<script src="../common/js/jquery.dataTables.min.js"></script>
		<script src="../common/js/dataTables.bootstrap.min.js"></script>
		<script src="../common/js/dataTables.responsive.min.js"></script>
		<script src="../common/js/dataTables.buttons.min.js"></script>
		<script src="../common/js/buttons.print.min.js"></script>
		<?php // Select2, com autocomplete ?>
		<script src="../common/js/select2.min.js"></script>
		<?php // Bootstrap Datetimepicker, para calendários de data e hora ?>
		<script src="../common/js/moment.min.js"></script>
		<script src="../common/js/moment.locale.pt-br.js"></script>
		<script src="../common/js/bootstrap-datetimepicker.min.js"></script>
		<?php // jQuery Bootstrap Touchspin, para campos de texto com spinner ?>
		<script src="../common/js/jquery.bootstrap-touchspin.js"></script>
		<?php // Bootstrap Colorpicker, para campos de seleção de cores ?>
		<script src="../common/js/bootstrap-colorpicker.min.js"></script>
		<?php // jQuery Mask, para aplicar máscaras em campos de formulário ?>
		<script src="../common/js/jquery.mask.min.js"></script>
		
		<script src="../common/js/funcoes.js?<?php echo filemtime('../common/js/funcoes.js') ?>"></script>
		<script src="../common/js/modal.js?<?php echo filemtime('../common/js/modal.js') ?>"></script>
		<script src="../common/js/menu.js?<?php echo filemtime('../common/js/menu.js') ?>"></script>
		<script src="../common/js/tabela.js?<?php echo filemtime('../common/js/tabela.js') ?>"></script>
		<script src="../common/js/aviso.js?<?php echo filemtime('../common/js/aviso.js') ?>"></script>
		<script src="../common/js/aba.js?<?php echo filemtime('../common/js/aba.js') ?>"></script>
		<script src="../common/js/select.js?<?php echo filemtime('../common/js/select.js') ?>"></script>
		<script src="../common/js/calendario.js?<?php echo filemtime('../common/js/calendario.js') ?>"></script>
		<script src="../common/js/fileUploader.js?<?php echo filemtime('../common/js/fileUploader.js') ?>"></script>
		<script src="../common/js/spinner.js?<?php echo filemtime('../common/js/spinner.js') ?>"></script>
		<script src="../common/js/colorpicker.js?<?php echo filemtime('../common/js/colorpicker.js') ?>"></script>
		<script src="../common/js/campoMultiplo.js?<?php echo filemtime('../common/js/campoMultiplo.js') ?>"></script>
		<script type="text/javascript">
			var data_servidor = new Date(<?php echo strtotime('now') * 1000 ?>);
			var ambiente = '<?php echo $ambiente ?>';
			var dispositivo = '';
			$(function(){
				<?php /*
				* Chamada de função que define o valor da variável global "dispositivo", que
				* é utilizada para determinar o tipo de dispositivo utilizado pelo usuário.
				* A variável é atualizada toda vez que o evento window.resize é chamado.
				*/
				?>
				dispositivo = getDispositivo(true);
				<?php /*
				* Chamada de função que instancia todos os componentes de front-end de uma vez,
				* em todos os elementos da página.
				*/
				?>
				instanciarComponentes();
			})
		</script>
	</head>
<?php } ?>