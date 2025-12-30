import {
    IonButton,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonPage,
    IonTitle,
    IonToolbar,
    IonToast,
    IonLoading,
} from "@ionic/react";
import { useState } from "react";
import { postJson } from "../api/api";

import "./css/base.css";
import "./css/layout.css";
import "./css/forms.css";
import "./css/cards.css";
import "./css/Auth.css";

type UserResponse = {
    id: number;
    username: string;
    role: string;
};

const Signup: React.FC = () => {
    const router = useIonRouter();
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");

    const [errorMessage, setErrorMessage] = useState<string>("");
    const [showError, setShowError] = useState<boolean>(false);

    const [isLoading, setIsLoading] = useState(false);

    const [successMessage, setSuccessMessage] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    const validate = (): string | null => {
        const u = username.trim();
        if (u.length < 3) return "Username must be at least 3 characters.";
        if (password.length < 8) return "Password must be at least 8 characters.";
        if (password !== confirmPassword) return "Passwords do not match.";
        return null;
    };

    const onSubmit = async () => {
        const err = validate();
        if (err) {
            setErrorMessage(err);
            setShowError(true);
            return;
        }

        setIsLoading(true);
        try {
            const resp = await postJson<UserResponse>("/api/auth/signup", {
                username: username.trim(),
                password,
            });

            setSuccessMessage(`Account created for ${resp.username}. You can log in now.`);
            setShowSuccess(true);

            // reset form (opțional)
            setPassword("");
            setConfirmPassword("");
            router.push("/login", "root");
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Signup failed";
            setErrorMessage(msg);
            setShowError(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Sign up</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="auth-page">
                <div className="auth-shell">
                    {/* Decor subtil / “special” */}
                    <div className="auth-orb auth-orb--a" />
                    <div className="auth-orb auth-orb--b" />

                    <div className="auth-card auth-card--premium">
                        <div className="auth-hero">
                            <div className="auth-badge">TherAppy</div>
                            <h2 className="auth-title">Create your account</h2>
                            <p className="auth-subtitle">Join in a calm, safe space.</p>
                        </div>

                        <div className="form-group">
                            <IonItem lines="none" className="form-item form-item--premium">
                                <IonLabel position="stacked" className="form-label">
                                    Username
                                </IonLabel>
                                <IonInput
                                    value={username}
                                    placeholder="Choose a username"
                                    onIonInput={(e) => setUsername(e.detail.value ?? "")}
                                    autocomplete="username"
                                    className="form-input"
                                />
                            </IonItem>

                            <IonItem lines="none" className="form-item form-item--premium">
                                <IonLabel position="stacked" className="form-label">
                                    Password
                                </IonLabel>
                                <IonInput
                                    value={password}
                                    type="password"
                                    placeholder="Create a password (min 8 chars)"
                                    onIonInput={(e) => setPassword(e.detail.value ?? "")}
                                    autocomplete="new-password"
                                    className="form-input"
                                />
                            </IonItem>

                            <IonItem lines="none" className="form-item form-item--premium">
                                <IonLabel position="stacked" className="form-label">
                                    Confirm password
                                </IonLabel>
                                <IonInput
                                    value={confirmPassword}
                                    type="password"
                                    placeholder="Re-enter your password"
                                    onIonInput={(e) => setConfirmPassword(e.detail.value ?? "")}
                                    autocomplete="new-password"
                                    className="form-input"
                                />
                            </IonItem>
                        </div>

                        <div className="auth-actions">
                            <IonButton
                                expand="block"
                                className="primary-button primary-button--lavender"
                                onClick={onSubmit}
                                disabled={isLoading}
                            >
                                Create account
                            </IonButton>
                        </div>
                    </div>
                </div>

                <IonToast
                    isOpen={showError}
                    message={errorMessage}
                    duration={2000}
                    onDidDismiss={() => setShowError(false)}
                />

                <IonLoading isOpen={isLoading} message="Creating account..." />

                <IonToast
                    isOpen={showSuccess}
                    message={successMessage}
                    duration={2200}
                    onDidDismiss={() => setShowSuccess(false)}
                />
            </IonContent>
        </IonPage>
    );
};

export default Signup;
