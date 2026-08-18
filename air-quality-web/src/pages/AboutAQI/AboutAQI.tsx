import {
  Activity,
  CircleCheck,
  Cloud,
  HeartPulse,
  House,
  RefreshCw,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react";

import "./AboutAQI.scss";

const aqiLevels = [
  {
    status: "Good",
    range: "0–50",
    description:
      "Air quality is considered good. Outdoor activities can continue as usual.",
    icon: CircleCheck,
    className: "good",
  },
  {
    status: "Moderate",
    range: "51–80",
    description:
      "Air quality is acceptable, but sensitive people may want to reduce prolonged outdoor activity.",
    icon: TriangleAlert,
    className: "moderate",
  },
  {
    status: "Poor",
    range: "81+",
    description:
      "Air quality may affect health. Reducing prolonged or strenuous outdoor activity is recommended.",
    icon: ShieldAlert,
    className: "poor",
  },
];

const poorAirRecommendations = [
  {
    icon: Activity,
    title: "Reduce outdoor activity",
    text: "Limit prolonged or strenuous exercise outdoors.",
  },
  {
    icon: House,
    title: "Keep windows closed",
    text: "Avoid unnecessary ventilation during periods of poor air quality.",
  },
  {
    icon: HeartPulse,
    title: "Pay attention to symptoms",
    text: "Take a break if you notice respiratory discomfort.",
  },
  {
    icon: RefreshCw,
    title: "Check current readings",
    text: "Review air quality before planning longer outdoor activities.",
  },
];

function AboutAQI() {
  return (
    <section className="about-aqi">
      <header className="about-aqi__header">
        <div>
          <h1 className="about-aqi__title">About AQI</h1>

          <p className="about-aqi__subtitle">
            Understand air quality levels and particulate matter measurements
          </p>
        </div>
      </header>

      <section className="about-aqi__intro">
        <div className="about-aqi__intro-content">
          <span className="about-aqi__eyebrow">Air Quality Index</span>

          <h2>What does AQI tell you?</h2>

          <p>
            AQI provides a simple way to understand the current air quality
            level and how much attention should be paid to outdoor exposure.
          </p>
        </div>

        <div
          className="about-aqi__intro-visual"
          role="img"
          aria-label="AQI scale from 0 to 100 and above. Lower values indicate better air quality and higher values indicate poorer air quality."
        >
          <div className="about-aqi__scale">
            <div className="about-aqi__scale-track">
              <span className="about-aqi__scale-good" />
              <span className="about-aqi__scale-moderate" />
              <span className="about-aqi__scale-poor" />
            </div>

            <div className="about-aqi__scale-labels">
              <span>0</span>
              <span>50</span>
              <span>80</span>
              <span>100+</span>
            </div>
          </div>

          <div className="about-aqi__scale-caption">
            <span>Lower AQI · Better air</span>

            <span>Higher AQI · Poorer air</span>
          </div>
        </div>
      </section>

      <section className="about-aqi__section">
        <div className="about-aqi__section-heading">
          <h2>AQI Levels</h2>

          <p>Three air quality levels used throughout this dashboard</p>
        </div>

        <div className="about-aqi__levels">
          {aqiLevels.map(
            ({ status, range, description, icon: Icon, className }) => (
              <article
                className={`about-aqi__level about-aqi__level--${className}`}
                key={status}
              >
                <div className="about-aqi__level-top">
                  <div className="about-aqi__level-icon" aria-hidden="true">
                    <Icon size={21} strokeWidth={1.8} />
                  </div>

                  <span className="about-aqi__level-range">{range}</span>
                </div>

                <h3>{status}</h3>

                <p>{description}</p>
              </article>
            ),
          )}
        </div>
      </section>

      <section className="about-aqi__importance">
        <div className="about-aqi__importance-icon" aria-hidden="true">
          <HeartPulse size={22} strokeWidth={1.8} />
        </div>

        <div>
          <h2>Why air quality matters</h2>

          <p>
            Poor air quality can affect breathing, physical comfort and overall
            well-being. Children, older adults and people with respiratory
            conditions may be more sensitive to elevated pollution levels.
          </p>
        </div>
      </section>

      <div className="about-aqi__details-grid">
        <article className="about-aqi__pollutants">
          <div className="about-aqi__panel-heading">
            <div>
              <h2>Particulate Matter</h2>

              <p>The dashboard also tracks PM2.5 and PM10 readings</p>
            </div>

            <Cloud size={22} strokeWidth={1.7} aria-hidden="true" />
          </div>

          <div className="about-aqi__pollutant-list">
            <div className="about-aqi__pollutant">
              <div className="about-aqi__pollutant-name">
                <strong>PM2.5</strong>

                <span>Fine particles</span>
              </div>

              <p>
                Particles with a diameter of 2.5 micrometres or smaller. Because
                of their small size, they can travel deep into the respiratory
                system.
              </p>
            </div>

            <div className="about-aqi__pollutant">
              <div className="about-aqi__pollutant-name">
                <strong>PM10</strong>

                <span>Coarse particles</span>
              </div>

              <p>
                Particles with a diameter of 10 micrometres or smaller,
                including dust and other airborne particulate matter.
              </p>
            </div>
          </div>
        </article>

        <article className="about-aqi__health">
          <div className="about-aqi__panel-heading">
            <div>
              <h2>When air quality is poor</h2>

              <p>Simple steps to reduce your exposure</p>
            </div>

            <ShieldAlert size={22} strokeWidth={1.7} aria-hidden="true" />
          </div>

          <div className="about-aqi__recommendations">
            {poorAirRecommendations.map(({ icon: Icon, title, text }) => (
              <div className="about-aqi__recommendation" key={title}>
                <div
                  className="about-aqi__recommendation-icon"
                  aria-hidden="true"
                >
                  <Icon size={18} strokeWidth={1.7} />
                </div>

                <div>
                  <h3>{title}</h3>

                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

export default AboutAQI;
