/* Plugin modal de avisos
 * 
 * Baseado no componente "Popover", do Bootstrap, porém mantendo a mesma sintaxe
 * de uso da função "aviso", em outros sistemas.
 * 
 * Formas de Uso:
 *	aviso( id_elemento, texto, [ tempo, posicao, estilo, fecharComClick, mostraBarraAviso, callback ] )
 */

function aviso(id_elemento, texto, tempo, posicao, estilo, fecharComClick, mostraBarraAviso, callback) {
	if(typeof id_elemento == 'object'){
		var id;
		if (!gE($(id_elemento).attr('id'))) {
			id = gerarIdAleatorio(id_elemento);
			$(id_elemento).attr('id', id);
		} else{
			id = $(id_elemento).attr('id');
		}
		id_elemento = id;
	}
	var $elemento_alvo = $('#' + id_elemento);
	
	if ( $elemento_alvo.length == 0 || $elemento_alvo.is(":hidden") ){
		// Se elemento não existir, ou estiver oculto na página, exibir texto em uma janela modal, ao invés do aviso
		jAlert(texto, 'Aviso');
		return false;
	} else {
		if(typeof tempo == 'undefined' || parseInt(tempo) == 'NaN') tempo = 0;
		if(typeof posicao == 'undefined') posicao = 'r';
		if(typeof estilo == 'undefined') estilo = '';
		if(typeof fecharComClick == 'undefined') fecharComClick = true;
		if(typeof mostraBarraAviso == 'undefined') mostraBarraAviso = false;
		
		// Definindo posição do aviso
		if(posicao == 't'){ // Cima
			posicao = 'top';
		} else if(posicao == 'l'){ // Esquerda
			posicao = 'left';
		} else if(posicao == 'b'){ // Baixo
			posicao = 'bottom';
		} else { // Direita
			posicao = 'right';
		}
		
		// Definindo template HTML padrão do aviso
		var $template = $("<div />").addClass('popover aviso ' + estilo).attr('role', 'tooltip').append(
			$('<div />').addClass('arrow')
		).append(
			$('<h3 />').addClass('popover-title')
		).append(
			$('<div />').addClass('popover-content')
		);
		
		// Retirar atributo "title" do elemento-alvo, se existir
		var titulo_elemento;
		if($elemento_alvo.is('[title]') && ($.trim( $elemento_alvo.attr('title') ) != '')){
			titulo_elemento = $elemento_alvo.attr('title');
			$elemento_alvo.attr('data-old-title', titulo_elemento).removeAttr('title');
		} else {
			titulo_elemento = '';
		}
		
		// Exibir barra no aviso, se for o caso
		var titulo_aviso;
		if(mostraBarraAviso){
			titulo_aviso = '&nbsp;';
		} else {
			titulo_aviso = '';
		}
		
		// Instanciando aviso através do componente do Bootstrap "Popover"
		$elemento_alvo.popover({
			'html': true,
			'placement': 'auto ' + posicao,
			'template': $template,
			'container': 'body',
			'title': titulo_aviso,
			'content': texto,
			'delay': 200,
			'trigger': 'manual'	
		})
		
		// Redefinir posição ao redimensionar a janela do navegador
		var permitirCallback = true;
		$(window).unbind('resize.reajusta_aviso_' + id_elemento).bind('resize.reajusta_aviso_' + id_elemento, function() {
			permitirCallback = false;
			$elemento_alvo.popover('show');
		});
		
		// Definindo eventos do aviso
		$elemento_alvo.on({
			// Chamado após o aviso ser exibido
			'shown.bs.popover': function(){
				if(callback && permitirCallback) callback();
			},
			// Chamado após o aviso ser ocultado
			'hidden.bs.popover': function(){
				// Removendo evento de reajuste da janela do navegador
				$(window).unbind('resize.reajusta_aviso_' + id_elemento);
				
				// Removendo tags HTML do aviso, inclusas pelo componente
				$elemento_alvo.popover('destroy').removeAttr('data-original-title');
				
				// Repondo atributo "title" do elemento-alvo, se tiver sido removido antes do balão ser exibido
				if(titulo_elemento != ''){
					$elemento_alvo.removeAttr('data-old-title').attr('title', titulo_elemento);
				}
			}
		});
		
		// Exibindo aviso programaticamente
		$elemento_alvo.popover('show');
		
		// Mudando cores do aviso, em função da classe passada na variável "estilo"
		// A mudança é feita inserindo dinamicamente algumas regras CSS na página,
		// através de tags <style>
		var cores = {
			'fundo': $template.css('backgroundColor'),
			'borda': $template.css('borderColor')
		};
		if( $('#css_' + estilo).length == 0 ){
			var style_borda = '<style id="css_'+estilo+'" type="text/css">';
			if(estilo != '') estilo = '.' + estilo;
			if(posicao == 'left'){
				style_borda += ".popover" + estilo + ".left>.arrow{ border-left-color: " + cores.borda + "; } .popover" + estilo + ".left>.arrow:after{ border-left-color: " + cores.fundo + ";}";
			} else if(posicao == 'right'){
				style_borda += ".popover" + estilo + ".right>.arrow{ border-right-color: " + cores.borda + "; } .popover" + estilo + ".right>.arrow:after{ border-right-color: " + cores.fundo + ";}";
			} else if(posicao == 'top'){
				style_borda += ".popover" + estilo + ".top>.arrow{ border-top-color: " + cores.borda + "; } .popover" + estilo + ".top>.arrow:after{ border-top-color: " + cores.fundo + ";}";
			} else if(posicao == 'bottom'){
				style_borda += ".popover" + estilo + ".bottom>.arrow{ border-bottom-color: " + cores.borda + "; } .popover" + estilo + ".bottom>.arrow:after{ border-bottom-color: " + cores.fundo + ";}";
			}
			style_borda += '</style>';
			$('head').append(style_borda);
		}
		
		// Ocultar aviso quando clicado (se a variável "fecharComClick" for true)
		if(fecharComClick){
			$template.click(function(){
				$elemento_alvo.popover('hide');
			});
		}
		
		// Ocultar aviso após o tempo especificado (se a variável "tempo" for maior que 0)
		if(tempo > 0){
			setTimeout(function(){
				$elemento_alvo.popover('hide');
			}, tempo * 1000);
		}
		
		// Retornar elemento ao qual o aviso foi exibido
		return $elemento_alvo;
	}
}

function avisoFechaAoClicarFora(id_elemento, texto, tempo, posicao, estilo, fecharComClick, mostraBarraAviso, callback) {
	// Chamar evento normalmente
	var $elemento_alvo = aviso(id_elemento, texto, tempo, posicao, estilo, fecharComClick, mostraBarraAviso, callback);
	
	// Verificar se o elemento existe e está visível na página
	if ( $elemento_alvo.length == 0 || $elemento_alvo.is(":hidden") ){
		// Setar evento na página, de modo a fechar o aviso ao clicar fora de sua área
		var id_elemento = $elemento_alvo.attr('id');
		$('html').bind('click.fecha_aviso_' + id_elemento, function(e){
			if (typeof $(e.target).data('original-title') == 'undefined' && !$(e.target).parents().is('.popover.in')) {
				$(window).unbind('click.fecha_aviso_' + id_elemento);
				$elemento_alvo.popover('hide');
			}
		});
	}
	return $elemento_alvo;
}

function removerAviso(id_elemento, callback){
	if(typeof id_elemento == 'object'){
		var id;
		if (!gE($(id_elemento).attr('id'))) {
			id = gerarIdAleatorio(id_elemento);
			$(id_elemento).attr('id', id);
		} else{
			id = $(id_elemento).attr('id');
		}
		id_elemento = id;
	}
	var $elemento_alvo = $('#' + id_elemento);
	$elemento_alvo.on('hidden.bs.popover', function(){
		$(window).unbind('resize.reajusta_aviso_' + id_elemento);
		$elemento_alvo.popover('destroy');
		if(callback) callback();
	}).popover('hide');
}