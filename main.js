'use strict';

// var ref = new Firebase('https://tic-tac-firebase.firebaseio.com/');


// var userid = Math.floor(Math.random() * 10000);
// var amOnline = new Firebase('https://tic-tac-firebase.firebaseio.com/.info/connected');
// var userRef = new Firebase('https://tic-tac-firebase.firebaseio.com/presence/' + userid);
// var players = ref.child('players');
// amOnline.on('value', function(snapshot) {
//   if (snapshot.val()) {
//     userRef.onDisconnect().remove();
//     userRef.set(true);
//     ref.once("value", function(snap){
//     	var numPlayers = snap.child("presence").numChildren();
//       setSymbols(numPlayers);
//     })
//     console.log('off');
//   }
// });


// $(document).ready(function() {

// });

// function setSymbols(numPlayers) {
// 	if (numPlayers == 2) {
// 		players.update({'O': userid})
// 	} else {
// 		players.update({'X': userid})
// 	}
// }

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
	var $val = $(val);
	for (var key in obj) {
		$("#"+key).text(obj[key]);
	}
	$.each($theButton, function(i, val) {
	  	if ($val.text() !== "") {
			$val.prop('disabled', true);
		}
	});
});

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