(function(){
	var app = angular.module('gallery',[]);

	app.controller('ContainerController', function(){
		this.tab = 0;		
		
		this.selectTab = function(setTab){
			this.tab = setTab;
		}
		
		this.isSelected = function(checkTab){
			return this.tab == checkTab;
		}
	});
	
	app.controller('ItemController',['$http','$scope', '$q', function($http, $scope, $q){	    	
		this.items = [];	
		$scope.init = function(){
			var ctrl = this;
			ctrl.items = [];
			$http.get('databases/packages.json').success(function(data) {
				ctrl.items = data;
			});
		};

		$scope.init();
			
		this.getItems = function(category){
		    var ctrl = this;
			ctrl.items = [];
			var canceler = $q.defer();
			$http.get('databases/packages.json', {timeout : canceler.promise}).success(function(data) {
				if (category == 'All'){
					ctrl.items = data;
				}
				else{
					for(var index = 0; index < data.length; index++){
						var item = data[index];
						if(item.category == category){
							ctrl.items.push(item);						
						}
					}
				}								
			});	
			canceler.resolve();
		};
		
		this.getItem = function(name){
			var ctrl = this;
			ctrl.items = [];
			$http.get('databases/packages.json').success(function(data){
				for(var index = 0; index < data.length; index++){
					var item = data[index];
					if(item.name == name){
						ctrl.items.push(item);
					}
				}
			});
		}		
	}]);
	angular.bootstrap(document,['gallery']);
})();