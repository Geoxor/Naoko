import { singleton } from "@triptyk/tsyringe";

@singleton()
export default class CommonUtils {
  randomChoice<T>(l: Array<T>): T {
    return l[~~(Math.random() * l.length)];
  }
}
