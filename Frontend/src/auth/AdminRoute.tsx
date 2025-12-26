import { Redirect, Route, RouteProps } from "react-router-dom";
import { getAccessToken, isAuthenticated } from "./authStorage";
import { parseJwt } from "./jwt";

interface AdminRouteProps extends RouteProps {
    component: React.ComponentType<any>;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ component: Component, ...rest }) => {
    return (
        <Route
            {...rest}
            render={(props) => {
                if (!isAuthenticated()) return <Redirect to="/login" />;

                const token = getAccessToken();
                const payload = token ? parseJwt(token) : null;
                const role = payload?.role;

                return role === "ADMIN" ? <Component {...props} /> : <Redirect to="/home" />;
            }}
        />
    );
};

export default AdminRoute;
