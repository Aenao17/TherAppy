import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Home.css';
import { IonButton } from "@ionic/react";
import { postJson } from "../api/api";
import { clearTokens, getRefreshToken } from "../auth/authStorage";
import { useIonRouter } from "@ionic/react";


const Home: React.FC = () => {

    const router = useIonRouter();

    const onLogout = async () => {
        const refreshToken = getRefreshToken();

        try {
            if (refreshToken) {
                await postJson<void>("/api/auth/logout", { refreshToken });
            }
        } catch {
            // chiar dacă backend-ul dă eroare, noi tot “delogăm” local
        } finally {
            clearTokens();
            router.push("/login", "root");
        }
    };


    return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Blank</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Blank</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer />
          <IonButton expand="block" onClick={onLogout}>
              Logout
          </IonButton>

      </IonContent>
    </IonPage>
  );
};

export default Home;
