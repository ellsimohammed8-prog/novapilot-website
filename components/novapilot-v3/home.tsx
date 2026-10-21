import V3Interactions from "./interactions";

/**
 * NovaPilot AI — homepage, ported 1:1 from the owner-approved standalone v3
 * build (~/workspace/novapilot-site-v3/index.html). Structure, copy and class
 * names are unchanged; styles live in app/css/novapilot-v3.css scoped under
 * .np-v3, and behaviours in ./interactions (a React port of its script.js).
 * The explainer video reuses the repo's existing /videos/nova-pilot-ai.mp4,
 * which is byte-identical to the v3 build's assets/explainer.mp4.
 */
export default function NovaPilotV3Home() {
  return (
    <div className="np-v3">
      <div id="glow" aria-hidden="true"></div>

      <header className="nav" id="nav">
        <a className="brand" href="#top" aria-label="NovaPilot AI">
          <svg
            className="brand-mark"
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden="true"
          >
            <rect width="32" height="32" rx="8" fill="#0a0f1e" />
            <path
              d="M6 18c2.5 0 2.5-6 5-6s2.5 10 5 10 2.5-14 5-14 2.5 8 5 8"
              stroke="#4f7cff"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
          <span>NovaPilot&nbsp;AI</span>
        </a>
        <a className="nav-cta" href="#download">
          Download
        </a>
      </header>

      <main>
        {/* HERO */}
        <section className="hero" id="top">
          <div className="hero-media" data-depth="7">
            <img
              className="hero-poster"
              src="/v3-hero-poster.webp"
              alt=""
              aria-hidden="true"
            />
            <video
              className="hero-video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="/v3-hero-poster.webp"
              aria-hidden="true"
            >
              <source src="/v3-hero.mp4" type="video/mp4" />
            </video>
          </div>
          <canvas id="waves" aria-hidden="true"></canvas>
          <div className="hero-shade" aria-hidden="true"></div>

          <div className="hero-content" data-depth="-12">
            <h1>
              Every meeting,
              <br />
              <span className="grad">captured.</span>
            </h1>
            <p className="sub">
              NovaPilot records your calls, writes the transcript, and hands
              you a clear summary the moment you hang up.
            </p>
          </div>

          <a className="scroll-cue" href="#values" aria-label="Scroll down">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 9l7 7 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </section>

        {/* VALUES */}
        <section className="values" id="values">
          <div className="wrap values-grid">
            <article className="value rv">
              <div className="value-icon">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect
                    x="9"
                    y="3"
                    width="6"
                    height="11"
                    rx="3"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M8.5 21h7"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3>Records the call</h3>
            </article>
            <article className="value rv">
              <div className="value-icon">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M7 3h7l4 4v14H7z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 3v4h4M10 12h5M10 15.5h5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3>Writes your summary</h3>
            </article>
            <article className="value rv">
              <div className="value-icon">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect
                    x="3.5"
                    y="4.5"
                    width="17"
                    height="12"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M9.5 20.5h5M12 16.5v4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M9.8 10.6l1.6 1.6 3-3.2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3>Stays on your computer</h3>
            </article>
          </div>
        </section>

        {/* EXPLAINER VIDEO */}
        <section className="see" id="see">
          <div className="wrap">
            <h2 className="rv">See it work.</h2>
            <p className="see-line rv">A quick look at NovaPilot in action.</p>
            <div className="player rv">
              <div className="player-inner">
                <video
                  id="explainer"
                  preload="none"
                  poster="/v3-explainer-poster.webp"
                  playsInline
                >
                  <source src="/videos/nova-pilot-ai.mp4" type="video/mp4" />
                </video>
                <button
                  className="play-overlay"
                  id="playBtn"
                  aria-label="Play video"
                >
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M8.5 5.8v12.4c0 .8.9 1.3 1.6.9l9.3-6.2c.6-.4.6-1.4 0-1.8L10.1 4.9c-.7-.4-1.6.1-1.6.9z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* PRIVACY */}
        <section className="privacy">
          <div className="wrap rv">
            <svg
              className="privacy-icon"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 3l7 2.6v5.2c0 4.6-3 8.4-7 10.2-4-1.8-7-5.6-7-10.2V5.6z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              <path
                d="M9.2 11.8l2 2 3.6-3.8"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p>Your calls never leave your computer.</p>
          </div>
        </section>

        {/* DOWNLOAD */}
        <section className="download" id="download">
          <div className="wrap rv">
            <a
              className="btn-big"
              href="https://github.com/ellsimohammed8-prog/novapilot-website"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 4v11m0 0l-4.2-4.2M12 15l4.2-4.2M4.5 19.5h15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Download for Windows
            </a>
            <p className="tiny">Free — Windows 10 &amp; 11</p>
          </div>
        </section>
      </main>

      <footer>
        <p>© 2026 NovaPilot AI — Every meeting, captured.</p>
      </footer>

      <V3Interactions />
    </div>
  );
}
