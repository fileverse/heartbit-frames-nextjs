// import { Button, FrameContext } from "frog";

import { convertToSecondsOrMinutes } from "@/utils";
import { TextFrame, ResultFrameImage } from "./FrameComponents";

export const InitialFrame = () => <TextFrame text="Press start to begin!" />;

export const ProgressFrame = (props: { startTime: number }) => {
  const { startTime } = props;
  const currentTime = Date.now();
  const elapsedTime = Math.floor((currentTime - startTime) / 1000);
  const timeSpent = convertToSecondsOrMinutes(elapsedTime);
  return <TextFrame text={`You have spent ${timeSpent} on this frame`} />;
};

export const ResultFrame = (props: { startTime: number; endTime: number }) => {
  const { startTime, endTime } = props;
  const elapsedTime = Math.floor((endTime - startTime) / 1000);
  return <ResultFrameImage timeSpent={elapsedTime} />;
};
