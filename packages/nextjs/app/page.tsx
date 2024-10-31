import Link from "next/link";
import type { NextPage } from "next";
import { CowLogo } from "~~/components/assets/CowLogo";

const PAGES = [
  {
    emoji: <CowLogo />,
    title: "CoW AMMs",
    href: "/cow",
    description: "Deploy a CoW AMM pool",
  },
];

const Home: NextPage = () => {
  return (
    <div className="flex-grow bg-base-300">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center flex-col flex-grow py-10 px-5 lg:px-10">
          <h1 className="text-5xl md:text-6xl font-bold my-5">Pool Creator</h1>
          <p className="text-xl md:text-2xl mb-14 text-center">
            Create and initialize a variety of liquidity pool types with Balancer protocol
          </p>

          <div className="flex justify-center">
            {PAGES.map(item => (
              <Link
                className="shadow-inner relative bg-base-100 hover:bg-base-200 text-2xl text-center p-8 rounded-3xl"
                key={item.href}
                href={item.href}
                passHref
              >
                <h3 className="text-3xl md:text-4xl font-bold mb-5">{item.title}</h3>
                <div className="flex justify-center my-7">
                  <div className="w-1/2">{item.emoji}</div>
                </div>
                <p className="text-xl mb-0">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
