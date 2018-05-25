var debugmode = false;
var states = Object.freeze({
    SplashScreen: 0,
    GameScreen: 1,
    ScoreScreen: 2
});
var currentstate;
var gravity = 0.25;
var velocity = 0;
var position = 180;
var rotation = 0;
var jump = -4.6;
var score = 0;
var highscore = 0;
var canoheight = 90;
var canowidth = 52;
var canos = new Array();
var replayclickable = false;
var volume = 30;
var soundJump = new buzz.sound("assets/sounds/sfx_wing.ogg");
var soundScore = new buzz.sound("assets/sounds/sfx_point.ogg");
var soundHit = new buzz.sound("assets/sounds/sfx_hit.ogg");
var soundDie = new buzz.sound("assets/sounds/sfx_die.ogg");
var soundSwoosh = new buzz.sound("assets/sounds/sfx_swooshing.ogg");
buzz.all().setVolume(volume);
var loopGameloop;
var loopcanoloop;



$(document).ready(function() {
    if (window.location.search == "?debug")
        debugmode = true;
    if (window.location.search == "?easy")
        canoheight = 200;
    var savedscore = getCookie("highscore");
    if (savedscore != "")
        highscore = parseInt(savedscore);
    showSplash();
});

//BOTAO PARA BAIXAR APK
$("#btnDownload").click(function() {

})

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function showSplash() {
    currentstate = states.SplashScreen;

    velocity = 0;
    position = 180;
    rotation = 0;
    score = 0;

    $("#player").css({ y: 0, x: 0 });
    updatePlayer($("#player"));

    soundSwoosh.stop();
    soundSwoosh.play();

    $(".cano").remove();
    canos = new Array();

    $(".animated").css('animation-play-state', 'running');
    $(".animated").css('-webkit-animation-play-state', 'running');

    $("#splash").transition({ opacity: 1 }, 2000, 'ease');
}

function startGame() {
    currentstate = states.GameScreen;

    $("#splash").stop();
    $("#splash").transition({ opacity: 0 }, 500, 'ease');

    setBigScore();

    if (debugmode) {
        $(".boundingbox").show();
    }

    var updaterate = 1000.0 / 60.0; // 60 fps
    loopGameloop = setInterval(gameloop, updaterate);
    loopcanoloop = setInterval(updatecanos, 1400);
    playerJump();
}

function updatePlayer(player) {
    rotation = 0;

    $(player).css({ rotate: rotation, top: position });
}

function gameloop() {

    var player = $("#player");

    velocity += gravity;
    position += velocity;

    updatePlayer(player);

    var box = document.getElementById('player').getBoundingClientRect();
    var origwidth = 34.0;
    var origheight = 24.0;

    var boxwidth = origwidth - (Math.sin(Math.abs(rotation) / 90) * 8);
    var boxheight = (origheight + box.height) / 2;
    var boxleft = ((box.width - boxwidth) / 2) + box.left;
    var boxtop = ((box.height - boxheight) / 2) + box.top;
    var boxright = boxleft + boxwidth;
    var boxbottom = boxtop + boxheight;

    if (box.bottom >= $("#footer-game").offset().top) {
        playerDead();
        return;
    }

    var ceiling = $("#ceiling");
    if (boxtop <= (ceiling.offset().top + ceiling.height()))
        position = 0;

    if (canos[0] == null)
        return;

    var nextcano = canos[0];
    var nextcanoupper = nextcano.children(".cano_upper");

    var canotop = nextcanoupper.offset().top + nextcanoupper.height();
    var canoleft = nextcanoupper.offset().left - 2;
    var canoright = canoleft + canowidth;
    var canobottom = canotop + canoheight;

    if (boxright > canoleft) {
        if (boxtop > canotop && boxbottom < canobottom) {} else {
            playerDead();
            return;
        }
    }

    if (boxleft > canoright) {
        canos.splice(0, 1);
        playerScore();
    }
}

$(document).keydown(function(e) {
    if (e.keyCode == 32) {
        if (currentstate == states.ScoreScreen)
            $("#replay").click();
        else
            screenClick();
    }
});
if ("ontouchstart" in window)
    $(document).on("touchstart", screenClick);
else
    $(document).on("mousedown", screenClick);

function screenClick() {
    if (currentstate == states.GameScreen) {
        playerJump();
    } else if (currentstate == states.SplashScreen) {
        startGame();
    }
}

function playerJump() {
    velocity = jump;
    soundJump.stop();
    soundJump.play();
}

function setBigScore(erase) {
    var elemscore = $("#bigscore");
    elemscore.empty();

    if (erase)
        return;

    var digits = score.toString().split('');
    for (var i = 0; i < digits.length; i++)
        elemscore.append("<img src='assets/font_big_" + digits[i] + ".png' alt='" + digits[i] + "'>");
}

function setSmallScore() {
    var elemscore = $("#currentscore");
    elemscore.empty();

    var digits = score.toString().split('');
    for (var i = 0; i < digits.length; i++)
        elemscore.append("<img src='assets/font_small_" + digits[i] + ".png' alt='" + digits[i] + "'>");
}

function setHighScore() {
    var elemscore = $("#highscore");
    elemscore.empty();

    var digits = highscore.toString().split('');
    for (var i = 0; i < digits.length; i++)
        elemscore.append("<img src='assets/font_small_" + digits[i] + ".png' alt='" + digits[i] + "'>");
}

function setMedal() {
    var elemmedal = $("#medal");
    elemmedal.empty();
    if (score < 10)
        return false;

    if (score >= 10)
        medal = "bronze";
    if (score >= 20)
        medal = "silver";
    if (score >= 30)
        medal = "gold";
    if (score >= 40)
        medal = "platinum";

    elemmedal.append('<img src="assets/medal_' + medal + '.png" alt="' + medal + '">');

    return true;
}

function playerDead() {
    $(".animated").css('animation-play-state', 'paused');
    $(".animated").css('-webkit-animation-play-state', 'paused');

    var playerbottom = $("#player").position().top + $("#player").width();
    var floor = $("#flyarea-game").height();
    var movey = Math.max(0, floor - playerbottom);
    $("#player").transition({ y: movey + 'px', rotate: 90 }, 1000, 'easeInOutCubic');

    currentstate = states.ScoreScreen;

    clearInterval(loopGameloop);
    clearInterval(loopcanoloop);
    loopGameloop = null;
    loopcanoloop = null;

    if (isIncompatible.any()) {
        showScore();
    } else {
        soundHit.play().bindOnce("ended", function() {
            soundDie.play().bindOnce("ended", function() {
                showScore();
            });
        });
    }
}

function showScore() {
    $("#scoreboard").css("display", "block");
    setBigScore(true);

    if (score > highscore) {
        highscore = score;
        setCookie("highscore", highscore, 999);
    }

    setSmallScore();
    setHighScore();
    var wonmedal = setMedal();

    soundSwoosh.stop();
    soundSwoosh.play();

    $("#scoreboard").css({ y: '40px', opacity: 0 });
    $("#replay").css({ y: '40px', opacity: 0 });
    $("#scoreboard").transition({ y: '0px', opacity: 1 }, 600, 'ease', function() {
        soundSwoosh.stop();
        soundSwoosh.play();
        $("#replay").transition({ y: '0px', opacity: 1 }, 600, 'ease');

        if (wonmedal) {
            $("#medal").css({ scale: 2, opacity: 0 });
            $("#medal").transition({ opacity: 1, scale: 1 }, 1200, 'ease');
        }
    });

    replayclickable = true;
}

$("#replay").click(function() {
    if (!replayclickable)
        return;
    else
        replayclickable = false;
    soundSwoosh.stop();
    soundSwoosh.play();

    $("#scoreboard").transition({ y: '-40px', opacity: 0 }, 1000, 'ease', function() {
        $("#scoreboard").css("display", "none");
        showSplash();
    });
});

function playerScore() {
    score += 1;
    soundScore.stop();
    soundScore.play();
    setBigScore();
}

function updatecanos() {
    $(".cano").filter(function() { return $(this).position().left <= -100; }).remove()

    var padding = 80;
    var constraint = 420 - canoheight - (padding * 2);
    var topheight = Math.floor((Math.random() * constraint) + padding);
    var bottomheight = (420 - canoheight) - topheight;
    var newcano = $('<div class="cano animated"><div class="cano_upper" style="height: ' + topheight + 'px;"></div><div class="cano_lower" style="height: ' + bottomheight + 'px;"></div></div>');
    $("#flyarea-game").append(newcano);
    canos.push(newcano);
}


var isIncompatible = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Safari: function() {
        return (navigator.userAgent.match(/OS X.*Safari/) && !navigator.userAgent.match(/Chrome/));
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isIncompatible.Android() || isIncompatible.BlackBerry() || isIncompatible.iOS() || isIncompatible.Opera() || isIncompatible.Safari() || isIncompatible.Windows());
    }
};