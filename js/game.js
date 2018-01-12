/*
 *  锅哥
 *  微信： tornodo
 *  博客：https://www.jianshu.com/u/1b05a5363c32
 *  微信公众号： guo_game
 */
 
var WIDTH = 800;
var HEIGHT = 600;
var score = 0; //得分
var changeScore = 10;//切换背景得分
var changeBGScore= 0;//统计累计等分更换背景，然后置0重新统计
var scoreText;//得分的文字说明，添加到舞台上
var topScore = 0;//最高得分
var distance = 180;//上下烟囱之间的距离
var MaxChinmeyNum = 5;//每次游戏开始默认生成10个烟囱，上下各5个
var ChimneyGroupsUp;//上面的烟囱组
var ChimneyGroupsDown;//下面的烟囱组
var minChimneyHeight = 120; // 烟囱在场景上最小的一个Y值
var maxChimneyHeight = 300; // 烟囱在场景上最大的一个Y值
var birdDropSpeed = 1200;
var speed = -280;//烟囱移动速度
var day = '#6ec5ce';
var night = '#0493a2';
var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, 'game');

game.states = {};
game.states.boot = function() {
    this.preload = function() {
        this.load.image('loading', 'assets/image/progress.png');
    },
    this.create = function() {
        this.state.start('preloader');
    }
}

game.states.preloader = function() {
    this.preload = function() {
        var loadingSprite = this.add.sprite((this.world.width - 311) / 2, this.world.height / 2, 'loading');
        this.load.setPreloadSprite(loadingSprite, 0);
        this.load.image('bg', 'assets/image/bg.png');
        this.load.atlasJSONHash('ui', 'assets/image/ui.png', 'assets/image/ui');
        this.load.audio('die', 'assets/audio/die.wav');
        this.load.audio('music', 'assets/audio/bg.mp3');
    },
    this.create = function() {
        this.state.start('menu');
    }
}
//var chimney;
//function test() {
//	chimney = game.add.sprite(300, 300, 'ui', '6.png');
//	chimney.type = "down";
//	chimney.anchor.set(0.5);
//	game.physics.arcade.enable(chimney);
//	var halfH = chimney.height / 2;
//	var body = game.add.sprite(0, 0, 'ui', '9.png');
//	body.anchor.set(0.5, -0.5);
//	game.physics.arcade.enable(body);
//	chimney.addChild(body);
//	var n = Math.floor((chimney.y - halfH) / body.height);
//	for (var j = 0;j < n;j++) {
//		var b = game.add.sprite(0, 0, 'ui', '9.png');
//		b.anchor.set(0.5, -0.5 - (j + 1));
//		chimney.addChild(b);
//		game.physics.arcade.enable(b);
//	}
//}
game.states.menu = function() {
    this.create = function() {
        this.bg = this.add.sprite(0, 0, 'bg');
        this.bird = this.add.sprite(0, 0, 'ui', 'bird1.png');
        this.bird.anchor.set(0.5);
        this.bird.x = game.world.centerX;
        this.bird.y = game.world.centerY - 100;
        this.bird.animations.add('bird_fly', ['bird1.png', 'bird2.png', 'bird3.png'], 20, true, false);
        this.bird.animations.play('bird_fly');
        this.startButton = this.add.sprite(0, 0, 'ui', 'button.png');
		this.startButton.anchor.set(0.5);
		this.startButton.x = game.world.centerX;
		this.startButton.y = this.bird.y + this.bird.height + this.startButton.height / 2;
		this.startButton.inputEnabled = true;
		this.startButton.input.useHandCursor = true;
		this.startButton.events.onInputDown.add(this.startGame, this);
    },
    this.startGame = function() {
    	this.bg.destroy();
    	this.bird.destroy();
    	this.startButton.destroy();
        game.state.start('start');
    }/*,
    this.render = function() {
    	game.debug.body(chimney);
    	chimney.children.forEach(function(item) {
			game.debug.body(item);
    	});
    }*/
}

game.states.start = function() {
    this.preload = function() {
        game.stage.backgroundColor = day;
        this.cloud1 = this.add.tileSprite(0, game.height - 68 * 2, game.width, 95, 'ui', 'cloud1.png');
        this.cloud1.autoScroll(speed / 10, 0);
        this.cloud2 = this.add.tileSprite(0, game.height - 68 * 2, game.width, 95, 'ui', 'cloud2.png');
        this.cloud2.visible = false;
        this.building1 = this.add.tileSprite(0, game.height - 68, game.width, 68, 'ui', 'building1.png');
        this.building1.autoScroll(speed / 5, 0);
        this.building2 = this.add.tileSprite(0, game.height - 68, game.width, 68, 'ui', 'building2.png');
        this.building2.visible = false;
        this.bang = this.add.audio('die');
        this.music = this.add.audio('music');
        this.input.maxPointers = 1;
        game.physics.startSystem(Phaser.Physics.ARCADE);
        ///初始化状态
        score = 0;
        changeBGScore = 0;
    },
    this.create = function() {
        this.music.play('', 0, 1, true);
        this.bird = this.add.sprite(0, 300, 'ui', 'bird1.png');
        game.physics.arcade.enable(this.bird);
        this.bird.anchor.set(0.5);
        this.bird.x = game.world.centerX;
        this.bird.y = game.world.centerY;
        this.bird.body.gravity.y = birdDropSpeed;
    	ChimneyGroupsUp = game.add.group();//上面的烟囱组
    	ChimneyGroupsDown = game.add.group();
    	initChimney();
        topScore = localStorage.getItem("bird_topScore") === null ? 0 : localStorage.getItem("bird_topScore");
        scoreText = game.add.text(10, 10, "-", {
            font:"bold 18px Arial",
            fill: "#ffffff"
        });
        game.input.onDown.add(this.fly, this); //给鼠标按下事件绑定鸟的飞翔动作
        updateScore();
        moveAChimney();
        ChimneyGroupsUp.forEach(function(Chimney) {
        	game.physics.arcade.collide(this.bird, Chimney);
        	Chimney.children.forEach(function(item) {
        		game.physics.arcade.collide(this.bird, item);
        	}, this);
        }, this);
        ChimneyGroupsDown.forEach(function(Chimney) {
        	game.physics.arcade.collide(this.bird, Chimney);
        	Chimney.children.forEach(function(item) {
        		game.physics.arcade.collide(this.bird, item);
        	}, this);
        }, this);
		game.time.events.loop(1500, moveAChimney, this); //利用时钟事件来循环产生管道
		
    },
    this.update = function() {
    	if(this.bird.x <= 0 || this.bird.x >= game.width || this.bird.y <= 0 || this.bird.y >= game.height) {
    		this.gameOver();
    	}
        ChimneyGroupsUp.forEach(function(Chimney) {
        	if (Chimney.x + Chimney.width / 2 < this.bird.x + this.bird.width / 2 && Chimney.scored === false) {
        		Chimney.scored = true;
        		score += 1;
        		changeBGScore += 1;
        		updateScore();
        	}
        	game.physics.arcade.overlap(this.bird, Chimney, this.gameOver, null, this);
        	Chimney.children.forEach(function(item) {
        		game.physics.arcade.overlap(this.bird, item, this.gameOver, null, this);
        	}, this);
        }, this);
        ChimneyGroupsDown.forEach(function(Chimney) {
        	game.physics.arcade.overlap(this.bird, Chimney, this.gameOver, null, this);
        	Chimney.children.forEach(function(item) {
        		game.physics.arcade.overlap(this.bird, item, this.gameOver, null, this);
        	}, this);
        }, this);
    	if(this.bird.angle < 90) {
    		this.bird.angle += 2.5;//一直朝下旋转鸟头
    	}
    	if (changeBGScore === changeScore) {//看看是否该切换背景了
			changeBGScore = 0;//清空统计
			if(this.cloud2.visible === false) {
				this.cloud2.visible = true;
				this.building2.visible = true;
				this.cloud1.visible = false;
				this.building1.visible = false;
				game.stage.backgroundColor = night;
			} else {
				this.cloud2.visible = false;
				this.building2.visible = false;
				this.cloud1.visible = true;
				this.building1.visible = true;
				game.stage.backgroundColor = day;
			}
		}
    },
    this.fly = function() {
		this.bird.body.velocity.y = -350; //给鸟设一个向上的速度
    	game.add.tween(this.bird).to({angle:-30}, 100, null, true, 0, 0, false); //上升时头朝上的动画
    },
    this.gameOver = function() {
		this.bang.play();
	    clearChimney();//清空保存的烟囱数组
	    localStorage.setItem("bird_topScore", Math.max(score, topScore));
	    updateScore();
	    this.music.stop();
	    this.cloud1.destroy();
	    this.cloud2.destroy();
	    this.building1.destroy();
	    this.building2.destroy();
	    this.bird.destroy();
	    this.bang.destroy();
	    this.music.destroy();
	    game.state.start('stop');
    }
}

game.states.stop = function() {
    this.preload = function() {
        game.stage.backgroundColor = day;
        this.bird = this.add.sprite(0, 0, 'ui', 'bird1.png');
        this.bird.anchor.set(0.5);
        this.bird.x = game.world.centerX;
        this.bird.y = game.world.centerY - 100;
        this.bird.animations.add('bird_fly', ['bird1.png', 'bird2.png', 'bird3.png'], 20, true, false);
        this.bird.animations.play('bird_fly');
        this.startButton = this.add.sprite(0, 0, 'ui', 'button.png');
		this.startButton.anchor.set(0.5);
		this.startButton.x = game.world.centerX;
		this.startButton.y = this.bird.y + this.bird.height + this.startButton.height / 2;
		this.startButton.inputEnabled = true;
		this.startButton.input.useHandCursor = true;
		this.startButton.events.onInputDown.add(this.startGame, this);
        scoreText = game.add.text(0, this.bird.y - this.bird.height - 30, "-", {
            font:"bold 28px Arial",
            fill: "#FFFFFF"
        });
        scoreText.anchor.set(0.5);
        scoreText.x = this.bird.x;
    },
    this.create = function() {
        updateScore();
    },
    this.startGame = function() {
    	this.bird.destroy();
    	this.startButton.destroy();
    	scoreText.destroy();
        game.state.start('start');
    }
}

//移动一个烟囱
function moveAChimney() {
	var up = ChimneyGroupsUp.getFirstDead();
	if (up == null) {
		return;
	}
	var y = game.rnd.between(minChimneyHeight, maxChimneyHeight);
	up.reset(game.width, y)
	up.scored = false;
	up.body.velocity.x = speed;
	var down = ChimneyGroupsDown.getFirstDead();
	if (down != null) {
		down.angle = 0;
		down.reset(game.width, y + distance);
		down.body.velocity.x = speed;
	}
}

// 每次游戏重新开始的时候，清空保存的烟囱数组
function clearChimney() {
	console.log("清理所有烟囱");
	ChimneyGroupsUp.forEach(function(Chimney) {
	    Chimney.destroy();
	});
	ChimneyGroupsUp.destroy();
	ChimneyGroupsDown.forEach(function(Chimney) {
	    Chimney.destroy();
	});
	ChimneyGroupsDown.destroy();
}

// 随机10个烟囱
function initChimney() {
	initUpChimney();
	initDownChimney();
	ChimneyGroupsUp.setAll('checkWorldBounds',true); //边界检测
    ChimneyGroupsUp.setAll('outOfBoundsKill',true); //出边界后自动kill
	ChimneyGroupsDown.setAll('checkWorldBounds',true); //边界检测
    ChimneyGroupsDown.setAll('outOfBoundsKill',true); //出边界后自动kill
}

function initUpChimney() {
	for(var i = 0;i < MaxChinmeyNum;i++) {
		var chimney = game.add.sprite(game.width, game.height, 'ui', '6.png');
		chimney.scored = false;
		chimney.anchor.set(0.5);
		chimney.angle = 180;
		game.physics.arcade.enable(chimney);
		var halfH = chimney.height / 2;
		var body = game.add.sprite(0, 0, 'ui', '9.png');
		body.anchor.set(0.5, 1.5);
		body.angle = 180;
		game.physics.arcade.enable(body);
		chimney.addChild(body);
		var n = Math.floor((chimney.y - halfH) / body.height);
		for (var j = 0;j < n;j++) {
			var b = game.add.sprite(0, 0, 'ui', '9.png');
			b.anchor.set(0.5, 1.5 + (j + 1));
			b.angle = 180;
			chimney.addChild(b);
			game.physics.arcade.enable(b);
		}
		chimney.alive = false;
		chimney.visible = false;
		ChimneyGroupsUp.add(chimney);
	}
}
function initDownChimney() {
	for(var i = 0;i < MaxChinmeyNum;i++) {
		var chimney = game.add.sprite(game.width, game.height, 'ui', '6.png');
		chimney.anchor.set(0.5);
		game.physics.arcade.enable(chimney);
		var halfH = chimney.height / 2;
		var body = game.add.sprite(0, 0, 'ui', '9.png');
		body.anchor.set(0.5, -0.5);
		game.physics.arcade.enable(body);
		chimney.addChild(body);
		var n = Math.floor((chimney.y - halfH) / body.height);
		for (var j = 0;j < n;j++) {
			var b = game.add.sprite(0, 0, 'ui', '9.png');
			b.anchor.set(0.5, -0.5 - (j + 1));
			chimney.addChild(b);
			game.physics.arcade.enable(b);
		}
		chimney.alive = false;
		chimney.visible = false;
		ChimneyGroupsDown.add(chimney);
	}
}
function updateScore() {
    scoreText.text = "得分：" + score + "    最高得分：" + Math.max(score, topScore);
}
game.state.add('boot', game.states.boot);
game.state.add('preloader', game.states.preloader);
game.state.add('menu', game.states.menu);
game.state.add('start', game.states.start);
game.state.add('stop', game.states.stop);
game.state.start('boot');