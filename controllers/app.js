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
	
	app.controller('ItemController',['$http','$scope', function($http, $scope){	    	
		this.items = [];
		
		$scope.init = function(){
		    var ctrl = this;
			ctrl.items = [];
			$http.get('../databases/index.json').success(function(data) {
				ctrl.items = data;
			});
		};
			
		this.getItems = function(category){
		    var ctrl = this;
			ctrl.items = [];
			$http.get('../databases/index.json').success(function(data) {
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
			$http.get('../databases/index.json').success(function(data){
				for(var index = 0; index < data.length; index++){
					var item = data[index];
					if(item.name == name){
						ctrl.items.push(item);
					}
				}
			});
		}		
	}]);
	
	app.controller('CarouselController',['$http','$scope', function($http, $scope){	    	
		this.items = [];
		
		this.initCarousel = function(){
		    var ctrl = this;
			ctrl.items = [];
			$http.get('../databases/index.json').success(function(data) {
				ctrl.items = data;
			});
		};
	}]);
})();