import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "v3 Pool Creator",
  description: "Create a variety of pool types with Balancer v3",
});

const v3Layout = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex-grow bg-base-300">{children}</div>;
};

export default v3Layout;
