import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./components/RootLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import CodingRoom from "./pages/CodingRoom";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "sonner";

function App() {

  const routerObj = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        { path: "", element: <Home /> },
        { path: "login", element: <Login /> },
        { path: "register", element: <Register /> },
        { path: "forgot-password", element: <ForgotPassword /> },

        // ✅ Protected Dashboard
        {
          path: "dashboard",
          element: (
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          )
        },

      ]
    },
    // ✅ Protected Coding Room (Full Screen, outside RootLayout)
    {
      path: "/codingroom/:roomId",
      element: (
        <ProtectedRoute>
          <CodingRoom />
        </ProtectedRoute>
      )
    }
  ]);

  return (
    <>
      <Toaster 
        position="top-center" 
        richColors 
        closeButton
        theme="dark"
        toastOptions={{
          style: {
            background: "#1e1e2e",
            color: "#cdd6f4",
            border: "1px solid rgba(137, 180, 250, 0.2)",
            fontFamily: '"Outfit", sans-serif'
          }
        }}
      />
      <RouterProvider router={routerObj} />
    </>
  );
}

export default App;