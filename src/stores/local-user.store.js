import AgoraRTC from "agora-rtc-react";
import { makeAutoObservable } from "mobx";

import { fakeAvatar, fakeName } from "../utils";

export class MyLocalUser {
  constructor({ client, uid }) {
    this.client = client;
    this.uid = uid;
    this.name = fakeName(this.uid);
    this.avatar = fakeAvatar();
    this.micOn = false;
    this.cameraOn = false;
    this.micTrack = undefined;
    this.cameraTrack = undefined;

    makeAutoObservable(this);
  }

  setMic = (micOn) => {
    this.micOn = micOn;
    if (micOn && !this.micTrack) {
      this.createLocalMicTrack().then(() => this.setMic(this.micOn));
    }
    if (this.micTrack) {
      this.micTrack.setEnabled(micOn);
    }
  };

  setCamera = (cameraOn) => {
    this.cameraOn = cameraOn;
    if (cameraOn && !this.cameraTrack) {
      this.createLocalCameraTrack().then(() => this.setCamera(this.cameraOn));
    }
    if (this.cameraTrack) {
      this.cameraTrack.setEnabled(cameraOn);
    }
  };

  async createLocalMicTrack() {
    if (this.client && !this.micTrack) {
      const track = await AgoraRTC.createMicrophoneAudioTrack({
        AEC: true,
        ANS: true,
      });
      await this.client.publish(track);
      this.updateLocalMicTrack(track);
    }
    if (this.micTrack) {
      return this.micTrack;
    }
    return Promise.reject();
  }

  updateLocalMicTrack(track) {
    this.micTrack = track;
  }

  async createLocalCameraTrack() {
    if (this.client && !this.cameraTrack) {
      const track = await AgoraRTC.createCameraVideoTrack();
      await this.client.publish(track);
      this.updateLocalCameraTrack(track);
    }
    if (this.cameraTrack) {
      return this.cameraTrack;
    }
    return Promise.reject();
  }

  updateLocalCameraTrack(track) {
    this.cameraTrack = track;
  }

  dispose() {
    if (this.micTrack) {
      this.micTrack.stop();
      this.micTrack.close();
      this.micTrack = undefined;
    }
    if (this.cameraTrack) {
      this.cameraTrack.stop();
      this.cameraTrack.close();
      this.cameraTrack = undefined;
    }
  }
}
