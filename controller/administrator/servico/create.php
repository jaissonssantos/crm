<?php

use Utils\Conexao;

header('Content-type: application/json');
$oConexao = Conexao::getInstance();
$params = json_decode(file_get_contents('php://input'));
$response = new stdClass();

try {
    $servico = (array) $params;

    $required = array(
        'nome',
        'descricao',
        'valor',
        'promocao',
        'valorpromocao',
        'idservico_categoria',
    );

    $servico = array_intersect_key($servico, array_flip($required));

    if (count($servico) != count($required)) {
        throw new Exception('Verifique os dados preenchidos', 400);
    }

    // Default Parameters
    $servico['status'] = 1;
    $servico['idestabelecimento'] = $_SESSION['ang_plataforma_estabelecimento'];
    $servico['idusuario'] = $_SESSION['ang_plataforma_uid'];
    $servico['hash'] = uniqid();

    // Inserir o servico
    $stmt = $oConexao->prepare(
        'INSERT INTO
			servico(
				nome,descricao,valor,promocao,valorpromocao,idusuario,idservico_categoria,
				idestabelecimento,hash,status,datacadastro
		) VALUES (
			:nome,:descricao,:valor,:promocao,:valorpromocao,:idusuario,:idservico_categoria,
			:idestabelecimento,:hash,:status,now()
		)
		'
    );

    $stmt->execute($servico);

    http_response_code(200);
    $response->success = 'Cadastrado com sucesso';
    $response->id = $oConexao->lastInsertId();
} catch (PDOException $e) {
    //echo $e->getMessage();
    http_response_code(500);
    $response->error = 'Desculpa. Tivemos um problema, tente novamente mais tarde';
} catch (Exception $e) {
    http_response_code($e->getCode());
    $response->error = $e->getMessage();
}

echo json_encode($response);