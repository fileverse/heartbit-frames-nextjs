import { NextRequest, NextResponse } from "next/server";
import satori from "satori";
import sharp from "sharp";
import { getImageOptions } from "@/utils";
import { FrameState } from "@/types";
import { InitialFrame, ProgressFrame, ResultFrame } from "../components";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const frameState =
      (searchParams.get("frameState") as FrameState) || FrameState.Idle;
    const isComplete = frameState === FrameState.Completed;
    const startTime = searchParams.get("startTime") || "0";
    const endTime = searchParams.get("endTime") || "0";

    if (isComplete) {
      return await sendImageResponse(
        <ResultFrame
          startTime={parseInt(startTime)}
          endTime={parseInt(endTime)}
        />
      );
    }

    if (frameState === FrameState.Started) {
      return sendImageResponse(
        <ProgressFrame startTime={parseInt(startTime)} />
      );
    }

    return sendImageResponse(<InitialFrame />);
  } catch (err) {
    console.log(err);
    return new NextResponse(null, { status: 500 });
  }
}

const sendImageResponse = async (children: React.ReactNode) => {
  const svg = await satori(children, getImageOptions("landscape"));

  const pngBuffer = await sharp(Buffer.from(svg)).toFormat("png").toBuffer();

  return new NextResponse(pngBuffer, {
    headers: {
      "Content-Type": "image/png",
    },
  });
};
