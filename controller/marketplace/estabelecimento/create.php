<?php

use Utils\Conexao;

header('Content-type: application/json');
$oConexao = Conexao::getInstance();
$estabelecimento = json_decode(file_get_contents('php://input'));
$response = new stdClass();
setlocale(LC_ALL, 'pt_BR.UTF8');

try {
    if (!isset(
        $estabelecimento->nomefantasia,
        $estabelecimento->idsegmento,
        $estabelecimento->email, 
        $estabelecimento->telefonecomercial,
        $estabelecimento->cep,
        $estabelecimento->logradouro,
        $estabelecimento->numero,
        //$estabelecimento->complemento,
        $estabelecimento->bairro,
        $estabelecimento->idestado,
        $estabelecimento->idcidade
    )) {
        throw new Exception('Verifique os dados preenchidos', 400);
    }
    if(!isset($estabelecimento->complemento)){
     $estabelecimento->complemento = null;
    }

    // Gerar url (hash) do estabelecimento
    $estabelecimento->hash = friendlyURL($estabelecimento->nomefantasia);
    $loops = 0;
    $findHash = true;

    $oConexao->beginTransaction();

    $stmt = $oConexao->prepare('SELECT hash FROM estabelecimento WHERE hash = ? LIMIT 1');
    while($findHash){
        $stmt->execute(array($estabelecimento->hash));
        $findHash = $stmt->fetchObject();
        if($findHash) $estabelecimento->hash = $estabelecimento->hash . '-'. $loops . rand(0,9999);
        if($loops > 20) {
            throw new Exception('Tente usar um nome fantasia diferente', 500);
        }
        $loops++;
    }

    $stmt = $oConexao->prepare('INSERT INTO
                 estabelecimento(hash,nomefantasia,idsegmento,email,telefonecomercial,cep,logradouro,
                 numero,complemento,bairro,idestado,idcidade,datacadastro
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,now())');
    $stmt->execute(array(
        $estabelecimento->hash,
        $estabelecimento->nomefantasia,
        $estabelecimento->idsegmento,
        $estabelecimento->email, 
        $estabelecimento->telefonecomercial,
        $estabelecimento->cep,
        $estabelecimento->logradouro,
        $estabelecimento->numero,
        $estabelecimento->complemento,
        $estabelecimento->bairro,
        $estabelecimento->idestado,
        $estabelecimento->idcidade
    ));    

    $estabelecimento->senha = sha1(SALT.$estabelecimento->senha);
    $estabelecimento->perfil = 1;
    $estabelecimento->master = 1;
    $estabelecimento_id = $oConexao->lastInsertId();

    // Cadastro do usuário
    $stmt = $oConexao->prepare('INSERT INTO
                 usuario(nome,login,email,senha,perfil,master,idestabelecimento
                ) VALUES (?,?,?,?,?,?,?)');
    $stmt->execute(array(
        $estabelecimento->nomeAdmin,
        $estabelecimento->email,
        $estabelecimento->email, 
        $estabelecimento->senha,
        $estabelecimento->perfil,
        $estabelecimento->master,
        $estabelecimento_id
    ));

    $usuario_id = $oConexao->lastInsertId();

    // Permissões do Usuário Gestor
    $stmt = $oConexao->prepare(
    'INSERT INTO usuario_permissao(
            idusuario,roles
        ) VALUES (
            :idusuario,:roles
        )');
    $usuario_permissao = array('idusuario' => $usuario_id);
    $roles = array(
        '/dashboard', '/agenda', '/clientes', '/servicos', '/profissionais',
        '/usuarios', '/site', '/configuracoes', '/relatorio', '/pagamento-do-plano', '/404',
    );
    foreach ($roles as $role) {
        $usuario_permissao['roles'] = $role;
        $stmt->execute($usuario_permissao);
    }

    $_SESSION['ang_plataforma_uid'] = $usuario_id;
    $_SESSION['ang_plataforma_nome'] = $estabelecimento->nomeAdmin;
    $_SESSION['ang_plataforma_login'] = $estabelecimento->email;
    $_SESSION['ang_plataforma_email'] = $estabelecimento->email;
    $_SESSION['ang_plataforma_estabelecimento'] = $estabelecimento_id;
    $_SESSION['ang_plataforma_perfil'] = $estabelecimento->perfil;
    $_SESSION['ang_plataforma_plano'] = 0;

    $oConexao->commit();

    http_response_code(200);
    $response->success = 'Cadastrado sucesso';
} catch (PDOException $e) {
    http_response_code(500);
    $response->error = 'Desculpa. Tivemos um problema, tente novamente mais tarde';
    //$response->error = $e->getMessage();
} catch (Exception $e) {
    http_response_code($e->getCode());
    $response->error = $e->getMessage();
}

echo json_encode($response);
