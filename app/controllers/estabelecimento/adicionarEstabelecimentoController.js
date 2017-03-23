
angular.module('app').controller('adicionarEstabelecimentoController', 
['$location','$rootScope', '$scope', 'estabelecimentoService', 'estadocidadeService', 'cepService', 'formaPagamentoService', 'segmentoService',
function($location, $scope, $rootScope, estabelecimentoService, estadocidadeService, cepService, formaPagamentoService, segmentoService){

	$scope.estabelecimento = $scope.email = $scope.cnpjcpf = $scope.formaspagamento = {};

	$rootScope.$on('segmentos', function(event, segmentos) {
		$scope.segmentos = segmentos;
		if(!segmentos[0]) return
		$scope.estabelecimento.idsegmento = segmentos[0].id;
	});

	$rootScope.$on('estabelecimento:save', function(event, status) {
    $scope.status = {
      loading: (status == 'loading'),
      success: (status == 'success'),
      error: (status == 'error')
    };
		if($scope.status.success){
			document.location = '/plataforma/dashboard';
		}
  });

	$rootScope.$on('estabelecimento:cnpjcpf', function(event, status) {
    $scope.cnpjcpf = {
      found: (status == "found"),
      notfound: (status == "notfound"),
			loading: (status === "loading")
    };
  });

	$rootScope.$on('estabelecimento:email', function(event, status) {
    $scope.email = {
      found: (status == "found"),
      notfound: (status == "notfound"),
			loading: (status === "loading")
    };
  });

	$rootScope.$on('endereco:cep', function(event, status) {
    $scope.endereco = {
      loading: (status == 'loading'),
      loaded: (status == 'loaded'),
      error: (status == 'error')
    };
  });

	$rootScope.$on('segmentos', function(event, segmentos) {
    $scope.segmentos = segmentos;
		$scope.estabelecimento.idsegmento = segmentos[0].id;
  });

	$rootScope.$on('planos', function(event, planos) {
    $scope.planos = planos;
		$scope.estabelecimento.idplano = planos[0].id;
  });

	$rootScope.$on('estados', function(event, estados) {
    $scope.estados = estados;
		$scope.estabelecimento.idestado = estados[0].idestado;
		estadocidadeService.loadCidades(estados[0].idestado);
  });

	$rootScope.$on('cidades', function(event, cidades) {
    $scope.cidades = cidades;
		$scope.estabelecimento.idcidade = cidades[0].idcidade;
  });

	$rootScope.$on('formaspagamento', function(event, formaspagamento) {
    $scope.formaspagamento = formaspagamento;
  });

	$rootScope.$on('endereco', function(event, endereco) {
		$scope.estabelecimento.bairro = endereco.bairro;
    $scope.estabelecimento.logradouro = endereco.logradouro;
  });

	$scope.save = function(){
		estabelecimentoService.set($scope.estabelecimento);
		estabelecimentoService.save();
	};

	$scope.searchCep = function() {
    cepService.searchCep($scope.estabelecimento.cep);
  };

	$scope.loadSegmentos = function(){
		segmentoService.getList();
	};

	$scope.loadPlanos = function(){
		estabelecimentoService.loadPlanos();
	};

	$scope.loadCidades = function(){
		if(!$scope.estabelecimento.idestado){
			return
		}
		estadocidadeService.loadCidades($scope.estabelecimento.idestado);
	};

	$scope.loadEstados = function(){
		estadocidadeService.loadEstados();
	};

	$scope.loadFormasPagamento = function() {
		formaPagamentoService.getList();
	};

	$scope.checkCnpjcpf = function() {
		estabelecimentoService.checkCnpjcpf($scope.estabelecimento.cnpjcpf);
	};

	$scope.checkEmail = function() {
		estabelecimentoService.checkEmail($scope.estabelecimento.email);
	};

}]);
