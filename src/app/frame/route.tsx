import { NextRequest, NextResponse } from "next/server";
import {
  convertToSecondsOrMinutes,
  getFarcasterFrameData,
  getLensterFrameData,
} from "@/utils";
import { HeartBitCore, SupportedChain } from "@fileverse/heartbit-core";

import {
  FrameButtonMetadata,
  getFrameHtmlResponse,
} from "@coinbase/onchainkit";
import { AppName, FrameState } from "@/types";

const { HOST, NETWORK, API_KEY } = process.env;

async function getResponse(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);

  const appName = searchParams.get("app") || AppName.FARCASTER;
  const frameData =
    appName === AppName.FARCASTER
      ? await getFarcasterFrameData(req)
      : await getLensterFrameData(req);

  if (!frameData) return new NextResponse(null, { status: 500 });

  const { owner, buttonIndex } = frameData;

  const frameState =
    (searchParams.get("frameState") as FrameState) || FrameState.Idle;
  const startTime = searchParams.get("startTime") || "0";

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
    const endTime = Date.now();
    const frameState = FrameState.Completed;
    const coreSDK = new HeartBitCore({
      chain: NETWORK as SupportedChain,
    });

    const response = await coreSDK.unSignedMintHeartBit({
      address: owner,
      startTime: Math.floor(parseInt(startTime) / 1000),
      endTime: Math.floor(endTime / 1000),
      hash: "ipfs://cid", // ipfs hash of json file with metadata that you want for these nfts
      apiKey: API_KEY as string,
    });
    console.log(response);
    return new NextResponse(
      getFrameHtmlResponse({
        image: {
          src: `${HOST}/image?app=${appName}&frameState=${frameState}&startTime=${startTime}&endTime=${endTime}`,
        },
        postUrl: `${HOST}/frame?app=${appName}&frameState=${frameState}&startTime=${startTime}&endTime=${endTime}`,
        buttons: buttons as any,
      })
    );
  }

  const elapsedTime = Math.floor((Date.now() - parseInt(startTime)) / 1000);
  const timeSpent = convertToSecondsOrMinutes(elapsedTime);
  return new NextResponse(
    getFrameHtmlResponse({
      buttons: buttons as any,
      image: {
        src: `${HOST}/image?app=${appName}&startTime=${startTime}&frameState=${frameState}&timeSpent=${timeSpent}`,
      },
      postUrl: `${HOST}/frame?app=${appName}&startTime=${startTime}&frameState=${frameState}`,
    })
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
