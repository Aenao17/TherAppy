import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonLoading,
    IonToast,
    IonItem,
    IonList,
    IonButton,
    IonAlert,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { patchJsonAuth, deleteAuth, getJsonAuth } from "../api/api";

import "./css/base.css";
import "./css/layout.css";
import "./css/forms.css";
import "./css/cards.css";
import "./css/lists.css";
import "./css/utilities.css";
import "./css/AdminDashboard.css";

const AdminDashboard: React.FC = () => {
    type AdminStatsResponse = { totalUsers: number };

    type AdminUserItem = {
        id: number;
        username: string;
        role: string;
    };

    type AdminUsersResponse = { users: AdminUserItem[] };

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
                <IonToolbar className="app-toolbar">
                    <IonTitle>Admin Dashboard</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="admin-page">
                <div className="admin-shell">
                    <div className="admin-header">
                        <div>
                            <h2 className="admin-title">Administration</h2>
                            <p className="admin-subtitle">Users overview & management</p>
                        </div>

                        <div className="admin-pill">
                            <span className="admin-pill-label">Total users</span>
                            <span className="admin-pill-value">{stats?.totalUsers ?? "—"}</span>
                        </div>
                    </div>

                    <div className="admin-grid">
                        <IonCard className="ui-card admin-card">
                            <IonCardHeader>
                                <IonCardTitle>Overview</IonCardTitle>
                            </IonCardHeader>
                            <IonCardContent>
                                <div className="admin-overview">
                                    <div className="admin-metric">
                                        <div className="admin-metric-label">Total users</div>
                                        <div className="admin-metric-value">{stats?.totalUsers ?? "—"}</div>
                                    </div>

                                    <div className="admin-hint">
                                        Tip: Promote/demote admins and remove unused accounts.
                                    </div>
                                </div>
                            </IonCardContent>
                        </IonCard>

                        <IonCard className="ui-card admin-card admin-card--wide">
                            <IonCardHeader>
                                <IonCardTitle>User Management</IonCardTitle>
                            </IonCardHeader>
                            <IonCardContent>
                                {users.length === 0 ? (
                                    <div className="admin-empty">No users found.</div>
                                ) : (
                                    <IonList className="admin-list">
                                        {users.map((u) => (
                                            <IonItem key={u.id} lines="none" className="admin-row" detail={false}>
                                                {/* ✅ control total: nu mai folosim slot=end */}
                                                <div className="admin-row-grid">
                                                    <div className="admin-row-info">
                                                        <div className="admin-username" title={u.username}>
                                                            @{u.username}
                                                        </div>
                                                        <div className="admin-meta">ID: {u.id}</div>
                                                    </div>

                                                    <div className="admin-row-role">
                                                        <span className={`role-badge role-${u.role.toLowerCase()}`}>{u.role}</span>
                                                    </div>

                                                    <div className="admin-row-actions">
                                                        <IonButton
                                                            className="secondary-button"
                                                            onClick={() => toggleRole(u)}
                                                            disabled={isLoading}
                                                        >
                                                            {u.role === "ADMIN" ? "Demote" : "Promote"}
                                                        </IonButton>

                                                        <IonButton
                                                            className="danger-button"
                                                            onClick={() => confirmDelete(u.id)}
                                                            disabled={isLoading}
                                                        >
                                                            Delete
                                                        </IonButton>
                                                    </div>
                                                </div>
                                            </IonItem>
                                        ))}
                                    </IonList>
                                )}
                            </IonCardContent>
                        </IonCard>
                    </div>
                </div>

                <IonAlert
                    isOpen={deleteUserId !== null}
                    header="Delete user?"
                    message="This action cannot be undone."
                    buttons={[
                        { text: "Cancel", role: "cancel", handler: () => setDeleteUserId(null) },
                        { text: "Delete", role: "destructive", handler: doDelete },
                    ]}
                    onDidDismiss={() => setDeleteUserId(null)}
                />

                <IonLoading isOpen={isLoading} message="Loading admin data..." />
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
