import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { GameStatus, GetGamesQuery, TurnOnGameGQL } from '../state/gql';
import { firstValueFrom } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-game-poster',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatSlideToggleModule, MatProgressSpinnerModule],
  templateUrl: './game-poster.component.html',
  styleUrls: ['./game-poster.component.scss']
})
export class GamePosterComponent {

  @Input()
  public game!: GetGamesQuery['games'][0]

  public get cannotToggle(): boolean {
    return this.game.online || this.game.status === GameStatus.Starting
  }

  public get isStarting(): boolean {
    return this.game.online === false && this.game.status === GameStatus.Starting
  }

  constructor(
    protected readonly turnOnGame: TurnOnGameGQL
  ) { }

  public async toggleGame(event: MatSlideToggleChange) {
    if (event.checked === true) {
      await firstValueFrom(this.turnOnGame.mutate(
        { gameId: this.game.id },
        { optimisticResponse: { turnOnServer: { success: true, game: { ...this.game, status: GameStatus.Starting } } } }))
    } else {
      // no-op currently
    }

  }

}
