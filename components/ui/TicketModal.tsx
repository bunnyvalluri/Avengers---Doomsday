"use client";

import { useEffect, useState } from "react";
import { useExperience } from "@/lib/store";
import styles from "./modal.module.css";

const FORMATS = [
  { id: "imax", name: "IMAX 3D Laser", desc: "1.43:1 Expanded Aspect Ratio · 12-Track Audio" },
  { id: "dolby", name: "Dolby Cinema", desc: "Dolby Vision HDR · Dolby Atmos Spatial Audio" },
  { id: "4dx", name: "4DX Motion", desc: "Multi-Sensory Motion Chairs & Environmental FX" },
  { id: "screenx", name: "ScreenX 270°", desc: "270-Degree Panoramic Tri-Screen Projection" },
];

const DATES = [
  { id: "thurs", day: "Thu", date: "May 07", label: "Midnight Preview" },
  { id: "fri", day: "Fri", date: "May 08", label: "World Premiere" },
  { id: "sat", day: "Sat", date: "May 09", label: "Opening Weekend" },
  { id: "sun", day: "Sun", date: "May 10", label: "Opening Weekend" },
];

export default function TicketModal() {
  const open = useExperience((s) => s.ticketModalOpen);
  const setOpen = useExperience((s) => s.setTicketModalOpen);

  const [selectedFormat, setSelectedFormat] = useState("imax");
  const [selectedDate, setSelectedDate] = useState("fri");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  // ESC key closes modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const randomCode = "DOOM-" + Math.random().toString(36).substring(2, 7).toUpperCase() + "-2026";
    setTicketId(randomCode);
    setSubmitted(true);
  };

  const activeFmt = FORMATS.find((f) => f.id === selectedFormat);
  const activeDt = DATES.find((d) => d.id === selectedDate);

  return (
    <div className={styles.backdrop} onClick={() => setOpen(false)} aria-modal="true" role="dialog">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close modal">
          ✕
        </button>

        <div className={styles.header}>
          <div className={styles.kicker}>Marvel Studios Premiere Access</div>
          <h2 className={styles.title}>AVENGERS: DOOMSDAY</h2>
          <p className={styles.subtitle}>Reserve VIP Premiere Access &amp; IMAX Pre-Sale Alerts · May 2026</p>
        </div>

        {!submitted ? (
          <>
            <div className={styles.sectionTitle}>Select Cinematic Format</div>
            <div className={styles.formatGrid}>
              {FORMATS.map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  className={`${styles.formatCard} ${selectedFormat === fmt.id ? styles.formatActive : ""}`}
                  onClick={() => setSelectedFormat(fmt.id)}
                >
                  <div className={styles.formatName}>{fmt.name}</div>
                  <div className={styles.formatDesc}>{fmt.desc}</div>
                </button>
              ))}
            </div>

            <div className={styles.sectionTitle}>Select Premiere Date</div>
            <div className={styles.dates}>
              {DATES.map((dt) => (
                <button
                  key={dt.id}
                  type="button"
                  className={`${styles.dateBtn} ${selectedDate === dt.id ? styles.dateActive : ""}`}
                  onClick={() => setSelectedDate(dt.id)}
                >
                  <div className={styles.dateDay}>{dt.day}</div>
                  <div className={styles.dateNum}>{dt.date}</div>
                </button>
              ))}
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.sectionTitle}>Priority Ticket Notification</div>
              <div className={styles.inputGroup}>
                <input
                  type="email"
                  required
                  placeholder="Enter your email for VIP Pre-sale Pass"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                />
                <button type="submit" className={styles.submitBtn}>
                  Claim Priority Pass
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className={styles.ticketPass}>
            <div className={styles.passHeader}>
              <span className={styles.passBadge}>VIP Priority Reserved</span>
              <span className={styles.passCode}>{ticketId}</span>
            </div>

            <div className={styles.passDetails}>
              <div>
                <div className={styles.passLabel}>Experience</div>
                <div className={styles.passValue}>{activeFmt?.name}</div>
              </div>
              <div>
                <div className={styles.passLabel}>Premiere Date</div>
                <div className={styles.passValue}>{activeDt?.date} (2026)</div>
              </div>
              <div>
                <div className={styles.passLabel}>VIP Guest</div>
                <div className={styles.passValue}>{email}</div>
              </div>
              <div>
                <div className={styles.passLabel}>Status</div>
                <div className={styles.passValue} style={{ color: "#00ff9c" }}>Pre-Sale Priority Confirmed</div>
              </div>
            </div>

            <div className={styles.barcode} aria-hidden>
              {[4, 2, 8, 2, 5, 2, 9, 3, 2, 6, 2, 7, 3, 2, 5, 2, 8, 3, 4, 2, 6, 2, 9, 2, 4].map((w, idx) => (
                <span
                  key={idx}
                  className={styles.barcodeBar}
                  style={{ width: `${w}px`, height: `${60 + ((idx * 7) % 40)}%` }}
                />
              ))}
            </div>

            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <button
                type="button"
                className={styles.submitBtn}
                style={{ width: "100%" }}
                onClick={() => setOpen(false)}
              >
                Done · Return to Film
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
