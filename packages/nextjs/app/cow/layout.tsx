import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Create a CoW AMM",
  description: "Create CoW AMM pools powered by Balancer",
  imageRelativePath: "/cow-thumbnail.png",
});

const CowLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default CowLayout;
