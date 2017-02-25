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

import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { UUID } from 'angular2-uuid';
import { Friend, FirebaseService, Snap } from '../firebase.service';
import { State } from '../app.component';

declare var Webcam: any;

@Component({
  selector: 'app-send-snap',
  templateUrl: './send-snap.component.html',
  styleUrls: ['./send-snap.component.css']
})
export class SendSnapComponent implements OnInit {
  imageSrc: SafeStyle;
  snap: Snap = {url: '', message: '', duration: 3};
  viewFriends: boolean = false;
  selectedFriends: string[] = [];

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly firebaseService: FirebaseService) { }

  @Input() viewSnaps: Function;
  ngOnInit() {
    const options = {
      width: window.innerWidth,
      height: window.innerHeight,
      image_format: 'jpeg',
      jpeg_quality: 90
    }
    Webcam.set(options);
    Webcam.attach('#camera');
  }

  ngOnDestroy() {
    Webcam.reset();
  }

  takePhoto() {
    Webcam.snap((dataUri: string) => {
      const ref = this.firebaseService.firebaseApp.storage()
        .ref(`snaps/${this.firebaseService.currentUser.uid}/`);
      const imageName: string = UUID.UUID() + '.jpg';

      ref.child(imageName).putString(dataUri, 'data_url')
        .then((snapshot: firebase.storage.UploadTaskSnapshot) => {
          this.snap.url = snapshot.downloadURL;
        });

      this.imageSrc = this.sanitizer.bypassSecurityTrustStyle(`url('${dataUri}')`);
      Webcam.reset();
    });
  }

  getFriends(): Friend[] {
    return this.firebaseService.friends;
  }

  toggleFriend(uid: string) {
    const idx = this.selectedFriends.indexOf(uid);
    if (idx > -1) {
      this.selectedFriends.splice(idx, 1);
    } else {
      this.selectedFriends.push(uid);
    }
  }

  sendSnapToFriends() {
    this.selectedFriends.forEach(friendId => {
      const ref = this.firebaseService.firebaseApp.database()
        .ref(`snaps/${friendId}/snaps/${this.firebaseService.currentUser.uid}/`);
      ref.push(this.snap);
    });
    this.viewSnaps();
  }
}
