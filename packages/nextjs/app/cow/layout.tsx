import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Create a CoW AMM",
  description: "Create CoW AMM pools with Balancer protocol",
});

const CowLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default CowLayout;