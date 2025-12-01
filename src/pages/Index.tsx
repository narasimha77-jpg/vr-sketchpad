import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Hand, Boxes, Wand2 } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-cyan/5 rounded-full blur-3xl" />
      </div>

      {/* Hero section */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Next-Gen 3D Creation</span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          >
            <span className="neon-text">Hand-Tracked</span>
            <br />
            <span className="bg-gradient-to-r from-primary via-neon-blue to-secondary bg-clip-text text-transparent">
              3D VR Drawing
            </span>
            <br />
            <span className="text-foreground">& Sculpting App</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Create stunning 3D artwork using hand gestures and VR. Draw, sculpt, and shape 
            your imagination in three-dimensional space with intuitive hand-tracking technology.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/draw">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground neon-glow-strong text-lg px-8 py-6 h-auto group"
              >
                <Wand2 className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                Start Creating
              </Button>
            </Link>
            <Link to="/draw">
              <Button
                variant="outline"
                size="lg"
                className="border-primary/50 hover:bg-primary/10 hover:border-primary text-lg px-8 py-6 h-auto"
              >
                View Canvas
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Features grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="grid md:grid-cols-3 gap-6 mt-24 max-w-5xl mx-auto"
        >
          <div className="glass rounded-2xl p-8 border border-primary/20 hover:border-primary/40 transition-all hover:neon-glow">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 neon-glow">
              <Hand className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Hand Tracking</h3>
            <p className="text-muted-foreground">
              Advanced gesture recognition powered by MediaPipe. Draw naturally using your hands as the brush.
            </p>
          </div>

          <div className="glass rounded-2xl p-8 border border-secondary/20 hover:border-secondary/40 transition-all hover:neon-glow">
            <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 neon-glow">
              <Boxes className="w-7 h-7 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">WebXR Powered</h3>
            <p className="text-muted-foreground">
              Immersive VR experience built on WebXR. Step into your artwork and create from any angle.
            </p>
          </div>

          <div className="glass rounded-2xl p-8 border border-neon-blue/20 hover:border-neon-blue/40 transition-all hover:neon-glow">
            <div className="w-14 h-14 rounded-xl bg-neon-blue/10 flex items-center justify-center mb-4 neon-glow">
              <Sparkles className="w-7 h-7 text-neon-blue" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Export to OBJ</h3>
            <p className="text-muted-foreground">
              Save your 3D creations as OBJ files. Use them in other 3D software or 3D print your designs.
            </p>
          </div>
        </motion.div>

        {/* Tech stack info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-24 text-center"
        >
          <p className="text-sm text-muted-foreground mb-4">Powered by cutting-edge web technologies</p>
          <div className="flex flex-wrap justify-center gap-4">
            {['React', 'Three.js', 'WebXR', 'MediaPipe', 'TypeScript'].map((tech, i) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 + i * 0.1 }}
                className="px-4 py-2 rounded-full bg-muted/50 text-sm font-medium"
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
