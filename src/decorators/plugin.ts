import { container, injectable } from '@triptyk/tsyringe';
import AbstractPlugin from '../plugins/AbstractPlugin';

type constructor<T = AbstractPlugin> = {
  new (...args: any[]): T;
}

export default function plugin<T>(): (target: constructor<T>) => void {
  return function(target: constructor<T>): void {
    injectable()(target);
    container.registerSingleton(target);
    container.register('naokoPlugin', target);
  };
}
