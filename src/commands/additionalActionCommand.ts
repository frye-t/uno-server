import {UNOCard} from '../models/unoCard';
import {Player} from '../models/player';
import { GameCommand } from './gameCommand';

export class AdditionalActionCommand implements GameCommand {
  private action: () => void;

  constructor(action: () => void) {
    this.action = action;
  }

  execute() {
    this.action();
  }
}
