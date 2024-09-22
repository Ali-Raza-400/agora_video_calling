import { RemoteUser } from "agora-rtc-react";
import { observer } from "mobx-react-lite";

import { appStore } from "../stores/app.store";

// import { Controls } from "./Control";
import { LocalUser } from "./LocalUser";
import { ShareScreenTracks } from "./shareScreenTrack";
import { Users } from "./Users";
import './Room.css'



import { clsx } from "clsx";
// import { observer } from "mobx-react-lite";

// import { appStore } from "../stores/app.store";

export const Room = observer(function Room() {
  const { localUser, remoteUsers } = appStore.users;
console.log("localUser::::====>",localUser);
  return (
    <div className="room">
      <div className="tabs">
        <div className="tab">
          <div className="tracks layout" data-size={remoteUsers.length + (localUser ? 1 : 0)}>
            {localUser && <LocalUser className="layout-item" localUser={localUser} />}
            {remoteUsers.map(user => (
              <div className="layout-item" key={user.uid}>
                <RemoteUser
                  cover={user.avatar}
                  playAudio={user.micOn}
                  playVideo={user.cameraOn}
                  user={user.rtcUser}
                >
                  <span className="user-name">{user.name}</span>
                </RemoteUser>
              </div>
            ))}
            <ShareScreenTracks />
          </div>
          {localUser && <Controls localUser={localUser} />}
        </div>
        <Users />
      </div>
    </div>
  );
});




export const Controls = observer(function Controls({ localUser }) {
  
  const { shareScreen } = appStore;
console.log("localUser::::",localUser);
  return (
    <div className="controls">
      <button
        className={clsx("btn", { active: localUser.micOn })}
        onClick={() => localUser.setMic(!localUser.micOn)}
      >
        {localUser.micOn ? (
          <i className="i-mdi-microphone" />
        ) : (
          <i className="i-mdi-microphone-off" />
        )}
        <span className="btn-text">{localUser.micOn ? "Mute" : "Unmute"}</span>
      </button>
      <button
        className={clsx("btn", { active: localUser.cameraOn })}
        onClick={() => localUser.setCamera(!localUser.cameraOn)}
      >
        {localUser.cameraOn ? <i className="i-mdi-video" /> : <i className="i-mdi-video-off" />}
        <span className="btn-text">Video</span>
      </button>
      <div className="flex-1" />
      <button
        className={clsx("btn", { active: shareScreen.enabled })}
        disabled={shareScreen.remoteVideoTrack != null}
        onClick={() => (shareScreen.enabled ? shareScreen.disable() : shareScreen.enable())}
      >
        <i className="i-mdi-arrow-up-bold-box" />
        <span className="btn-text">Share Screen</span>
      </button>
      <div className="flex-1" />
      <button className="btn btn-quit" onClick={() => appStore.leave()}>
        <i className="i-mdi-exit-to-app" />
        <span className="btn-text">Quit</span>
      </button>
    </div>
  );
});

