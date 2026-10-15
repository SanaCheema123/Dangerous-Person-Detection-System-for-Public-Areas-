import {
  ArrowRight,
  Eye,
  BrainCircuit,
  ShieldCheck,
  MonitorPlay,
  UsersRound,
  Activity,
} from "lucide-react";

import Navbar from "../components/Navbar";

import heroImage from "../assets/hero-right.png";
import liveDetectionImage from "../assets/live-detection-feed.png";

import "./Landing.css";

const features = [
  {
    icon: Eye,
    title1: "REAL-TIME",
    title2: "DETECTION",
    description:
      "Classifies detected people from live camera frames using the connected YOLO11n backend.",
  },

  {
    icon: BrainCircuit,
    title1: "AI-POWERED",
    title2: "ANALYSIS",
    description:
      "YOLO11n performs person-level visual classification using observable cues learned from the training data.",
  },

  {
    icon: ShieldCheck,
    title1: "ACCURATE &",
    title2: "RELIABLE",
    description:
      "Hard-negative fine-tuning targets known false-positive patterns while human review remains essential.",
  },

  {
    icon: MonitorPlay,
    title1: "MULTI-SOURCE",
    title2: "SUPPORT",
    description:
      "Works with images, videos, and live camera feeds.",
  },

  {
    icon: UsersRound,
    title1: "HUMAN",
    title2: "OVERSIGHT",
    description:
      "Designed to assist human reviewers, not replace them.",
  },
];

const metrics = [
  {
    value: "0.826",
    label: "PRECISION",
    percentage: 82.6,
  },
  {
    value: "0.626",
    label: "RECALL",
    percentage: 62.6,
  },
  {
    value: "0.712",
    label: "F1-SCORE",
    percentage: 71.2,
  },
  {
    value: "0.669",
    label: "MAP50",
    percentage: 66.9,
  },
];

function HudCorners() {
  return (
    <>
      <span className="panel-corner top-left" />
      <span className="panel-corner top-right" />
      <span className="panel-corner bottom-left" />
      <span className="panel-corner bottom-right" />
    </>
  );
}

function FeatureCard({ icon: Icon, title1, title2, description }) {
  return (
    <article className="feature-card">
      <HudCorners />

      <div className="feature-icon">
        <span className="icon-corner icon-tl" />
        <span className="icon-corner icon-tr" />
        <span className="icon-corner icon-bl" />
        <span className="icon-corner icon-br" />

        <Icon />
      </div>

      <h3>
        {title1}
        <br />
        {title2}
      </h3>

      <p>{description}</p>
    </article>
  );
}

function MetricCircle({ value, label, percentage }) {
  return (
    <div className="performance-item">
      <div
        className="performance-circle"
        style={{
          "--metric": `${percentage * 3.6}deg`,
        }}
      >
        <div className="performance-center">
          {value}
        </div>
      </div>

      <span>{label}</span>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="landing-page">
      <Navbar />

      {/* HERO */}

      <section className="hero-section" id="home">
        <div className="hero-grid-overlay" />
        <div className="hero-noise" />

        <div className="hero-container">
          <div className="hero-left">
            <div className="hero-eyebrow">
              <div>SEE THE RISK.</div>

              <div className="muted">
                PROTECT THE PUBLIC.
              </div>
            </div>

            <h1 className="hero-title">
              <span
                className="glitch-title teal-title"
                data-text="DETECT"
              >
                DETECT
              </span>

              <span
                className="glitch-title dark-title"
                data-text="BEFORE"
              >
                BEFORE
              </span>

              <span
                className="glitch-title dark-title last-line"
                data-text="IT HAPPENS."
              >
                IT HAPPENS.
              </span>
            </h1>

            <div className="hero-description">
              AI-powered vision system that detects
              <br />
              people associated with potentially
              <br />
              dangerous objects in real-time.
            </div>

            <a href="#demo" className="explore-button">
              <span>EXPLORE LIVE DEMO</span>

              <div className="explore-arrow">
                <ArrowRight />
              </div>
            </a>
          </div>

          <div className="hero-right">
            <div className="hero-aura aura-one" />
            <div className="hero-aura aura-two" />

            <img
              src={heroImage}
              className="hero-main-image"
              alt="Safe and potentially dangerous person detection"
            />

            <div className="scan-widget">
              <strong>SCANNING...</strong>

              <div>
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
            </div>

            

            <div className="system-status">
              
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE CARDS */}

      <section className="features-section" id="models">
        <div className="features-container">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title1}
              {...feature}
            />
          ))}
        </div>
      </section>

      {/* DASHBOARD */}

      <section
        className="dashboard-section"
        id="demo"
      >
        <div className="dashboard-container">

          {/* LEFT PANEL */}

          <article className="dashboard-panel feed-panel">
            <HudCorners />

            <header className="dashboard-panel-header">
              <div>
                <Activity />

                <span>
                  LIVE DETECTION FEED
                </span>
              </div>

              <div className="live-label">
                <i />
                LIVE
              </div>
            </header>

            <div className="feed-image-frame">
              <img
                src={liveDetectionImage}
                alt="Live dangerous person detection"
              />

              <div className="feed-scan-line" />
            </div>
          </article>

          {/* RIGHT PANEL */}

          <article
            className="dashboard-panel system-panel"
            id="results"
          >
            <HudCorners />

            <header className="dashboard-panel-header">
              <div>
                <Activity />

                <span>
                  SYSTEM OVERVIEW
                </span>
              </div>
            </header>

            <div className="system-chart">
              <svg
                viewBox="0 0 700 100"
                preserveAspectRatio="none"
              >
                <line
                  x1="0"
                  y1="50"
                  x2="700"
                  y2="50"
                  className="chart-baseline"
                />

                <polyline
                  className="chart-line"
                  points="
                    0,47
                    25,46
                    50,62
                    75,80
                    100,60
                    125,52
                    150,42
                    175,55
                    200,50
                    225,55
                    250,46
                    275,82
                    300,25
                    325,68
                    350,54
                    375,44
                    400,64
                    425,72
                    450,61
                    475,56
                    500,44
                    525,60
                    550,58
                    575,32
                    600,76
                    625,63
                    650,58
                    675,61
                    700,54
                  "
                />
              </svg>
            </div>

            <div className="overview-stats">
              <div>
                <span>MODEL</span>
                <strong>YOLO11n</strong>
              </div>

              <div>
                <span>CLASSES</span>
                <strong>02</strong>
              </div>

              <div>
                <span>INPUT SIZE</span>
                <strong>640</strong>
              </div>
            </div>

            <div className="performance-section">
              <h3>FROZEN VALIDATION PERFORMANCE · V2</h3>

              <div className="performance-grid">
                {metrics.map((metric) => (
                  <MetricCircle
                    key={metric.label}
                    {...metric}
                  />
                ))}
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}