/**
 * @Game 整个游戏类
 * @ctx 画笔
 * @bird 鸟的实例
 * @pipe 管子的实例
 * @land 地面（背景的实例）
 * @mountain 山 （背景的实例）
 */

function Game(ctx, bird, pipe, land, mountain) {
	this.ctx = ctx;
	this.bird = bird;

	this.pipeArr = [pipe];
	this.land = land;
	this.mountain = mountain;
	this.time = null;
	this.iframe = null;
	this.score = 0;


	this.init();
}

Game.prototype.init = function() {
	this.start();
	this.bindEvent();
}
// 渲染背景山
Game.prototype.renderMountain = function() {
	var img = this.mountain.img;
	this.mountain.x -=this.mountain.step;

	if (this.mountain.x < -img.width) {
		this.mountain.x = 0;
	}
	this.ctx.drawImage(img, this.mountain.x, this.mountain.y);
	this.ctx.drawImage(img, this.mountain.x + img.width, this.mountain.y);
	this.ctx.drawImage(img, this.mountain.x + img.width * 2, this.mountain.y);
}
// 渲染地面
Game.prototype.renderLand = function() {
	var img = this.land.img;
	this.land.x -=this.land.step;

	if (this.land.x < -img.width) {
		this.land.x = 0;
	}
	this.ctx.drawImage(img, this.land.x, this.land.y);
	this.ctx.drawImage(img, this.land.x + img.width, this.land.y);
	this.ctx.drawImage(img, this.land.x + img.width * 2, this.land.y);
}


// 开始游戏
Game.prototype.start = function() {
	var me = this;

	this.timer = setInterval(function() {
		// 帧数自加控制鸟翅膀同步问题降低频率到1/10
		me.iframe++;
		// 像素检测法太耗费性能，不开启
		// me.checkPX();
		me.clear();
		// 加分方法
		me.birdScore();

		me.renderMountain();
		me.renderLand();


		if (!(me.iframe % 10)) {
			me.bird.fly();
		}

		me.bird.falwDown();

		me.movePipe();

		me.renderPipe();
		me.renderBird();

		if (!(me.iframe % 65)) {
			me.createPipe();
		}
		me.clearPipe();
		//渲染鸟的四个点
		me.renderBirdPoints();
		// 渲染管子的八个点
		me.renderPipePoints();
		// 碰撞检测
		me.checkBoom();

	}, 20)
}

// 请屏方法
Game.prototype.clear = function() {
	this.ctx.clearRect(0, 0, 360, 512);
}

// 渲染鸟

Game.prototype.renderBird = function() {
	var img = this.bird.img;

	this.ctx.save();

	this.ctx.translate(this.bird.x, this.bird.y);

	// 旋转
	// this.ctx.rotate(Math.PI / 180 * this.iframe);
	var deg = this.bird.state ==="D" ? Math.PI / 180 * this.bird.speed : -  Math.PI / 180 * this.bird.speed;
	this.ctx.rotate(deg);

	this.ctx.drawImage(img, -img.width / 2, -img.height / 2);

	this.ctx.restore();
}

// 绑定事件方法
Game.prototype.bindEvent = function() {
	var me = this;
	this.ctx.canvas.onclick = function() {
		me.bird.goUp();
	}
}

// 渲染管子
Game.prototype.renderPipe = function() {
	var me = this;
	this.pipeArr.forEach(function(value, index) {
		var img_up = value.pipe_up;

		var img_x = 0;

		var img_y = img_up.height - value.up_height;

		var img_w = img_up.width;

		var img_h = value.up_height;

		var canvas_x = me.ctx.canvas.width - value.step * value.count;

		var canvas_y = 0;

		var canvas_w = img_up.width;

		var canvas_h = value.up_height;

		me.ctx.drawImage(img_up, img_x, img_y, img_w, img_h, canvas_x, canvas_y, canvas_w, canvas_h);


		//下管子
		var img_down = value.pipe_down;

		var img_down_x = 0;

		var img_down_y = 0;

		var img_down_w = img_down.width;

		var img_down_h = value.down_height;

		var canvas_down_x = me.ctx.canvas.width - value.step * value.count;

		var canvas_down_y = value.up_height + 150;

		var canvas_down_w = img_down_w;

		var canvas_down_h = img_down_h;


		me.ctx.drawImage(img_down, img_down_x, img_down_y, img_down_w, img_down_h, canvas_down_x, canvas_down_y, canvas_down_w, canvas_down_h);
	})
}

Game.prototype.movePipe = function() {
	this.pipeArr.forEach(function(value, index) {
		value.count ++;
	})
}

Game.prototype.createPipe = function() {
	var pipe = this.pipeArr[0].createPipe();

	this.pipeArr.push(pipe);
}


Game.prototype.clearPipe = function() {
	// 循环清理
	for (var i = 0; i < this.pipeArr.length; i ++) {
		var pipe = this.pipeArr[i];
		// count是怎么计算的  65 % 取余？？？
		// 解释取余65，每当画面刷新65次的时候，加载一个管子
		// 当画面刷新十次的时候煽动一次翅膀，就是变一下图片路径
		// pipe.x - pipe.step * pipe.count
		// pipe.x是360，减去步长和信号量的值就是每次不断变化的管子的X值
		// 这样管子就可以移动了，如果管子移动到canvas的外面，也就是
		// 管子的x值刚好是负的一个管子的宽度就认为是出去了canvas画面
		// 此时为了避免数组的不停积累，可以删除这个出去的管子
		// 也可以用另一种方法，判断pipeArr的长度，当pipeArr的值的大于3的时候，
		// 就让pipeArr去删除掉前面的第一项，也可以完成类似的效果
		if (pipe.x - pipe.step * pipe.count < - pipe.pipe_up.width) {
			this.pipeArr.splice(i, 1);
			return;
		}
	}
}

// 绘制鸟的四个点
Game.prototype.renderBirdPoints = function() {
	// 鸟A点
	var bird_A = {
		x: -this.bird.img.width / 2 + 7 + this.bird.x,
		y: -this.bird.img.height / 2 + 10 + this.bird.y
	}

	// 鸟的B点
	var bird_B = {
		x: bird_A.x + this.bird.img.width - 15,
		y: bird_A.y
	}

	// 鸟的C点
	var bird_C = {
	 	x: bird_A.x,
	 	y: bird_A.y + this.bird.img.height -17
	}

	// 鸟的D点
	var bird_D = {
		x: bird_B.x,
		y: bird_C.y
	}
	// 开启路径
	this.ctx.beginPath();
	// 移动画笔到某个位置
	this.ctx.moveTo(bird_A.x, bird_A.y);
	this.ctx.lineTo(bird_B.x, bird_B.y);
	this.ctx.lineTo(bird_D.x, bird_D.y);
	this.ctx.lineTo(bird_C.x, bird_C.y);
	// 闭合路径
	this.ctx.closePath();

	// 改变描边色,canvas的描边色不用重复书写，设置一个其他都改变
	// 想单独设置则需要保存状态
	// 设置透明用户不可见颜色
	this.ctx.strokeStyle = "rgba(0,0,0,.0)";

	this.ctx.stroke();
}


// 绘制上下管子一共八个点
Game.prototype.renderPipePoints = function() {
	// 循环绘制
	for (var i = 0; i < this.pipeArr.length; i ++) {
		var pipe = this.pipeArr[i];
		// 绘制上管子的四个点
		// 上管子的A点
		var pipe_A = {
			x: pipe.x - pipe.step * pipe.count,
			y: 0
		}

		// 上管子的B点
		var pipe_B = {
			x: pipe.x - pipe.step * pipe.count + pipe.pipe_up.width,
			y: 0
		}

		// 上管子的C点
		var pipe_C = {
			x: pipe_A.x,
			y: pipe.up_height
		}

		// 上管子的D点
		var pipe_D = {
			x: pipe_B.x,
			y: pipe_C.y
		}

		// 开启路径
		this.ctx.beginPath();
		// 移动画笔到某个位置
		this.ctx.moveTo(pipe_A.x, pipe_A.y);
		this.ctx.lineTo(pipe_B.x, pipe_B.y);
		this.ctx.lineTo(pipe_D.x, pipe_D.y);
		this.ctx.lineTo(pipe_C.x, pipe_C.y);
		// 闭合路径
		this.ctx.closePath();
		// 改变描边色
		// this.ctx.strokeStyle = "blue";
		// 描边路径
		this.ctx.stroke();




		// 绘制下管子的四个点
		// 下管子的A点
		var pipe_down_A = {
			x: pipe.x - pipe.step * pipe.count,
			y: pipe_C.y + 150
		}

		// 下管子的B点
		var pipe_down_B = {
			x: pipe.x - pipe.step * pipe.count + pipe.pipe_up.width,
			y: pipe_down_A.y
		}

		// 下管子的C点
		var pipe_down_C = {
			x: pipe_A.x,
			y: 400
		}

		// 下管子的D点
		var pipe_down_D = {
			x: pipe_down_B.x,
			y: 400
		}

		// 开启路径
		this.ctx.beginPath();
		// 移动画笔到某个位置
		this.ctx.moveTo(pipe_down_A.x, pipe_down_A.y);
		this.ctx.lineTo(pipe_down_B.x, pipe_down_B.y);
		this.ctx.lineTo(pipe_down_D.x, pipe_down_D.y);
		this.ctx.lineTo(pipe_down_C.x, pipe_down_C.y);
		// 闭合路径
		this.ctx.closePath();
		// 改变描边色
		// this.ctx.strokeStyle = "blue";
		// 描边路径
		this.ctx.stroke();


	}
}

// 检测方法
Game.prototype.checkBoom = function() {
	for (var i = 0; i < this.pipeArr.length; i ++) {
		var pipe = this.pipeArr[i];
		// 绘制上管子的四个点
		// 上管子的A点
		var pipe_A = {
			x: pipe.x - pipe.step * pipe.count,
			y: 0
		}

		// 上管子的B点
		var pipe_B = {
			x: pipe.x - pipe.step * pipe.count + pipe.pipe_up.width,
			y: 0
		}

		// 上管子的C点
		var pipe_C = {
			x: pipe_A.x,
			y: pipe.up_height
		}

		// 上管子的D点
		var pipe_D = {
			x: pipe_B.x,
			y: pipe_C.y
		}

		// 绘制下管子的四个点
		// 下管子的A点
		var pipe_down_A = {
			x: pipe.x - pipe.step * pipe.count,
			y: pipe_C.y + 150
		}

		// 下管子的B点
		var pipe_down_B = {
			x: pipe.x - pipe.step * pipe.count + pipe.pipe_up.width,
			y: pipe_down_A.y
		}

		// 下管子的C点
		var pipe_down_C = {
			x: pipe_A.x,
			y: 400
		}

		// 下管子的D点
		var pipe_down_D = {
			x: pipe_down_B.x,
			y: 400
		}

		var bird_A = {
			x: -this.bird.img.width / 2 + 7 + this.bird.x,
			y: -this.bird.img.height / 2 + 10 + this.bird.y
		}

		// 鸟的B点
		var bird_B = {
			x: bird_A.x + this.bird.img.width - 15,
			y: bird_A.y
		}

		// 鸟的C点
		var bird_C = {
		 	x: bird_A.x,
		 	y: bird_A.y + this.bird.img.height -17
		}

		// 鸟的D点
		var bird_D = {
			x: bird_B.x,
			y: bird_C.y
		}
		// 上管子判断法
		if (bird_B.x >= pipe_C.x && bird_B.y <= pipe_C.y && bird_A.x <= pipe_B.x) {
			console.log("撞到管子上了");
			this.gameOver();
		}
		// 下管子判断法
		if (bird_D.x >= pipe_down_A.x && bird_D.y >= pipe_down_A.y && bird_A.x <= pipe_down_B.x) {
			console.log("撞到管子了");
			this.gameOver();
		}
		// 地面判读
		if (bird_D.y >= 400) {
			console.log("撞到地面了")
			this.gameOver();
		}
		// 分数++
		if (bird_A.x >= pipe_B.x && !(this.iframe % 21)) {
			console.log("得分");
			this.score ++;
			console.log(this.score);
		}

	}
}

Game.prototype.gameOver = function() {
	// 清除定时器
	clearInterval(this.timer);
}

// 像素检测法 
Game.prototype.checkPX = function() {
	this.ctx.clearRect(0, 0, 360, 512);

	// 保存状态
	this.ctx.save();
	// 渲染
	this.renderPipe();
	// 改变融合方式
	this.ctx.globalCompositeOperation = "source-in";
	// 恢复状态
	this.renderBird();

	this.ctx.restore();


	// 获取像素信息

	var imgData = this.ctx.getImageData(0, 0, 360, 512);
	for (var i = 0; i < imgData.data.length; i ++) {
		// console.log(imgData);
		if (imgData.data[i]) {
			console.log("碰到了");
			this.gameOver();
			return;
		}
	}
}

// 显示分数方法
Game.prototype.birdScore = function() {
	game_score.innerHTML = this.score;
}













