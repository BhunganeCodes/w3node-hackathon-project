import { motion } from "framer-motion";
import Hero3D from "./components/Hero3D";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <section className="hero">
        <div className="hero-left">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            TenderChain 🔗
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Decentralized. Transparent. Intelligent Tendering.
          </motion.p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Launch App
          </motion.button>
        </div>

        <div className="hero-right glass">
          <Hero3D />
        </div>
      </section>
    </div>
  );
}

export default App;
