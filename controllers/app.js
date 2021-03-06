(function(){
	var app = angular.module('gallery',['ui.bootstrap']);

	app.directive('bar2', function($timeout){
		return{
			restrict : 'A',
			link : function(scope, element, attr){
				$(element).mosaic({
					animation:'slide' //fade or slide
				});
			}
		}
	});

	app.filter('startFrom', function() {
	    return function(input, start) {
	        start = +start; //parse to int
	        return input.slice(start);
	    }
	});

	app.controller('ContainerController', ['$scope', '$http', '$window', function($scope, $http, $window){
		this.tab = 0;	
		$scope.resultInstall = "";
		$scope.itemInstalled = "";
		$scope.itemModified = "";	
		$scope.currentPage = 0;
			$scope.pageSize = 15;
			$scope.numberOfPages=function(){
	        return Math.ceil($scope.items.length/$scope.pageSize);                
	    }
		
		this.selectTab = function(setTab){
			if(this.tab !== setTab)
				this.tab = setTab;
			$window.scrollTo(0,0);

		}
		
		this.isSelected = function(checkTab){
			return this.tab == checkTab;
		}

		this.getInstall = function(name, category){
			$scope.resultInstall = "";
			$scope.itemInstalled = name;

			$http.get('/gallery/product/install?name=' + name + '&category=' + category).
			success(function(data, status, headers, config){
				$scope.resultInstall = data.Reason;
			}).
			error(function(data){
				$scope.resultInstall = "Installation échouée";
				$scope.itemInstalled = name;
			});
		};

		this.isAppExist = function(app){
			var res = false;
			angular.forEach($scope.items, function(key, value){
				angular.forEach(key.application, function(appKey, appValue){
					if((appKey === app)&&(key.category === $scope.category))
						res = true;
				});
			});
			return res;
		};

		this.setItemModification = function(itemName){
			this.selectTab(4);
			angular.forEach(items, function(item, key){
				if(item.name = itemName)
					$scope.itemModified = item;
			});
		};
	}]);
	
	app.controller('ItemController',['$scope', '$http', function($scope, $http){	
		$scope.category = '';  
		$scope.application = '';
		$scope.name = '';
		$scope.items = [];
		$scope.slides = [];
		$scope.myInterval = 5000;

		this.init = function(){
			$http.get('/gallery/getPackageJSON').success(function(data){
			// $.get('/getPackageJSON', function(data){	
				$scope.items = data;
				angular.forEach(data, function(value,key){
					angular.forEach(value.captures, function(captures, keyCap){
						$scope.slides.push({
							image : "https://gallerie.blob.core.windows.net/images/"+ captures.capture,
							itemName : value.name
						});
					});						
				});
			});
		};

		this.init();
			
		this.setCategory = function(category){
			$scope.application = '';
			if(category == 'All'){
				$scope.category = '';
			}
			else
				$scope.category = category;
		};

		this.setApp = function(app){
			$scope.application = app;
		}

		this.setItem = function(name){
			$scope.name = name;
		};

		this.hideItem = function(item){
			var res = true;

			if (($scope.category == '') || (($scope.category != '') && (item.category == $scope.category))){
				if(($scope.application != '') && ($scope.category == item.category) && (($scope.category == 'Dashboards') || ($scope.category == 'Activities'))){
					if((item.category == $scope.category) && ($scope.application != '')){
						angular.forEach(item.application, function(key, value){
							if (key == $scope.application){
								res = false;
							}								
						});
					}
				}
				else
					res = false;
			}
			return res;
		};
	}]);
	angular.bootstrap(document,['gallery']);
})();