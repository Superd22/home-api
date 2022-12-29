import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Game = {
  __typename?: 'Game';
  id: Scalars['ID'];
  image?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  node?: Maybe<Node>;
  online: Scalars['Boolean'];
  status: GameStatus;
};

export enum GameStatus {
  Offline = 'OFFLINE',
  Online = 'ONLINE',
  Starting = 'STARTING'
}

export type Mutation = {
  __typename?: 'Mutation';
  connectVPN: Nordvpn;
  turnOffServer: ToggleGameServer;
  turnOnServer: ToggleGameServer;
  wakeNode: WakeResult;
};


export type MutationConnectVpnArgs = {
  region: VpnRegion;
};


export type MutationTurnOffServerArgs = {
  gameId: Scalars['ID'];
};


export type MutationTurnOnServerArgs = {
  gameId: Scalars['ID'];
};


export type MutationWakeNodeArgs = {
  id: WakableNodes;
};

export type Node = {
  __typename?: 'Node';
  games: Array<Game>;
  id: Scalars['ID'];
  name: Scalars['String'];
  online: Scalars['Boolean'];
  status: NodeStatus;
};

export enum NodeStatus {
  Offline = 'OFFLINE',
  Online = 'ONLINE',
  Starting = 'STARTING'
}

export type Nordvpn = {
  __typename?: 'Nordvpn';
  region: Scalars['String'];
  serverName: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  games: Array<Game>;
  nodes: Array<Node>;
  test: Scalars['String'];
  version: Scalars['String'];
};

export type ToggleGameServer = {
  __typename?: 'ToggleGameServer';
  game: Game;
  success: Scalars['Boolean'];
};

export enum VpnRegion {
  Au = 'au',
  Ca = 'ca',
  Ch = 'ch',
  Uk = 'uk',
  Us = 'us'
}

export enum WakableNodes {
  Desktop = 'Desktop'
}

export type WakeResult = {
  __typename?: 'WakeResult';
  /** Wether or not the node is currently active. */
  active: Scalars['Boolean'];
  error?: Maybe<Scalars['String']>;
  success: Scalars['Boolean'];
};

export type GetGamesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetGamesQuery = { __typename?: 'Query', games: Array<{ __typename?: 'Game', id: string, name: string, online: boolean, image?: string | null, status: GameStatus, node?: { __typename?: 'Node', id: string, name: string, online: boolean } | null }> };

export type TurnOffGameMutationVariables = Exact<{
  gameId: Scalars['ID'];
}>;


export type TurnOffGameMutation = { __typename?: 'Mutation', turnOffServer: { __typename?: 'ToggleGameServer', success: boolean, game: { __typename?: 'Game', id: string, status: GameStatus, online: boolean } } };

export type TurnOnGameMutationVariables = Exact<{
  gameId: Scalars['ID'];
}>;


export type TurnOnGameMutation = { __typename?: 'Mutation', turnOnServer: { __typename?: 'ToggleGameServer', success: boolean, game: { __typename?: 'Game', id: string, status: GameStatus, online: boolean } } };

export type GetNodesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetNodesQuery = { __typename?: 'Query', nodes: Array<{ __typename?: 'Node', name: string, online: boolean, status: NodeStatus }> };

export type WakeNodeMutationVariables = Exact<{
  node: WakableNodes;
}>;


export type WakeNodeMutation = { __typename?: 'Mutation', wakeNode: { __typename?: 'WakeResult', success: boolean, active: boolean } };

export type WatchStatusChangeQueryVariables = Exact<{ [key: string]: never; }>;


export type WatchStatusChangeQuery = { __typename?: 'Query', nodes: Array<{ __typename?: 'Node', id: string, online: boolean, status: NodeStatus, games: Array<{ __typename?: 'Game', id: string, online: boolean, status: GameStatus }> }> };

export const GetGamesDocument = gql`
    query getGames {
  games {
    id
    name
    online
    image
    status
    node {
      id
      name
      online
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetGamesGQL extends Apollo.Query<GetGamesQuery, GetGamesQueryVariables> {
    document = GetGamesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const TurnOffGameDocument = gql`
    mutation turnOffGame($gameId: ID!) {
  turnOffServer(gameId: $gameId) {
    success
    game {
      id
      status
      online
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class TurnOffGameGQL extends Apollo.Mutation<TurnOffGameMutation, TurnOffGameMutationVariables> {
    document = TurnOffGameDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const TurnOnGameDocument = gql`
    mutation turnOnGame($gameId: ID!) {
  turnOnServer(gameId: $gameId) {
    success
    game {
      id
      status
      online
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class TurnOnGameGQL extends Apollo.Mutation<TurnOnGameMutation, TurnOnGameMutationVariables> {
    document = TurnOnGameDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetNodesDocument = gql`
    query getNodes {
  nodes {
    name
    online
    status
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetNodesGQL extends Apollo.Query<GetNodesQuery, GetNodesQueryVariables> {
    document = GetNodesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const WakeNodeDocument = gql`
    mutation wakeNode($node: WakableNodes!) {
  wakeNode(id: $node) {
    success
    active
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class WakeNodeGQL extends Apollo.Mutation<WakeNodeMutation, WakeNodeMutationVariables> {
    document = WakeNodeDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const WatchStatusChangeDocument = gql`
    query watchStatusChange {
  nodes {
    id
    online
    status
    games {
      id
      online
      status
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class WatchStatusChangeGQL extends Apollo.Query<WatchStatusChangeQuery, WatchStatusChangeQueryVariables> {
    document = WatchStatusChangeDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }