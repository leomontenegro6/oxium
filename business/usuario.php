<?php
class usuario extends abstractBusiness {
	
	public function getAll(){
		return $this->getByParameter("ORDER BY login");
	}
	
	public function getTotalByListagem($login){
		$login = str_replace(' ', '%', $login);
		$login = trim($login);
		
		return $this->getTotal("WHERE login LIKE :login", array('login'=>"%$login%"));
	}
	
	public function getByListagem($login, $ordenacao='login', $filtragem='ASC', $limit=15, $offset=0){
		$login = str_replace(' ', '%', $login);
		$login = trim($login);
		
		$parametros = array('login'=>"%$login%");
		return $this->getFieldsByParameter("login, nome, id", "WHERE login LIKE :login ORDER BY $ordenacao $filtragem LIMIT $limit OFFSET $offset", $parametros);
	}
	
	public function getLogin($login, $senha){
		$senha_sha1 = sha1($senha);
		
		$usuario_rs = $this->getByParameter("WHERE login = :login AND senha = :senha LIMIT 1", array('login'=>$login, 'senha'=>$senha_sha1));
		if(count($usuario_rs) > 0){
			return $usuario_rs[0];
		} else {
			return array();
		}
	}
	
	public function update($post, $id, $commit=true){
		if(isset($post['senha'])){
			$post['senha'] = sha1($post['senha']); // senha inicial padrão
		}
		
		return parent::update($post, $id, $commit);
	}
	
    public function resetarSenha($id, $commit=true){
        $senha = sha1('123456'); // senha inicial padrão
        
        $post_editar = array('senha'=>$senha);
        
        return parent::update($post_editar, $id, $commit);
    }
	
}