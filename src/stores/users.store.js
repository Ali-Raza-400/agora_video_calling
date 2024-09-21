import { makeAutoObservable, observable } from "mobx";
import { SideEffectManager } from "side-effect-manager";

import { MyLocalUser } from "./local-user.store";
import { MyRemoteUser } from "./remote-user.store";

export class Users {
  constructor() {
    this._remoteUsersMap = observable.map();
    this._sideEffect = new SideEffectManager();

    /** will not be included in `remoteUsers` and will not be subscribed */
    this.localUIDs = [];

    this.localUser = null;

    makeAutoObservable(this);
  }

  get remoteUsers() {
    return [...this._remoteUsersMap.values()];
  }

  updateClient(client) {
    this._sideEffect.add(() => {
      if (client && client.uid) {
        const localUser = new MyLocalUser({ client, uid: client.uid });
        this.localUser = localUser;

        // Register event listeners using Agora SDK's built-in methods
        const handleUserJoined = (user) => {
          if (this.localUIDs.includes(user.uid)) return;
          this._updateRemoteUser(user, true);
        };

        const handleUserLeft = (user) => {
          if (this.localUIDs.includes(user.uid)) return;
          this._deleteRemoteUser(user.uid);
        };

        const handleUserPublished = (user) => {
          if (user.uid === client.uid || this.localUIDs.includes(user.uid)) return;
          this._updateRemoteUser(user);
        };

        const handleUserUnpublished = (user) => {
          if (user.uid === client.uid || this.localUIDs.includes(user.uid)) return;
          this._updateRemoteUser(user);
        };

        // Listen for Agora events
        client.on("user-joined", handleUserJoined);
        client.on("user-left", handleUserLeft);
        client.on("user-published", handleUserPublished);
        client.on("user-unpublished", handleUserUnpublished);

        return () => {
          // Clean up event listeners when the client is disposed
          localUser.dispose();
          this.localUser = null;

          client.off("user-joined", handleUserJoined);
          client.off("user-left", handleUserLeft);
          client.off("user-published", handleUserPublished);
          client.off("user-unpublished", handleUserUnpublished);
        };
      } else {
        return null;
      }
    }, "update-client");
  }

  dispose() {
    this._sideEffect.flushAll();
    this.remoteUsers.forEach(({ rtcUser }) => {
      rtcUser.audioTrack?.stop();
      rtcUser.videoTrack?.stop();
    });
    this._remoteUsersMap.clear();
  }

  _updateRemoteUser(rtcUser, createIfNotExist) {
    const user = this._remoteUsersMap.get(rtcUser.uid);
    // trigger MobX updates
    if (user) {
      user.update(rtcUser);
    } else if (createIfNotExist) {
      this._remoteUsersMap.set(rtcUser.uid, new MyRemoteUser(rtcUser));
    }
  }

  _deleteRemoteUser(uid) {
    this._remoteUsersMap.delete(uid);
  }
}
