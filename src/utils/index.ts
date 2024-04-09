import { NextRequest } from "next/server";

import {
  FrameRequest,
  getFrameMessage,
  FrameMetadataType,
} from "@coinbase/onchainkit";
import { join } from "path";
import * as fs from "fs";
import type { FontStyle, FontWeight } from "satori";
import { gql, GraphQLClient } from "graphql-request";

const regularFontPath = join(process.cwd(), "/fonts/Nunito-Regular.ttf");
const boldFontPath = join(process.cwd(), "/fonts/Nunito-Bold.ttf");

export interface ResolvedFrameData {
  fid: number;
  buttonIndex: number;
  owner: string;
  username: string;
}

interface SizeMap {
  width: number;
  height: number;
}

const { LENSTER_GQL_API } = process.env;

export async function getFarcasterFrameData(
  req: NextRequest
): Promise<ResolvedFrameData | undefined> {
  try {
    const body: FrameRequest = await req.json();

    const { isValid, message } = await getFrameMessage(body as FrameRequest, {
      neynarApiKey: process.env.NEYNAR_API_KEY,
    });
    if (!isValid) throw new Error("Invalid message");

    const { button, raw, interactor } = message;
    const { fid, verified_accounts } = interactor;
    // fail if user has not connected their account on Farcaster
    if (!verified_accounts.length) throw new Error("No verified accounts");
    return {
      fid,
      buttonIndex: button ? button - 1 : 0,
      owner: verified_accounts[0],
      username: raw.action.interactor.username || "",
    };
  } catch (err) {
    console.error(err);
  }

  return;
}

export async function getLensterFrameData(
  req: NextRequest
): Promise<ResolvedFrameData | undefined> {
  try {
    const body = await req.json();

    const { trustedData } = body;
    const { address, buttonIndex, profileId } = trustedData;
    const gqlClient = new GraphQLClient(LENSTER_GQL_API as string);
    const query = gql`
        query Profile {
          profile(request: { forProfileId: "${profileId}" }) {
            handle {
              localName
            }
          }
        }
      `;
    const response: any = await gqlClient.request(query);
    return {
      fid: profileId,
      buttonIndex: buttonIndex ? buttonIndex - 1 : 0,
      owner: address,
      username: response?.profile?.handle?.localName || "",
    };
  } catch (err) {
    console.error(err);
  }
  return;
}

const SIZE_MAP = {
  portrait: {
    width: 1080,
    height: 1080,
  } as SizeMap,
  landscape: {
    width: 1910,
    height: 1000,
  } as SizeMap,
};

export const getImageOptions = (
  orientation: "portrait" | "landscape" = "portrait"
) => {
  return {
    width: SIZE_MAP[orientation].width,
    height: SIZE_MAP[orientation].height,
    fonts: [
      {
        data: fs.readFileSync(regularFontPath),
        name: "font-regular",
        fontStyle: "normal" as FontStyle,
        weight: 400 as FontWeight,
      },
      {
        data: fs.readFileSync(boldFontPath),
        name: "font-bold",
        fontStyle: "normal" as FontStyle,
        weight: 700 as FontWeight,
      },
    ],
  };
};

export const convertToSecondsOrMinutes = (time: number) => {
  if (time < 60) return `${time} seconds`;
  const minutes = Math.floor(time / 60);
  const seconds = time - minutes * 60;
  return minutes === 1
    ? `${minutes} min ${seconds} s`
    : `${minutes} mins ${seconds} s`;
};

export const getNextPageNumber = (buttonIndex: number, pageNumber: number) => {
  if (pageNumber === 1) return pageNumber + 1;
  if (buttonIndex === 0) return pageNumber - 1;
  return pageNumber + 1;
};

export const getHeyFrameMetadata = function ({
  buttons,
  image,
  input,
  postUrl,
  refreshPeriod,
}: FrameMetadataType) {
  const postUrlToUse = postUrl;
  const refreshPeriodToUse = refreshPeriod;

  const metadata: Record<string, string> = {
    "of:version": "1.0.0",
    "of:accepts:lens": "1.0.0",
  };
  if (typeof image === "string") {
    metadata["of:image"] = image;
    metadata["og:image"] = image;
  } else {
    metadata["of:image"] = image.src;
    metadata["og:image"] = image.src;
    if (image.aspectRatio) {
      metadata["of:image:aspect_ratio"] = image.aspectRatio;
    }
  }
  if (input) {
    metadata["of:input:text"] = input.text;
  }
  if (buttons) {
    buttons.forEach((button, index) => {
      metadata[`of:button:${index + 1}`] = button.label;
      if (button.action) {
        metadata[`of:button:${index + 1}:action`] = button.action;
      }
      if (
        (button.action == "link" || button.action == "mint") &&
        button.target
      ) {
        metadata[`of:button:${index + 1}:target`] = button.target;
      }
    });
  }
  if (postUrlToUse) {
    metadata["of:post_url:post_url"] = postUrlToUse;
  }
  if (refreshPeriodToUse) {
    metadata["hey:portal:refresh_period"] = refreshPeriodToUse.toString();
  }
  return metadata;
};
