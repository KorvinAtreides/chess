import { PlayerColor } from '../constants';
import ElementCreator from '../elementCreator';

export default class Figure {
  imageUrl: string;

  color: PlayerColor;

  cost: number;

  name: string;

  position: string | null;

  constructor(color: PlayerColor, position: string | null) {
    this.color = color;
    this.position = position;
  }

  render() {
    const image = ElementCreator.createImage(`${this.imageUrl}`);
    image.ondragstart = () => false;
    image.dataset.type = String(this.constructor.name);
    image.dataset.color = this.color;
    image.dataset.position = this.position;
    return image;
  }

  canBeat() {
    const beatableArray: Array<Array<string>> = [[this.position]];
    return beatableArray;
  }

  canMove() {
    const moveableArray: Array<Array<string>> = [[this.position]];
    return moveableArray;
  }
}
