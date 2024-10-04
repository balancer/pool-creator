import Link from "next/link";
import type { NextPage } from "next";
import { BalancerLogo } from "~~/components/assets/BalancerLogo";
import { CowLogo } from "~~/components/assets/CowLogo";

const PAGES = [
  {
    emoji: <CowLogo className="h-28" />,
    title: "CoW AMMs",
    href: "/cow",
    description: "Deploy a CoW AMM pool",
  },
  {
    emoji: <BalancerLogo className="h-28" />,
    title: "Balancer v3",
    href: "/v3",
    description: "Deploy a CoW AMM pool",
  },
];

const Home: NextPage = () => {
  return (
    <div className="flex-grow bg-base-300">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center flex-col flex-grow py-10 px-5 lg:px-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-10">Pool Creator</h1>
          <div className="text-xl md:text-2xl mb-14 text-center">
            Create and initialize a variety of liquidity pool types with Balancer protocol
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {PAGES.map(item => (
              <Link
                className="shadow-xl relative bg-base-100 hover:scale-105 text-2xl text-center p-8 rounded-3xl w-96"
                key={item.href}
                href={item.href}
                passHref
              >
                <div className="flex justify-center">
                  <div className="mt-2">{item.emoji}</div>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold mt-5 mb-0">{item.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
