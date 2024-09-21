import { makeAutoObservable } from "mobx";
import { fakeAvatar, fakeName } from "../utils";

/**
 * This class extracts fields from the AgoraRTCRemoteUser object so that mobx can track them.
 *
 * `uid`, `audioTrack`, `videoTrack` → same
 * `hasAudio` → `micOn`
 * `hasVideo` → `cameraOn`
 */
export class MyRemoteUser {
  constructor(rtcUser) {
    this.uid = rtcUser.uid;
    this.name = fakeName(rtcUser.uid);
    this.avatar = fakeAvatar();
    this.rtcUser = rtcUser;
    this.micOn = rtcUser.hasAudio;
    this.cameraOn = rtcUser.hasVideo;
    this.audioTrack = rtcUser.audioTrack;
    this.videoTrack = rtcUser.videoTrack;

    makeAutoObservable(this);
  }

  update(rtcUser) {
    this.rtcUser = rtcUser;
    this.micOn = rtcUser.hasAudio;
    this.cameraOn = rtcUser.hasVideo;
    this.audioTrack = rtcUser.audioTrack;
    this.videoTrack = rtcUser.videoTrack;
  }
}
