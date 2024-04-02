import { convertToSecondsOrMinutes } from "@/utils";
import { TextFrame, ResultFrameImage } from "./FrameComponents";

export const InitialFrame = () => <TextFrame text="Press start to begin!" />;

export const ProgressFrame = (props: { timeSpent: string }) => {
  const { timeSpent } = props;
  return (
    <TextFrame
      text={`You have spent ${timeSpent || "1 second"} on this frame`}
    />
  );
};

export const ResultFrame = (props: { startTime: number; endTime: number }) => {
  const { startTime, endTime } = props;
  const elapsedTime = Math.floor((endTime - startTime) / 1000);
  return <ResultFrameImage timeSpent={elapsedTime} />;
};
