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

  const buttons = [
    { label: "Reload", action: "post" } as FrameButtonMetadata,
    { label: "Mint HeartBit", action: "post" } as FrameButtonMetadata,
  ];

  if (frameState === FrameState.Idle) {
    const startTime = Date.now();
    const frameState = FrameState.Started;
    return new NextResponse(
      getFrameHtmlResponse({
        image: {
          src: `${HOST}/image?app=${appName}&frameState=${frameState}&startTime=${startTime}`,
        },
        postUrl: `${HOST}/frame?app=${appName}&frameState=${frameState}&startTime=${startTime}`,
        buttons: buttons as any,
      })
    );
  }

  if (frameState === FrameState.Started && buttonIndex === 1) {
    return new NextResponse(
      getFrameHtmlResponse({
        image: {
          src: `${HOST}/image?app=${appName}&frameState=${frameState}&startTime=${startTime}`,
        },
        postUrl: `${HOST}/frame?app=${appName}&frameState=${frameState}&startTime=${startTime}`,
        buttons: buttons as any,
      })
    );
  }

  return new NextResponse(
    getFrameHtmlResponse({
      buttons: buttons as any,
      image: {
        src: `${HOST}/image?app=${appName}&startTime=${startTime}&frameState=${frameState}`,
      },
      postUrl: `${HOST}/frame?app=${appName}&startTime=${startTime}&frameState=${frameState}`,
    })
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
