import AgoraRTC from "agora-rtc-react";
import { makeAutoObservable } from "mobx";

import { ShareScreen } from "./share-screen.store";
import { Users } from "./users.store"

AgoraRTC.setLogLevel(2);

class AppStore {
  client = null;
  users = new Users();
  shareScreen = new ShareScreen();

  get uid() {
    return this.client?.uid;
  }

  constructor() {
    this.users.localUIDs.push(this.shareScreen.uid);
    makeAutoObservable(this);
  }

  async join(appid, channel, token) {
    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    await client.join(appid, channel, token, null);
    this._updateClient(client);
  }

  async leave() {
    this.users.dispose();
    await this.shareScreen.dispose();
    const client = this.client;
    if (client) {
      await client.leave();
      this._updateClient(null);
    }
  }

  _updateClient(client) {
    this.client = client;
    this.users.updateClient(client);
    this.shareScreen.updateMainClient(client);
  }
}

export const appStore = new AppStore();

if (import.meta.env.DEV) {
  window.appStore = appStore;
}
