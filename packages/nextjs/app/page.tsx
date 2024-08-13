import Link from "next/link";
import type { NextPage } from "next";

const PAGES = [
  {
    emoji: "🐮",
    title: "CoW AMMs",
    href: "/cow",
    description: "Deploy pools with 2 tokens and 50/50 weight distribution",
  },
];

const Home: NextPage = () => {
  return (
    <div className="flex-grow bg-base-300">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center flex-col flex-grow py-10 px-5 lg:px-10">
          <h1 className="text-6xl font-bold my-5">Pool Creator</h1>

          <p className="text-2xl mb-14">
            Create and initialize a variety of liquidity pool types with Balancer protocol
          </p>

          <div className="flex justify-center">
            {PAGES.map(item => (
              <Link
                className="shadow-xl relative bg-base-100 hover:scale-105 text-2xl text-center p-8 rounded-3xl"
                key={item.href}
                href={item.href}
                passHref
              >
                <div className="text-8xl my-7">{item.emoji}</div>
                <h3 className="text-4xl font-bold mb-5">{item.title}</h3>
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
