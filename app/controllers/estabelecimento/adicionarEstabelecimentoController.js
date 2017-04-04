
angular.module('app').controller('adicionarEstabelecimentoController', 
['$location','$rootScope', '$scope', 'estabelecimentoService', 'estadocidadeService', 'cepService', 'usuarioService',
function($location, $scope, $rootScope, estabelecimentoService, estadocidadeService, cepService, usuarioService){

	$scope.estabelecimento = $scope.email = $scope.cnpjcpf = {};

	$rootScope.$on('estabelecimento:save', function(event, status) {
    	$scope.status = {
	      loading: (status == 'loading'),
	      success: (status == 'success'),
	      error: (status == 'error')
	    };
		if($scope.status.success){
			// document.location = '/plataforma/dashboard';
			console.log('cadastro efetuado com sucesso.');
		}
  	});

	$rootScope.$on('estabelecimento:cnpjcpf', function(event, status) {
	    $scope.cnpjcpf = {
	      found: (status == "found"),
	      notfound: (status == "notfound"),
				loading: (status === "loading")
	    };
	});

	$rootScope.$on('usuario:email', function(event, status) {
	    $scope.email = {
	      found: (status == "found"),
	      notfound: (status == "notfound"),
				loading: (status === "loading")
	    };
	});

	// $rootScope.$on('endereco:cep', function(event, status) {
	//     $scope.endereco = {
	//       loading: (status == 'loading'),
	//       loaded: (status == 'loaded'),
	//       error: (status == 'error')
	//     };
	// });

	// $rootScope.$on('planos', function(event, planos) {
	//     $scope.planos = planos;
	// 		$scope.estabelecimento.idplano = planos[0].id;
	// });

	$rootScope.$on('estados', function(event, estados) {
    	$scope.estados = estados;
		$scope.estabelecimento.idestado = estados[0].id;
		if($scope.estabelecimento.idestado)
			estadocidadeService.loadCidades($scope.estabelecimento.idestado);
  	});

	$rootScope.$on('cidades', function(event, cidades) {
    	$scope.cidades = cidades;
		$scope.estabelecimento.idcidade = cidades[0].idcidade;
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

	$scope.loadCidades = function(){
		estadocidadeService.loadCidades($scope.estabelecimento.idestado);
	};

	$scope.loadEstados = function(){
		estadocidadeService.loadEstados();
	};

	$scope.checkEmail = function() {
		usuarioService.checkEmail($scope.estabelecimento.usuario.email);
	};

}]);
