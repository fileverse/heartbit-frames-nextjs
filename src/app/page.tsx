import { Metadata } from "next";

import { getFrameMetadata } from "@coinbase/onchainkit";
import { getHeyFrameMetadata } from "@/utils";

const { HOST } = process.env;

export async function generateMetadata({}): Promise<Metadata> {
  const buttons = [{ label: "Start", action: "post" }];

  const frameMetadata = getFrameMetadata({
    buttons: buttons as any,
    image: {
      src: `${HOST}/image`,
      aspectRatio: "1.91:1",
    },
    postUrl: `${HOST}/frame`,
  });

  const heyMetadata = getHeyFrameMetadata({
    buttons: buttons as any,
    image: {
      src: `${HOST}/image?app=LENSTER`,
      aspectRatio: "1.91:1",
    },
    postUrl: `${HOST}/frame?app=LENSTER`,
  });

  return {
    title: "HeartBit Frame",
    openGraph: {
      title: "HeartBit Frame",
      images: [`${HOST}/image`],
    },
    other: {
      ...frameMetadata,
      ...heyMetadata,
    },
    metadataBase: new URL(HOST || ""),
  };
}

export default function Home() {
  return <div>HeartBit Frame</div>;
}
