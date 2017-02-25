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

import { Component, ViewChild } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { SendSnapComponent } from './send-snap/send-snap.component';

export enum State {
  ViewSnaps,
  ViewFriends,
  TakeSnap,
  EditSnap
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  currentState: State = State.ViewSnaps;
  State: typeof State = State;

  @ViewChild(SendSnapComponent)
  private sendSnapComponent: SendSnapComponent;

  constructor(private readonly firebaseService: FirebaseService) { }

  isInitialized(): boolean {
    return this.firebaseService.initialized;
  }

  isLoggedIn(): boolean {
    return !!this.firebaseService.currentUser;
  }

  hasFriends(): boolean {
    return this.firebaseService.friends.length > 0;
  }

  isTakingSnap(): boolean {
    return this.currentState == State.TakeSnap || this.currentState == State.EditSnap;
  }

  onLogout() {
    this.firebaseService.logout();
  }

  takeSnap() {
    this.currentState = State.EditSnap;
    this.sendSnapComponent.takePhoto();
  }

  viewSnaps() {
    return () => this.currentState = State.ViewSnaps;
  }
}
