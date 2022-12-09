import { Component, Input } from '@angular/core';
import { Node } from '../state/gql';
import { MatCard, MatCardModule } from '@angular/material/card'

@Component({
  selector: 'app-node',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.scss'],
  standalone: true,
  imports: [MatCardModule],

})
export class NodeComponent {

  @Input()
  public node!: Partial<Node>

}
