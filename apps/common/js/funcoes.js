// Adicionando funções como membro do protótipo do objeto String
String.prototype.trim = function(){
	return this.replace(/^\s+|\s+$/g, '');
}
String.prototype.ltrim = function(){
	return this.replace(/^\s+/, '');
}
String.prototype.rtrim = function(){
	return this.replace(/\s+$/, '');
}
String.prototype.strtr = function(replacePairs){
	var str = this.toString(), key, re;
	for (key in replacePairs) {
		if (replacePairs.hasOwnProperty(key)) {
			if(key == '*'){
				re = /\*/g;
			} else if(key == '.') {
				re = /\./g;
			} else {
				re = new RegExp(key, 'g');
			}
			str = str.replace(re, replacePairs[key]);
		}
	}
	return str;
}

//Funções JavaScript
function gE(ID) {
	return document.getElementById(ID);
}

function gEs(tag) {
	return document.getElementsByTagName(tag);
}

function gEn(name) {
	return document.getElementsByName(name);
}

function getLargura(){
	var largura = (top != self) ? (top.innerWidth || document.documentElement.clientWidth) : (window.innerWidth || document.documentElement.clientWidth);
	return largura;
}

function getAltura(){
	var altura = (top != self) ? (top.innerHeight || document.documentElement.clientHeight) : (window.innerHeight || document.documentElement.clientHeight);
	return altura;
}

function getAlturaBarras(){
	var alturaBarras = (top != self) ? ((top.outerHeight - top.innerHeight) || 125) : ((window.outerHeight - window.innerHeight) || 125);
	return alturaBarras;
}

function sortNumber(array){
	return array.sort(function(a, b){ return a - b; });
}

function removeDuplicates(array){
	return array.filter(function (item, index, self) {
        return self.indexOf(item) == index;
    });
}

function getTamanhoObjeto(obj){
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
}

/* Função que retorna o dispositivo utilizado pelo usuário, para acessar o sistema
 * Valores possíveis de retorno:
 *	- xs: Extra small (Celulares, com largura de tela menor que 768px);
 *	- sm: Small (Tablets, com largura de tela maior ou igual a 768px);
 *	- md: Medium (Desktops de monitor antigo, com largura maior ou igual a 992px);
 *	- lg: Large (Desktops de monitor widescreen, com largura maior ou igual a 1200px).
 * */
function getDispositivo(onresize) {
	if(typeof onresize == 'undefined') onresize = false;
	if(onresize){
		$(window).off('resize.atualizaVariavelGlobal').on('resize.atualizaVariavelGlobal', function(){
			window.dispositivo = getDispositivo(false);
		});
	}
	var envs = ['xs', 'sm', 'md', 'lg'];

	var $el = $('<div>');
	$el.appendTo( $('body') );

	for (var i = envs.length - 1; i >= 0; i--) {
		var env = envs[i];

		$el.addClass('hidden-'+env);
		if ($el.is(':hidden')) {
			$el.remove();
			return env
		}
	};
}

function scrollarElemento(elem){
	$('body').animate({
		scrollTop: $(elem).offset().top
	}, 500);
}

function upper(texto){
	return texto.toUpperCase();
}

function lower(texto){
	return texto.toLowerCase();
}

function normalize(texto){
	var tabela_caracteres_especiais = {
		'Š':'S', 'š':'s', 'Đ':'Dj', 'đ':'dj', 'Ž':'Z', 'ž':'z', 'Č':'C', 'č':'c', 'Ć':'C', 'ć':'c',
		'À':'A', 'Á':'A', 'Â':'A',  'Ã':'A',  'Ä':'A', 'Å':'A', 'Æ':'A', 'Ç':'C', 'È':'E', 'É':'E',
		'Ê':'E', 'Ë':'E', 'Ì':'I',  'Í':'I',  'Î':'I', 'Ï':'I', 'Ñ':'N', 'Ò':'O', 'Ó':'O', 'Ô':'O',
		'Õ':'O', 'Ö':'O', 'Ø':'O',  'Ù':'U',  'Ú':'U', 'Û':'U', 'Ü':'U', 'Ý':'Y', 'Þ':'B', 'ß':'Ss',
		'à':'a', 'á':'a', 'â':'a',  'ã':'a',  'ä':'a', 'å':'a', 'æ':'a', 'ç':'c', 'è':'e', 'é':'e',
		'ê':'e', 'ë':'e', 'ì':'i',  'í':'i',  'î':'i', 'ï':'i', 'ð':'o', 'ñ':'n', 'ò':'o', 'ó':'o',
		'ô':'o', 'õ':'o', 'ö':'o',  'ø':'o',  'ù':'u', 'ú':'u', 'û':'u', 'ý':'y', 'ý':'y', 'þ':'b',
		'ÿ':'y', 'Ŕ':'R', 'ŕ':'r',  '*':'',   ';':'',  '.':'',  '\'':'', '´':'',  '_':' '
	};
	return texto.strtr(tabela_caracteres_especiais);
}

function capitaliza(texto){
	texto = lower(texto);
	var texto_capitalizado = '';
	var palavras = texto.split(' ');
	var total_palavras = palavras.length;
	for(var i=0; i<total_palavras; i++){
		var p = palavras[i];
		p = lower(p);
		p = p.replace(/(?:^|\s)\S/g, function(a){ return a.toUpperCase(); });
		var temAlgarismosRomanos = p.match(/^([ivx]?[xiv][xiv][xiv]?[xiv]?[:]?[.]?)$/i);
		var temPreposicoes = p.match(/^([dn]?[aeou][s]?|em|para|ao|aos|sobre|com|por|que)$/i);
		if(temAlgarismosRomanos){ // Palavra em algarismo romano. Deixar tudo maiúsculo
			p = upper(p);
		} else if(temPreposicoes){ // Preposições. Deixar tudo minúsculo
			p = lower(p);
		} else { // Palavras normais. Capitalizar
			p = lower(p);
			p = p.replace(/(?:^|\s)\S/g, function(a){ return a.toUpperCase(); });
		}
		if(i > 0) texto_capitalizado += ' ';
		texto_capitalizado += p;
	}
	return texto_capitalizado;
}

function encodeData(data){
	var data_encodada;
	if(data != '' && data != 'null'){
		var dh = data.split(' '); // Separar data de hora, se houver
		var d = dh[0].split('-'); 
		var dia = d[2];
		var mes = d[1];
		var ano = d[0];
		// Se o dígito do ano for valor menor que 100, inserir prefixo '19'
		if(parseInt(ano, 10) < 100){
			ano = '19' + ( parseInt(ano, 10) ).toString();
		}
		data_encodada = dia + '/' + mes + '/' + ano;
	} else {
		data_encodada = '';
	}
	return data_encodada;
}

function encodeDataHora(data_hora){
	if(data_hora != '' && data_hora != 'null'){
		var data_encodada;
		var hora_encodada;
		var dh = data_hora.split(' ');
		var d = dh[0].split('-');
		var dia = d[2];
		var mes = d[1];
		var ano = d[0];
		// Se o dígito do ano for valor menor que 100, inserir prefixo '19'
		if(parseInt(ano, 10) < 100){
			ano = '19' + ( parseInt(ano, 10) ).toString();
		}
		var data_encodada = dia + '/' + mes + '/' + ano;
		var h = dh[1].slice(0, 5).split(':');
		var horas = h[0];
		var minutos = h[1];
		var hora_encodada = horas + ':' + minutos;
		var data_hora_encodada = data_encodada + ' - ' + hora_encodada;
	} else {
		data_hora_encodada = '';
	}
	return data_hora_encodada;
}

function geraImagem(caminho){
	var nome = caminho.split('/').pop();
	var $img = $('<img />', {'src': caminho}).css('width', '100px').attr({
		'alt': nome,
		'onerror': "$(this).after('<div class=\'erro\' />').remove()"
	});
	return $img[0].outerHTML;
}

function interpretarJSON(string){
	var array_json;
	try{
		array_json = $.parseJSON(string);
	}catch(e){
		array_json = {};
	};
	return array_json;
}

function chamarPagina(pagina, parametros, callback, callback_erro, timeout) {
	var metodo;
	if(typeof parametros == 'undefined' || (typeof parametros == 'string' && $.trim(parametros) == '')){
		metodo = 'get';
	} else {
		metodo = 'post';
	}
	if(typeof timeout == 'undefined') timeout = 0;
	ajax = $.ajax({
		type: metodo,
		url: pagina,
		data: parametros,
		timeout: timeout,
		error: function(jqXHR, textStatus){
			if(callback_erro) callback_erro(jqXHR, textStatus);
		},
		success: function(d) {
			if(callback) callback(d);
		}
	});
	return ajax;
}

function abortarPaginaChamada(ajax){
	try{
		return ajax.abort();
	}catch(e){
		return e;
	}
}

function setSelect(url,campo,callback) {
	var $campo;
	if(typeof campo == 'string'){
		$campo = $('#' + campo);
	} else {
		$campo = $(campo);
	}
	$campo.attr('disabled', 'disabled');
	chamarPagina(url, '', function(r){
		$campo.removeAttr('disabled').attr('data-atualizado', 'true').html(r);
		$campo.trigger('change.estiliza');
		if( callback ) callback();
	});
}

function validaSenha(campo, formulario) {
	var form = gE(formulario);
	var $campo = $(campo).closest('td.td_form_left');
	if (form.senha.value != form.repetesenha.value) {
		aviso($campo, 'Senhas não conferem!', 8);
		form.senha.value = ('');
		form.repetesenha.value = ('');
	return false;
	}
	return true;
}

function exibeForcaSenha(campo){
	var $barra = $("<table />").addClass('barra').html(
		$("<tr />").addClass('forca').html('<td></td><td></td><td></td><td></td>')
	);
	var $rotulo = $("<div />").width(150).addClass('rotulo').html('Por favor, digite a senha.');
	aviso(campo, $barra.add($rotulo), undefined, 'r', 'forca_senha');
	atualizaForcaSenha(campo);
}

function atualizaForcaSenha(campo){
	var senha = campo.value;
	var $balao_senha = $('div.popover.forca_senha');
	var $rotulo_balao_senha = $balao_senha.find('div.rotulo');
	var $barra_balao_senha = $balao_senha.find('table.barra');
	var rotulo, forca = 0, entropia = 0;
	if(senha != ''){
		if ((senha.length >= 4) && (senha.length <= 7)) {
			entropia += 10;
		} else if (senha.length > 7) {
			entropia += 25;
		}
		if (senha.match(/[a-z]+/)) {
			entropia += 10;
		}
		if (senha.match(/[A-Z]+/)) {
			entropia += 20;
		}
		if (senha.match(/\d+/)) {
			entropia += 20;
		}
		if (senha.match(/\W+/)) {
			entropia += 25;
		}
		
		if (entropia <= 30) {
			rotulo = 'Fraca';
			forca = 1;
		} else if ((entropia > 30) && (entropia <= 60)) {
			rotulo = 'Razoável';
			forca = 2;
		} else if ((entropia > 60) && (entropia <= 85)) {
			rotulo = 'Forte';
			forca = 3;
		} else {
			rotulo = 'Segura';
			forca = 4;
		}
	} else {
		rotulo = 'Por favor, digite a senha.';
		forca = 0;
	}
	$('#entropia_senha').val(entropia);
	$('#forca_senha').val(forca);
	$rotulo_balao_senha.html(rotulo);
	
	var classe;
	if(forca == 4){
		classe = 'segura';
	} else if(forca == 3){
		classe = 'forte';
	} else if(forca == 2){
		classe = 'razoavel';
	} else if(forca == 1){
		classe = 'fraca';
	} else {
		classe = '';
	}
	
	$barra_balao_senha.find('tr.forca>td').each(function(i){
		var $td = $(this);
		if(i < forca){
			$td.attr('class', classe);
		} else {
			$td.removeClass();
		}
	})
}

function ocultaForcaSenha(campo){
	removerAviso(campo);
}

function destravarCampoSenha(botao){
	var $botao = $(botao);
	var $campo = $('#senha');
	
	$botao.attr('disabled', 'disabled');
	
	$campo.removeAttr('disabled').attr('required', 'required').val('').focus();
}

function gerarIdAleatorio(el){
	var nome, numero, id;
	do{
		nome = ($(el).attr('name') === undefined) ? ('sem_nome') : $(el).attr('name');
		numero = parseInt(Math.random() * 1000, 10);
		id = (nome + numero).replace("[", "").replace("]", "");
	} while($('#'+id).length > 0);
	return id;
}

function travaForm(){
	$("form").attr("novalidate", "novalidate");
	$("input, button").filter("[type='submit']").mouseup(function(e){
		if(e.which == 1){
			var $botaoSubmit = $(this);
			
			// Travar botão submit
			$botaoSubmit.trigger("click").attr("disabled", "disabled").addClass("processando");
			
			// Travar submissão do formulário ao teclar Enter em um dos
			// campos de texto do formulário associado ao botão submit
			var $form = $botaoSubmit.closest('form');
			$form.find("input[type='text'], input[type='password']").each(function(){
				var $campoTexto = $(this);
				if( !$campoTexto.hasClass("enterDesativado") ){
					$campoTexto.bind("keydown.desativaEnter", function(e){
						if(e.which == 13){
							e.preventDefault();
							return false;
						}
					}).addClass("enterDesativado");
				}
			})
		}
	});
}

function destravaForm(){
	$("input, button").filter("[type='submit']").each(function(){
		var $botaoSubmit = $(this);
		
		// Destravar botão submit
		$botaoSubmit.removeAttr("disabled").removeClass("processando");
		
		// Travar submissão do formulário ao teclar Enter em um dos
		// campos de texto do formulário associado ao botão submit
		var $form = $botaoSubmit.closest('form');
		$form.find("input[type='text'], input[type='password']").each(function(){
			var $campoTexto = $(this);
			if( $campoTexto.hasClass("enterDesativado") ){
				$campoTexto.unbind("keydown.desativaEnter").removeClass("enterDesativado");
			}
		});
	})
}

function validaForm(elemento, tem_modal, tem_aviso){
	var status = true, mensagem, alvo, posicao;
	var $elemento = $(elemento);
	var dispositivo = getDispositivo();
	var posicao = (dispositivo == 'xs') ? ('t') : ('r');
	var ajax = ($elemento.is('[data-ajax]') && $elemento.attr('data-ajax') == 'true');
	if(typeof tem_modal === 'undefined') tem_modal = true;
	if(typeof tem_aviso === 'undefined') tem_aviso = true;
	var array_avisos = [];
	var inserirAviso = function(a, m, t, p){
		array_avisos.push({
			'alvo': a,
			'mensagem': m,
			'tempo': t,
			'posicao': p
		});
	}
	var mostrarAvisos = function(){
		for(var i in array_avisos){
			var a = array_avisos[i];
			aviso(a.alvo, a.mensagem, a.tempo, a.posicao);
		}
	}
	$elemento.find("input, textarea, select").not(":disabled, [type='hidden']").each(function(){
		var $campo = $(this);
		var alvo = (dispositivo == 'xs') ? ($campo.closest('div.form-group').children('label.control-label')) : ($campo);
		var checkCampoObrigatorio = ((($campo.is('[required]')) || ($campo.is('[data-required]'))) && (!$campo.is("[data-desativar-validacao='true']")) );
		if(checkCampoObrigatorio){
			if( !$campo.is('[id]') ) $campo.attr('id', gerarIdAleatorio(this));
			
			if((window.tinyMCE) && ($campo.is("textarea.editor"))){
				// Textarea com tinyMCE
				var editorContent = (tinyMCE.get( $campo.attr("id") ).getContent()).replace(/[(&nbsp;)(<p>)(</p>)(\n)(\r)( )]/g, "");
				if (editorContent == ''){
					mensagem = "Este campo é requerido.";
					if(tem_aviso) inserirAviso(alvo, mensagem, 8, posicao);
					status = false;
				}
			} else if($campo.attr('name') == "quantidade"){
				// Campo de texto com nome "quantidade"
				var campoVazio = ( ($.trim($campo.val())).replace(/ /g, '') == '');
				var campoZerado = ( ($.trim($campo.val())).replace(/ /g, '') == '0');
				if (campoVazio || campoZerado) {
					if(campoZerado){
						mensagem = "O valor deste campo tem que ser superior a 0.";
					} else {
						mensagem = "Este campo é requerido.";
					}
					if(tem_aviso) inserirAviso(alvo, mensagem, 8, posicao);
					if(status) $campo.focus();
					status = false;
				}
			} else if($campo.is('select.select')){
				// Campo Select instanciado com o componente Select2
				var campoVazio = (($.trim($campo.val())).replace(/ /g, '') == '');
				if(campoVazio){
					alvo = $campo.next();
					mensagem = "Este campo é requerido.";
					if(tem_aviso) inserirAviso(alvo, mensagem, 8, posicao);
					if(status) $campo.focus();
					status = false;
				}
			} else if (($.trim($campo.val())).replace(/ /g, '') == '') {
				mensagem = "Este campo é requerido.";
				if(tem_aviso) inserirAviso(alvo, mensagem, 8, posicao);
				if(status) $campo.focus();
				status = false;
			}
		}
	})
	if(status){
		if (tem_modal) jLoadingWheel(true, false);
		if(ajax){
			// Submeter formulário via Ajax
			submeteFormAjax(elemento);
			return false;
		} else {
			// Submeter formulário normalmente
			return true;
		}
	} else {
		if (tem_modal){
			jInfo('Por favor, preencha os campos obrigatórios!', '', function(){
				if(tem_aviso) mostrarAvisos();
			});
		} else {
			if(tem_aviso) mostrarAvisos();
		}
		setTimeout(destravaForm, 25);
		return false;
	}
}

function submeteFormAjax(form){
	var $form = $(form);
	var acao = ($form.is('[action]')) ? ( $form.attr('action') ) : (location.pathname.split('/').pop());
	var metodo = ($form.is('[method]')) ? ( ( $form.attr('method') ).toLowerCase() ) : ('get');
	var parametros;
	$form.append(
		$("<input />", {"type": "hidden", "name": "ajax", "value": "true"})
	);
	if(metodo == 'post'){
		parametros = $form.serialize();
	} else {
		acao += '?' + $form.serialize();
		parametros = 'ajax=true';
	}
	chamarPagina(acao, parametros, function(r){
		ocultaCarregando();
		// Callback de sucesso
		var resposta = interpretarJSON(r);
		if(getTamanhoObjeto(resposta) > 0){
			var tipo_modal = resposta.tipo_modal;
			var msg_modal = resposta.msg_modal;
			
			if(tipo_modal == 'informacao' || tipo_modal == ''){
				jModalRemove();
				if(typeof tabela != 'undefined') tabela.atualizar();
				jInfo(msg_modal, '', function(){
					var form_callback = $form.attr('data-ajax-callback');
					if(form_callback != ''){
						new Function('return ' + form_callback)();
					}
				});
			} else if(tipo_modal == 'aviso'){
				jAlert(msg_modal);
			} else if(tipo_modal == 'erro'){
				if(typeof msg_modal == 'string' && msg_modal.startsWith('Sessão expirada')){
					modal.sessaoExpirada();
				} else {
					jError(msg_modal);
				}
			} else {
				jError('Dados da requisição inválidos.<br />Tente novamente após alguns instantes.');
			}
		} else {
			jError('Dados da requisição inválidos.<br />Tente novamente após alguns instantes.');
		}
		
		setTimeout(destravaForm, 25);
	}, function(){
		// Callback de erro
		ocultaCarregando();
		jError('Não foi possível obter resposta do servidor.<br />Tente novamente após alguns instantes.');
		setTimeout(destravaForm, 25);
	});
}

function confirma(pagina, parametros, mensagem, ajax, callback_sucesso, callback_erro){
	if(!mensagem) mensagem = 'Deseja realizar esta operação?';
	ajax = (typeof ajax != 'undefined' && ajax == 'true');
	jConfirm(mensagem, 'Confirmação', function(valor) {
        if (valor){
			if(ajax){
				mostraCarregando();
				chamarPagina(pagina, parametros, function(r){
					// Callback de sucesso
					ocultaCarregando();
					if(callback_sucesso) callback_sucesso(r);
				}, function(){
					// Callback de erro
					ocultaCarregando();
					if(callback_erro) callback_erro();
				});
			} else {
				abrirPagina(pagina, parametros);
			}			
        }
    });
}

function apagaRegistro(pagina, id, mensagem, ajax){
	if(!mensagem) mensagem = 'Deseja excluir a opção selecionada?';
	ajax = (typeof ajax != 'undefined' && ajax == true);
	jConfirm(mensagem, 'Confirmação', function(valor) {
        if (valor){
			var parametros = 'id='+id+'&acao=excluir';
			if(ajax){
				parametros += '&ajax=true';
				mostraCarregando();
				chamarPagina(pagina, parametros, function(r){
					// Callback de sucesso
					var resposta = interpretarJSON(r);
					ocultaCarregando(false, false);
					if(getTamanhoObjeto(resposta) > 0){
						var tipo_modal = resposta.tipo_modal;
						var msg_modal = resposta.msg_modal;
						var pagina = function(){
							location.href = resposta.pagina;
						};

						if(tipo_modal == 'informacao' || tipo_modal == ''){
							// Atualizar tabela após remoção do registro
							tabela.atualizar();
							// Remover linha da tabela
							//tabela.removerLinhaById(id);
							
							// Mostrar aviso em janela modal
							jInfo(msg_modal, '');
						} else if(tipo_modal == 'aviso'){
							jAlert(msg_modal);
						} else if(tipo_modal == 'erro'){
							if(typeof msg_modal == 'string' && msg_modal.startsWith('Sessão expirada')){
								modal.sessaoExpirada();
							} else {
								jError(msg_modal);
							}
						} else {
							jError('Dados da requisição inválidos.<br />Tente novamente após alguns instantes.');
						}
					} else {
						jError('Dados da requisição inválidos.<br />Tente novamente após alguns instantes.');
					}
				}, function(){
					// Callback de erro
					ocultaCarregando(false, false);
					jError('Não foi possível obter resposta do servidor.<br />Tente novamente após alguns instantes.');
				});
			} else {
				abrirPagina(pagina, parametros);
			}			
        }
    });
}

function marcaDesmarcaCheck(formulario, campo){
	$("#"+formulario).find("input:checkbox").not('#check').each(function(i){		
		var $check = $(this);
		var ativo = true;
		if(($check.is("[readonly]")) || ($check.is("[disabled]")) || ($check.is("[data-readonly]") && $check.attr('data-readonly') == 'true')){
			ativo = false;
		}
		if(ativo){
			if($("#"+campo).is(":checked")){
				$check.prop("checked", true);
			} else {
				$check.prop("checked", false);
			}
		}
	})
}

function validaData (e) {
  	var divisor = '/';
	var data = e.value;
	if(e.value != ""){
		x = data.split(divisor);
		confere = new Date (x[2],x[1]-1,x[0]);
		confere2 = (confere.getDate () < 10 ? '0' : '') + confere.getDate ();
		confere2 += divisor + ((confere.getMonth()+1) < 10 ? '0' : '') + (confere.getMonth()+1);
		confere2 += divisor + confere.getFullYear();
		if (confere2 != data){
			e.value = '';
            jError('Data inválida! \nPor favor, digite novamente!', '', function(){
				e.focus();
			});
			return false;
		}
		return true;
	}
}

function comparaDataMaior(data1, data2) {
	/* Retorna true se a data 1 for maior que a data 2 */
	var array_data_1 = data1.split('/');
	var data_1 = new Date(array_data_1[2], array_data_1[1], array_data_1[0]);
	var array_data_2 = data2.split('/');
	var data_2 = new Date(array_data_2[2], array_data_2[1], array_data_2[0]);
	if (data_1 > data_2) {
		return true;
	}
	else {
		return false; 
	}
}
 
function comparaDataMenor(data1, data2) {
	/* Retorna true se a data 1 for menor que a data 2 */
	var array_data_1 = data1.split('/');
	var data_1 = new Date(array_data_1[2], array_data_1[1], array_data_1[0]);
	var array_data_2 = data2.split('/');
	var data_2 = new Date(array_data_2[2], array_data_2[1], array_data_2[0]);
	if (data_1 < data_2) {
		return true;
	}
	else {
		return false; 
	}
}

function validaDataInicioFim(e, e_ini, msg) {
    if (typeof msg == 'undefined' || msg == '') {
        msg = 'A data de fim não pode ser menor que a data de início!'
    }
    var el = document.getElementById(e_ini);
    var divisor = '/';
    var dataFim = e.value;
    if (dataFim != "") {
        dataIni = el.value;
        x = dataFim.split(divisor);
        confere = new Date(x[2], x[1] - 1, x[0]);
        confere2 = (confere.getDate() < 10 ? '0' : '') + confere.getDate();
        confere2 += divisor + ((confere.getMonth() + 1) < 10 ? '0' : '') + (confere.getMonth() + 1);
        confere2 += divisor + confere.getFullYear();
        if (confere2 != dataFim) {
            e.value = '';
            jAlert("Data inválida! \nPor favor, digite novamente!", "Aviso!", function() {
                e.focus();
            });
        } else if(dataIni != '' && (parseInt(dataIni.split("/")[2].toString() + dataIni.split("/")[1].toString() + dataIni.split("/")[0].toString()) > parseInt(dataFim.split("/")[2].toString() + dataFim.split("/")[1].toString() + dataFim.split("/")[0].toString()))) {
            e.value = '';
            jAlert(msg + " \nPor favor, digite novamente!", "Aviso!", function() {
                e.focus();
            });
        }
    }
}

function validaDataFimInicio(e, e_ini, msg) {
    if (typeof msg == 'undefined' || msg == '') {
        msg = 'A data de início não pode ser maior que a data de fim!'
    }
    var el = document.getElementById(e_ini);
    var divisor = '/';
    var dataFim = e.value;
    if (dataFim != "") {
        dataIni = el.value;
        x = dataFim.split(divisor);              
        confere = new Date(x[2], x[1] - 1, x[0]);
        confere2 = (confere.getDate() < 10 ? '0' : '') + confere.getDate();
        confere2 += divisor + ((confere.getMonth() + 1) < 10 ? '0' : '') + (confere.getMonth() + 1);
        confere2 += divisor + confere.getFullYear();
        if (confere2 != dataFim) {
            e.value = '';
            jAlert("Data inválida! \nPor favor, digite novamente!", "Aviso!", function() {
                e.focus();
            });
        } else if (dataIni != '' && (parseInt(dataIni.split("/")[2].toString() + dataIni.split("/")[1].toString() + dataIni.split("/")[0].toString()) < parseInt(dataFim.split("/")[2].toString() + dataFim.split("/")[1].toString() + dataFim.split("/")[0].toString()))) {
            e.value = '';
            jAlert(msg + " \nPor favor, digite novamente!", "Aviso!", function() {
                e.focus();
            });
        }
    }
}

function validaFormatoData(e) {
  	var divisor = '/';
	var data = e.value;
	if(data != ""){
		x = data.split(divisor);
		confere = new Date (x[2],x[1]-1,x[0]);
		confere2 = (confere.getDate () < 10 ? '0' : '') + confere.getDate ();
		confere2 += divisor + ((confere.getMonth()+1) < 10 ? '0' : '') + (confere.getMonth()+1);
		confere2 += divisor + confere.getFullYear();
		if (confere2 != data){
			e.value = '';
			aviso(e, "Data inválida!<br/>Por favor, digite novamente!", 5000, 't');
			return false;
		}
		return true;
	}
	return true;
}

function validaHora(variavel){
	var divisor = ':';
	var hora = variavel.value;
	if (variavel.value != ""){
		if (hora.length == 5){
			if(hora.charAt(2) == ':'){
				x = hora.split(divisor);
				if(parseInt(x[0], 10) > 24){
					jError("Hora inválida! \nPor favor, digite novamente!", '', function(){
						variavel.focus();
					});
					variavel.value = "";
					return false;
				}else if(parseInt(x[1], 10) > 60){
					jError("Hora inválida! \nPor favor, digite novamente!", '', function(){
						variavel.focus();
					});
					variavel.value = "";
					return false;
				}else{
					return true;
				}
			}else{
				jError("Formato da hora inválido! Deve obedecer ao padrão \"HH:MM\"", '', function(){
					variavel.focus();
				});
				variavel.value = "";
				return false;
			}
		}else{
			jError("Hora inválida! Deve possuir 4 dígitos! \nPor favor, digite novamente!", '', function(){
				variavel.focus();
			});
			variavel.value = "";
			return false;
		}
	}else{
		return true;
	}
}

function instanciarComponentes(campo, escopo){
	campoMultiplo.instanciar(campo, escopo);
	select.instanciar(campo, escopo);
	tabela.instanciar(campo, escopo);
	calendario.instanciar(campo, escopo);
	fileUploader.instanciar(campo, escopo);
	spinner.instanciar(campo, escopo);
	colorpicker.instanciar(campo, escopo);
	aba.instanciar(campo, escopo);
}

function criaObjetoDeURI(uri) {
	var obj;
	try{
		obj = $.parseJSON('{"' + decodeURI(uri.replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}');
	}catch(e){
		obj = {};
	}
	return obj;
}

function abrirPagina(pagina, dados, target){
	var metodo;
	if(typeof dados === 'undefined' || (typeof dados === 'string' && $.trim(dados) == '')){
		metodo = 'get';
	} else {
		metodo = 'post';
	}
	if(typeof target === 'undefined' || $.trim(target) == '') target = '_self';
	if(metodo == 'get'){
		if(target == '_self'){
			location.href = pagina;
		} else {
			window.open(pagina, target);
		}
	} else {
		var form = $('<form />', {"method": metodo, "action": pagina, "target": target}).css("opacity", "0").appendTo("body");
		
		if(typeof dados === 'string'){
			dados = criaObjetoDeURI(dados);
		}

		$.each(dados, function(k, v){
			form.append(
				$("<input />", {"type": "hidden", "name": k, "value": v})
			)
		})
		form.submit();
	}
}

function obterJanelaIframe(iframe) {
	return (iframe.contentWindow) ? iframe.contentWindow : (iframe.contentDocument.document) ? iframe.contentDocument.document : iframe.contentDocument;
}

function validaLogin(form) {
	var $form = $(form);
	var $campo_login = $form.find("[name='login']");
	var $campo_senha = $form.find("[name='senha']");
	var login = $campo_login.val();
	var senha = $campo_senha.val();
	
	mostraCarregando(true, false);
	chamarPagina('login.php', 'login=' + login + '&senha=' + senha + '&ajax=true', function(r){
		var resposta = (r == 'true');
		
		if(resposta){
			form.submit();
		} else {
			ocultaCarregando();
			jAlert('Usuário e/ou senha incorreta!', '', function(){
				$campo_login.trigger('focus');
			});
		}
	});
    return false;
}

function validaURL(campo){
    var url = campo;
    var retorno = true;
    if (url.value == "")
        return false;
    if (url.value.substr(0, 7) != "http://")
        url.value = "http://" + url.value;
    var padrao = "^[A-Za-z]+://[A-Za-z0-9-_]+\\.[A-Za-z0-9-_%&\?\/.=]+$"
    var tempURL = url.value;
    var matchURL = tempURL.match(padrao);
    if (matchURL == null) {
        url.value = "";
        jError("URL inválida!<br />Por favor, digite-a novamente!", "Erro!", function() {
            url.focus();
        });
        retorno = false;
    }
    return retorno;
}

function decodeData(data){
	var data_split = data.split('/');
	return new Date(parseInt(data_split[2], 10), parseInt(data_split[1], 10) - 1, parseInt(data_split[0], 10));
}

// Se for ambiente de desenvolvimento ou homologação, exibir consultas salvas na sessão
// Útil para depuração
function obterConsultasSessao(callback){
	if((typeof ambiente != 'undefined') && (ambiente == 'D' || ambiente == 'H')){
		chamarPagina('../common/obterConsultasSessao.php', '', function(r){
			if(callback) callback(r);
		})
	}
}

function mostrarConsultasSessao(){
	obterConsultasSessao(function(r){
		jAlert(r);
	})
}

function dec2hex(d) {
    var s = "00" + Number(d).toString(16);
    return s.substring(s.length - 2);
}

function instanciarContaGotas(id_input_file, id_canvas, callback){
	var $inputFile = $('#' + id_input_file);
	var $canvas = $('#' + id_canvas);
	var $imagemThumbnail = $inputFile.closest('div.fileuploader').find('img.thumbnail').first();
	
	var contexto = $canvas[0].getContext('2d');
	var imagem = new Image;
	imagem.onload = function() {
		var largura = imagem.width;
		var altura = imagem.height;
		
		$canvas.attr({
			'width': largura,
			'height': altura
		}).show();
		contexto.drawImage(imagem, 0, 0, largura, altura);
		
		pixel = function(e) {
			// Encontrando a posição do elemento
			var x = 0;
			var y = 0;
			var o = $canvas[0];
			do {
				x += o.offsetLeft;
				y += o.offsetTop;
			} while (o = o.offsetParent);

			x = e.pageX - x - 10; // largura da borda
			y = e.pageY - y - 10; // largura da borda
			var imagesdata = contexto.getImageData( x, y, 1, 1 );
			var vermelho = imagesdata.data[0];
			var verde = imagesdata.data[1];
			var azul = imagesdata.data[2];
			var canal_alfa = imagesdata.data[3];
			
			var new_color = [ vermelho, verde, azul ];
			$canvas[0].style.borderColor = "rgb("+new_color+")";
			
			if(callback) callback(vermelho, verde, azul, canal_alfa);
		}
		
		$canvas.on({
			'mousedown.contagotas': function(){
				$canvas[0].onmousemove = pixel; // fire pixel() while user is dragging
				$canvas[0].onclick = pixel; // only so it will still fire if user doesn't drag at all
			},
			'mouseup.contagotas': function(){
				$canvas[0].onmousemove = null;
			}
		})
	}
	imagem.src = $imagemThumbnail.attr('src');
}

function atualizarCorChaveCRUDFontes(vermelho, verde, azul, canal_alfa){
	var $campoCorChave = $('#cor_chave');
	if(canal_alfa == 255){
		var cor = '#' + dec2hex(vermelho) + dec2hex(verde) + dec2hex(azul);
		colorpicker.setarValor($campoCorChave, cor);
	} else {
		colorpicker.setarValor($campoCorChave, '');
	}
}

function toggleCamposCoresCRUDFontes(exibir){
	exibir = ((typeof exibir != 'undefined') && (exibir == true));
	var $campoCorChave = $('#cor_chave');
	var $divsCamposCores = $('div.campos_cores');
	if(exibir){
		$divsCamposCores.show();
	} else {
		$divsCamposCores.hide();
		colorpicker.setarValor($campoCorChave, '');
	}
}