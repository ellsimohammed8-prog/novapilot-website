import V2Interactions from "./interactions";

/**
 * NovaPilot AI — homepage, ported 1:1 from the approved standalone v2 build
 * (~/workspace/novapilot-site-v2/index.html). Structure, copy and class names are
 * unchanged; styles live in app/css/novapilot-v2.css scoped under .np-v2.
 */
export default function NovaPilotV2Home() {
  return (
    <div className="np-v2">
      <header className="site-header">
        <div className="header-inner">
          <a className="wordmark" href="#top">
            NovaPilot&nbsp;AI
          </a>
          <span className="header-version">v2.7.1 — production release</span>
          <nav className="site-nav" aria-label="Main">
            <a href="#subsystems">Subsystems</a>
            <a href="#specs">Spec sheet</a>
            <a href="#privacy">Privacy</a>
            <a href="#faq">FAQ</a>
            <a className="nav-download" href="#download">
              Download
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        {/* ============ HERO ============ */}
        <section className="hero">
          <div className="hero-text">
            <p className="hero-marker">
              Desktop app &middot; Windows 10 &amp; 11 (64-bit) &middot; NOVA-CORE
              ENGINE v2.7.1
            </p>
            <h1 className="hero-title">
              <span className="line">The meeting ends.</span>
              <span className="line">The notes are</span>
              <span className="line">already written.</span>
            </h1>
            <p className="hero-sub">
              NovaPilot AI records your calls and writes them up as they happen:
              a live transcript while you talk, then a summary &mdash; decisions,
              key points, action items &mdash; saved on your own machine when you
              hang up. Nothing joins your meeting. There is no bot in the
              attendee list, because NovaPilot never leaves your desktop.
            </p>
            <div className="hero-actions">
              <a
                className="btn btn-primary"
                href="https://github.com/ellsimohammed8-prog/novapilot-website/releases/download/v2.7.1/NovaPilot-AI-Setup-2.7.1.exe"
              >
                Download NovaPilot-AI-Setup-2.7.1.exe
              </a>
              <a className="btn btn-quiet" href="#specs">
                Read the spec sheet
              </a>
            </div>
            <p className="hero-meta">
              Free &middot; Installer or portable .exe &middot; No account
              &middot; No drivers to install
            </p>
          </div>

          <aside className="fact-sheet" aria-label="Field data for version 2.7.1">
            <h2 className="fact-title">Field data &mdash; v2.7.1</h2>
            <dl className="fact-rows">
              <div className="fact-row">
                <dt>Capture latency</dt>
                <dd>Under 5 ms, WASAPI loopback</dd>
              </div>
              <div className="fact-row">
                <dt>Audio stream</dt>
                <dd>16 kHz mono PCM</dd>
              </div>
              <div className="fact-row">
                <dt>Memory in use</dt>
                <dd>Under 120 MB RAM</dd>
              </div>
              <div className="fact-row">
                <dt>CPU</dt>
                <dd>Under 1%</dd>
              </div>
              <div className="fact-row">
                <dt>Your audio</dt>
                <dd>Not stored. Not uploaded.</dd>
              </div>
              <div className="fact-row">
                <dt>Transcripts</dt>
                <dd>Local SQLite database, on your disk</dd>
              </div>
            </dl>
          </aside>
        </section>

        {/* ============ A SESSION ============ */}
        <section className="section session" id="session">
          <div className="section-head">
            <span className="section-no">01</span>
            <h2>A session, start to finish</h2>
          </div>
          <ol className="steps">
            <li className="step step-a">
              <span className="step-no">1</span>
              <h3>Open NovaPilot, then join the call.</h3>
              <p>
                It listens through the Windows render endpoint &mdash; the audio
                your speakers are already playing &mdash; together with your
                microphone. No meeting bot is added to the call, and no virtual
                audio cable is installed.
              </p>
            </li>
            <li className="step step-b">
              <span className="step-no">2</span>
              <h3>Talk. The transcript keeps up.</h3>
              <p>
                Both sides are downmixed to a 16 kHz mono stream and transcribed
                live. When a reasoning model drafts your summary, its internal{" "}
                <span className="mono">&lt;think&gt;</span> blocks are stripped
                before anything reaches your screen, so you read answers, not
                deliberation.
              </p>
            </li>
            <li className="step step-c">
              <span className="step-no">3</span>
              <h3>Hang up. The write-up is waiting.</h3>
              <p>
                Summary first, then the decisions, then the action items &mdash;
                saved to a local SQLite database on your disk. The audio itself
                was never stored, and it never left the machine.
              </p>
            </li>
          </ol>
        </section>

        {/* ============ SUBSYSTEMS ============ */}
        <section className="section subsystems" id="subsystems">
          <div className="section-head">
            <span className="section-no">02</span>
            <h2>Four subsystems do the work</h2>
          </div>

          <article className="feature-row">
            <div className="feature-body">
              <p className="feature-cat">Hardware DSP engine</p>
              <h3>WASAPI loopback, straight off the hardware</h3>
              <p>
                A Rust engine (CPAL 0.15.2) reads the Windows render endpoint
                with <span className="mono">AUDCLNT_STREAMFLAGS_LOOPBACK</span>{" "}
                and downmixes whatever your sound card outputs &mdash; 5.1, 7.1,
                plain stereo &mdash; into one 16 kHz mono stream. A Rubato
                polyphase sinc resampler converts 48 kHz and 44.1 kHz hardware
                clocks with more than 20 dB of alias attenuation. A lock-free
                ring buffer keeps the real-time audio thread and the processing
                queue out of each other&rsquo;s way, and frames are batched
                three at a time before crossing into the app.
              </p>
              <p className="feature-file">
                Source:{" "}
                <span className="mono">native-module/src/speaker/windows.rs</span>
              </p>
            </div>
            <dl className="feature-metrics">
              <div>
                <dt>Loopback latency</dt>
                <dd>&lt; 5 ms</dd>
              </div>
              <div>
                <dt>Sampling target</dt>
                <dd>16,000 Hz</dd>
              </div>
              <div>
                <dt>Ring buffer</dt>
                <dd>32,768 samples</dd>
              </div>
              <div>
                <dt>IPC crossings cut</dt>
                <dd>66.7%</dd>
              </div>
            </dl>
          </article>

          <article className="feature-row">
            <div className="feature-body">
              <p className="feature-cat">Real-time NLP pipeline</p>
              <h3>You read the answer, not the thinking</h3>
              <p>
                Reasoning models draft thousands of internal tokens inside{" "}
                <span className="mono">&lt;think&gt;</span> tags before they
                answer. In a live call, nobody has time to read that.
                ThinkStripper is a two-state finite-state machine that removes
                those blocks as tokens stream in &mdash; including tags split
                across network chunks, and thoughts the model never finished.
                What reaches the page is the answer. Routing runs across Gemini
                2.0 Flash, Claude 3.7 Sonnet, DeepSeek-R1 and Groq Llama-3.3, and
                fails over if a provider rate-limits mid-call.
              </p>
              <p className="feature-file">
                Source: <span className="mono">electron/llm/thinkStripper.ts</span>
              </p>
            </div>
            <dl className="feature-metrics">
              <div>
                <dt>Reasoning leak</dt>
                <dd>0 bytes</dd>
              </div>
              <div>
                <dt>FSM states</dt>
                <dd>pass &middot; inThink</dd>
              </div>
              <div>
                <dt>Filter latency</dt>
                <dd>&lt; 0.2 ms</dd>
              </div>
              <div>
                <dt>Provider failover</dt>
                <dd>&lt; 150 ms</dd>
              </div>
            </dl>
          </article>

          <article className="feature-row">
            <div className="feature-body">
              <p className="feature-cat">Speech recognition</p>
              <h3>Names and jargon survive transcription</h3>
              <p>
                Speech recognisers mangle product names, acronyms and
                people&rsquo;s names &mdash; usually the words that matter most
                in the summary. NovaPilot pre-warms a 224-token prompt cache of
                technical identifiers, programming keywords and domain acronyms,
                biasing the decoder before the first word of the call is spoken.
                Go offline and an on-device Whisper engine (ONNX, DirectML)
                takes over, so a dropped connection doesn&rsquo;t end the
                record.
              </p>
              <p className="feature-file">
                Pipeline: Deepgram relay online &middot; Whisper / Moonshine ONNX
                on-device
              </p>
            </div>
            <dl className="feature-metrics">
              <div>
                <dt>Prompt cache</dt>
                <dd>224 tokens</dd>
              </div>
              <div>
                <dt>Offline engine</dt>
                <dd>Whisper ONNX</dd>
              </div>
              <div>
                <dt>Acceleration</dt>
                <dd>DirectML</dd>
              </div>
            </dl>
          </article>

          <article className="feature-row">
            <div className="feature-body">
              <p className="feature-cat">Governance &amp; reliability</p>
              <h3>Crash reports with no server in the middle</h3>
              <p>
                If the app faults, the crash is hashed with SHA-256 and sent to
                a Telegram bot &mdash; no analytics platform, no third-party
                tracker watching your usage. Identical crashes inside a
                60-second window are deduplicated, reports are capped and
                truncated before sending, and a version check against{" "}
                <span className="mono">latest.yml</span> can retire a broken
                release outright instead of letting it fail quietly on your
                machine.
              </p>
              <p className="feature-file">
                Source:{" "}
                <span className="mono">electron/services/TelegramNotifier.ts</span>
              </p>
            </div>
            <dl className="feature-metrics">
              <div>
                <dt>Dedup window</dt>
                <dd>60 s</dd>
              </div>
              <div>
                <dt>Rate limit</dt>
                <dd>15 msg / min</dd>
              </div>
              <div>
                <dt>Payload cap</dt>
                <dd>4,000 chars</dd>
              </div>
              <div>
                <dt>Update gating</dt>
                <dd>Strict semver</dd>
              </div>
            </dl>
          </article>
        </section>

        {/* ============ WAVE STRIP ============ */}
        <figure className="wave-strip">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img-wave.webp" alt="" width="1600" height="300" loading="lazy" />
          <figcaption>
            One stream &mdash; both sides of the call, downmixed to 16 kHz mono
          </figcaption>
        </figure>

        {/* ============ SPECS ============ */}
        <section className="section specs" id="specs">
          <div className="section-head">
            <span className="section-no">03</span>
            <h2>The spec sheet</h2>
          </div>
          <p className="specs-intro">
            NovaPilot AI Desktop v2.7.1, measured against its own engineering
            targets. Every figure below is from the build&rsquo;s own
            documentation.
          </p>

          <table className="spec-table">
            <caption>Engine specifications</caption>
            <tbody>
              <tr>
                <th scope="row">Audio capture</th>
                <td className="spec-value">
                  Hardware WASAPI loopback &mdash; &lt; 5 ms
                </td>
                <td>
                  Render-endpoint capture (Rust CPAL 0.15.2). Dynamic N-channel
                  downmix to 16 kHz mono PCM; lock-free HeapRb ring buffer.
                </td>
              </tr>
              <tr>
                <th scope="row">Reasoning filter</th>
                <td className="spec-value">
                  StreamingThinkStripper FSM &mdash; 0-byte leak
                </td>
                <td>
                  Removes <span className="mono">&lt;think&gt;</span>,{" "}
                  <span className="mono">&lt;thought&gt;</span> and{" "}
                  <span className="mono">&lt;reasoning&gt;</span> blocks
                  mid-stream, including tags split across network chunk
                  boundaries.
                </td>
              </tr>
              <tr>
                <th scope="row">Privacy &amp; storage</th>
                <td className="spec-value">Local-first &mdash; zero cloud audio</td>
                <td>
                  No raw audio is stored or uploaded to company servers.
                  Transcripts live in a local SQLite database; model inference
                  goes direct to the provider over HTTPS.
                </td>
              </tr>
              <tr>
                <th scope="row">Platform</th>
                <td className="spec-value">Native Windows 10 &amp; 11 (x64)</td>
                <td>
                  A desktop application, not a browser tab. Global shortcuts{" "}
                  <span className="mono">Ctrl+B</span> and{" "}
                  <span className="mono">Ctrl+Shift+B</span> register without
                  window focus.
                </td>
              </tr>
              <tr>
                <th scope="row">Footprint</th>
                <td className="spec-value">
                  &lt; 120 MB RAM &middot; &lt; 1% CPU
                </td>
                <td>
                  Native Rust DSP with zero-copy casting. Three-frame
                  BatchEmitter batching cuts V8 IPC boundary crossings by 66.7%.
                </td>
              </tr>
            </tbody>
          </table>

          <table className="spec-table req-table">
            <caption>System requirements</caption>
            <tbody>
              <tr>
                <th scope="row">Operating system</th>
                <td className="spec-value">Windows 10 / 11 (64-bit)</td>
                <td></td>
              </tr>
              <tr>
                <th scope="row">Processor</th>
                <td className="spec-value">x64 Intel / AMD, AVX2 supported</td>
                <td></td>
              </tr>
              <tr>
                <th scope="row">Memory</th>
                <td className="spec-value">
                  4 GB minimum &middot; 8 GB recommended
                </td>
                <td></td>
              </tr>
              <tr>
                <th scope="row">Storage</th>
                <td className="spec-value">600 MB free space</td>
                <td></td>
              </tr>
              <tr>
                <th scope="row">Privileges</th>
                <td className="spec-value">None &mdash; user space only</td>
                <td>
                  No administrator rights, no kernel drivers, no DLL injection.
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* ============ PRIVACY ============ */}
        <section className="section privacy" id="privacy">
          <div className="section-head">
            <span className="section-no">04</span>
            <h2>Your audio stays home</h2>
          </div>
          <div className="privacy-body">
            <p>
              The usual arrangement with meeting software is that your audio is
              piped to a vendor&rsquo;s cloud, transcribed on their servers, and
              kept around. NovaPilot was built the other way around.
            </p>
            <p>
              Capture, buffering and storage happen on your desktop. Transcripts
              sit in a local SQLite database. When a language model is involved,
              the call goes directly from your machine to the provider over
              HTTPS &mdash; there is no NovaPilot server holding your meetings,
              because there is no NovaPilot server in the path at all.
            </p>
            <p>
              The app also runs entirely in user space (Ring 3) on standard
              Win32 and WASAPI APIs. No kernel drivers, no administrator prompt,
              nothing injected into other processes &mdash; which is why it
              installs cleanly on locked-down corporate laptops, alongside VPNs
              and endpoint-security tools.
            </p>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section className="section faq" id="faq">
          <div className="section-head">
            <span className="section-no">05</span>
            <h2>Asked often, answered plainly</h2>
          </div>
          <div className="faq-list">
            <div className="faq-item">
              <h3>
                <button className="faq-q" aria-expanded="true">
                  How does NovaPilot capture meeting audio without virtual audio
                  cables?
                </button>
              </h3>
              <div className="faq-a">
                <p>
                  It taps the Windows render endpoint directly, using WASAPI
                  loopback (<span className="mono">AUDCLNT_STREAMFLAGS_LOOPBACK</span>)
                  &mdash; the same stream your speakers play. Surround and
                  stereo are downmixed to a 16,000 Hz mono PCM feed at under 5
                  ms of latency, via polyphase sinc resampling. There is no
                  VB-Cable-style driver to install, so there is nothing to
                  conflict with your headset, your VPN, or the meeting app
                  itself.
                </p>
              </div>
            </div>
            <div className="faq-item">
              <h3>
                <button className="faq-q" aria-expanded="false">
                  Where do my recordings and transcripts live?
                </button>
              </h3>
              <div className="faq-a" hidden>
                <p>
                  On your machine. NovaPilot is local-first: zero raw audio is
                  stored or uploaded to intermediate company servers, and
                  transcripts are kept in a local SQLite database. When a
                  language model is used, inference goes straight from your
                  desktop to the provider over HTTPS.
                </p>
              </div>
            </div>
            <div className="faq-item">
              <h3>
                <button className="faq-q" aria-expanded="false">
                  What does the ThinkStripper actually do?
                </button>
              </h3>
              <div className="faq-a" hidden>
                <p>
                  Reasoning models like DeepSeek-R1 and Claude 3.7 produce
                  thousands of internal chain-of-thought tokens inside{" "}
                  <span className="mono">
                    &lt;think&gt;...&lt;/think&gt;
                  </span>{" "}
                  tags before they answer. Reading that in a live conversation
                  is a lag you can feel. ThinkStripper is a streaming
                  finite-state machine that filters those blocks in real time
                  (under 0.2 ms), so only the answer reaches your screen &mdash;
                  with a 0-byte leak guarantee, even when a tag is split across
                  two network chunks or never closed.
                </p>
              </div>
            </div>
            <div className="faq-item">
              <h3>
                <button className="faq-q" aria-expanded="false">
                  Is NovaPilot AI free, and how do I verify the download is
                  genuine?
                </button>
              </h3>
              <div className="faq-a" hidden>
                <p>
                  Yes. Production release v2.7.1 is a free download, as an Inno
                  Setup installer and as a standalone portable executable. Every
                  release binary is verifiable against its published SHA-512
                  checksum. In Windows PowerShell, run:
                </p>
                <p className="mono-block">
                  Get-FileHash NovaPilot-AI-Setup-2.7.1.exe -Algorithm SHA512
                </p>
                <p>
                  and compare the result with the checksum printed in the{" "}
                  <a href="#download">download section</a> below.
                </p>
              </div>
            </div>
            <div className="faq-item">
              <h3>
                <button className="faq-q" aria-expanded="false">
                  Does NovaPilot require administrative privileges or kernel
                  drivers?
                </button>
              </h3>
              <div className="faq-a" hidden>
                <p>
                  No. NovaPilot operates entirely in user space (Ring 3), using
                  standard Win32 and WASAPI user-mode APIs &mdash; no
                  kernel-level drivers, no DLL injections, no administrator
                  privileges. That keeps it compatible with corporate laptops,
                  enterprise VPNs, and endpoint detection and response (EDR)
                  agents.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ DOWNLOAD ============ */}
        <section className="section download" id="download">
          <div className="section-head">
            <span className="section-no">06</span>
            <h2>Download</h2>
          </div>
          <p className="download-file">NovaPilot-AI-Setup-2.7.1.exe</p>
          <p className="download-notes">
            Production release 2.7.1 for Windows 10 &amp; 11 (64-bit). A
            self-contained package of about 489 MB &mdash; the desktop runtime
            ships inside it, so there is nothing else to install. Prefer not to
            install? The same build is available as a portable executable,{" "}
            <span className="mono">NovaPilot-AI-2.7.1.exe</span>.
          </p>
          <div className="download-actions">
            <a
              className="btn btn-primary"
              href="https://github.com/ellsimohammed8-prog/novapilot-website/releases/download/v2.7.1/NovaPilot-AI-Setup-2.7.1.exe"
            >
              Download the installer
            </a>
            <a
              className="btn btn-quiet"
              href="https://github.com/ellsimohammed8-prog/novapilot-website/releases/download/v2.7.1/NovaPilot-AI-2.7.1.exe"
            >
              Download portable (.exe)
            </a>
          </div>

          <div className="sha-block">
            <div className="sha-head">
              <h3>SHA-512 checksum &mdash; installer</h3>
              <button type="button" className="copy-btn" id="copy-sha">
                Copy checksum
              </button>
            </div>
            <p className="sha-hash mono" id="sha-hash">
              acc168926f7bbb553b954a6fe5c9a8b61797626088a117de653e211feec6e6f6420690a193b9d92c5bcb69f3fe639c231381e4f852212899b0012212fbe914e5
            </p>
            <p className="sha-note">
              Verify in PowerShell:{" "}
              <span className="mono">
                Get-FileHash NovaPilot-AI-Setup-2.7.1.exe -Algorithm SHA512
              </span>
            </p>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <p className="footer-brand">
            NovaPilot AI <span className="footer-ver">v2.7.1</span>
          </p>
          <p className="footer-line">
            Transcripts stay on the machine that made them.
          </p>
          <nav className="footer-nav" aria-label="Footer">
            <a href="#subsystems">Subsystems</a>
            <a href="#specs">Spec sheet</a>
            <a href="#faq">FAQ</a>
            <a href="https://github.com/ellsimohammed8-prog/novapilot-website">
              GitHub repository
            </a>
          </nav>
        </div>
      </footer>

      <V2Interactions />
    </div>
  );
}
