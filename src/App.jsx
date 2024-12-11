import { useState, useEffect } from "react";
import MainApp from "./pages/mainapp.jsx";
import { useInView } from "react-intersection-observer";
import "./App.css";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  const [missive, setMissive] = useState();
  const { ref, inView } = useInView({});

  useEffect(() => {
    if (!inView || missive) return;
    console.log("initialRun");
    setMissive(window.Missive);
  });

  return (
    <QueryClientProvider client={queryClient}>
      <div ref={ref}>{missive && inView && <MainApp missive={missive} />}</div>
    </QueryClientProvider>
  );
}

export default App;
