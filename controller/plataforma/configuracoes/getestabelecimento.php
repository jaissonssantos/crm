<?php
use Utils\Conexao;

$oConexao = Conexao::getInstance();
$response = new stdClass();

//get session local browser
$idestabelecimento = $_SESSION['ang_plataforma_estabelecimento'];

if (!isset($idestabelecimento)) {
    throw new Exception('Ops! faça o login novamente para executar a operação', 400);
}

try {
    $stmt = $oConexao->prepare(
        'SELECT
			nomefantasia,sobre,telefonecomercial,imagem
		FROM estabelecimento
		WHERE id = :idestabelecimento'
    );
    $stmt->bindValue('idestabelecimento', $idestabelecimento);
    $stmt->execute();
    $estabelecimento = $stmt->fetchObject();
    $estabelecimento->imagem = STORAGE_URL . '/estabelecimento/' . $estabelecimento->imagem;

    if (!$estabelecimento) {
        throw new Exception('Não encontrado', 404);
    }

    http_response_code(200);
    $response = $estabelecimento;
} catch (PDOException $e) {
    http_response_code(500);
    $response->error = 'Desculpa. Tivemos um problema, tente novamente mais tarde';
} catch (Exception $e) {
    http_response_code($e->getCode());
    $response->error = $e->getMessage();
}

echo json_encode($response);
