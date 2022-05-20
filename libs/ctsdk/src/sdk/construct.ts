import { Enumerable } from '../decorators/enumerable.decorator';
import { Node } from './node';

export const Construct_ID = Symbol('id of a given construct');
export abstract class Construct<
  Props extends Object,
  Parent extends Construct<any, any> = Construct<any, any>,
> extends Node<Props> {
  public readonly [Construct_ID]!: string;

  protected readonly internals: Construct<any>[] = [];

  constructor(
    protected readonly scope: Parent,
    protected readonly name: string,
    props?: Props,
  ) {
    super(props);
    Enumerable(false)(this, Construct_ID);
    Enumerable(false)(this, 'internals');

    this[Construct_ID] = name?.toLowerCase();

    if (scope) {
      scope.addConstruct(this);
    }
  }

  protected addConstruct(construct: Construct<any>) {
    this.internals.push(construct);
  }
}
