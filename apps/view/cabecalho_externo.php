<?php
if(isset($_GET['ajax']) || isset($_POST['ajax'])){
	if((isset($_GET['ajax']) && $_GET['ajax'] == 'true') || (isset($_POST['ajax']) && $_POST['ajax'] == 'true')){
		$ajax = true;
	} else {
		$ajax = false;
	}
} else {
	$ajax = false;
}
require_once '../../utils/autoload.php';
$ambiente = mensagens::getAmbienteDesenvolvimento();
?>
<?php if(!$ajax){ ?>
<!DOCTYPE html>
<html>
	<head>
		<title>Oxium Scriptsium</title>
		<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
		<meta http-equiv="content-type" content="text/html;charset=utf-8" />
		<link rel="icon" type="image/png" href="../common/images/favicon-32x32.png" sizes="32x32" />
		<link rel="icon" type="image/png" href="../common/images/favicon-16x16.png" sizes="16x16" />
		
		<link rel="stylesheet" href="../common/css/bootstrap.min.css" />
		<link rel="stylesheet" type="text/css" href="../common/css/font-awesome.min.css" />
		<link rel="stylesheet" href="../common/css/layout.css?<?php echo filemtime('../common/css/layout.css') ?>" />
		<link rel="stylesheet" href="../common/css/layout-xs.css?<?php echo filemtime('../common/css/layout-xs.css') ?>" />
		
		<?php // CARREGAMENTO DE ARQUIVOS JS ?>
		<script src="../common/js/jquery-1.11.0.min.js"></script>
		<script src="../common/js/jquery-funcoes.js?<?php echo filemtime('../common/js/jquery-funcoes.js') ?>"></script>
		<script src="../common/js/bootstrap.min.js"></script>
		
        <script src="../common/js/aviso.js?<?php echo filemtime('../common/js/aviso.js') ?>"></script>
		<script src="../common/js/funcoes.js?<?php echo filemtime('../common/js/funcoes.js') ?>"></script>
		<script src="../common/js/modal.js?<?php echo filemtime('../common/js/modal.js') ?>"></script>
		<script type="text/javascript">
			var data_servidor = new Date(<?php echo strtotime('now') * 1000 ?>);
			var ambiente = '<?php echo $ambiente ?>';
			$(function(){
				
			})
		</script>
	</head>
	<body id="pagina">
<?php } ?>