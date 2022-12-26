import { AfterViewInit, Component } from '@angular/core';
import { OnModuleInit } from '@nestjs/common';
import { map } from 'rxjs';
import { GetGamesGQL, GetNodesGQL, WatchStatusChangeGQL } from './state/gql';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'server-manager';

  public readonly nodes$ = this.getNodes
    .watch({})
    .valueChanges
    .pipe(map((result) => result.data.nodes));


  public readonly games$ = this.getGames
    .watch({})
    .valueChanges
    .pipe(map((result) => result.data.games));

  constructor(
    protected readonly getNodes: GetNodesGQL,
    protected readonly getGames: GetGamesGQL,
    protected readonly watch: WatchStatusChangeGQL
  ) {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.watch.watch({}, { pollInterval: 5000 }).valueChanges.subscribe()
    }, 5000)
  }
}
