import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Beets Pool Creator",
  description: "Create a variety of pool types on Beets, a friendly fork of Balancer v3",
  imageRelativePath: "/beets-thumbnail.png",
});

const v3Layout = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex-grow bg-base-300">{children}</div>;
};

export default v3Layout;
