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
};

export type Mutation = {
  __typename?: 'Mutation';
  connectVPN: Nordvpn;
  turnOffServer: Scalars['Boolean'];
  turnOnServer: Scalars['Boolean'];
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
};

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


export type GetGamesQuery = { __typename?: 'Query', games: Array<{ __typename?: 'Game', id: string, name: string, online: boolean, image?: string | null, node?: { __typename?: 'Node', id: string, name: string, online: boolean } | null }> };

export type GetNodesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetNodesQuery = { __typename?: 'Query', nodes: Array<{ __typename?: 'Node', name: string, online: boolean }> };

export type WakeNodeMutationVariables = Exact<{
  node: WakableNodes;
}>;


export type WakeNodeMutation = { __typename?: 'Mutation', wakeNode: { __typename?: 'WakeResult', success: boolean, active: boolean } };

export type WatchStatusChangeQueryVariables = Exact<{ [key: string]: never; }>;


export type WatchStatusChangeQuery = { __typename?: 'Query', nodes: Array<{ __typename?: 'Node', id: string, online: boolean, games: Array<{ __typename?: 'Game', id: string, online: boolean }> }> };

export const GetGamesDocument = gql`
    query getGames {
  games {
    id
    name
    online
    image
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
export const GetNodesDocument = gql`
    query getNodes {
  nodes {
    name
    online
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
    games {
      id
      online
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