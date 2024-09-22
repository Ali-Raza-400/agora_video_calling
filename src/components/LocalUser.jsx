import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "react";

export const LocalUser = observer(function LocalUser({ className, localUser }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (localUser.cameraOn && localUser.cameraTrack && videoRef.current) {
      // Play local user's video in the video element
      localUser.cameraTrack.play(videoRef.current);
    } else if (videoRef.current) {
      // If the camera is off, stop the video playback
      localUser.cameraTrack?.stop();
    }
  }, [localUser.cameraOn, localUser.cameraTrack]);

  const handleToggleMic = () => {
    localUser.setMic(!localUser.micOn);
  };

  const handleToggleCamera = () => {
    localUser.setCamera(!localUser.cameraOn);
  };

  return (
    <div className={className}>
      <div className="local-user">
        <img src={localUser.avatar} alt="User Avatar" />
        <span className="user-name">{localUser.name}</span>

        <div className="video-container">
          {localUser.cameraOn ? (
            <video ref={videoRef} autoPlay playsInline muted></video>
          ) : (
            <div className="video-off">Camera Off</div>
          )}
        </div>

        {localUser.micOn ? (
          <button onClick={handleToggleMic}>Mute</button>
        ) : (
          <button onClick={handleToggleMic}>Unmute</button>
        )}

        {localUser.cameraOn ? (
          <button onClick={handleToggleCamera}>Stop Video</button>
        ) : (
          <button onClick={handleToggleCamera}>Start Video</button>
        )}
      </div>
    </div>
  );
});
