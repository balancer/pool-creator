import Link from "next/link";
import type { NextPage } from "next";

const PAGES = [
  {
    emoji: "🐮",
    title: "CoW AMMs",
    href: "/cow",
    description: "Create and initialize 50/50 weighted CoW AMMs",
  },
];

const Home: NextPage = () => {
  return (
    <div className="flex-grow">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center flex-col flex-grow py-10 px-5 lg:px-10">
          <h1 className="text-6xl font-bold my-5">Buidl A Pool</h1>

          <p className="text-2xl mb-14">Create and initialize liquidity pools with Balancer</p>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 w-full">
            {PAGES.map(item => (
              <Link
                className="relative bg-base-300 hover:scale-105 text-2xl text-center p-8 rounded-3xl"
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
