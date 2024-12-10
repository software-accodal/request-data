import { useState, useEffect } from "react";
import MainApp from "./pages/mainapp.jsx";
import "./App.css";

function App() {
  const [isReady, setIsReady] = useState(false);
  const [missive, setMissive] = useState();

  useEffect(() => {
    if (missive) return;

    setMissive(window.Missive);
    window.Missive.on("main_action", () => setIsReady(true));
  });

  if (!isReady || !missive) {
    return null;
  }

  return <MainApp missive={missive} />;
}

export default App;
