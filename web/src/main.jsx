import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./redux/store.js";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
    <Toaster position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "var(--light-color1)",
          color: "var(--text-color3)",
          borderRadius: "8px",
          padding: "0.5rem 1.5rem",
          fontSize: "1.1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        },
      }} />
  </Provider>
);
