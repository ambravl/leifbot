module.exports.Passport = class Passport {
  constructor(info) {
    this.info = info;
    this.Canvas = require('canvas');
    this.Canvas.registerFont('./src/passport/Humming.otf', {family: 'Humming'});
    this.canvas = this.Canvas.createCanvas(1094, 626);
    this.ctx = this.canvas.getContext('2d');
    this.color = "#AAD022";
    this.coords = {
      island: [467, 196, false],
      islandIcon: [424, 192],
      fruit: [670, 196, true],
      fruitIcon: [626, 192],
      bio: [430, 120, true],
      role: [423, 261, false],
      characterName: [426, 328, false],
      sign: [413, 391],
      birthday: [462, 402, true],
      friendcode: [508, 500, true],
      icon: [97, 119]
    }
  }

  async background() {
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.globalCompositeOperation = "source-in";
    const background = await this.Canvas.loadImage('./src/passport/bg.png');
    this.ctx.drawImage(background, 0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  async icon() {
    const iconBoundary = await this.Canvas.loadImage('./src/passport/avvy.png');
    this.ctx.drawImage(iconBoundary, this.coords.icon[0], this.coords.icon[1]);
    this.ctx.save();
    this.ctx.globalCompositeOperation = "source-in";
    const icon = await this.Canvas.loadImage(this.info.icon);
    this.ctx.drawImage(icon, 97, 119, this.coords.icon[0], this.coords.icon[1]);
    this.ctx.restore();
  }

  async text(name) {
    this.ctx.fillStyle = this.coords[name][2] ? '#59440b' : '#59440b';
    this.ctx.font = name === 'characterName' ? '35px "Humming"' : '25px "Humming"';
    this.ctx.fillText(this.info[name], this.coords[name][0], this.coords[name][1], 480);
  }

  async draw() {
    await this.background();
    await this.icon();
    await this.text('island');
    await this.text('bio');
    await this.text('characterName');
    await this.text('fruit');
    await this.text('friendcode');
    await this.text('role');
    return this.canvas.toBuffer();
  }
};

