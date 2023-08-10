import { performance } from "perf_hooks";
import "reflect-metadata";

type WithTimings = {
  __timings: unknown[];
};

const importantMetadataKey = Symbol("important");

export function important(
  target: Object,
  propertyKey: string | symbol,
  parameterIndex: number
) {
  let importantParams: number[] =
    Reflect.getOwnMetadata(importantMetadataKey, target, propertyKey) || [];

  importantParams.push(parameterIndex);

  Reflect.defineMetadata(
    importantMetadataKey,
    importantParams,
    target,
    propertyKey
  );
}

export function logTimings<T extends new (...args: any[]) => {}>(
  constructor: T
) {
  return class extends constructor {
    __timings = [];
    public printTimings() {
      console.log(this.__timings);
    }
  };
}

export function timing() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const fn = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = performance.now();
      const output = await fn.apply(this, args);
      const end = performance.now();
      const delta = (end - start).toFixed(2);

      let message = `Call to ${propertyKey} took ${delta} milliseconds.`;

      let importantParams: number[] = Reflect.getOwnMetadata(
        importantMetadataKey,
        target,
        propertyKey
      );

      if (importantParams) {
        for (let paramIndex of importantParams) {
          message += ` Param ${paramIndex} was ${args[paramIndex]}`;
        }
      }

      if ((this as WithTimings).__timings) {
        (this as WithTimings).__timings.push(message);
      } else {
        console.log(message);
      }

      return output;
    };
  };
}
