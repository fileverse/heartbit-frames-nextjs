import { Metadata } from "next";

import { getFrameMetadata } from "@coinbase/onchainkit";
import { getHeyFrameMetadata } from "@/utils";
import style from "./page.module.css";
import Link from "next/link";

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
  return (
    <main className={style.main}>
      <div className={style.wrapper}>
        <h1>HeartBit Frame</h1>
        <p className={style.description}>
          Next.js Frame App with HeartBit Integration
        </p>
        <div className={style.doc_links}>
          <div className={style.doc}>
            <p>HeartBit Core :</p>
            <Link
              className={style.link}
              target="_blank"
              href="https://github.com/fileverse/HeartBitSDK/blob/main/packages/heartbit-core/README.md"
            >
              Docs
            </Link>
            <Link
              className={style.link}
              target="_blank"
              href="https://www.npmjs.com/package/@fileverse/heartbit-core"
            >
              NPM
            </Link>
          </div>
          <div className={style.doc}>
            <p>HeartBit React :</p>
            <Link
              className={style.link}
              target="_blank"
              href="https://github.com/fileverse/HeartBitSDK/blob/main/packages/heartbit-react/README.md"
            >
              Docs
            </Link>
            <Link
              className={style.link}
              target="_blank"
              href="https://www.npmjs.com/package/@fileverse/heartbit-react"
            >
              NPM
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
