import { useEffect, useState } from "react";
import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export function Welcome() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/greeting`)
        .then((res) => res.json())
        .then((data) => setMessage(data.message))
        .catch((err) => console.error(err));
    console.log(API_BASE_URL);
  }, []);

  return (
      <main className="flex items-center justify-center pt-16 pb-4">
        <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
          <header className="flex flex-col items-center gap-9">
            <div className="w-[500px] max-w-[100vw] p-4">
              <img
                  src={logoLight}
                  alt="React Router"
                  className="block w-full dark:hidden"
              />
              <img
                  src={logoDark}
                  alt="React Router"
                  className="hidden w-full dark:block"
              />
            </div>

            {message && (
                <p className="text-lg text-gray-700 dark:text-gray-200">
                  {message}
                </p>
            )}
          </header>

          <div className="max-w-[300px] w-full space-y-6 px-4">
            <nav className="rounded-3xl border border-gray-200 p-6 dark:border-gray-700 space-y-4">
              <p className="leading-6 text-gray-700 dark:text-gray-200 text-center">
                What&apos;s next?
              </p>
              <ul>
                {resources.map(({ href, text, icon }) => (
                    <li key={href}>
                      <a
                          className="group flex items-center gap-3 self-stretch p-3 leading-normal text-blue-700 hover:underline dark:text-blue-500"
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                      >
                        {icon}
                        {text}
                      </a>
                    </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </main>
  );
}

const resources = [
  { href: "https://reactrouter.com/docs", text: "React Router Docs", icon: "📘" },
  { href: "https://rmx.as/discord", text: "Join Discord", icon: "💬" },
];
