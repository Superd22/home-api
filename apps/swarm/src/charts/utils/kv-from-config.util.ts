import { KeyValue, KeyValueImpl } from '@homeapi/ctsdk';

/**
 * Turns a JSON config to KeyValue objects
 * @param config
 * @returns
 */
export function keyValueFromConfig(
  config: Record<string, unknown>,
): KeyValue[] {
  const lfc = (
    config: Record<string, unknown>,
    prefix: string,
    acc: KeyValue[],
  ): KeyValue[] => {
    const entries = Object.entries(config).flatMap(([key, value]) => {
      if (value instanceof Object)
        return lfc(value as Record<any, any>, `${prefix}${key}.`, acc);
      return new KeyValueImpl({ key: `${prefix}${key}`, value: value });
    });
    return [...acc, ...entries]
  };

  return lfc(config, '', []);
}
