/* Plugin de campos colorpicker
 * 
 * Baseado no componente "Bootstrap Colorpicker" (https://itsjavi.com/bootstrap-colorpicker/),
 * em conjunto com estilizações nos padrões do Bootstrap.
 * 
 * Dependências:
 * - bootstrap-colorpicker.min.css
 * - bootstrap-colorpicker.min.js
 * - Estilizações do campo, nos arquivos CSS
 * 
 * Funções adicionadas:
 *	colorpicker.instanciar( [ seletor_campo ] , [ escopo ] )
 */

function colorpicker(){}

colorpicker.instanciar = function(seletor_campo, escopo){
	var busca;
	if(!escopo) escopo = 'body';
	if(seletor_campo){
		busca = $(escopo).find(seletor_campo).not("[data-instanciado='true']");
	} else {
		busca = $(escopo).find("input.colorpicker").not("[data-instanciado='true']");
	}
	busca.each(function(){
		var $campo = $(this);
		var maxlength, formato, cor_padrao;
		
		// Definindo id dos campos, caso não exista
		var id;
		if(!$campo.is('[id]')){
			id = gerarIdAleatorio($campo);
			$campo.attr('id', id);
		} else {
			id = $campo.attr('id');
		}
		
		// Definindo formato de cores em função do atributo "data-formato".
		// Se não especificado, usar como padrão "hex".
		if($campo.is('[data-formato]')){
			formato = $campo.attr('data-formato');
		} else {
			formato = 'hex';
		}
		
		// Definindo limite de caracteres, em função do formato de cores
		if(formato == 'hex'){
			maxlength = 7;
		} else {
			maxlength = 25;
		}
		$campo.attr('maxlength', maxlength);
		
		// Definindo formato de cores em função do atributo "data-formato".
		// Se não especificado, usar como padrão "hex".
		if($campo.is('[data-cor-padrao]')){
			cor_padrao = $campo.attr('data-cor-padrao');
		} else {
			// Definindo cor padrão para #444, caso nenhuma tenha sido fornecida
			if($campo.val() == ''){
				cor_padrao = '#444444';
			}
		}
		
		// Parâmetros de instanciação do campo select
		var parametros = {
			// Definindo formato de cores padrão
			'format': formato
		}
		
		// Definindo cor padrão
		if(cor_padrao != ''){
			parametros.color = cor_padrao;
		}
		
		// Formatando campo
		var id_div_campo = 'div_' + id;
		var $divCampo = $('<div />').attr('id', id_div_campo).addClass('input-group colorpicker-component');
		var $botaoSelecaoCor = $('<span />').addClass('input-group-addon').html('<i></i>');
		$campo.wrap($divCampo).after($botaoSelecaoCor);
		
		// Instanciação do Colorpicker
		$('#' + id_div_campo).colorpicker(parametros);
		
		// Inserir atributo que impede desta função atuar sobre o colorpicker
		// duas vezes, de modo a evitar bugs.
		$campo.attr('data-instanciado', 'true');
	});
}

colorpicker.setarValor = function(campo, valor){
	var $campo = $(campo);
	$campo.colorpicker('setValue', valor);
	if(valor == ''){
		$campo.val('');
	}
}