/* Plugin modal de diálogos
 * 
 * Baseado no componente de modal do Bootstrap.
 * 
 * Formas de Uso:
 *	jInfo( mensagem, [titulo, callback] )
 *	jConfirm( mensagem, [titulo, callback] )
 *	jConfirmCancelar( mensagem, [titulo, callback] )
 *	jAlert( mensagem, [titulo, callback] )
 *	jError( mensagem, [titulo, callback] )
 *	jPrompt( mensagem, [valor, titulo, callback] )
 *	jModal( pagina, [titulo, callback] )
 *	jModalLocal( html, [titulo, callback] )
 *	jModalRemove( [callback] )
 *	jImage( imagem )
 *	jLoadingWheel( [tem_modal, tem_animacao] )
 *	jLoadingWheelRemove( [ callback ] )
 *	modal.sessaoExpirada( )
 */

function modal(){}

modal.instanciar = function(mensagem, titulo, tipo, callback, tem_modal, tem_animacao, arrastavel){
	if(typeof tipo == 'undefined') tipo = 'i';
	if(typeof tem_modal == 'undefined') tem_modal = true;
	if(typeof tem_animacao == 'undefined') tem_animacao = true;
	if(typeof arrastavel == 'undefined') arrastavel = true;
	var classe_titulo, classe_icone;
	var resultado;
	if(tipo == 'cc'){
		resultado = undefined;
	} else {
		resultado = false;
	}
	var botoes_modal = $("<button />").addClass('btn btn-default btn-dynamic btn-ok').attr('data-dismiss', 'modal').html('OK').click(function(){
		resultado = true;
	});
	var backdrop;
	if(tem_modal){
		if(tipo == 'img' || tipo == 'm' || tipo == 'ml'){
			backdrop = true;
		} else {
			backdrop = 'static';
		}
	} else {
		backdrop = false;
	}
	if(tipo == 'i'){
		if(typeof titulo == 'undefined') titulo = 'Informação';
		classe_titulo = 'janela_modal informacao';
		classe_icone = 'fa-info-circle text-success';
	} else if(tipo == 'a'){
		if(typeof titulo == 'undefined') titulo = 'Aviso';
		classe_titulo = 'janela_modal aviso';
		classe_icone = 'fa-warning text-warning';
	} else if(tipo == 'c'){
		if(typeof titulo == 'undefined') titulo = 'Confirmação';
		classe_titulo = 'janela_modal confirmacao';
		classe_icone = 'fa-question-circle text-primary';
		var html_botao1 = 'Sim';
		var html_botao2 = 'Não';
		
		var botao_ok = botoes_modal.html(html_botao1).addClass('btn-danger');
		var botao_cancelar = $("<button />").addClass('btn btn-default btn-dynamic btn-cancel').attr('data-dismiss', 'modal').html(html_botao2).click(function(){
			resultado = false;
		});
		botoes_modal = botao_cancelar.add(botao_ok);
	} else if(tipo == 'cc'){
		if(typeof titulo == 'undefined') titulo = 'Confirmação';
		classe_titulo = 'janela_modal confirmacao';
		classe_icone = 'fa-question-circle';
		var botao_sim = botoes_modal.html('Sim').addClass('btn-danger');
		var botao_nao = $("<button />").addClass('btn btn-default btn-dynamic btn-nao').attr('data-dismiss', 'modal').html('Não').click(function(){
			resultado = false;
		});
		var botao_cancelar = $("<button />").addClass('btn btn-default btn-dynamic btn-cancel').attr('data-dismiss', 'modal').html('Cancelar').click(function(){
			resultado = undefined;
		});
		botoes_modal = botao_cancelar.add(botao_nao).add(botao_sim);
	} else if(tipo == 'e'){
		if(typeof titulo == 'undefined') titulo = 'Erro';
		classe_titulo = 'janela_modal erro';
		classe_icone = 'fa-warning text-danger';
	} else if(tipo == 'l'){
		titulo = '';
		classe_titulo = 'janela_modal loadingwheel';
		botoes_modal = '';
		classe_icone = '';
	} else if(tipo == 'img'){
		titulo = '';
		classe_titulo = 'janela_modal imagem';
		botoes_modal = '';
	} else {
		classe_titulo = 'janela_modal modal_pagina';
		classe_icone = '';
	}
	if(tem_animacao) classe_titulo += ' fade';
	
	var $janela_modal = $("<div />").data('tipo', tipo).addClass('modal ' + classe_titulo).append(
		$("<div />").addClass('modal-dialog').append(
			$("<div />").addClass('modal-content')
		)
	);
	var $dialogo_janela_modal = $janela_modal.find('div.modal-dialog');
	var $conteudo_janela_modal = $janela_modal.find('div.modal-content');
	var $corpo_janela_modal = '';
	var $mensagem_janela_modal = '';
	if(tipo == 'l'){
		$conteudo_janela_modal.append(
			$("<div />").addClass('modal-header').append(
				$("<i />").addClass('fa fa-circle-o-notch fa-spin fa-3x fa-fw').html('')
			).append('<span class="sr-only">Carregando...</span>').append('<div>Carregando...</div>')
		);
	} else if(tipo == 'img'){
		$janela_modal.addClass('carregando');
		$conteudo_janela_modal.append(
			$("<i />").addClass('fa fa-circle-o-notch fa-spin fa-3x fa-fw').html('')
		).append('<span class="sr-only">Carregando...</span>');
	} else {
		var $modal_header = $("<div />").addClass('modal-header').append(
			$("<button />").attr({
				"type": "button",
				"data-dismiss": "modal",
				"aria-label": "Close"
			}).addClass('close').html(
				$("<span />").attr('aria-hidden', 'true').html('&times;')
			)
		);
		if(tipo != 'm'){
			$modal_header.append(
				$("<h4 />").addClass('modal-title').html(titulo)
			);
		}
		var $modal_body = $("<div />").addClass('modal-body');
		$conteudo_janela_modal.append($modal_header).append($modal_body);
		
		if(tipo != 'm' && tipo != 'ml'){
			$conteudo_janela_modal.append(
				$("<div />").addClass('modal-footer').append(botoes_modal)
			)
		}
		$corpo_janela_modal = $conteudo_janela_modal.find('div.modal-body');
		
		if(tipo == 'm' || tipo == 'ml' || tipo == 'img'){
			var mensagem_modal;
			if(tipo == 'm' || tipo == 'img'){
				mensagem_modal = 'Carregando...';
			} else {
				mensagem_modal = mensagem;
			}
			if(tipo == 'ml'){
				$mensagem_janela_modal = mensagem_modal;
			} else {
				$mensagem_janela_modal = $("<table />").attr('align', 'center').html(
					$("<tr />").append(
						$("<td />").attr('colspan', '2').addClass('mensagem_modal').html(mensagem_modal)
					)
				);
			}
		} else {
			$mensagem_janela_modal = $("<table />").attr('align', 'center').html(
				$("<tr />").append(
					$("<td />").html(
						$("<i />").addClass('fa ' + classe_icone + ' fa-3x').html('')
					)
				).append(
					$("<td />").addClass('mensagem_modal').html(mensagem)
				)
			)
		}
		$corpo_janela_modal.append($mensagem_janela_modal);
	}
	
	centralizarModal = function(apenas_verticalmente){
		if(typeof apenas_verticalmente == 'undefined') apenas_verticalmente = false;
		
		var largura_janela = $(window).width();
		var altura_janela = $(window).height();
		var largura_modal;
		var altura_modal;
		if(tipo == 'img'){
			largura_modal = $conteudo_janela_modal.width();
			altura_modal = $conteudo_janela_modal.height();
		} else {
			largura_modal = $dialogo_janela_modal.width();
			altura_modal = $dialogo_janela_modal.height();
		}
		var margem_esquerda = Math.max(0, (largura_janela - largura_modal) / 2);
		var margem_direita;
		if(apenas_verticalmente){
			margem_direita = 20;
		} else {
			margem_direita = Math.max(0, (altura_janela - altura_modal) / 2);
		}
		
		$dialogo_janela_modal.css({
			'marginLeft': margem_esquerda,
			'marginTop': margem_direita
		});
	}
	
	var id = gerarIdAleatorio( $janela_modal[0] );
	$janela_modal.appendTo('body').attr('id', id);
	$janela_modal.on({
		'show.bs.modal': function(e) {
			if(tipo == 'm' || tipo == 'ml'){
				centralizarModal(true);
			} else {
				centralizarModal();
			}
			if(tipo != 'l'){
				$janela_modal.find('button.btn-ok').trigger('focus');
			}
		},
		'shown.bs.modal': function(e) {
			if(tipo == 'm' || tipo == 'ml'){
				if(tipo == 'ml') if(callback) callback(resultado);
			} else {
				$(window).on('resize.centralizaModal' + id, centralizarModal);
			}
		},
		'hidden.bs.modal': function(e) {
			if(tipo != 'm' && tipo != 'ml') $(window).off('resize.centralizaModal' + id);
			$janela_modal.remove();
			
			if(tipo == 'i' || tipo == 'a' || tipo == 'c' || tipo == 'e') if(callback) callback(resultado);
		}
	});
	$janela_modal.modal({
		'show': true,
		'backdrop': backdrop
	});
	if(arrastavel){
		var drags;
		if(tipo == 'img'){
			drags = '.modal-content';
		} else {
			drags = '.modal-header';
		}
		$janela_modal.drags({'handle': drags});
	}
	
	if(tipo == 'm'){
		var pagina = mensagem;
		var parametros = titulo;
		var metodo;
		if(typeof parametros != 'undefined'){
			metodo = 'POST';
		} else {
			metodo = 'GET';
		}
		$.ajax({
			type: metodo,
			cache: false,
			url: pagina,
			data: parametros,
			timeout: 5000,
			error: function(jqXHR, textStatus){
				$corpo_janela_modal.html("<b style='color: red; font-weight: bold'>Erro ao carregar página!</b>");
			},
			success: function(d) {
				$corpo_janela_modal.html(d);
				if(callback) callback(resultado);
			}
		});
	} else if(tipo == 'img'){
		var caminho_imagem = mensagem;
		var $botao_fechar = $("<button />").attr({
			"type": "button",
			"data-dismiss": "modal",
			"aria-label": "Close"
		}).addClass('close').html(
			$("<span />").attr('aria-hidden', 'true').html('&times;')
		);
		
		// Carregando imagem para exibir no modal
		$("<img />", {"src": caminho_imagem}).css({
			"width": "auto",
			"height": getAltura() - (getAltura() * 20/100),
			"borderRadius": "3px"
		}).load(function(){
			var $img = $(this);
			$janela_modal.removeClass('carregando');
			$conteudo_janela_modal.html($img).prepend($botao_fechar);
			$dialogo_janela_modal.css({
				'width': $img.width()
			});
			$botao_fechar.focus();
			centralizarModal();
		}).error(function(){
			$corpo_janela_modal.html(
				$("<div />", {"text": "<b style='color: red; font-weight: bold'>Erro ao carregar página!</b>"}).css({"color": "#FF0000", "fontWeight": "bold"})
			).prepend($botao_fechar);
		});
	}
}

function jInfo(mensagem, titulo, callback){
	if(!titulo) titulo = 'Informação';
	modal.instanciar(mensagem, titulo, 'i', callback);
}

function jAlert(mensagem, titulo, callback){
	if(!titulo) titulo = 'Aviso';
	modal.instanciar(mensagem, titulo, 'a', callback);
}

function jConfirm(mensagem, titulo, callback){
	if(!titulo) titulo = 'Confirmação';
	modal.instanciar(mensagem, titulo, 'c', callback);
}

function jConfirmCancelar(mensagem, titulo, callback){
	if(!titulo) titulo = 'Confirmação';
	modal.instanciar(mensagem, titulo, 'cc', callback);
}

function jError(mensagem, titulo, callback){
	if(!titulo) titulo = 'Erro';
	modal.instanciar(mensagem, titulo, 'e', callback);
}

function jModal(pagina, parametros, callback, tem_modal, tem_animacao){
	modal.instanciar(pagina, parametros, 'm', callback, tem_modal, tem_animacao, false);
}

function jModalLocal(html, titulo, callback, tem_modal, tem_animacao){
	if(!titulo) titulo = 'Modal';
	modal.instanciar(html, titulo, 'ml', callback, tem_modal, tem_animacao);
}

function jModalRemove(callback){
	var $janela_modal = $('div.janela_modal').last();
	$janela_modal.on('hidden.bs.modal', callback);
	$janela_modal.modal('hide');
}

function jImage(caminho_imagem, tem_modal, tem_animacao){
	modal.instanciar(caminho_imagem, '', 'img', null, null, tem_modal, tem_animacao);
}

function jLoadingWheel(tem_modal, tem_animacao){
	modal.instanciar('', '', 'l', null, tem_modal, tem_animacao);
}

function jLoadingWheelRemove(callback){
	jModalRemove(callback);
}

function jForm(pagina, parametros, callback){
	if(typeof parametros == 'undefined' || $.trim(parametros) == ''){
		parametros = '?ajax=true';
	} else {
		parametros += '&ajax=true';
	}
	jModal(pagina, parametros, function(){
		var $janela_modal = $('div.janela_modal');
		var $form = $janela_modal.find('form');
		instanciarComponentes(null, $janela_modal);
		if($form.length > 0){
			$form.find("[autofocus]").focus();
		} else {
			$janela_modal.find('button.close').focus();
		}
		if(callback) callback();
	}, true, false);
}

function mostraCarregando(tem_modal, tem_animacao){
	if(typeof tem_modal == 'undefined') tem_modal = true;
	if(typeof tem_animacao == 'undefined') tem_animacao = true;
	jLoadingWheel(tem_modal, tem_animacao);
}

function ocultaCarregando(callback){
	jModalRemove(callback);
}

function exibirBgBody(pagina, titulo){
	jModal(pagina, titulo);
}

function removerDivs(callback){
	jModalRemove(callback);
}

modal.sessaoExpirada = function(){
	var reconectar = function(){
		var pagina_destino;
		if(typeof ambiente != 'undefined' && ambiente == 'D'){
			pagina_destino = 'logoff.php?destino=l';
		} else {
			pagina_destino = 'logoff.php';
		}
		mostraCarregando();
		location.href = pagina_destino;
	}
	var $html = $("<div />").addClass('sessao_expirada').append(
		$("<div />").addClass('titulo').html('Sessão Expirada.')
	).append(
		$("<div />").addClass('texto').html('Por questão de segurança, o tempo de sessão é definido em 10 (dez) minutos a partir de sua última ação.')
	).append(
		$("<div />").addClass('botoes').html(
			$("<button />", {'type': 'button'}).addClass('btn btn-default').html('Reconectar').click(reconectar)
		)
	);
	jModalLocal($html, 'Aviso', reconectar);
	$html.find('button').focus();
}