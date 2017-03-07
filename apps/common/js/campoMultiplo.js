/* Plugin que estiliza campos múltiplos
 * 
 * Funções adicionadas:
 *	campoMultiplo.instanciar( [ seletor_campo ] , [ escopo ] )
 */

function campoMultiplo(){}

// Propriedades globais
campoMultiplo.divPai = [];
campoMultiplo.tabelaConteiner = [];
campoMultiplo.botaoAdicionar = [];
campoMultiplo.divTemplateConteiner = [];
campoMultiplo.divValores = [];

// Métodos
campoMultiplo.instanciar = function(seletor_campo, escopo){
	var busca;
	if(!escopo) escopo = 'body';
	if(seletor_campo){
		busca = $(escopo).find(seletor_campo).filter(':visible').not("[data-instanciado='true']");
	} else {
		busca = $(escopo).find("div.campo_multiplo").not("[data-instanciado='true']");
	}
	busca.each(function(){
		var $campo = $(this);
		var id_campo;
		if($campo.is('[id]')){
			id_campo = $campo.attr('id');
		} else {
			id_campo = gerarIdAleatorio($campo);
			$campo.attr('id', id_campo);
		}
		
		// Obtendo parâmetros obtidos na instanciação do componente
		var quantidade_maxima;
		
		// Obtendo quantidade máxima de campos que podem ser adicionados. Se não for
		// especificado, assumir como padrão 0, permitindo adicionar vários campos.
		if($campo.is('[data-quantidade-maxima]') && $.trim( $campo.attr('data-quantidade-maxima') != '' )){
			quantidade_maxima = parseInt($campo.attr('data-quantidade-maxima'), 10);
			if(isNaN(quantidade_maxima)) quantidade_maxima = 0;
		} else {
			quantidade_maxima = 0;
		}
		
		// Salvando propriedades, em função do id do campo
		campoMultiplo.salvarPropriedades(id_campo);
		
		// Travando campos do template, para evitar que sejam instanciados
		// antes da função "adicionar".
		campoMultiplo.travarCamposTemplate(id_campo);
		
		// Obtendo propriedades necessárias para a instanciação do campo
		var $tabelaConteiner = campoMultiplo.tabelaConteiner[id_campo];
		var $botaoAdicionar = campoMultiplo.botaoAdicionar[id_campo];
		var $divValores = campoMultiplo.divValores[id_campo];
		
		// Setando valor inicial do atributo "data-iterador-proximo-campo"
		$tabelaConteiner.attr('data-iterador-proximo-campo', '0');
		
		// Obtendo valores précadastrados para este campo, se houver
		var valores_campos = interpretarJSON( $.trim( $divValores.html() ) );
		var total_campos_inserir = valores_campos.length;
		
		// Adicionando campos, caso haja valores fornecidos.
		// Do contrário, adicionar um único campo vazio.
		if(total_campos_inserir > 0){
			for(var i in valores_campos){
				var valores_campo = valores_campos[i];
				if(i == 0){
					campoMultiplo.adicionar(id_campo, true, valores_campo);
				} else {
					campoMultiplo.adicionar(id_campo, false, valores_campo);
				}
			}
		} else {
			campoMultiplo.adicionar(id_campo, true);
			total_campos_inserir = 1;
		}
		
		// Atualizando variável de campos inseridos
		$tabelaConteiner.attr('data-iterador-proximo-campo', total_campos_inserir);
		
		// Setando evento para o botão "Adicionar".
		// O evento verifica se o total de campos ultrapassa a quantidade máxima permitida, antes de adicionar os campos.
		$botaoAdicionar.click(function(){
			var total_campos = ($tabelaConteiner.children('tbody').children('tr').length) + 1;
			if((quantidade_maxima == 0) || (total_campos <= quantidade_maxima)){
				campoMultiplo.adicionar(id_campo);
			} else {
				aviso($botaoAdicionar, 'Quantidade máxima de campos excedida.<br />Só é possível adicionar ' + quantidade_maxima + ' campos.', 10);
			}
		});
		
		// Inserir atributo que impede desta função atuar sobre o campo múltiplo
		// duas vezes, de modo a evitar bugs.
		$campo.attr('data-instanciado', 'true');
	});
}

campoMultiplo.salvarPropriedades = function(id_campo){
	var $campo = $('#' + id_campo);
	var $tabelaConteiner = $campo.children('table.conteiner');
	var $botaoAdicionar = $tabelaConteiner.find('button.adicionar').first();
	var $divTemplateConteiner = $campo.children('div.template');
	var $divValores = $campo.children('div.valores');
	
	campoMultiplo.divPai[id_campo] = $campo;
	campoMultiplo.tabelaConteiner[id_campo] = $tabelaConteiner;
	campoMultiplo.botaoAdicionar[id_campo] = $botaoAdicionar;
	campoMultiplo.divTemplateConteiner[id_campo] = $divTemplateConteiner;
	campoMultiplo.divValores[id_campo] = $divValores;
}

campoMultiplo.travarCamposTemplate = function(id_campo){
	var $divTemplateConteiner = campoMultiplo.divTemplateConteiner[id_campo];
	
	$divTemplateConteiner.find('input, select, textarea').attr({
		'disabled': 'disabled',
		'data-instanciado': 'true',
		'data-desativar-limpar' : 'true',
		'data-desativar-validacao' : 'true'
	});
}

campoMultiplo.adicionar = function(id_campo, primeiroCampo, valores_campo){
	if(typeof primeiroCampo == 'undefined') primeiroCampo = false;
	
	var $tabelaConteiner = campoMultiplo.tabelaConteiner[id_campo];
	var $tbody = $tabelaConteiner.children('tbody');
	
	var $elementoDestino;
	if(primeiroCampo){
		// Se for primeiro campo, apenas definir a primeira linha
		// como elemento de destino para o template a ser clonado.
		$elementoDestino = $tabelaConteiner.find('td.corpo').first();
	} else {
		// Se for do segundo campo em diante, clonar última linha da tabela por inteiro,
		// e em seguida, realizar nesta as operações:
		// 1. Limpar célula do corpo;
		// 2. Remover ação de adicionar;
		// 3. Desocultar ação de remover, bem como outras ações;
		// 4. No botão de remover, setar evento para remover campo.
		var $trClonado = $tbody.children('tr').last().clone();
		$trClonado.children('td.corpo').html('');
		$trClonado.children('td.acoes').children('button').each(function(){
			var $botaoAcao = $(this);
			if($botaoAcao.hasClass('adicionar')){
				$botaoAcao.remove();
			} else {
				$botaoAcao.show();
				
				if($botaoAcao.hasClass('remover')){
					$botaoAcao.click(function(){
						campoMultiplo.remover(this);
					})
				}
			}
		})
		
		// Definindo última linha inserida como elemento de destino
		// para o template a ser clonado.
		$tbody.append($trClonado);
		$elementoDestino = $trClonado.children('td.corpo');
	}
	
	// Clonando template para o elemento de destino
	campoMultiplo.clonarTemplate(id_campo, $elementoDestino, valores_campo);
}

campoMultiplo.remover = function(botao){
	var $botao = $(botao);
	var $tr = $botao.closest('tr');
	$tr.remove();
}

campoMultiplo.clonarTemplate = function(id_campo, elementoDestino, valores_campo){
	var $campo = campoMultiplo.divPai[id_campo];
	var $tabelaConteiner = campoMultiplo.tabelaConteiner[id_campo];
	var $divTemplateConteiner = campoMultiplo.divTemplateConteiner[id_campo];
	var $elementoDestino = $(elementoDestino);
	
	var iterador_proximo_campo = parseInt($tabelaConteiner.attr('data-iterador-proximo-campo'), 10);
	
	// Obtendo parâmetro que determina se o campo aceitará valores duplicados ou não.
	var aceitaValoresDuplicados;
	if($campo.is('[data-aceita-valores-duplicados]') && $.trim( $campo.attr('data-aceita-valores-duplicados') != '' )){
		aceitaValoresDuplicados = ($.trim( $campo.attr('data-aceita-valores-duplicados')) == 'true' );
	} else {
		aceitaValoresDuplicados = false;
	}
	
	// Clonando template
	var html_clone = $divTemplateConteiner.html();
	
	// Trocando ocorrências do termo {iterador} para o número do campo inserido
	var busca = new RegExp('\\{(.*?)\\}', 'g');
	var resultado;
	while(resultado = busca.exec(html_clone)){
		var coluna = resultado[1];
		if(coluna == 'iterador'){
			html_clone = html_clone.replace(new RegExp('{' + coluna + '}', 'g'), iterador_proximo_campo);
		}
	}
	
	// Incrementando total de campos inseridos
	iterador_proximo_campo++;
	$tabelaConteiner.attr('data-iterador-proximo-campo', iterador_proximo_campo);
	
	// Salvando template clonado no elemento de destino
	$elementoDestino.html(html_clone);
	
	// Instanciando componentes de outros campos de formulário, após clonar o template
	campoMultiplo.instanciarOutrosComponentes($elementoDestino);
	
	// Se houver valores fornecidos, obtê-los e setar valores nos seus respectivos campos
	if(typeof valores_campo == 'object'){
		campoMultiplo.setarValorCamposClonados($elementoDestino, valores_campo);
	}
	
	// Setando eventos nos campos do template.
	if(!aceitaValoresDuplicados){
		campoMultiplo.setarEventoVerificaValoresDuplicados($elementoDestino);
	}
}

campoMultiplo.setarValorCamposClonados = function(elementoDestino, valores_campo){
	var $elementoDestino = $(elementoDestino);
	
	for(var nome_campo in valores_campo){
		var valor = valores_campo[nome_campo];
		
		var $campo = $elementoDestino.find("[data-nome='" + nome_campo + "']");
		if($campo.is('select')){
			// Campos Select, instanciados com o componente select2
			var id_campo, valor_campo;
			if($campo.is('[data-pagina]')){
				id_campo = valor['id'];
				valor_campo = valor['valor'];
			} else {
				id_campo = valor_campo = valor;
			}
			select.setarValor($campo, id_campo, valor_campo);
		} else if($campo.is("[type='checkbox']")){
			// Campos checkbox
			if(valor.toString() == $campo.val()){
				$campo.prop('checked', true);
			} else {
				$campo.prop('checked', false);
			}
		} else {
			// Campos diversos
			$campo.val(valor).trigger('estiliza');
		}
	}
}

campoMultiplo.setarEventoVerificaValoresDuplicados = function(elementoDestino){
	var $elementoDestino = $(elementoDestino);
	
	$elementoDestino.find('input:not([hidden]), select, textarea').change(function(){
		campoMultiplo.verificaValoresDuplicados(this);
	});
}

campoMultiplo.verificaValoresDuplicados = function(campoElementoDestino){
	var $campoElementoDestino = $(campoElementoDestino);
	var $elementoDestino = $campoElementoDestino.closest('td.corpo');
	var $outrosCampos = $elementoDestino.closest('table.conteiner').find('td.corpo').not($elementoDestino);
	
	// Obtendo valores dos campos de formulário, situados no elemento de destino atual
	var valores_atual = '';
	$elementoDestino.find('input:not([hidden]), select, textarea').each(function(i){
		var $campo = $(this);
		if(i > 0) valores_atual += '|';
		
		if($campo.is("[type='checkbox']")){
			if($campo.is(':checked')){
				valores_atual += ( $campo.val() ).toString();
			}
		} else {
			valores_atual += ( $campo.val() ).toString();
		}
	});
	
	// Comparando valores acima com os de outros campos.
	// Se encontrar pelo menos um igual, abortar.
	var checkExisteValoresDuplicados = false;
	$outrosCampos.each(function(){
		var $tdCorpo = $(this);
		var valores = '';
		$tdCorpo.find('input:not([hidden]), select, textarea').each(function(i){
			var $campo = $(this);
			if(i > 0) valores += '|';
			
			if($campo.is("[type='checkbox']")){
				if($campo.is(':checked')){
					valores_atual += ( $campo.val() ).toString();
				}
			} else {
				valores += ( $campo.val() ).toString();
			}
		});
		
		if(valores == valores_atual){
			checkExisteValoresDuplicados = true;
			return false; // Sair do $.each
		}
	});
	
	if(checkExisteValoresDuplicados){
		aviso($campoElementoDestino, 'Não é possível cadastrar informações duplicadas!', 5);
		
		if($campoElementoDestino.is("[type='checkbox']")){
			if($campoElementoDestino.is(':checked')){
				$campoElementoDestino.prop('checked', false);
			} else {
				$campoElementoDestino.prop('checked', true);
			}
		} else {
			$campoElementoDestino.val('').trigger('estiliza');
		}
	}
}

campoMultiplo.instanciarOutrosComponentes = function(elementoDestino){
	var $elementoDestino = $(elementoDestino);
	
	$elementoDestino.find('input, select, textarea').removeAttr('disabled data-instanciado data-desativar-limpar data-desativar-validacao');
	
	instanciarComponentes(null, $elementoDestino);
}