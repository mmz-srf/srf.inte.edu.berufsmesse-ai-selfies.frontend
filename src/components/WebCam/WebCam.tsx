import React from "react";
import Webcam from "react-webcam";

interface WebcamCaptureProps {
  width?: number;
  height?: number;
  screenshotFormat?: "image/png";
}

// TODO: Adjust output size when we know what we need
const WebcamCapture = React.forwardRef<Webcam, WebcamCaptureProps>(
  ({ width = 320, height = 240, screenshotFormat = "image/png" }, ref) => {
    return (
      <Webcam
        audio={false}
        ref={ref}
        screenshotFormat={screenshotFormat}
        videoConstraints={{ facingMode: "user" }}
        style={{ width, height, borderRadius: 16, boxShadow: "0 0 20px rgba(0,0,0,0.4)", transform: "scaleX(-1)", objectFit: "cover", backgroundColor: "#D9D9D9" }}
      />
    );
  }
);

export default WebcamCapture;
