/*鸟类*/
function Bird(imgArr, x, y) {
	this.imgArr = imgArr;
	this.index = parseInt(Math.random() * this.imgArr.length);
	this.img = this.imgArr[this.index];

	this.x = x;
	this.y = y;

	// 定义鸟的状态用于判断是在下降还是上升
	this.state = "D";  //D down  U up
	// 定义一个speed可以让鸟具有一个加速度，而不是匀速下降或者上升
	this.speed = 0;
}

Bird.prototype.fly = function() {
	this.index ++;

	if (this.index > this.imgArr.length - 1) {
		this.index = 0;
	}

	this.img = this.imgArr[this.index];
}
// 鸟下降
Bird.prototype.falwDown = function() {
	// this.y ++;
	if (this.state === "D") {
		this.speed ++;
		this.y += Math.sqrt(this.speed);
	} else {
		this.speed --;
		if (this.speed === 0) {
			//改变鸟状态使其下降，并且return，如果不判断speed会导致speed开一个负数方，无意义NaN；
			this.state = "D";
			return;
		}
		this.y -= Math.sqrt(this.speed);
	}
}
// 鸟上升
Bird.prototype.goUp = function() {
	// this.y -= 25;

	// 改变鸟的状态
	this.state = "U";
	this.speed = 20;
}