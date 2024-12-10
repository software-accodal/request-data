import { useState, useEffect } from "react";
import MainApp from "./pages/mainapp.jsx";
import { useInView } from "react-intersection-observer";
import "./App.css";

function App() {
  const [missive, setMissive] = useState();
  const { ref, inView } = useInView({});

  useEffect(() => {
    if (!inView || missive) return;
    console.log("initialRun");
    setMissive(window.Missive);
  });

  return (
    <div ref={ref}>{missive && inView && <MainApp missive={missive} />}</div>
  );
}

export default App;
