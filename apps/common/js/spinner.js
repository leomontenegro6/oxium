/* Plugin de campos spinner
 * 
 * Baseado no componente "jQuery Bootstrap TouchSpin" (http://www.virtuosoft.eu/code/bootstrap-touchspin/),
 * em conjunto com o componente de máscara jQuery Mask (http://igorescobar.github.io/jQuery-Mask-Plugin/),
 * e estilizações nos padrões do Bootstrap.
 * 
 * Dependências:
 * - jquery.bootstrap-touchspin.css
 * - jquery.bootstrap-touchspin.js
 * - jquery.mask.min.js
 * - Estilizações do campo, nos arquivos CSS
 * 
 * Funções adicionadas:
 *	spinner.instanciar( [ seletor_campo ] , [ escopo ] )
 */

function spinner(){}

spinner.instanciar = function(seletor_campo, escopo){
	var busca;
	if(!escopo) escopo = 'body';
	if(seletor_campo){
		busca = $(escopo).find(seletor_campo).not("[data-instanciado='true']");
	} else {
		busca = $(escopo).find("input.spinner").not("[data-instanciado='true']");
	}
	busca.each(function(){
		var $campo = $(this);
		
		var minimo, maximo, step, casas_decimais, prefixo, posfixo, checkArredondar, checkAceitaValoresNulos;
		var checkDesativado, checkSomenteLeitura;
		
		// Obtendo parâmetros adicionais
		if(($campo.is("[data-minimo]") && (!isNaN(parseFloat($campo.attr('data-minimo')))))){
			minimo = parseFloat($campo.attr('data-minimo'));
		} else {
			minimo = undefined;
		}
		if(($campo.is("[data-maximo]") && (!isNaN(parseFloat($campo.attr('data-maximo')))))){
			maximo = parseFloat($campo.attr('data-maximo'));
		} else {
			maximo = undefined;
		}
		if(($campo.is("[data-step]") && (!isNaN(parseFloat($campo.attr('data-step')))))){
			step = parseFloat($campo.attr('data-step'));
		} else {
			step = 1;
		}
		if(($campo.is("[data-casas-decimais]") && (!isNaN(parseFloat($campo.attr('data-casas-decimais')))))){
			casas_decimais = parseFloat($campo.attr('data-casas-decimais'));
		} else {
			casas_decimais = 0;
		}
		if(($campo.is("[data-prefixo]") && ($.trim( $campo.attr('data-prefixo') ) != ''))){
			prefixo = $campo.attr('data-prefixo');
		}
		if(($campo.is("[data-posfixo]") && ($.trim( $campo.attr('data-posfixo') ) != ''))){
			posfixo = $campo.attr('data-posfixo');
		}
		if(($campo.is("[data-arredondar]") && ($.trim( $campo.attr('data-arredondar') ) != ''))){
			if($.trim( $campo.attr('data-arredondar') ) == 'true'){
				checkArredondar = true;
			} else {
				checkArredondar = false;
			}
		} else {
			checkArredondar = true;
		}
		if(($campo.is("[data-aceita-valores-nulos]") && ($.trim( $campo.attr('data-aceita-valores-nulos') ) != ''))){
			if($.trim( $campo.attr('data-aceita-valores-nulos') ) == 'true'){
				checkAceitaValoresNulos = true;
			} else {
				checkAceitaValoresNulos = false;
			}
		} else {
			checkAceitaValoresNulos = true;
		}
		checkDesativado = $campo.is(':disabled');
		checkSomenteLeitura = $campo.is('[readonly]');
		
		// Eventos do campo
		$campo.on({
			// Blur: usado quando o foco do campo é retirado
			'blur': function(){
				// Anulando valor do campo, se for fornecido 0 (zero) e o campo não aceitar valores nulos
				if(!checkAceitaValoresNulos){
					spinner.anulaValor(this);
				}
			}
		});
		
		// Geração de parâmetros de instanciação do campo
		var parametros = {
			'prefix': prefixo,
			'postfix': posfixo,
			'step': step,
			'decimals': casas_decimais
		};
		
		// Fornecendo valor mínimo para o campo, se houver
		if(typeof minimo != 'undefined'){
			parametros.min = minimo;
		}
		
		// Fornecendo valor máximo para o campo, se houver
		if(typeof maximo != 'undefined'){
			parametros.max = maximo;
			
			// Inserindo atributo "maxlength" no campo, em função do número de dígitos
			// do valor máximo (se houver).
			var maxlength;
			if(spinner.checkNumeroReal(step)){
				maxlength = (maximo.toFixed(2)).length - 1;
			} else {
				maxlength = (maximo.toString()).length - 1;
			}
			$campo.attr('maxlength', maxlength);
		}
		
		// Verificando se a opção de arrendondar valor pelo "step" foi ativada ou não
		if(checkArredondar){
			parametros.forcestepdivisibility = 'round';
		} else {
			parametros.forcestepdivisibility = 'none';
		}
		
		// Aplicando máscara
		if(casas_decimais > 0){
			$campo.mask('##0.00', {reverse: true});
		} else {
			$campo.mask('0#');
		}
		
		// Instanciação do Spinner
		$campo.TouchSpin(parametros);
		
		// Se campo estiver desativado ou somente leitura, desativar botões + e - após a instanciação
		if(checkDesativado || checkSomenteLeitura){
			spinner.desativar($campo);
		}
		
		// Inserir atributo que impede desta função atuar sobre o spinner
		// duas vezes, de modo a evitar bugs.
		$campo.attr('data-instanciado', 'true');
	});
}

spinner.checkNumeroReal = function(n){
	return Number(n) === n && n % 1 !== 0;
}

spinner.anulaValor = function(campo){
	var $campo = $(campo);
	if(parseFloat($campo.val()) == 0){
		$campo.val('');
	}
}

spinner.ativar = function(campo){
	var $campo = $(campo);
	var $conteiner = $campo.closest('div.bootstrap-touchspin');
	var $botaoDecrementar = $conteiner.find('button.bootstrap-touchspin-down');
	var $botaoIncrementar = $conteiner.find('button.bootstrap-touchspin-up');
	
	$campo.removeAttr('disabled readonly');
	$botaoDecrementar.add($botaoIncrementar).removeAttr('disabled');
}

spinner.desativar = function(campo){
	var $campo = $(campo);
	var $conteiner = $campo.closest('div.bootstrap-touchspin');
	var $botaoDecrementar = $conteiner.find('button.bootstrap-touchspin-down');
	var $botaoIncrementar = $conteiner.find('button.bootstrap-touchspin-up');
	
	$campo.attr({
		'disabled': 'disabled',
		'readonly': 'readonly'
	});
	$botaoDecrementar.add($botaoIncrementar).attr('disabled', 'disabled');
}

spinner.atualizarPropriedades = function(campo, propriedades){
	var $campo = $(campo);
	$campo.trigger("touchspin.updatesettings", propriedades);
}