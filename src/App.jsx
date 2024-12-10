import { useState, useEffect } from "react";
import MainApp from "./pages/mainapp.jsx";
import "./App.css";

function App() {
  const [isReady, setIsReady] = useState(false);
  const [missive, setMissive] = useState();

  useEffect(() => {
    console.log("before");
    if (missive || !window.Missive) return;
    console.log("after");

    setMissive(window.Missive);
    window.Missive.on("main_action", () => {
      setIsReady(true);
      console.log("main action");
    });
  });

  if (!isReady || !missive) {
    return null;
  }

  return <MainApp missive={missive} />;
}

export default App;
