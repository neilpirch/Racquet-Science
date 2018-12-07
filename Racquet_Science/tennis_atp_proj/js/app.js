/**
 * Created by karthik on 7/14/17.
 */
var urlPlayer = "https://www.atpworldtour.com/en/-/ajax/playersearch/PlayerUrlSearch?searchTerm=";
var urlPicture = "https://ws.protennislive.com/api/Atp/PlayerImage?playerId=";
var myapp = angular.module('app',[]);

var id1 = 0;
var id2 = 0;



myapp.run(function ($http) {
    // Sends this header with any AJAX request
    $http.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
    // Send this header only in post requests. Specifies you are sending a JSON object
    $http.defaults.headers.post['dataType'] = 'json'
});

myapp.controller('homeController',function($scope,$http){

    $scope.playerList = [];
    $scope.playerIds = [];
    $scope.prob1 = 0;
    $scope.prob2 = 0;
    $scope.player1name;
    $scope.player2name;
    $scope.p1;
    $scope.p2;

    $("#probSpinner").removeClass("hide");
    $scope.probText="Loading";

    $("#evalButton").prop("disabled",true);
    $("#searchBar").prop("disabled",true);
    $("#searchBar2").prop("disabled",true);

    $("#searchBar").on('input', function () {
        var val = this.value;
        if($('#players1 option').filter(function(){
            return this.value.toUpperCase() === val.toUpperCase();
        }).length) {
        var value = $('#players1').val();
        //var option = $("[value='" + value + "']");
        $scope.id1 = $('[value="' + val + '"]').data('id');
        $scope.player1name = val;
        $scope.playerSelect(1);
        }else{
            $scope.player1name="";
            $scope.reset1();
        }
    });

    $("#searchBar2").on('input', function () {
        var val = this.value;
        if($('#players2 option').filter(function(){
            return this.value.toUpperCase() === val.toUpperCase();
        }).length) {
            var value = $('#players2').val();
            //var option = $("[value='" + value + "']");
            $scope.id2 = $('[value="' + val + '"]').data('id');
            $scope.player2name = val;
            $scope.playerSelect(2);
        }else{
            $scope.player2name="";
            $scope.reset2();
        }
    });

    $scope.reset1=function(){
        $("#div1").addClass("invisible");
        $("#p1media").addClass("invisible");
        $("#p1spinner").removeClass("hide");
        $("#p1info").addClass("invisible");
        $scope.resetProb()
    };

    $scope.reset2=function(){
        $("#div2").addClass("invisible");
        $("#p2media").addClass("invisible");
        $("#p2spinner").removeClass("hide");
        $("#p2info").addClass("invisible");
        $scope.resetProb()
    };

    $scope.resetProb=function(){
        $("#div1").addClass("invisible");
        $("#div2").addClass("invisible");
        $scope.probText = "Select Players";
        $("#evalButton").prop("disabled",true);
        $scope.prob1 = 0;
        $scope.prob2 = 0;
    }

    $scope.checkButton=function(){
        if($scope.p1 && $scope.p2){
            $scope.probText = "Evaluate";
            $("#evalButton").prop("disabled",false);
        }
    }

    $scope.getData=function(){
        var req = $http.get('http://127.0.0.1:8081/get');
        req.success(function(data, status, headers, config) {
            for(dat in data){
                $scope.playerList.push({"name":data[dat].firstname + " " + data[dat].lastname,"id":data[dat].id});
            } data;
            console.log(data);
            $('#pageLoad').remove();
            $("#evalButton").prop("disabled",false);
            $("#searchBar").prop("disabled",false);
            $("#searchBar2").prop("disabled",false);
            $scope.probText="Select Players";
            $("#probSpinner").addClass("hide");
        });
        req.error(function(data, status, headers, config) {
            //alert( "failure message: " + JSON.stringify({data: data}));
        });
    };

    $scope.search=function(){
        var req = $http.get('http://127.0.0.1:8081/players1/'+$scope.lastname+'/'+$scope.firstname);
        req.success(function(data, status, headers, config) {
            $scope.playerIds=[];
            $scope.playerList=[];
            for(dat in data){
                $scope.playerList.push({"name":data[dat].firstname + " " + data[dat].lastname,"id":data[dat].id});
                //$scope.playerIds.push(data[dat].id);
            } data;
            console.log(data);
            console.log($scope.playerList);
        });
        req.error(function(data, status, headers, config) {
            //alert( "failure message: " + JSON.stringify({data: data}));
        });
    };

    $scope.calculate=function(){

        if($scope.probText != "Evaluate") return;

        $("#evalButton").prop("disabled",true);
        $("#probSpinner").removeClass("hide");
        $scope.probText="Loading";

      var rankDif1 = $scope.p1.rank - $scope.p2.rank;
      var rankDif2 = $scope.p2.rank - $scope.p1.rank;
      var rankptsDif1 = $scope.p1.rankpts - $scope.p2.rankpts;
      var rankptsDif2 = $scope.p2.rankpts - $scope.p1.rankpts;

      var params = JSON.stringify([{"rank":$scope.p1.rank,"rankDif":rankDif1,"age":$scope.p1.age,"rankpts":$scope.p1.rankpts,"rankPtDif":rankptsDif1},
      {"rank":$scope.p2.rank,"rankDif":rankDif2,"age":$scope.p2.age,"rankpts":$scope.p2.rankpts,"rankPtDif":rankptsDif2}]);

      var req = $http.post('http://127.0.0.1:8081/calculate',params);
        req.success(function(data, status, headers, config) {
            $scope.prob1=data[0];
            $scope.prob2=data[1];
            $("#div1").removeClass("invisible");
            $("#div2").removeClass("invisible");
            $("#probSpinner").addClass("hide");
            $scope.probText="Evaluate";
            $("#evalButton").prop("disabled",false);
            start();
            console.log(data);
            console.log($scope.prob1);

        });
    };

    $scope.evaluate=function(){
        if($scope.player1 != "" && $scope.player2 != ""){
            //let id1 = $('#players1').text();
            //let id2 = $('#players2').text();

            var value = $('#searchBar').val();
            //var option = $("[value='" + value + "']");
            $scope.id1 = $('[value="' + value + '"]').attr('data-id');

            var value2 = $('#searchBar2').val();
            //var option = $("[value='" + value + "']");
            $scope.id2 = $('[value="' + value2 + '"]').attr('data-id');

            var req = $http.get('http://127.0.0.1:8081/compare/'+$scope.id1+'/'+$scope.id2);
            req.success(function(data, status, headers, config) {
                $scope.prob1=data[0];
                $scope.prob2=data[1];
                start();
                console.log(data);
                console.log($scope.prob1);

            });
            req.error(function(data, status, headers, config) {
                //alert( "failure message: " + JSON.stringify({data: data}));
            });


        }
    }

    $scope.playerSelect=function(num){
        let q="";
        let pid=0;

        if(num===1){
            q = $scope.player1name;
            pid = $scope.id1;
        }else{
            q = $scope.player2name;
            pid = $scope.id2
        }

        if (q != null && q !== "") { //check if there is input in the field to search

            let handler = $http.get(urlPlayer + q);
            handler.success(function (response) { //if the call was successful

                console.log(response);
                let id = response.items[0].Value;
                id = id.split("/")[4];
                if (num==1){
                    $scope.player1Pic = urlPicture + id;
                    $("#p1media").removeClass("invisible");
                }else{
                    $scope.player2Pic = urlPicture + id;
                    $("#p2media").removeClass("invisible");
                }
            });
            handler.error(function (response) {
                alert("There was some error processing your request.")
            });

            $http.get('http://127.0.0.1:8081/stats/'+pid)
                .success(function(data){
                    if (num===1){
                        $scope.p1 = data;
                        $("#p1spinner").addClass("hide");
                        $("#p1info").removeClass("invisible");
                    }else{
                        $scope.p2 = data;
                        $("#p2spinner").addClass("hide");
                        $("#p2info").removeClass("invisible");
                    }
                    $scope.checkButton()
                });

        }

    }

    $scope.delete = function(id,callback){

        $http.get('http://127.0.0.1:8081/delete/'+id)
            .success(function(data){
                console.log("Successfully deleted");
                $scope.getData();
            });
    };


    $scope.update = function(book,callback){

        $http.get('http://127.0.0.1:8081/update/'+book._id,{params:book})
            .success(function(data){
                console.log("Successfully updated");
                $scope.getData();
            });
    };

    var div1=d3.select(document.getElementById('div1'));
    var div2=d3.select(document.getElementById('div2'));
    var div3=d3.select(document.getElementById('div3'));
    var div4=d3.select(document.getElementById('div4'));

    start();

    function start() {

        var rp1 = radialProgress(document.getElementById('div1'))
            .label("RADIAL 1")
            .diameter(150)
            .value($scope.prob1*100)
            .render();

        var rp2 = radialProgress(document.getElementById('div2'))
            .label("RADIAL 2")
            .diameter(150)
            .value($scope.prob2*100)
            .render();
    }



    function radialProgress(parent) {
        var _data=null,
            _duration= 1000,
            _selection,
            _margin = {top:0, right:0, bottom:30, left:0},
            __width = 150,
            __height = 150,
            _diameter = 150,
            _label="",
            _fontSize=10;


        var _mouseClick;

        var _value= 0,
            _minValue = 0,
            _maxValue = 100;

        var  _currentArc= 0, _currentArc2= 0, _currentValue=0;

        var _arc = d3.svg.arc()
            .startAngle(0 * (Math.PI/180)); //just radians

        var _arc2 = d3.svg.arc()
            .startAngle(0 * (Math.PI/180))
            .endAngle(0); //just radians


        _selection=d3.select(parent);


        function component() {

            _selection.each(function (data) {

                // Select the svg element, if it exists.
                var svg = d3.select(this).selectAll("svg").data([data]);

                var enter = svg.enter().append("svg").attr("class","radial-svg").append("g");

                measure();

                svg.attr("width", __width)
                    .attr("height", __height);

/*
                var background = enter.append("g").attr("class","component")
                    .attr("cursor","pointer")
                    .on("click",onMouseClick);
*/

                _arc.endAngle(360 * (Math.PI/180))
/*
                background.append("rect")
                    .attr("class","background")
                    .attr("width", _width)
                    .attr("height", _height);

                background.append("path")
                    .attr("transform", "translate(" + _width/2 + "," + _width/2 + ")")
                    .attr("d", _arc);

                background.append("text")
                    .attr("class", "label")
                    .attr("transform", "translate(" + _width/2 + "," + (_width + _fontSize) + ")")
                    .text(_label);
  */              var g = svg.select("g")
                    .attr("transform", "translate(" + _margin.left + "," + _margin.top + ")");


                _arc.endAngle(_currentArc);
                enter.append("g").attr("class", "arcs");
                var path = svg.select(".arcs").selectAll(".arc").data(data);
                path.enter().append("path")
                    .attr("class","arc")
                    .attr("transform", "translate(" + _width/2 + "," + _width/2 + ")")
                    .attr("d", _arc);

                //Another path in case we exceed 100%
                var path2 = svg.select(".arcs").selectAll(".arc2").data(data);
                path2.enter().append("path")
                    .attr("class","arc2")
                    .attr("transform", "translate(" + _width/2 + "," + _width/2 + ")")
                    .attr("d", _arc2);


                enter.append("g").attr("class", "labels");
                var label = svg.select(".labels").selectAll(".label").data(data);
                label.enter().append("text")
                    .attr("class","label")
                    .attr("y",_width/2+_fontSize/3)
                    .attr("x",_width/2)
                    .attr("cursor","pointer")
                    .attr("width",_width)
                    // .attr("x",(3*_fontSize/2))
                    .text(function (d) { return Math.round((_value-_minValue)/(_maxValue-_minValue)*100) + "%" })
                    .style("font-size",_fontSize+"px")
                    .on("click",onMouseClick);

                path.exit().transition().duration(500).attr("x",1000).remove();


                layout(svg);

                function layout(svg) {

                    var ratio=(_value-_minValue)/(_maxValue-_minValue);
                    var endAngle=Math.min(360*ratio,360);
                    endAngle=endAngle * Math.PI/180;

                    path.datum(endAngle);
                    path.transition().duration(_duration)
                        .attrTween("d", arcTween);

                    if (ratio > 1) {
                        path2.datum(Math.min(360*(ratio-1),360) * Math.PI/180);
                        path2.transition().delay(_duration).duration(_duration)
                            .attrTween("d", arcTween2);
                    }

                    label.datum(Math.round(ratio*100));
                    label.transition().duration(_duration)
                        .tween("text",labelTween);

                }

            });

            function onMouseClick(d) {
                if (typeof _mouseClick == "function") {
                    _mouseClick.call();
                }
            }
        }

        function labelTween(a) {
            var i = d3.interpolate(_currentValue, a);
            _currentValue = i(0);

            return function(t) {
                _currentValue = i(t);
                this.textContent = Math.round(i(t)) + "%";
            }
        }

        function arcTween(a) {
            var i = d3.interpolate(_currentArc, a);

            return function(t) {
                _currentArc=i(t);
                return _arc.endAngle(i(t))();
            };
        }

        function arcTween2(a) {
            var i = d3.interpolate(_currentArc2, a);

            return function(t) {
                return _arc2.endAngle(i(t))();
            };
        }


        function measure() {
            _width=_diameter - _margin.right - _margin.left - _margin.top - _margin.bottom;
            _height=_width;
            _fontSize=_width*.2;
            _arc.outerRadius(_width/2);
            _arc.innerRadius(_width/2 * .85);
            _arc2.outerRadius(_width/2 * .85);
            _arc2.innerRadius(_width/2 * .85 - (_width/2 * .15));
        }


        component.render = function() {
            measure();
            component();
            return component;
        }

        component.value = function (_) {
            if (!arguments.length) return _value;
            _value = [_];
            _selection.datum([_value]);
            return component;
        }


        component.margin = function(_) {
            if (!arguments.length) return _margin;
            _margin = _;
            return component;
        };

        component.diameter = function(_) {
            if (!arguments.length) return _diameter
            _diameter =  _;
            return component;
        };

        component.minValue = function(_) {
            if (!arguments.length) return _minValue;
            _minValue = _;
            return component;
        };

        component.maxValue = function(_) {
            if (!arguments.length) return _maxValue;
            _maxValue = _;
            return component;
        };

        component.label = function(_) {
            if (!arguments.length) return _label;
            _label = _;
            return component;
        };

        component._duration = function(_) {
            if (!arguments.length) return _duration;
            _duration = _;
            return component;
        };

        component.onClick = function (_) {
            if (!arguments.length) return _mouseClick;
            _mouseClick=_;
            return component;
        }

        return component;

    }

});

