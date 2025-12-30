import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonLoading,
  IonToast,
  IonRange,
} from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import { createMood, getMood } from "../api/mood";
import "./css/MoodThermometerWidget.css";

const labels: Record<number, string> = {
  1: "Very bad",
  2: "Bad",
  3: "Neutral",
  4: "Good",
  5: "Very good",
};

const emojis: Record<number, string> = {
  1: "😞",
  2: "😕",
  3: "😐",
  4: "🙂",
  5: "😁",
};

const MoodThermometerWidget: React.FC = () => {
  const [selected, setSelected] = useState<number>(3);
  const [lastSaved, setLastSaved] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const loadLast = async () => {
    const items = await getMood();
    if (items.length > 0) {
      setLastSaved(items[0].score);
      setSelected(items[0].score);
    } else {
      setLastSaved(null);
      setSelected(3);
    }
  };

  useEffect(() => {
    loadLast().catch(() => {});
  }, []);

  const onPick = async (score: number) => {
    setSelected(score);
    setIsLoading(true);
    try {
      await createMood(score);
      setLastSaved(score);
      setSuccessMessage(`Saved: ${score} (${labels[score]})`);
      setShowSuccess(true);
    } catch {
      setErrorMessage("Failed to save mood.");
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const subtitle = useMemo(() => `Tap or slide (1 = very bad, 5 = very good)`, []);

  return (
      <>
        <IonCard className="ui-card mood-card">
          <IonCardHeader>
            <IonCardTitle>Emotional thermometer</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            <div className="mood-subtitle">{subtitle}</div>

            {/* ✅ panel care “ține” sliderul + valoarea fără să iasă din card */}
            <div className="mood-panel">
              <div className="mood-scale">
                <span className="mood-scale-left">Bad</span>
                <span className="mood-scale-right">Excellent</span>
              </div>

              {/* ✅ wrapper pt range (overflow fix) */}
              <div className="mood-range-wrap">
                <IonRange
                    min={1}
                    max={5}
                    step={1}
                    snaps
                    ticks={false}
                    value={selected}
                    disabled={isLoading}
                    onIonChange={(e) => {
                      const v = Number(e.detail.value ?? 3);
                      setSelected(v);
                    }}
                    onIonKnobMoveEnd={(e) => {
                      const v = Number(e.detail.value ?? selected);
                      onPick(v);
                    }}
                    className="mood-range"
                />
              </div>

              <div className="mood-value">
                <span className="mood-emoji">{emojis[selected]}</span>
                <span className="mood-text">
                <b>{selected}</b> — {labels[selected]}
              </span>
              </div>
            </div>

            {/* ✅ 5 tappable buttons */}
            <div className="mood-buttons">
              {[1, 2, 3, 4, 5].map((n) => {
                const isActive = selected === n;
                return (
                    <button
                        key={n}
                        type="button"
                        className={`mood-chip ${isActive ? "is-active" : ""}`}
                        onClick={() => onPick(n)}
                        disabled={isLoading}
                        aria-label={`Mood ${n} - ${labels[n]}`}
                    >
                      <span className="mood-chip-emoji">{emojis[n]}</span>
                      <span className="mood-chip-num">{n}</span>
                    </button>
                );
              })}
            </div>

            <div className="mood-last">
              {lastSaved ? (
                  <div>
                    Last saved: <b>{lastSaved}</b> — {labels[lastSaved]}
                  </div>
              ) : (
                  <div className="mood-muted">No mood saved yet.</div>
              )}
            </div>
          </IonCardContent>
        </IonCard>

        <IonLoading isOpen={isLoading} message="Saving..." />
        <IonToast
            isOpen={showError}
            message={errorMessage}
            duration={2000}
            onDidDismiss={() => setShowError(false)}
        />
        <IonToast
            isOpen={showSuccess}
            message={successMessage}
            duration={1500}
            onDidDismiss={() => setShowSuccess(false)}
        />
      </>
  );
};

export default MoodThermometerWidget;
