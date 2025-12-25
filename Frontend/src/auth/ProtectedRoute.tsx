import { Route, Redirect, RouteProps } from "react-router-dom";
import { isAuthenticated } from "./authStorage";

interface ProtectedRouteProps extends RouteProps {
  component: React.ComponentType<any>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
                                                         component: Component,
                                                         ...rest
                                                       }) => {
  return (
      <Route
          {...rest}
          render={(props) =>
              isAuthenticated() ? (
                  <Component {...props} />
              ) : (
                  <Redirect to="/login" />
              )
          }
      />
  );
};

export default ProtectedRoute;
