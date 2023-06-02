import { container, injectable } from '@triptyk/tsyringe';
import AbstractCommand from 'src/commands/AbstractCommand';

type constructor<T = AbstractCommand> = {
  new (...args: any[]): T;
}

export default function command<T>(): (target: constructor<T>) => void {
  return function(target: constructor<T>): void {
    injectable()(target);
    container.registerSingleton(target);
    container.register('naokoCommand', target);
  };
}
