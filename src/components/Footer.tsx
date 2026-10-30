import Link from "next/link";
import { site } from "../../content/site";
import { asset } from "../lib/asset";
import { Img } from "./Img";

const RESUME_HREF = "/resume/Apoorv-Mahajan-Resume.pdf";

// A photograph half and a menu half. The photograph is a close crop of the Drive Coach simulator rig.
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer__photo">
        <Img
          src="/work/woven/03.jpg"
          alt="A driver at the wheel of a simulator rig, with the road ahead on screen"
          style={{ objectPosition: "72% 50%" }}
        />
      </div>
      <div className="footer__side">
        <p className="strong">{site.name}</p>
        <nav aria-label="Footer" className="footer__menu">
          <Link href="/work/">Work</Link>
          <Link href="/personal/">Side projects</Link>
          <Link href="/about/">About</Link>
          <a href={asset(RESUME_HREF)} target="_blank" rel="noopener noreferrer">
            Résumé<span className="sr-only"> (PDF, opens in a new tab)</span>
          </a>
          <a href={`mailto:${site.email}`}>Email me</a>
        </nav>
        <div className="footer__blocks">
          <div>
            <h2 className="strong small">Contact</h2>
            <ul>
              <li>
                <a className="link" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
              </li>
              <li className="muted">{site.location}</li>
            </ul>
          </div>
          <div>
            <h2 className="strong small">Elsewhere</h2>
            <ul>
              <li>
                <a className="link" href={site.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
              <li>
                <a className="link" href={site.github} target="_blank" rel="noopener noreferrer">
                  GitHub<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer__legal small">
          <p>
            © {year} {site.name}
          </p>
          {site.disclaimer && <p>{site.disclaimer}</p>}
        </div>
      </div>
    </footer>
  );
}
