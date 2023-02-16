import { Service } from "@homeapi/ctsdk";
import { Updater } from "./updater.compose";

/**
 * This service should be kept auto updated
 * @returns 
 */
export function AutoUpdate() {
  return function (target: any, propertyName: string, descriptor?: TypedPropertyDescriptor<Service>): void {
    Updater.addService({
      class: target.constructor,
      name: propertyName,
    })
  }
}
