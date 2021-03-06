var kredApp = angular.module('snlApp', []);
kredApp.run(function($rootScope) {
    $rootScope.settings = { 'playerCount': 1 };
    $rootScope.computerPlay = false;
    $rootScope.players = [];
    //statistics of players
    $rootScope.stats = [];
    $rootScope.showMulti = false;
    //configurations of ladders
    $rootScope.ladders = [{
        "start": 1,
        "end": 38
    }, {
        "start": 4,
        "end": 14
    }, {
        "start": 9,
        "end": 31
    }, {
        "start": 21,
        "end": 42
    }, {
        "start": 28,
        "end": 84
    }, {
        "start": 51,
        "end": 67
    }, {
        "start": 72,
        "end": 91
    }, {
        "start": 80,
        "end": 99
    }];

    //configuration of snakes
    $rootScope.snakes = [{
        "start": 17,
        "end": 7
    }, {
        "start": 54,
        "end": 34
    }, {
        "start": 62,
        "end": 19
    }, {
        "start": 64,
        "end": 60
    }, {
        "start": 87,
        "end": 36
    }, {
        "start": 93,
        "end": 73
    }, {
        "start": 95,
        "end": 75
    }, {
        "start": 99,
        "end": 79
    }];

    $rootScope.board = {};
    $rootScope.activeSquare = {};
    $rootScope.currentPlayer = 0;
    $rootScope.gameOver = false;
    $rootScope.showBoard = false;
    $rootScope.isLoading = false;
    $rootScope.isLoadingText = '';
    $rootScope.winner = -1;
});

kredApp.controller('GameCtrl', function($scope, $rootScope) {

    $scope.initializeGame = function() {
        for (i = 0; i < $rootScope.settings.playerCount; ++i) {
            $rootScope.players[i] = {
                'currentPos': -1,
                'isAuto': false
            };
        }
        if ($rootScope.settings.playerCount === 1) {
            $rootScope.players[1] = {
                'currentPos': -1,
                'isAuto': true
            };
        }
    }

    $scope.setSettings = function(count) {
        if (count == 1) {
            $rootScope.computerPlay = true;
        }
        if (count >= 1) {
            $rootScope.settings.playerCount = count;
            $scope.initializeGame();
            $rootScope.showBoard = true;

            var statObject = {};
            for (var i = 0; i < count; i++) {
                statObject = {
                    "throws": 0,
                    "sixes": 0,
                    "ladders": 0,
                    "snakes": 0,
                    "bestThrow": 0
                };

                $rootScope.stats.push(statObject);
            }
        } else {
            alert("Invalid choice.");
            return;
        }
    }
});

kredApp.controller('BoardCtrl', function($scope, $timeout, $rootScope) {
    var board = [],
        i = 0,
        ladders, snakes;
    $scope.minHopsArray = new Array(101),
        $scope.bestThrowArray = new Array(101);
    $scope.diceValues = [-1];
    $scope.currentPlayerRoll = -1;

    for (i = 0; i < 100; ++i) {
        if (Math.floor(i / 10) % 2 == 0) {
            board[i] = {
                "start": i,
                "end": i,
                "isEven": true,
                "class": '',
                "activeClass": ''
            };
        } else {
            board[i] = {
                "start": i,
                "end": i,
                "isEven": false,
                "class": '',
                "activeClass": ''
            };
        }
    }

    for (i = 0; i < $rootScope.ladders.length; ++i) {
        board[($rootScope.ladders[i].start - 1)].end = $rootScope.ladders[i].end - 1;
    }
    for (i = 0; i < $rootScope.snakes.length; ++i) {
        board[($rootScope.snakes[i].start - 1)].end = $rootScope.snakes[i].end - 1;
    }
    $rootScope.board = board;
    $scope.board = board.reverse();

    for (i = 0; i < 100; ++i) {
        if (board[i].isEven) {
            board[i].class = board[i].class + 'fright ';
        }
        if (board[i].start > board[i].end) {
            board[i].class = board[i].class + 'snake ';
        }
        if (board[i].start < board[i].end) {
            board[i].class = board[i].class + 'ladder ';
        }
    }

    $scope.rollDice = function() {
        var currentPosition = $rootScope.players[$rootScope.currentPlayer].currentPos + 1;
        var infinity = 99999;

        //calculating dynamic statistics before dice roll
        if (!$rootScope.computerPlay) {
            if ($scope.currentPlayerRoll === 1) {
                $rootScope.stats[$rootScope.currentPlayer].bestThrow = $scope.bestThrowArray[currentPosition];
            } else if ($scope.currentPlayerRoll == -1) {
                var maxAllowed = 18;
                if ($scope.minHopsArray[currentPosition + 6] === infinity) {
                    maxAllowed = 6;
                } else if ($scope.minHopsArray[currentPosition + 12] === infinity) {
                    maxAllowed = 12;
                }

                var min = $scope.minHopsArray[currentPosition + 1];
                var goTo = currentPosition + 1;
                for (var i = currentPosition + 1; i < currentPosition + maxAllowed; i++) {
                    if ($scope.minHopsArray[i] < min) {
                        min = $scope.minHopsArray[i];
                        goTo = currentPosition + i;
                    }
                }
                $rootScope.stats[$rootScope.currentPlayer].bestThrow = $scope.getThrowFromSum(goTo);

            } else if ($scope.currentPlayerRoll == 0) {
                var maxAllowed = 18;
                if ($scope.minHopsArray[currentPosition + 6] === infinity) {
                    maxAllowed = 6;
                }

                var min = $scope.minHopsArray[currentPosition + 1];
                var goTo = currentPosition + 1;
                for (var i = currentPosition + 1; i < currentPosition + maxAllowed; i++) {
                    if ($scope.minHopsArray[i] < min) {
                        min = $scope.minHopsArray[i];
                        goTo = currentPosition + i;
                    }
                }

                $rootScope.stats[$rootScope.currentPlayer].bestThrow = $scope.getThrowFromSum(goTo);

            }
        }

        //rolling the dice - tweaking for best throw
        //$scope.diceValues[0] = $rootScope.stats[$rootScope.currentPlayer].bestThrow;

        //rolling the dice - random 
        $scope.diceValues[0] = Math.floor(Math.random() * 6) + 1;

        $rootScope.isLoadingText = $scope.diceValues[0];
        //updating throws
        ($rootScope.stats[$scope.currentPlayer].throws) ++;
        var sixCount = 0;
        if ($scope.diceValues[0] === 6) {
            //person gets to roll again
            $scope.currentPlayerRoll++;
            ($rootScope.stats[$scope.currentPlayer].sixes) ++;
        } else {
            $scope.currentPlayerRoll = -1;
        }

    }

    $scope.changeCurrentPlayer = function() {
        $rootScope.isLoading = false;
        if ($scope.currentPlayerRoll === 2 || $scope.currentPlayerRoll === -1) {
            $scope.currentPlayerRoll = -1;

            if ($rootScope.currentPlayer !== $rootScope.players.length - 1) {
                $rootScope.currentPlayer++;
            } else {
                $rootScope.currentPlayer = 0;
            }

            if ($rootScope.players[$rootScope.currentPlayer].isAuto) {
                $scope.startGame();
            }

            //color of the button on the basis of current player
            var colors = ["purple", "red", "green", "blue"];
            $(".round-button-circle").css({ "background": colors[$scope.currentPlayer] });

        }
    }
    $scope.makeMove = function(player) {
        $scope.isLoading = true;
        $rootScope.isLoadingText = "Player" + ($rootScope.currentPlayer + 1) + "'s turn";
        if ($scope.diceValues[0] == -1) {
            return;
        }
        var previousPos = $rootScope.players[player].currentPos;
        var newPos = $rootScope.players[player].currentPos + $scope.diceValues[0];
        var ladderSnake = null;
        if (newPos <= 99) {
            $rootScope.players[player].currentPos = newPos;
            $rootScope.activeSquare = $rootScope.board[100 - $rootScope.players[player].currentPos - 1];

            if ($rootScope.activeSquare.start != $rootScope.activeSquare.end) {
                if ($rootScope.activeSquare.start < $rootScope.activeSquare.end) {
                    ladderSnake = { "start": $rootScope.activeSquare.start, "end": $rootScope.activeSquare.end };
                    $rootScope.isLoadingText = "Player" + ($rootScope.currentPlayer + 1) + " climbs a ladder";
                    
                    //alert("Player" + ($rootScope.currentPlayer + 1) + " climbs a ladder");
                    //updating ladders
                    ($rootScope.stats[$scope.currentPlayer].ladders) ++;
                }
                if ($rootScope.activeSquare.start > $rootScope.activeSquare.end) {
                    ladderSnake = { "start": $rootScope.activeSquare.start, "end": $rootScope.activeSquare.end };
                    $rootScope.isLoadingText = "Player" + ($rootScope.currentPlayer + 1) + " hits a snake";
                    //alert("Player" + ($rootScope.currentPlayer + 1) + " hits a snake");
                    
                    //updating snakes
                    ($rootScope.stats[$scope.currentPlayer].snakes) ++;
                }
                $rootScope.players[player].currentPos = $rootScope.activeSquare.end;
                $rootScope.activeSquare = $rootScope.board[$rootScope.players[player].currentPos];
                
            }
            $rootScope.isLoadingText = "Player " + ($rootScope.currentPlayer + 1) + "'s new position is " + ($rootScope.players[player].currentPos + 1);

            if (newPos === 99) {
                $rootScope.winner = $rootScope.currentPlayer + 1;
                $rootScope.gameOver = true;
                $rootScope.isLoadingText = "Player " + ($rootScope.winner) + "wins";

                $rootScope.viewStats = true;
                console.log($rootScope.stats);
            }

            //animating the peg
            var curPos = $rootScope.players[player].currentPos;
            for (var j = previousPos; j <= curPos; j++) {
                if (ladderSnake !== null) {
                    for (var k = 100; k >= 0; k--) {
                        if ($($(".snl-board li")[k]).text() == (ladderSnake.end + 1) && $($(".snl-board li")[k]).attr("data-start") == (ladderSnake.end + 1)) {
                            var left = $($(".snl-board li")[k]).offset().left;
                            var top = $($(".snl-board li")[k]).offset().top;

                            var playerPos = ".player" + player;

                            $($(playerPos).find("img")).stop().animate({ "left": left + 5 + "px" }, "fast");
                            $($(playerPos).find("img")).animate({ "top": top + 10 + "px" }, "fast");

                            break;
                        }
                    }
                } else {
                    for (var i = 100; i >= 0; i--) {
                        if ($($(".snl-board li")[i]).text() == (j + 1) && $($(".snl-board li")[i]).attr("data-start") == (j + 1)) {

                            var left = $($(".snl-board li")[i]).offset().left;
                            var top = $($(".snl-board li")[i]).offset().top;

                            var playerPos = ".player" + player;

                            $($(playerPos).find("img")).stop().animate({ "left": left + 5 + "px" }, "fast");
                            $($(playerPos).find("img")).animate({ "top": top + 10 + "px" }, "fast");

                            break;
                        }
                    }
                }

            }

            ladderSnake = null;

        } else {
            $rootScope.isLoadingText = "Player" + ($rootScope.currentPlayer + 1) + " cannot move";
        }

        $scope.diceValues = [-1];
        $scope.gameOver = $rootScope.gameOver;

    }
    $scope.startGame = function() {
        $rootScope.isLoading = true;
        $rootScope.isLoadingText = 'Rolling Dice..';
        $timeout(function() { $scope.rollDice(); }, 1000);

        $timeout(function() { $scope.makeMove($rootScope.currentPlayer); }, 2000);

        if (!$rootScope.gameOver) { $timeout(function() { $scope.changeCurrentPlayer(); }, 3000); }
    }

    $scope.sortableUI = function() {
        $(".column").sortable({
            connectWith: ".column",
            handle: ".portlet-header",
            cancel: ".portlet-toggle",
            start: function(event, ui) {
                ui.item.addClass('tilt');
            },
            stop: function(event, ui) {
                ui.item.removeClass('tilt');
            }
        });

        $(".portlet")
            .addClass("ui-widget ui-widget-content ui-helper-clearfix ui-corner-all")
            .find(".portlet-header")
            .addClass("ui-widget-header ui-corner-all")
            .prepend("<span class='ui-icon ui-icon-minusthick portlet-toggle'></span>");

        $(".portlet-toggle").click(function() {
            var icon = $(this);
            icon.toggleClass("ui-icon-minusthick ui-icon-plusthick");
            icon.closest(".portlet").find(".portlet-content").toggle();
        });
    }

    $scope.getThrowFromSum = function(num) {
        if (num > 6) {
            return 6;
        }
    }

    $scope.computeBestThrows = function() {
        var infinity = 99999;

        $scope.minHopsArray[100] = 0;


        angular.forEach($rootScope.snakes, function(value, key) {
            $scope.minHopsArray[value.start] = infinity;
        });

        for (var i = 99; i >= 1; i--) {

            if ($scope.minHopsArray[i] == infinity) {
                continue;
            }
            minHops = infinity;

            angular.forEach($rootScope.ladders, function(value, key) {
                if (value.start == i) {
                    $scope.minHopsArray[i] = $scope.minHopsArray[value.end];
                    $scope.bestThrowArray[i] = 0;
                }
            });

            if ($scope.bestThrowArray[i] == 0) {
                continue;
            }

            for (var k = 1; k <= 6 && i + k <= 100; k++) {
                if (minHops > $scope.minHopsArray[i + k]) {
                    minHops = $scope.minHopsArray[i + k];
                    $scope.bestThrowArray[i] = k;
                }
            }

            $scope.minHopsArray[i] = minHops + 1;
        }

    }

    $scope.computeBestThrows();

});
