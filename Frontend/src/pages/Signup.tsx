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
} from "@ionic/react";
import { useState } from "react";
import { IonLoading } from "@ionic/react";
import { postJson } from "../api/api";

type UserResponse = {
    id: number;
    username: string;
    role: string;
};

const Signup: React.FC = () => {
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

            <IonContent className="ion-padding">
                <IonItem>
                    <IonLabel position="stacked">Username</IonLabel>
                    <IonInput
                        value={username}
                        onIonInput={(e) => setUsername(e.detail.value ?? "")}
                        autocomplete="username"
                    />
                </IonItem>

                <IonItem>
                    <IonLabel position="stacked">Password</IonLabel>
                    <IonInput
                        value={password}
                        type="password"
                        onIonInput={(e) => setPassword(e.detail.value ?? "")}
                        autocomplete="new-password"
                    />
                </IonItem>

                <IonItem>
                    <IonLabel position="stacked">Confirm password</IonLabel>
                    <IonInput
                        value={confirmPassword}
                        type="password"
                        onIonInput={(e) => setConfirmPassword(e.detail.value ?? "")}
                        autocomplete="new-password"
                    />
                </IonItem>

                <IonButton expand="block" className="ion-margin-top" onClick={onSubmit}>
                    Create account
                </IonButton>
            </IonContent>

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
                duration={2000}
                onDidDismiss={() => setShowSuccess(false)}
            />

        </IonPage>
    );
};

export default Signup;