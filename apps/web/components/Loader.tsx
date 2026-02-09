import React from "react";
import MountainWithStars from "./MountainWithStars";

interface LoaderProps {
  fullScreen?: boolean;
}

export default function Loader({ fullScreen = true }: LoaderProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <MountainWithStars />
      </div>
    );
  }

  return <MountainWithStars />;
}
