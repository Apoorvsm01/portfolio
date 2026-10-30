import { site } from "../../content/site";
import { CopyEmail } from "./CopyEmail";

// One prompt and one field. With no script it is a plain mailto form: the message becomes the body.
export function Contact() {
  return (
    <section className="contact" id="contact" aria-labelledby="contact-title" data-reveal-group>
      <h2 id="contact-title" className="contact__prompt" data-reveal>
        <span className="muted">Have a team, a car or a hard problem?</span>
        <span>Tell me about it.</span>
      </h2>
      <div data-reveal style={{ display: "grid", gap: 16 }}>
        <form className="contact__form" action={`mailto:${site.email}`} method="get" encType="text/plain">
          <input type="text" name="body" aria-label="Your message" placeholder="Write a line or two" autoComplete="off" />
          <button className="ask__send" type="submit" aria-label="Send by email">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
            </svg>
          </button>
        </form>
        <p className="small muted">This opens your email app with your message ready to send to me. Nothing is stored on this site.</p>
      </div>
      <dl className="contact__rows" data-reveal>
        <div className="contact__row">
          <dt className="small muted">Email</dt>
          <dd>
            <CopyEmail />
          </dd>
        </div>
        <div className="contact__row">
          <dt className="small muted">LinkedIn</dt>
          <dd>
            <a className="link" href={site.linkedin} target="_blank" rel="noopener noreferrer">
              apoorvmahajan<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </dd>
        </div>
        <div className="contact__row">
          <dt className="small muted">Based</dt>
          <dd>{site.location}</dd>
        </div>
      </dl>
    </section>
  );
}
