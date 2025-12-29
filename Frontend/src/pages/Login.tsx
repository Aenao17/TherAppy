import {
    IonButton,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonLoading,
    IonPage,
    IonTitle,
    IonToast,
    IonToolbar,
} from "@ionic/react";
import { useState } from "react";
import { postJson } from "../api/api";
import { setTokens } from "../auth/authStorage";
import { useIonRouter } from "@ionic/react";


type AuthResponse = {
    accessToken: string;
    refreshToken: string;
    tokenType: string; // "Bearer"
};

const Login: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [isLoading, setIsLoading] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");
    const [showError, setShowError] = useState(false);

    const router = useIonRouter();

    const validate = (): string | null => {
        const u = username.trim();
        if (u.length < 3) return "Username must be at least 3 characters.";
        if (password.length < 8) return "Password must be at least 8 characters.";
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
            const resp = await postJson<AuthResponse>("/api/auth/login", {
                username: username.trim(),
                password,
            });

            setTokens(resp.accessToken, resp.refreshToken);
            router.push("/home", "root");

            // (Pasul următor) aici vom face redirect către o pagină protejată
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Login failed";
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
                    <IonTitle>Log in</IonTitle>
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
                        autocomplete="current-password"
                    />
                </IonItem>

                <IonButton expand="block" className="ion-margin-top" onClick={onSubmit}>
                    Log in
                </IonButton>

                <IonButton expand="block" fill="clear" routerLink="/signup">
                    Don't have an account? Register here!
                </IonButton>

                <IonLoading isOpen={isLoading} message="Logging in..." />

                <IonToast
                    isOpen={showError}
                    message={errorMessage}
                    duration={2000}
                    onDidDismiss={() => setShowError(false)}
                />
            </IonContent>
        </IonPage>
    );
};

export default Login;