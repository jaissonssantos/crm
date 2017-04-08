angular.module('app').controller('relatorioStatusServicoController', ['$rootScope', '$scope', '$routeParams', 'relatorioService', 'servicoService',
function($rootScope, $scope, $routeParams, relatorioService, servicoService) {

	$scope.agendamentos = $scope.agendamento = {};
	$scope.results = {};

	servicoService.getList();

	$scope.$on("servicos", function(event, servicos){
		$scope.servicos = servicos.results;
	});

	$rootScope.$on('agendamentos:message:success', function(event, message) {
		$rootScope.success = message;
	});

	$scope.$on("agendamentos", function(event, agendamentos){
		$scope.agendamentos = agendamentos;
	});

	$scope.$on("agendamentos:loading", function(event, status){
		$scope.results.loading = status;
	});

	$scope.search = function(){
		relatorioService.set($scope.agendamento);
		relatorioService.getList();
	};

	$scope.setToday = function(){
		$scope.agendamento.inicio = new Date();	
		$scope.agendamento.fim = new Date();	
	};

	$scope.setMonthCurrent = function(){
		var date = new Date();
		$scope.agendamento.inicio = new Date(date.getFullYear(), date.getMonth(), 1);
		$scope.agendamento.fim = new Date(date.getFullYear(), date.getMonth() + 1, 0);
	};

	$scope.setMonthLast = function(){
		var date = new Date();
		$scope.agendamento.inicio = new Date(date.getFullYear(), date.getMonth() - 1, 1);
		$scope.agendamento.fim = new Date(date.getFullYear(), date.getMonth(), 0);
	};

	$scope.setLast30Days = function(){
		$scope.agendamento.inicio = new Date(new Date().setDate(new Date().getDate() - 30));
		$scope.agendamento.fim = new Date();
	};

}]);
