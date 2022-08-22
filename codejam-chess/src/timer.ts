export default class Timer {
  x: number;

  y: number;

  value: number;

  context: CanvasRenderingContext2D;

  stopped: boolean;

  constructor(context: CanvasRenderingContext2D, x: number, y: number, timeValue: number) {
    this.x = x;
    this.y = y;
    this.value = timeValue;
    this.context = context;
    this.stopped = false;
  }

  tick() {
    const updateValue = this.stopped ? 0 : 1;
    this.value += updateValue;
    this.render();
  }

  render() {
    const [context] = [this.context];
    context.font = 'bold 50px serif';
    context.fillStyle = '#000';
    context.fillText(this.getCurrentTime(), this.x, this.y);
  }

  getCurrentTime() {
    const time = new Date(this.value * 1000);
    const timeText = `${time.getUTCHours() < 10 ? '0' : ''}${time.getUTCHours()}:${
      time.getUTCMinutes() < 10 ? '0' : ''
    }${time.getUTCMinutes()}:${time.getSeconds() < 10 ? '0' : ''}${time.getUTCSeconds()}`;
    return timeText;
  }
}
