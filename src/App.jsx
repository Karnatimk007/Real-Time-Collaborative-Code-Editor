import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./components/RootLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CodingRoom from "./pages/CodingRoom";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {

  const routerObj = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        { path: "", element: <Home /> },
        { path: "login", element: <Login /> },
        { path: "register", element: <Register /> },

        // ✅ Protected Dashboard
        {
          path: "dashboard",
          element: (
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          )
        },

        // ✅ Protected Coding Room
        {
          path: "codingroom/:roomId",
          element: (
            <ProtectedRoute>
              <CodingRoom />
            </ProtectedRoute>
          )
        }
      ]
    }
  ]);

  return <RouterProvider router={routerObj} />;
}

export default App;