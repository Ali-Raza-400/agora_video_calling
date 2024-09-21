import AgoraRTC from "agora-rtc-react";
import { makeAutoObservable } from "mobx";
import { SideEffectManager } from "side-effect-manager";

import { appId, channel, token } from "../components/constants";

export const ShareScreenUID = 10;

export class ShareScreen {
  constructor() {
    this._sideEffect = new SideEffectManager();
    this.uid = ShareScreenUID;
    this.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    this.enabled = false;
    this.localAudioTrack = null;
    this.localVideoTrack = null;
    this.remoteAudioTrack = null;
    this.remoteVideoTrack = null;

    makeAutoObservable(this);
  }

  get isRunning() {
    return this.enabled || this.remoteVideoTrack != null;
  }

  updateMainClient(client) {
    this._sideEffect.add(() => {
      if (client && client.uid) {
        // Subscribe to "user-published" event
        client.on("user-published", async (user, mediaType) => {
          if (user.uid !== this.uid || this.enabled) return;
          const track = await client.subscribe(user, mediaType);
          this.setRemoteTrack(track, mediaType);
        });

        // Subscribe to "user-unpublished" event
        client.on("user-unpublished", (user, mediaType) => {
          if (user.uid !== this.uid) return;
          this.setRemoteTrack(null, mediaType);
        });

        return () => {
          // Clean up event listeners when the client is disposed
          client.off("user-published");
          client.off("user-unpublished");
        };
      } else {
        return null;
      }
    }, "update-client");
  }

  setRemoteTrack(track, mediaType) {
    if (mediaType === "audio") {
      this.remoteAudioTrack = track;
    } else {
      this.remoteVideoTrack = track;
    }
  }

  async dispose() {
    this._sideEffect.flushAll();
    if (this.remoteVideoTrack) {
      this.remoteVideoTrack.stop();
      this.remoteVideoTrack = null;
    }
    if (this.remoteAudioTrack) {
      this.remoteAudioTrack.stop();
      this.remoteAudioTrack = null;
    }
    await this.disable();
  }

  async enable() {
    if (this.remoteVideoTrack) {
      throw new Error("remote screen video track already exists");
    }

    if (this._pTogglingShareScreen) {
      await this._pTogglingShareScreen;
    }

    if (!this.localVideoTrack) {
      let resolve;
      this._pTogglingShareScreen = new Promise(resolve_ => {
        resolve = resolve_;
      });

      try {
        await this.createLocalTracks();
      } catch {
        resolve();
        this._pTogglingShareScreen = undefined;
        return;
      }
      await this.client.join(appId, channel, token, ShareScreenUID);
      await this.client.publish(this._getLocalTracks());

      resolve();
      this._pTogglingShareScreen = undefined;
    }

    this.enabled = true;
  }

  async disable() {
    this.enabled = false;

    if (this._pTogglingShareScreen) {
      await this._pTogglingShareScreen;
    }

    if (this.localVideoTrack) {
      let resolve;
      this._pTogglingShareScreen = new Promise(resolve_ => {
        resolve = resolve_;
      });

      await this.client.unpublish(this._getLocalTracks());
      this.localVideoTrack.close();
      this.localVideoTrack = null;
      if (this.localAudioTrack) {
        this.localAudioTrack.close();
        this.localAudioTrack = null;
      }
      await this.client.leave();

      resolve();
      this._pTogglingShareScreen = undefined;
    }
  }

  async createLocalTracks() {
    const ret = await AgoraRTC.createScreenVideoTrack({}, "auto");
    if (Array.isArray(ret)) {
      [this.localVideoTrack, this.localAudioTrack] = ret;
    } else {
      this.localVideoTrack = ret;
      this.localAudioTrack = null;
    }
    this.localVideoTrack.once("track-ended", () => this.disable());
  }

  _getLocalTracks() {
    return [this.localAudioTrack, this.localVideoTrack].filter(Boolean);
  }
}
