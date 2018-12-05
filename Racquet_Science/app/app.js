
var myapp = angular.module('myApp',[]);
var url='mongodb://localhost/27017/tennis_atp';
myapp.run(function ($http) {
    // Sends this header with any AJAX request
    $http.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
    // Send this header only in post requests. Specifies you are sending a JSON object
    $http.defaults.headers.post['dataType'] = 'json'
});

myapp.controller('homeController',function($scope,$http){

    $scope.getPlayerList=function(){
        var req = $http.get(url + '/get');
        req.then(function(data, status, headers, config) {
            $scope.playerList = data;
            console.log(data);
        });
        req.catch(function(data, status, headers, config) {
            alert( "failure message: " + JSON.stringify({data: data}));
        });

    };

    $scope.getList=function(){
        var req = $http.get('http://127.0.0.1:8081/list');
        req.then(function(data, status, headers, config) {
            console.log(data);
        });
        req.catch(function(data, status, headers, config) {
            alert( "failure message: " + JSON.stringify({data: data}));
        });
    }

});
function playerSearch() {
    // Declare variables
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById('h2h-search-player-1');
    filter = input.value.toUpperCase();
    ul = document.getElementById("playerUL");
    li = ul.getElementsByTagName('li');

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("a")[0];
        txtValue = a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

