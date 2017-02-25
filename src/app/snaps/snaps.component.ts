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

import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { FriendSnap, FirebaseService, Snap } from '../firebase.service';

declare interface QueuedSnap {
  snapId: string,
  snap: Snap
}

@Component({
  selector: 'app-snaps',
  templateUrl: './snaps.component.html',
  styleUrls: ['./snaps.component.css']
})
export class SnapsComponent implements OnInit {
  viewingPaused: boolean = false;
  viewingFriendId: string = '';
  viewingSnap: Snap;
  viewingImageSrc: SafeStyle;
  private queuedSnaps: QueuedSnap[] = [];

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly firebaseService: FirebaseService) { }

  ngOnInit() { }

  getFriendSnaps(): FriendSnap[] {
    return this.firebaseService.friendSnaps;
  }

  pauseViewing() {
    this.viewingPaused = true;
  }

  viewSnaps(friend: FriendSnap) {
    if (this.viewingFriendId != friend.userId) {
      this.viewingFriendId = friend.userId;
      this.queuedSnaps = [];
      for (let snapId in friend.snaps) {
        this.queuedSnaps.push({
          snapId: snapId,
          snap: friend.snaps[snapId]
        });
      }
    }
    if (this.viewingPaused) {
      this.viewingPaused = false;
    } else {
      this.pumpQueue();
    }
  }

  private pumpQueue() {
    if (!this.queuedSnaps.length) {
      this.viewingSnap = null;
      this.viewingFriendId = '';
      return;
    } else {
      const queuedSnap: QueuedSnap = this.queuedSnaps.shift();
      this.viewingSnap = queuedSnap.snap;
      this.viewingImageSrc =
        this.sanitizer.bypassSecurityTrustStyle(`url('${this.viewingSnap.url}')`);
      setTimeout(() => {
        this.firebaseService.deleteSnap(queuedSnap.snapId, this.viewingFriendId);
        if (!this.viewingPaused) {
          this.pumpQueue();
        }
      }, this.viewingSnap.duration * 1000);
    }
  }

}
