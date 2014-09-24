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
	
	app.controller('ItemController',['$scope', '$http', function($scope, $http){	  
		this.items = [];	
		this.init = function(){
			$scope.items = [];
			$http.get('/getPackageJSON').success(function(data){
				this.items = data;
			});
		};

		this.init();
			
		this.getItems = function(category){
			var ctrl = this;
			ctrl.items = [];
			$http.get('/getPackageJSON').success(function(data){
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
		};
		
		this.getItem = function(name){
			var ctrl = this;
			ctrl.items = [];
			$http.get('/getPackageJSON').success(function(data){
				for(var index = 0; index < data.length; index++){
					var item = data[index];
					if(item.name == name){
						$scope.items.push(item);
					}
				}
			});	
		};
	}]);
	angular.bootstrap(document,['gallery']);
})();