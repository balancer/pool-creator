import Link from "next/link";
import type { NextPage } from "next";
import { BalancerLogo } from "~~/components/assets/BalancerLogo";
import { BeetsLogo } from "~~/components/assets/BeetsLogo";
import { CowLogo } from "~~/components/assets/CowLogo";

const PAGES = [
  {
    emoji: <CowLogo className="h-24" />,
    title: "CoW AMM",
    href: "/cow",
    description: "Deploy a CoW AMM pool",
  },
  {
    emoji: <BalancerLogo className="h-24" />,
    title: "Balancer",
    href: "/v3",
    description: "Deploy a CoW AMM pool",
  },
  {
    emoji: <BeetsLogo className="h-24" />,
    title: "Beets",
    href: "/beets",
    description: "Deploy a Beets pool",
  },
];

const Home: NextPage = () => {
  return (
    <div className="flex-grow bg-base-300">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center flex-col flex-grow py-10 px-5 lg:px-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-10">Pool Creator</h1>
          <div className="text-xl md:text-2xl mb-14 text-center">
            Create and initialize a variety of liquidity pool types with Balancer protocol
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 justify-center gap-10 w-full">
            {PAGES.map(item => (
              <Link
                className="shadow-lg relative bg-base-100 hover:bg-base-200 text-2xl text-center p-8 rounded-3xl"
                key={item.href}
                href={item.href}
                passHref
              >
                <div className="flex justify-center mb-5">
                  <div>{item.emoji}</div>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold mb-0">{item.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
