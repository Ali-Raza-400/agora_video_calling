import { observer } from "mobx-react-lite";
import { useState } from "react";

import { appId, channel, token } from "./constants";
import { appStore } from "../stores/app.store";
import { useSafePromise } from "../utils";

import { RoomInfo } from "./RoomInfo";

// Home component
export const Home = observer(function Home() {
  const sp = useSafePromise();
  const [isLoading, setLoading] = useState(false);

  const joinChannel = () => {
    setLoading(true);
    sp(appStore.join(appId, channel, token))
      .then(() => {
        setLoading(false);
        console.log("Successfully joined the channel.");
      })
      .catch(() => {
        setLoading(false);
        console.error("Error joining the channel.");
      });
  };
  
  const startScreenShare = async () => {
    try {
      if (!appStore.client) {
        console.error("Agora client is not initialized.");
        return;
      }
  
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
  
      console.log("stream:::", stream);
      await appStore.client.publish(stream);
      console.log("Screen sharing started");
    } catch (error) {
      console.error("Error starting screen share:", error);
    }
  };
  
  return (
    <div className="home" hidden={!!appStore.client}>
      <div className="bg">
        <div className="bg-row">Agora</div>
        <div className="bg-row">RTC</div>
        <div className="bg-row">React</div>
      </div>
      <div className="buttons">
        <NewButton />
        <JoinButton isLoading={isLoading} onClick={joinChannel} />
        <ScheduleButton />
        <ScreenShareButton onClick={startScreenShare} />
      </div>
      <RoomInfo onJoin={joinChannel} />
    </div>
  );
});

// JoinButton component
export function JoinButton({ onClick, isLoading }) {
  return (
    <button className="btn" disabled={isLoading} onClick={onClick}>
      <div className="btn-icon">
        {isLoading ? (
          <i className="i-mdi-loading" />
        ) : (
          <i className="i-mdi-plus-box" />
        )}
      </div>
      <div className="btn-text">Join</div>
    </button>
  );
}

// NewButton component
export function NewButton() {
  return (
    <button className="btn" disabled>
      <div className="btn-icon new">
        <i className="i-mdi-video" />
      </div>
      <div className="btn-text">New</div>
    </button>
  );
}

// ScheduleButton component
export function ScheduleButton() {
  return (
    <button className="btn" disabled>
      <div className="btn-icon">
        <i className="i-mdi-calendar" />
      </div>
      <div className="btn-text">Schedule</div>
    </button>
  );
}

// ScreenShareButton component
export function ScreenShareButton({ onClick }) {
  return (
    <button className="btn" onClick={onClick}>
      <div className="btn-icon">
        <i className="i-mdi-arrow-up-bold-box" />
      </div>
      <div className="btn-text">Share Screen</div>
    </button>
  );
}
