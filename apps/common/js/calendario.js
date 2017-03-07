/* Plugin de campos de calendario de data e hora
 * 
 * Baseado no componente "Bootstrap Datetimepicker" (https://eonasdan.github.io/bootstrap-datetimepicker/),
 * em conjunto com estilizações nos padrões do Bootstrap.
 * 
 * Dependências:
 * - bootstrap-datetimepicker.min.css
 * - bootstrap-datetimepicker.min.js
 * - jquery.mask.min.js
 * - Estilizações do campo, nos arquivos CSS
 * 
 * Funções adicionadas:
 *	calendario.instanciar( [ seletor_campo ] , [ escopo ] )
 */

function calendario(){}

calendario.instanciar = function(seletor_campo, escopo){
	var busca;
	if(!escopo) escopo = 'body';
	if(seletor_campo){
		busca = $(escopo).find(seletor_campo).not("[data-instanciado='true']");
	} else {
		busca = $(escopo).find("input.calendario").not("[data-instanciado='true']");
	}
	var dispositivo = getDispositivo();
	busca.each(function(){
		var $campo = $(this);
		var tipo, temIntervalo, data_minima, data_maxima, datas_desativadas, dias_desativados;
		
		// Obtenção do tipo do campo.
		// Se não existir, utilizar como padrão o tipo "data"
		if(($campo.is("[data-tipo]") && ($.trim( $campo.attr('data-tipo') ) != ''))){
			tipo = $.trim( $campo.attr('data-tipo') );
		} else {
			tipo = 'data';
		}
		
		// Obtenção do tipo do campo.
		// Se não existir, utilizar como padrão o tipo "data"
		if(($campo.is("[data-intervalo]") && ($.trim( $campo.attr('data-intervalo') ) == 'true'))){
			temIntervalo = true;
		} else {
			temIntervalo = false;
		}
		
		// Obtenção da data mínima permitida pelo calendário.
		// Se não existir, utilizar uma data predefinida
		if(($campo.is("[data-minima]") && ($.trim( $campo.attr('data-minima') ) != ''))){
			data_minima = moment( $.trim( $campo.attr('data-minima') ), 'DD/MM/YYYY HH:mm' );
		} else {
			data_minima = moment('01/01/1920', 'DD/MM/YYYY HH:mm');
		}
		
		// Obtenção da data máxima permitida pelo calendário
		// Se não existir, utilizar uma data predefinida
		if(($campo.is("[data-maxima]") && ($.trim( $campo.attr('data-maxima') ) != ''))){
			data_maxima = moment( $.trim( $campo.attr('data-maxima') ), 'DD/MM/YYYY HH:mm' );
		} else {
			data_maxima =  moment('01/01/2050', 'DD/MM/YYYY HH:mm');
		}
		
		// Obtenção das datas desativadas pelo campo
		if($campo.is("[data-desativadas]")){
			datas_desativadas = ( $campo.attr('data-desativadas') ).split(',');
			for(var i in datas_desativadas){
				var data_desativada = $.trim(datas_desativadas[i]);
				datas_desativadas[i] = data_desativada;
			}
		} else {
			datas_desativadas = [];
		}
		
		// Obtenção dos dias da semana desativados pelo campo
		if($campo.is("[data-dias-desativados]")){
			dias_desativados = ( $campo.attr('data-dias-desativados') ).split(',');
			for(var i in dias_desativados){
				var dia_desativado = $.trim(dias_desativados[i]);
				if(!isNaN(dia_desativado)){
					dias_desativados[i] = parseInt(dia_desativado, 10);
				} else {
					dias_desativados[i] = calendario.converteDiaSemanaNumero(dia_desativado);
				}
			}
		} else {
			dias_desativados = [];
		}
		
		var checkDesativado = $campo.is(':disabled');
		var checkSomenteLeitura = $campo.is('[readonly]');
		
		// Criando id único para o campo, pois é em função do id que o campo é instanciado
		var id_conteiner = gerarIdAleatorio($campo);
		
		// Desativar autocompletação de texto do próprio navegador
		$campo.attr('autocomplete', 'off');
		
		// Parâmetros de instanciação do campo select
		var parametros = {
			// Define localização pt-BR (as strings de tradução estão no final do arquivo)
			'locale': 'pt-br',
			// Mostrar botão "Fechar", com ação de fechar o calendário, quando clicado
			'showClose': true,
			// Data mínima aceita pelo campo
			'minDate': data_minima,
			// Data máxima aceita pelo campo
			'maxDate': data_maxima,
			// Datas desativadas pelo campo
			'disabledDates': datas_desativadas,
			// Dias da semana desativados pelo campo
			'daysOfWeekDisabled': dias_desativados,
			// Evita setar data atual no campo, após a instanciação
			'useCurrent': false,
			// Posição do calendário, em relação ao seu campo
			'widgetPositioning': {
				horizontal: 'left',
				vertical: 'auto'
			},
			// Ativa ou desativa depuração
			//'debug': true,
			// Localização do componente
			tooltips: {
				today: 'Escolhe a data atual',
				clear: 'Limpar seleção',
				close: 'Fechar calendário',
				selectMonth: 'Escolha o mês',
				prevMonth: 'Mês anterior',
				nextMonth: 'Mês seguinte',
				selectYear: 'Escolha o ano',
				prevYear: 'Ano anterior',
				nextYear: 'Ano seguinte',
				selectDecade: 'Escolha a década',
				prevDecade: 'Década anterior',
				nextDecade: 'Década seguinte',
				prevCentury: 'Século anterior',
				nextCentury: 'Século seguinte',
				pickHour: 'Escolha a hora por número',
				incrementHour: 'Adicionar hora',
				decrementHour: 'Diminuir hora',
				pickMinute: 'Escolha o minuto por número',
				incrementMinute: 'Adicionar minuto',
				decrementMinute: 'Diminuir minuto',
				pickSecond: 'Escolha o segundo por número',
				incrementSecond: 'Adicionar segundo',
				decrementSecond: 'Diminuir segundo',
				togglePeriod: 'Alterne o príodo',
				selectTime: 'Escolha a hora'
			}
		}
		
		// Formatando campos em função do tipo do calendário
		var $conteiner_campo = $('<div />').addClass('conteiner_calendario input-group').attr('id', id_conteiner);
		
		var $campoFinal;
		if(temIntervalo){
			// Possui intervalo de períodos, logo criar segundo campo ao lado
			
			// Obtenção dos valores inicial e final, se existir
			var valor_inicial, valor_final;
			if($campo.val() == ''){
				if(($campo.is("[data-valor-inicial]") && ($.trim( $campo.attr('data-valor-inicial') ) != ''))){
					valor_inicial = $.trim( $campo.attr('data-valor-inicial') );
				} else {
					valor_inicial = '';
				}
			} else {
				valor_inicial = $campo.val();
			}
			if(($campo.is("[data-valor-final]") && ($.trim( $campo.attr('data-valor-final') ) != ''))){
				valor_final = $.trim( $campo.attr('data-valor-final') );
			} else {
				valor_final = '';
			}
			
			// Duplicando campo de texto, de modo que o primeiro conterá a data inicial, e o segundo, a final
			$campoFinal = $campo.clone().removeAttr('id data-valor-inicial data-valor-final data-tipo data-minima data-maxima data-desativadas data-intervalo');
			var nome_campo = $campo.attr('name');
			$campo.attr('name', nome_campo + '[inicial]').val(valor_inicial);
			$campoFinal.attr('name', nome_campo + '[final]').val(valor_final);
			$campoFinal.attr('id', gerarIdAleatorio($campoFinal));
			
			// Formatando marcação HTML dos campos
			var $grid = $('<div />').addClass('row').append(
				$('<div />').addClass('col-xs-6 col_inicial').html('De:')
			).append(
				$('<div />').addClass('col-xs-6 col_final').html('Até:')
			);
			$campo.after($grid).appendTo( $grid.find('div.col_inicial') );
			$campoFinal.appendTo( $grid.find('div.col_final') );

			// Formatando marcação HTML do campo inicial
			$conteiner_campo.addClass('date ' + tipo + ' inicial');
			$campo.wrap($conteiner_campo).after(
				$('<span />').addClass('input-group-addon').html(
					$('<span />').addClass('glyphicon glyphicon-calendar')
				)
			);

			// Formatando marcação HTML do campo final
			var id_conteiner_final = gerarIdAleatorio($campoFinal);
			var $conteiner_campo_final = $('<div />').addClass('conteiner_calendario input-group').attr('id', id_conteiner_final);
			$conteiner_campo_final.addClass('date ' + tipo + ' final');
			$campoFinal.wrap($conteiner_campo_final).after(
				$('<span />').addClass('input-group-addon').html(
					$('<span />').addClass('glyphicon glyphicon-calendar')
				)
			);
			$campo.add($campoFinal).attr('data-nome', nome_campo);
		} else {
			// Não possui intervalo de campos
			$campoFinal = $campo;
			
			$conteiner_campo.addClass('date ' + tipo);
			$campo.wrap($conteiner_campo).after(
				$('<span />').addClass('input-group-addon').html(
					$('<span />').addClass('glyphicon glyphicon-calendar')
				)
			);
		}
		
		if(tipo == 'data_hora'){
			/* Campo de calendário com data e hora */
			
			// Formatando componente em função do seu tipo
			parametros.format = 'DD/MM/YYYY HH:mm';
			parametros.showTodayButton = true;
			parametros.sideBySide = true;
			
			// Adicionando máscara e limite de caracteres
			$campo.add($campoFinal).mask('00/00/0000 00:00', {placeholder: "__/__/____ __:__"}).attr('maxlength', 16);
		} else if(tipo == 'hora') {
			/* Campo de calendário apenas com hora */
			
			// Formatando componente em função do seu tipo
			parametros.format = 'HH:mm';
			parametros.showTodayButton = false;
			
			// Adicionando máscara e limite de caracteres
			$campo.add($campoFinal).mask('00:00'), {placeholder: "__:__"}.attr('maxlength', 5);
		} else if(tipo == 'mes') {
			/* Campo de calendário apenas com seleção de mês */
			
			// Formatando componente em função do seu tipo
			parametros.format = 'MMM';
			parametros.showTodayButton = false;
			
			// Adicionando máscara e limite de caracteres
			$campo.add($campoFinal).mask('0#').attr('maxlength', 3);
			
			// TODO: Criar campos hidden para salvar o mês em número, ao passo que o exibe por extenso
		} else if(tipo == 'ano') {
			/* Campo de calendário apenas com seleção de ano */
			
			// Formatando componente em função do seu tipo
			parametros.format = 'YYYY';
			parametros.showTodayButton = false;
			
			// Adicionando máscara e limite de caracteres
			$campo.add($campoFinal).mask('0000').attr('maxlength', 4);
		} else {
			/* Campo de calendário comum */
			
			// Formatando componente em função do seu tipo
			parametros.format = 'DD/MM/YYYY';
			parametros.showTodayButton = true;
			
			// Adicionando máscara e limite de caracteres
			$campo.add($campoFinal).mask('00/00/0000', {placeholder: "__/__/____"}).attr('maxlength', 10);
		}
		
		// Instanciação do componente
		var seletor;
		if(temIntervalo){
			seletor = '#' + id_conteiner + ', #' + id_conteiner_final;
		} else {
			seletor = '#' + id_conteiner;
		}
		var calendario_instanciado;
		$(seletor).each(function(){
			var $conteiner = $(this);
			
			var checkCampoInicial = ( $conteiner.hasClass('inicial') );
			
			if(temIntervalo){
				if(!checkCampoInicial){
					// Exibir campo final relativamente ao canto direito do calendário,
					// ao invés do esquerdo, que é o padrão.
					if(dispositivo == 'xs'){
						parametros.widgetPositioning.horizontal = 'right'
					}
				}
			}
			
			
			var id = $conteiner.attr('id');
			calendario_instanciado = $('#' + id).datetimepicker(parametros);
			
			// Eventos do calendário
			calendario_instanciado.on({
				// Show: Mostrado quando o calendário é exibido
				'dp.show': function(){
					var $div_calendario = $('div.datepicker');
					
					// Adicionando animação fadein via CSS
					$div_calendario.addClass('fadein');
					
					// Alterando ação do botão "hoje", de modo a fechar o calendário após setar a data para hoje
					var $widgetCalendario = $div_calendario.closest('div.bootstrap-datetimepicker-widget');
					var $botaoHoje = $widgetCalendario.find("a[data-action='today']");
					var $botaoFechar = $widgetCalendario.find("a[data-action='close']");
					
					$botaoHoje.click(function(){
						setTimeout(function(){
							$botaoFechar.trigger('click');
						}, 25);
					});
				},
				// dp.change: Mostrado quando a data do calendário é alterada
				'dp.change': function(e){
					// Inserção condições adicionais nesse evento, necessárias
					// para o campo de intervalo funcionar.
					if(temIntervalo){
						if(checkCampoInicial){
							$('#' + id_conteiner_final).data("DateTimePicker").minDate(e.date);
						} else {
							$('#' + id_conteiner).data("DateTimePicker").maxDate(e.date);
						}
					}
					
					var $campoAlterado = $(this).find('input.calendario');
					$campoAlterado.trigger('change');
				}
			});
		});
		
		// Se campo estiver desativado ou somente leitura, desativar botões + e - após a instanciação
		if(checkDesativado || checkSomenteLeitura){
			calendario.desativar($campo);
			if(temIntervalo){
				calendario.desativar($campoFinal);
			}
		}
		
		// Inserir atributo que impede desta função atuar sobre o calendario
		// duas vezes, de modo a evitar bugs.
		$campo.add($campoFinal).attr('data-instanciado', 'true');
	});
}

calendario.converteDiaSemanaNumero = function(dia){
	var dia_numero = undefined;
	if(dia == 'dom'){
		dia_numero = 0;
	} else if(dia == 'seg'){
		dia_numero = 1;
	} else if(dia == 'ter'){
		dia_numero = 2;
	} else if(dia == 'qua'){
		dia_numero = 3;
	} else if(dia == 'qui'){
		dia_numero = 4;
	} else if(dia == 'sex'){
		dia_numero = 5;
	} else if(dia == 'sab'){
		dia_numero = 6;
	}
	return dia_numero;
}

calendario.setarDataMinima = function(campo, data_hora){
	var $campo = $(campo);
	var $divCampo = $campo.closest('div');
	data_hora = moment(data_hora, 'DD/MM/YYYY HH:mm');
	$divCampo.data("DateTimePicker").minDate(data_hora);
}

calendario.setarDataMaxima = function(campo, data_hora){
	var $campo = $(campo);
	var $divCampo = $campo.closest('div');
	data_hora = moment(data_hora, 'DD/MM/YYYY HH:mm');
	$divCampo.data("DateTimePicker").maxDate(data_hora);
}

calendario.ativar = function(campo){
	var $campo = $(campo);
	var $conteiner = $campo.closest('div.conteiner_calendario');
	var $spanBotaoCalendario = $conteiner.find('span.input-group-addon');
	
	$campo.removeAttr('disabled readonly');
	$spanBotaoCalendario.removeClass('disabled');
	
	if($campo.attr('data-intervalo') == 'true'){
		var nome = $campo.attr('data-nome');
		var $campoFinal = $("[name^='" + nome + "\[final\]']");
		calendario.ativar($campoFinal);
	}
}

calendario.desativar = function(campo){
	var $campo = $(campo);
	var $conteiner = $campo.closest('div.conteiner_calendario');
	var $spanBotaoCalendario = $conteiner.find('span.input-group-addon');
	
	$campo.attr({
		'disabled': 'disabled',
		'readonly': 'readonly'
	});
	$spanBotaoCalendario.addClass('disabled');
	
	if($campo.attr('data-intervalo') == 'true'){
		var nome = $campo.attr('data-nome');
		var $campoFinal = $("[name^='" + nome + "\[final\]']");
		calendario.desativar($campoFinal);
	}
}

calendario.limpar = function(campo){
	var $campo = $(campo);
	var $conteiner = $campo.parent();
	$conteiner.data("DateTimePicker").date(null);
	
	if($campo.attr('data-intervalo') == 'true'){
		var nome = $campo.attr('data-nome');
		var $campoFinal = $("[name^='" + nome + "\[final\]']");
		calendario.limpar($campoFinal);
	}
}