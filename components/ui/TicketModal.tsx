"use client";

import { useEffect, useState } from "react";
import { useExperience } from "@/lib/store";
import { soundEngine } from "@/lib/soundEngine";
import { FORMAT_OPTIONS } from "@/lib/constants";
import styles from "./modal.module.css";

const DATES = [
  { id: "thurs", day: "Thu", date: "May 07", label: "Midnight Preview" },
  { id: "fri", day: "Fri", date: "May 08", label: "World Premiere" },
  { id: "sat", day: "Sat", date: "May 09", label: "Opening Weekend" },
  { id: "sun", day: "Sun", date: "May 10", label: "Opening Weekend" },
];

const SEAT_ROWS = ["A", "B", "C", "D", "E"];
const SEATS_PER_ROW = 10;
const OCCUPIED_SEATS = ["B3", "B4", "C5", "C6", "D7", "E2", "E8"];

export default function TicketModal() {
  const open = useExperience((s) => s.ticketModalOpen);
  const setOpen = useExperience((s) => s.setTicketModalOpen);
  const selectedSeats = useExperience((s) => s.selectedSeats);
  const toggleSeat = useExperience((s) => s.toggleSeat);
  const showToast = useExperience((s) => s.showToast);

  const [selectedFormat, setSelectedFormat] = useState("imax");
  const [selectedDate, setSelectedDate] = useState("fri");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  // Countdown timer to May 8, 2026
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const target = new Date("2026-05-08T00:00:00Z").getTime();
    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = target - now;
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, mins, secs });
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // ESC key closes modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        soundEngine.playClick();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (selectedSeats.length === 0) {
      showToast("Please select at least 1 seat on the theater map", "warning");
      return;
    }
    const randomCode = "DOOM-" + Math.random().toString(36).substring(2, 7).toUpperCase() + "-2026";
    setTicketId(randomCode);
    setSubmitted(true);
    soundEngine.playSuccess();
    showToast("VIP Premiere Priority Pass Confirmed!", "success");
  };

  const handleSeatClick = (seatId: string) => {
    if (OCCUPIED_SEATS.includes(seatId)) {
      soundEngine.playClick();
      showToast(`Seat ${seatId} is already reserved by a VIP guest`, "warning");
      return;
    }
    soundEngine.playClick();
    toggleSeat(seatId);
  };

  const copyShareLink = () => {
    soundEngine.playClick();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("Copied Doomsday Experience link to clipboard!", "success");
    }
  };

  const shareTwitter = () => {
    soundEngine.playClick();
    const text = encodeURIComponent(
      `I just claimed my VIP Priority Premiere Pass for AVENGERS: DOOMSDAY (${selectedSeats.join(
        ", "
      )})! The multiverse is breaking. Only legends remain.\n\nExperience it: `
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.href)}`, "_blank");
  };

  const printPass = () => {
    soundEngine.playClick();
    window.print();
  };

  const activeFmt = FORMAT_OPTIONS.find((f) => f.id === selectedFormat);
  const activeDt = DATES.find((d) => d.id === selectedDate);

  return (
    <div
      className={styles.backdrop}
      onClick={() => {
        setOpen(false);
        soundEngine.playClick();
      }}
      aria-modal="true"
      role="dialog"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeBtn}
          onClick={() => {
            setOpen(false);
            soundEngine.playClick();
          }}
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className={styles.header}>
          <div className={styles.kicker}>Marvel Studios Premiere Access</div>
          <h2 className={styles.title}>AVENGERS: DOOMSDAY</h2>
          <p className={styles.subtitle}>
            Reserve VIP Premiere Access, Theater Seats &amp; IMAX Pre-Sale Priority · May 2026
          </p>
        </div>

        {/* Global Premiere Countdown */}
        <div className={styles.countdownWrap}>
          <div className={styles.countdownUnit}>
            <span className={styles.countdownNum}>{timeLeft.days}</span>
            <span className={styles.countdownLbl}>Days</span>
          </div>
          <div className={styles.countdownUnit}>
            <span className={styles.countdownNum}>{String(timeLeft.hours).padStart(2, "0")}</span>
            <span className={styles.countdownLbl}>Hours</span>
          </div>
          <div className={styles.countdownUnit}>
            <span className={styles.countdownNum}>{String(timeLeft.mins).padStart(2, "0")}</span>
            <span className={styles.countdownLbl}>Mins</span>
          </div>
          <div className={styles.countdownUnit}>
            <span className={styles.countdownNum}>{String(timeLeft.secs).padStart(2, "0")}</span>
            <span className={styles.countdownLbl}>Secs</span>
          </div>
        </div>

        {!submitted ? (
          <>
            <div className={styles.sectionTitle}>
              <span>01 // Select Cinematic Experience</span>
              <span style={{ fontSize: "10px", color: "var(--silver)" }}>{activeFmt?.audio}</span>
            </div>
            <div className={styles.formatGrid}>
              {FORMAT_OPTIONS.map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  className={`${styles.formatCard} ${selectedFormat === fmt.id ? styles.formatActive : ""}`}
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedFormat(fmt.id);
                  }}
                  onMouseEnter={() => soundEngine.playHover()}
                >
                  <span className={styles.formatBadge}>{fmt.badge}</span>
                  <div className={styles.formatName}>{fmt.name}</div>
                  <div className={styles.formatDesc}>{fmt.desc}</div>
                </button>
              ))}
            </div>

            <div className={styles.sectionTitle}>
              <span>02 // Select Premiere Date</span>
            </div>
            <div className={styles.dates}>
              {DATES.map((dt) => (
                <button
                  key={dt.id}
                  type="button"
                  className={`${styles.dateBtn} ${selectedDate === dt.id ? styles.dateActive : ""}`}
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedDate(dt.id);
                  }}
                  onMouseEnter={() => soundEngine.playHover()}
                >
                  <div className={styles.dateDay}>{dt.day}</div>
                  <div className={styles.dateNum}>{dt.date}</div>
                </button>
              ))}
            </div>

            <div className={styles.sectionTitle}>
              <span>03 // Interactive VIP Theater Seat Selection</span>
              <span style={{ fontSize: "10px", color: "var(--green)" }}>
                Selected: {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}
              </span>
            </div>

            <div className={styles.seatMapWrap}>
              <div className={styles.screenCurve}>
                <span className={styles.screenLabel}>IMAX 70MM CURVED CANVASS</span>
              </div>

              <div className={styles.seatsGrid}>
                {SEAT_ROWS.map((row) => (
                  <div key={row} className={styles.seatRow}>
                    <span className={styles.rowLabel}>{row}</span>
                    {Array.from({ length: SEATS_PER_ROW }).map((_, idx) => {
                      const seatId = `${row}${idx + 1}`;
                      const isOccupied = OCCUPIED_SEATS.includes(seatId);
                      const isSelected = selectedSeats.includes(seatId);
                      return (
                        <button
                          key={seatId}
                          type="button"
                          className={`${styles.seatBtn} ${
                            isOccupied ? styles.seatOccupied : isSelected ? styles.seatSelected : ""
                          }`}
                          onClick={() => handleSeatClick(seatId)}
                          onMouseEnter={() => !isOccupied && soundEngine.playHover()}
                          aria-label={`Seat ${seatId}`}
                          title={`Seat ${seatId} ${isOccupied ? "(Reserved)" : isSelected ? "(Selected)" : "(Available)"}`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className={styles.seatLegend}>
                <div className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: "var(--green)" }} />
                  <span>Your Seats</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: "rgba(4, 28, 18, 0.9)", border: "1px solid var(--green)" }} />
                  <span>Available</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: "rgba(255, 255, 255, 0.2)" }} />
                  <span>Reserved</span>
                </div>
              </div>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.sectionTitle}>04 // Priority Guest Notification</div>
              <div className={styles.inputGroup}>
                <input
                  type="email"
                  required
                  placeholder="Enter your email for Instant VIP Pass & Holographic Badge"
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
            <div className={styles.holoShimmer} />

            <div className={styles.passHeader}>
              <span className={styles.passBadge}>VIP Priority Reserved</span>
              <span className={styles.passCode}>{ticketId}</span>
            </div>

            <div className={styles.passDetails}>
              <div>
                <div className={styles.passLabel}>Cinematic Experience</div>
                <div className={styles.passValue}>{activeFmt?.name}</div>
              </div>
              <div>
                <div className={styles.passLabel}>Premiere Date</div>
                <div className={styles.passValue}>{activeDt?.date} (2026)</div>
              </div>
              <div>
                <div className={styles.passLabel}>Reserved Seats</div>
                <div className={styles.passValue} style={{ color: "var(--green)" }}>
                  {selectedSeats.join(", ")}
                </div>
              </div>
              <div>
                <div className={styles.passLabel}>VIP Guest</div>
                <div className={styles.passValue}>{email}</div>
              </div>
            </div>

            <div className={styles.barcode} aria-hidden>
              {[4, 2, 8, 2, 5, 2, 9, 3, 2, 6, 2, 7, 3, 2, 5, 2, 8, 3, 4, 2, 6, 2, 9, 2, 4, 3, 7, 2].map((w, idx) => (
                <span
                  key={idx}
                  className={styles.barcodeBar}
                  style={{ width: `${w}px`, height: `${60 + ((idx * 7) % 40)}%` }}
                />
              ))}
            </div>

            <div className={styles.ticketActions}>
              <button type="button" className={styles.actionBtn} onClick={printPass}>
                ⎙ Print Pass
              </button>
              <button type="button" className={styles.actionBtn} onClick={shareTwitter}>
                𝕏 Share on Twitter
              </button>
              <button type="button" className={styles.actionBtn} onClick={copyShareLink}>
                ⧉ Copy Invite Link
              </button>
            </div>

            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <button
                type="button"
                className={styles.submitBtn}
                style={{ width: "100%" }}
                onClick={() => {
                  soundEngine.playClick();
                  setOpen(false);
                }}
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
