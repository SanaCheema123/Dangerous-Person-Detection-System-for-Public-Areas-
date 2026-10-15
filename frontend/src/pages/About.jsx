import {
  Target,
  Eye,
  Gem,
  ShieldCheck,
  Users,
  BrainCircuit,
  Camera,
  Activity,
  Quote,
} from "lucide-react";

import Navbar from "../components/Navbar";

import aboutHero from "../assets/about-hero.png";
import aboutImpact from "../assets/about-impact.png";

import "./About.css";

function HudCorners() {
  return (
    <>
      <span className="about-corner about-tl" />
      <span className="about-corner about-tr" />
      <span className="about-corner about-bl" />
      <span className="about-corner about-br" />
    </>
  );
}

const values = [
  "Innovation and Excellence",
  "Safety and Security",
  "Integrity and Transparency",
  "People-Centric Approach",
];

const impactItems = [
  {
    icon: Camera,
    title: "REAL-TIME",
    subtitle: "DETECTION",
  },
  {
    icon: Users,
    title: "PEOPLE-CENTRIC",
    subtitle: "SECURITY",
  },
  {
    icon: BrainCircuit,
    title: "AI-POWERED",
    subtitle: "ANALYSIS",
  },
  {
    icon: Activity,
    title: "24/7",
    subtitle: "MONITORING",
  },
];

export default function About() {
  return (
    <div className="about-page">
      <Navbar />

      {/* ============================
          HERO
      ============================ */}

      <section className="about-hero">
        <div className="about-grid-bg" />

        <div className="about-hero-container">
          <div className="about-hero-left">
            <p className="about-eyebrow">
              OUR STORY
            </p>

            <h1 className="about-title">
              <span
                className="about-glitch"
                data-text="ABOUT"
              >
                ABOUT
              </span>

              <span
                className="about-glitch about-teal"
                data-text="DANGEROUS-PERSON"
              >
                DANGEROUS-PERSON
              </span>

              <span
                className="about-glitch"
                data-text="DETECTION"
              >
                DETECTION
              </span>
            </h1>

            <div className="about-intro">
              Building safer environments with
              artificial intelligence, computer vision,
              and real-time surveillance technology.
            </div>

            <div className="about-mini-features">
              <div>
                <Target />
                <span>
                  INNOVATION
                  <br />
                  DRIVEN
                </span>
              </div>

              <div>
                <ShieldCheck />
                <span>
                  SAFER
                  <br />
                  COMMUNITIES
                </span>
              </div>

              <div>
                <Users />
                <span>
                  PEOPLE
                  <br />
                  FOCUSED
                </span>
              </div>
            </div>
          </div>

          <div className="about-hero-right">
            <div className="about-hero-glow" />

            <img
              src={aboutHero}
              alt="AI surveillance and public safety illustration"
            />
          </div>
        </div>
      </section>

      {/* ============================
          MISSION / VISION / VALUES
      ============================ */}

      <section className="about-info-section">
        <div className="about-info-grid">
          <article className="about-card">
            <HudCorners />

            <div className="about-card-icon">
              <Target />
            </div>

            <h2>OUR MISSION</h2>

            <p>
              To use advanced AI and computer vision to
              assist in identifying potentially dangerous
              situations and support safer public and
              private environments.
            </p>
          </article>

          <article className="about-card">
            <HudCorners />

            <div className="about-card-icon">
              <Eye />
            </div>

            <h2>OUR VISION</h2>

            <p>
              A future where intelligent surveillance
              supports faster awareness, better decisions,
              and stronger protection while keeping human
              oversight at the center.
            </p>
          </article>

          <article className="about-card">
            <HudCorners />

            <div className="about-card-icon">
              <Gem />
            </div>

            <h2>OUR VALUES</h2>

            <div className="about-values">
              {values.map((value) => (
                <div key={value}>
                  <ShieldCheck />
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </article>

          <aside className="about-quote">
            <Quote />

            <p>
              Technology is most powerful when it helps
              people make safer, more informed decisions.
            </p>

            <span />
          </aside>
        </div>
      </section>

      {/* ============================
          IMPACT / TECHNOLOGY
      ============================ */}

      <section className="about-impact-section">
        <div className="about-impact-container">
          <img
            src={aboutImpact}
            alt="AI surveillance technology impact"
            className="about-impact-image"
          />

          <div className="about-impact-overlay">
            <div className="about-impact-heading">
              <span>OUR IMPACT</span>
              <small>
                REAL TECHNOLOGY. REAL SAFETY.
              </small>
            </div>

            <div className="about-impact-items">
              {impactItems.map(
                ({ icon: Icon, title, subtitle }) => (
                  <div
                    className="about-impact-item"
                    key={title}
                  >
                    <div className="impact-icon">
                      <Icon />
                    </div>

                    <strong>{title}</strong>
                    <span>{subtitle}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================
          CLOSING
      ============================ */}

      <section className="about-closing">
        <div className="about-closing-container">
          <p className="about-closing-eyebrow">
            TOGETHER FOR A SAFER TOMORROW
          </p>

          <h2>
            AI-assisted surveillance with
            human-centered oversight.
          </h2>

          <p>
            The Dangerous-Person Detection System is
            designed to assist operators by analyzing
            images, videos, and live camera streams and
            highlighting potentially dangerous detections
            for review.
          </p>
        </div>
      </section>
    </div>
  );
}