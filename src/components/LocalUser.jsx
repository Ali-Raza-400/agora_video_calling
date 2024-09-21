import { observer } from "mobx-react-lite";

export const LocalUser = observer(function LocalUser({ className, localUser }) {
  console.log("Microphone On:", localUser.micOn);
  console.log("Camera On:", localUser.cameraOn);
  return (
    <div className={className}>
      <div className="local-user">
        <img src={localUser.avatar} alt="User Avatar" />
        <span className="user-name">{localUser.name}</span>
        {localUser.micOn ? (
          <button onClick={() => localUser.setMic(false)}>Mute</button>
        ) : (
          <button onClick={() => localUser.setMic(true)}>Unmute</button>
        )}
        {localUser.cameraOn ? (
          <button onClick={() => localUser.setCamera(false)}>Stop Video</button>
        ) : (
          <button onClick={() => localUser.setCamera(true)}>Start Video</button>
        )}
      </div>
    </div>
  );
});
