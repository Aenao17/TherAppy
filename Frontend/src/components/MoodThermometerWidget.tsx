import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonLoading,
  IonToast,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { createMood, getMood } from "../api/mood";

const labels: Record<number, string> = {
  1: "Very bad",
  2: "Bad",
  3: "Neutral",
  4: "Good",
  5: "Very good",
};

const MoodThermometerWidget: React.FC = () => {
  const [selected, setSelected] = useState<number | null>(null);
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
    } else {
      setLastSaved(null);
    }
  };

  useEffect(() => {
    loadLast().catch(() => {
      // nu e critic dacă nu se încarcă
    });
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

  return (
    <>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Emotional thermometer</IonCardTitle>
        </IonCardHeader>

        <IonCardContent>
          <div style={{ marginBottom: 10, opacity: 0.85 }}>
            Tap a number (1 = very bad, 5 = very good)
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 10,
            }}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <IonButton
                key={n}
                expand="block"
                onClick={() => onPick(n)}
                disabled={isLoading}
                fill={(selected === n || lastSaved === n) ? "solid" : "outline"}
                style={{
                  height: 64,          // big tap target
                  fontSize: 20,
                  fontWeight: 700,
                  borderRadius: 16,
                }}
              >
                {n}
              </IonButton>
            ))}
          </div>

          <div style={{ marginTop: 12 }}>
            {lastSaved ? (
              <div>
                Last saved: <b>{lastSaved}</b> — {labels[lastSaved]}
              </div>
            ) : (
              <div style={{ opacity: 0.7 }}>No mood saved yet.</div>
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
