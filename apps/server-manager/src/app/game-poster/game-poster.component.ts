import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Game, GetGamesQuery, Maybe } from '../state/gql';

@Component({
  selector: 'app-game-poster',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatSlideToggleModule],
  templateUrl: './game-poster.component.html',
  styleUrls: ['./game-poster.component.scss']
})
export class GamePosterComponent {

  @Input()
  public game!: GetGamesQuery['games'][0]

}
