import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Node, NodeStatus, WakableNodes, WakeNodeGQL } from '../state/gql';
import { MatCard, MatCardModule } from '@angular/material/card'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { CommonModule } from '@angular/common';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
@Component({
  selector: 'app-node',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],

})
export class NodeComponent implements AfterViewInit, OnChanges {

  @Input()
  public node!: Partial<Node>

  public isBooting$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(protected readonly wakeNode: WakeNodeGQL) {}

  ngAfterViewInit(): void {
    this.setBootingFromNode()
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setBootingFromNode()
  }

  protected setBootingFromNode() {
    if (!this.node.status) return
    if ([NodeStatus.Offline, NodeStatus.Online].includes(this.node.status)) return this.isBooting$.next(false)
    this.isBooting$.next(true)
  }

  public async bootNode() {
    if (this.isBooting$.value) return
    this.isBooting$.next(true);

    const wake = await firstValueFrom(this.wakeNode.mutate({ node: WakableNodes.Desktop }))

    if (wake.errors) {
      console.error(wake)
      this.isBooting$.next(false)
    }
  }
}
