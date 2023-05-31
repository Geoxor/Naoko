import { container } from '@triptyk/tsyringe';

type constructor<T> = {
  new (...args: any[]): T;
}

export default function plugin<T>(): (target: constructor<T>) => void {
  return function(target: constructor<T>): void {
    container.registerSingleton(target);
    container.register('naokoPlugin', target);
  };
}