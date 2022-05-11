/**
 * @enumerable decorator that sets the enumerable property of a class field to false.
 * @param value true|false
 */
 export function Enumerable(value: boolean) {
  return function (target: any, propertyKey: string | symbol) {
      let descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {};
      if (descriptor.enumerable != value) {
          descriptor.enumerable = value;
          descriptor.writable= true;
          Object.defineProperty(target, propertyKey, descriptor)
      }
  };
}