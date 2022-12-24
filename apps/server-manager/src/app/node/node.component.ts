import { Component, Input } from '@angular/core';
import { Node, WakableNodes, WakeNodeGQL } from '../state/gql';
import { MatCard, MatCardModule } from '@angular/material/card'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
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
export class NodeComponent {

  @Input()
  public node!: Partial<Node>

  public isBooting: boolean = false;

  constructor(protected readonly wakeNode: WakeNodeGQL) {}

  public async bootNode() {
    if (this.isBooting) return
    this.isBooting = true

    const wake = await firstValueFrom(this.wakeNode.mutate({ node: WakableNodes.Desktop }))

    if (wake.errors) {
      console.error(wake)
      this.isBooting = false
    }
  }
}
