import { NextRequest, NextResponse } from "next/server";
import { getFarcasterFrameData, getLensterFrameData } from "@/utils";

import {
  FrameButtonMetadata,
  getFrameHtmlResponse,
} from "@coinbase/onchainkit";
import { AppName, FrameState } from "@/types";

const { HOST } = process.env;

async function getResponse(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);

  const appName = searchParams.get("app") || AppName.FARCASTER;
  const frameData =
    appName === AppName.FARCASTER
      ? await getFarcasterFrameData(req)
      : await getLensterFrameData(req);

  if (!frameData) return new NextResponse(null, { status: 500 });

  const { owner, username, buttonIndex } = frameData;

  const frameState =
    (searchParams.get("frameState") as FrameState) || FrameState.Idle;
  const startTime = searchParams.get("startTime");
  const isComplete = frameState === FrameState.Completed;

  if (isComplete) {
    // mintMangaNFT({
    //   account: owner,
    //   startTime: Math.floor(startTimeInMillis / 1000),
    //   endTime: Math.floor(endTimeInMillis / 1000),
    // }).catch(console.error);

    return new NextResponse(
      getFrameHtmlResponse({
        image: {
          src: `${HOST}/image?isComplete=true&app=${appName}`,
          aspectRatio: "1:1",
        },
      })
    );
  }

  if (frameState === FrameState.Idle) {
    return new NextResponse(
      getFrameHtmlResponse({
        image: {
          src: `${HOST}/image?app=${appName}`,
        },
        postUrl: `${HOST}/frame?app=${appName}`,
      })
    );
  }

  const buttons = [
    { label: "Reload", action: "post" } as FrameButtonMetadata,
    { label: "Mint HeartBit", action: "post" } as FrameButtonMetadata,
  ];

  return new NextResponse(
    getFrameHtmlResponse({
      buttons: buttons as any,
      image: {
        src: `${HOST}/image?app=${appName}`,
      },
      postUrl: `${HOST}/frame?app=${appName}`,
    })
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
