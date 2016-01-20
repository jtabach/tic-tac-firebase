'use strict';

var timestamp = Date.now();
var newGame = true;
var ref = new Firebase('https://tic-tac-firebase.firebaseio.com/');
var amOnline = ref.child('.info/connected');
var usersRef = ref.child('users');
var playersRef = ref.child('players');
var locations = ref.child('locations');

var selfRef = usersRef.child(timestamp);
var currentPlayerRef = ref.child('currentPlayer');
var players, currentPlayer;

var $playerState, $theButton, $currentPlayer;

$(document).ready(function() {
  $currentPlayer = $("#currentPlayer")
  $theButton = $('.addSym');
  $playerState = $('#playerState');
  $theButton.click(clickButton);
});

function clickButton() {
  newGame = false;
  var obj = {};
  var nextPlayer = currentPlayer === 1 ? 0 : 1;
  currentPlayerRef.set(nextPlayer);
  var id = $(this).attr('id');
  if (nextPlayer === 0) {
  	obj[id] = "O"
  	locations.update(obj);
  } else {
  	obj[id] = "X"
  	locations.update(obj);
  }
}

function checkPlayer(){
  if(players[currentPlayer] == timestamp.toString()){
    $theButton.prop('disabled', false);
  } else {
    $theButton.prop('disabled', true);
  }
  
}

if (newGame) {
	locations.set({
		s1: "",
		s2: "",
		s3: "",
		s4: "",
		s5: "",
		s6: "",
		s7: "",
		s8: "",
		s9: "",
	});
}

locations.on('value', function(snap) {
	var obj = snap.val();
	for (var key in obj) {
		$("#"+key).text(obj[key]);
	}
	$.each($theButton, function(i, val) {
	  	if ($(val).text() !== "") {
			$(val).prop('disabled', true);
		}
	});
	checkWin('X');
	checkWin('O');
});

function checkWin(sym) {
	var winningCombos = [['s1','s2','s3'],['s4','s5','s6'],['s7','s8','s9'],
		['s1','s4','s7'],['s2','s5','s8'],['s3','s6','s9'],['s1','s5','s9'],
		['s3','s5','s7']];
	var winner = false;
	winningCombos.forEach(function (combo) {
		var counter = 0;
		combo.forEach(function(loc) {
			locations.child(loc).once('value', function(snap) {
				if (snap.val() === sym) {
					counter++;
				}
			});
			if (counter === 3) {
				return alert(sym + " wins");
			}
		}); 
	});
}

playersRef.on('value', function(snap) {
	players = snap.val();
	$playerState.text('');
	snap.forEach(function(playerSnap) {
	    if(playerSnap.val() === timestamp.toString()) {
			$playerState.text("You're Player " + playerSnap.key());
		}
	});
	checkPlayer();
});

currentPlayerRef.on('value', function(snap) {
  $currentPlayer.text(snap.val());
  currentPlayer = snap.val();
  checkPlayer();
});

usersRef.on('value', function(snap) {
  var users = 0;
  snap.forEach(function(userSnap) {
    if(users < 2) {
      playersRef.child(users).set(userSnap.key());
    }
    users++;
  });
});

amOnline.on('value', function(snap) {
  if (snap.val()) {
    selfRef.onDisconnect().remove();
    selfRef.set(true);
  }
});