import { convertToSecondsOrMinutes } from "@/utils";
import type { CSSProperties } from "react";

const FullFrame = {
  width: "100%",
  height: "100%",
} as CSSProperties;

const FlexCss = {
  display: "flex",
} as CSSProperties;

const FlexColumnCss = {
  ...FullFrame,
  display: "flex",
  flexDirection: "column",
} as CSSProperties;

const FlexCenterCss = {
  alignItems: "center",
  justifyContent: "center",
} as CSSProperties;

interface FrameWrapperProps {
  children: string | JSX.Element;
  customStyle?: CSSProperties;
}
export const FrameWrapper = (props: FrameWrapperProps) => {
  const customStyle = props.customStyle || {};
  return (
    <div
      style={{
        background: "#fff",
        ...FlexColumnCss,
        ...FlexCenterCss,
        ...customStyle,
      }}
    >
      {props.children}
    </div>
  );
};

export const TextFrame = (props: { text: string }) => {
  return (
    <FrameWrapper>
      <div
        style={{
          fontSize: 60,
          color: "#000",
        }}
      >
        {props.text}
      </div>
    </FrameWrapper>
  );
};

export const ResultFrameImage = (props: { timeSpent: number }) => {
  const { timeSpent } = props;
  return (
    <FrameWrapper>
      <div
        style={{
          ...FlexColumnCss,
          ...FlexCenterCss,
          fontSize: 60,
          color: "#000",
          gap: 20,
        }}
      >
        <div
          style={{
            ...FlexCss,
          }}
        >
          Total Time Spent: {convertToSecondsOrMinutes(timeSpent)}
        </div>
        <div
          style={{
            ...FlexCss,
          }}
        >
          HeartBit Minted: {timeSpent * 10}
        </div>
      </div>
    </FrameWrapper>
  );
};
