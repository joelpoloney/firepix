/*
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { CONFIG } from '../firebase.config';

export type Snap = {
    url: string;
    message: string;
    duration: number;
}

export declare interface Friend {
  key: string,
  name: string
}

export declare interface FriendSnap {
  userName: string,
  userId: string,
  snaps: {[key: string]: Snap}
}

@Injectable()
export class FirebaseService {
  initialized: boolean = false;
  firebaseApp: firebase.app.App;
  currentUser: firebase.User;

  friendsRef: firebase.database.Reference;
  snapsRef: firebase.database.Reference;
  friends: Friend[] = [];
  friendSnaps: FriendSnap[] = [];

  constructor() {
    this.firebaseApp = firebase.initializeApp(CONFIG);
    this.firebaseApp.auth().onAuthStateChanged((user: firebase.User) => {
      if (user && this.currentUser && user.uid == this.currentUser.uid) {
        return;
      }

      this.currentUser = user;
      this.initialized = true;

      if (this.currentUser) {
        this.setupFriends();
        this.setupSnaps();
      } else {
        if (this.friendsRef) {
          this.friendsRef.off('child_added');
          this.friendsRef.off('child_removed');
        }
        if (this.snapsRef) {
          this.snapsRef.off('child_added');
          this.snapsRef.off('child_changed');
          this.snapsRef.off('child_removed');
        }
        this.friends = [];
        this.friendSnaps = [];
      }
    });
  }

  setupFriends() {
    this.friendsRef = this.firebaseApp.database()
      .ref(`snaps/${this.currentUser.uid}/friends`);

    this.friendsRef.on('child_added', (data: firebase.database.DataSnapshot) => {
      const newFriend: Friend = {key: data.key, name: data.val()};
      this.friends = [...this.friends, newFriend].sort((a, b): number => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      });
    });
    this.friendsRef.on('child_removed', (data: firebase.database.DataSnapshot) => {
      this.friends = this.friends.filter((friend: Friend) => friend.key != data.key);
    });
  }

  setupSnaps() {
    this.snapsRef = this.firebaseApp.database()
      .ref(`snaps/${this.currentUser.uid}/snaps`);

    this.snapsRef.on('child_added', (data: firebase.database.DataSnapshot) => {
      const friendId: string = data.key;
      const friendSnap: FriendSnap = {
        userName: '',
        userId: friendId,
        snaps: data.val()
      };
      this.getFriendName(friendId).then(userName => friendSnap.userName = userName);
      this.friendSnaps.push(friendSnap);
    });

    this.snapsRef.on('child_changed', (data: firebase.database.DataSnapshot) => {
      const friendSnap: FriendSnap =
        this.friendSnaps.filter(friendSnap => friendSnap.userId == data.key)[0];
      friendSnap.snaps = data.val();
    });

    this.snapsRef.on('child_removed', (data: firebase.database.DataSnapshot) => {
      this.friendSnaps = this.friendSnaps.filter(friendSnap => friendSnap.userId != data.key);
    });
  }

  deleteSnap(snapId: string, friendId: string) {
    this.snapsRef.child(`${friendId}/${snapId}`).remove();
  }

  addFriend(userName: string) {
    this.getUserId(userName).then(userId => {
      if (userId) {
        this.friendsRef.child(userId).set(userName);
      }
    });
  }

  removeFriend(entryId: string) {
    this.friendsRef.child(entryId).remove();
  }

  getFriendName(friendId: string): firebase.Promise<string> {
    return this.firebaseApp.database()
      .ref(`users/${friendId}`)
      .once('value')
      .then((snapshot: firebase.database.DataSnapshot) => {
        return snapshot.val();
      });
  }

  getUserId(userName: string): firebase.Promise<string> {
    return this.firebaseApp.database()
      .ref('users')
      .orderByValue()
      .equalTo(userName)
      .once('value')
      .then((snapshot: firebase.database.DataSnapshot) => {
        const matchedUsers = snapshot.val();
        for (let userId in matchedUsers) {
          if (matchedUsers[userId] == userName) {
            return userId;
          }
        }
        return null;
      });
  }

  createUser(userName: string, email: string, password: string): firebase.Promise<any> {
    return this.getUserId(userName).then(userId => {
      if (userId == null) {
        this.firebaseApp.auth().createUserWithEmailAndPassword(email, password)
          .then((user: firebase.User) => {
            this.firebaseApp.database()
              .ref(`users/${user.uid}`)
              .set(userName);
          });
      } else {
        // TODO: handle error case later
      }
    });
  }

  login(email: string, password: string): firebase.Promise<any> {
    return this.firebaseApp.auth().signInWithEmailAndPassword(email, password);
  }

  logout() {
    this.firebaseApp.auth().signOut().then(() => this.currentUser = null);
  }

}
