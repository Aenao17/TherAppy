import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader, IonIcon,
    IonPage,
    IonTitle,
    IonToolbar, useIonRouter,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { IonLoading, IonToast } from "@ionic/react";
import { IonItem, IonLabel, IonList, IonNote } from "@ionic/react";
import { IonButton, IonButtons, IonAlert } from "@ionic/react";
import { patchJsonAuth, deleteAuth, getJsonAuth } from "../api/api";
import {homeOutline} from "ionicons/icons";


const AdminDashboard: React.FC = () => {

    type AdminStatsResponse = {
        totalUsers: number;
    };

    type AdminUserItem = {
        id: number;
        username: string;
        role: string;
    };

    type AdminUsersResponse = {
        users: AdminUserItem[];
    };

    const router = useIonRouter();

    const [stats, setStats] = useState<AdminStatsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [users, setUsers] = useState<AdminUserItem[]>([]);
    const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

    const [errorMessage, setErrorMessage] = useState("");
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const data = await getJsonAuth<AdminStatsResponse>("/api/admin/stats");
                setStats(data);
                const usersResp = await getJsonAuth<AdminUsersResponse>("/api/admin/users");
                setUsers(usersResp.users);
            } catch (e) {
                const msg = e instanceof Error ? e.message : "Failed to load admin stats";
                setErrorMessage(msg);
                setShowError(true);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const loadUsers = async () => {
        const usersResp = await getJsonAuth<AdminUsersResponse>("/api/admin/users");
        setUsers(usersResp.users);
    };

    const toggleRole = async (user: AdminUserItem) => {
        const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
        setIsLoading(true);
        try {
            await patchJsonAuth<void>(`/api/admin/users/${user.id}/role`, { role: newRole });
            await loadUsers();
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Failed to change role";
            setErrorMessage(msg);
            setShowError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const confirmDelete = (id: number) => setDeleteUserId(id);

    const doDelete = async () => {
        if (deleteUserId == null) return;

        setIsLoading(true);
        try {
            await deleteAuth(`/api/admin/users/${deleteUserId}`);
            setDeleteUserId(null);
            await loadUsers();
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Failed to delete user";
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
                    <IonTitle slot="start">Admin Dashboard</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => router.push("/home", "root")} title="Home" aria-label="Home">
                            <IonIcon icon={homeOutline} />
                        </IonButton>

                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding">
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>Overview</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        {stats ? (
                            <div>Total users: <b>{stats.totalUsers}</b></div>
                        ) : (
                            <div>No stats loaded.</div>
                        )}
                    </IonCardContent>
                </IonCard>

                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>User Management</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        {users.length === 0 ? (
                            <div>No users found.</div>
                        ) : (
                            <IonList>
                                {users.map((u) => (
                                    <IonItem key={u.id}>
                                        <IonLabel>
                                            <div><b>{u.username}</b></div>
                                            <div>ID: {u.id}</div>
                                        </IonLabel>
                                        <IonNote slot="end">{u.role}</IonNote>
                                        <IonButtons slot="end">
                                            <IonButton onClick={() => toggleRole(u)}>
                                                {u.role === "ADMIN" ? "Demote" : "Promote"}
                                            </IonButton>

                                            <IonButton color="danger" onClick={() => confirmDelete(u.id)}>
                                                Delete
                                            </IonButton>
                                        </IonButtons>

                                    </IonItem>
                                ))}
                            </IonList>
                        )}
                    </IonCardContent>
                </IonCard>
                <IonAlert
                    isOpen={deleteUserId !== null}
                    header="Delete user?"
                    message="This action cannot be undone."
                    buttons={[
                        {
                            text: "Cancel",
                            role: "cancel",
                            handler: () => setDeleteUserId(null),
                        },
                        {
                            text: "Delete",
                            role: "destructive",
                            handler: doDelete,
                        },
                    ]}
                    onDidDismiss={() => setDeleteUserId(null)}
                />
                <IonLoading isOpen={isLoading} message="Loading admin stats..." />
                <IonToast
                    isOpen={showError}
                    message={errorMessage}
                    duration={2500}
                    onDidDismiss={() => setShowError(false)}
                />
            </IonContent>
        </IonPage>
    );
};

export default AdminDashboard;
