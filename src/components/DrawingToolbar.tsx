import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Play, Square, Trash2, Download, Glasses } from "lucide-react";

interface DrawingToolbarProps {
  isDrawing: boolean;
  isVRSupported: boolean;
  onStartDrawing: () => void;
  onStopDrawing: () => void;
  onClear: () => void;
  onExport: () => void;
  onEnterVR: () => void;
}

const DrawingToolbar = ({
  isDrawing,
  isVRSupported,
  onStartDrawing,
  onStopDrawing,
  onClear,
  onExport,
  onEnterVR,
}: DrawingToolbarProps) => {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="glass rounded-2xl p-4 backdrop-blur-xl border border-primary/30">
        <div className="flex gap-3 items-center">
          {!isDrawing ? (
            <Button
              onClick={onStartDrawing}
              variant="default"
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground neon-glow font-semibold"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Drawing
            </Button>
          ) : (
            <Button
              onClick={onStopDrawing}
              variant="destructive"
              size="lg"
              className="neon-glow"
            >
              <Square className="mr-2 h-5 w-5" />
              Stop Drawing
            </Button>
          )}

          <div className="w-px h-8 bg-border" />

          <Button
            onClick={onClear}
            variant="outline"
            size="lg"
            className="border-destructive/50 hover:bg-destructive/20 hover:border-destructive"
          >
            <Trash2 className="mr-2 h-5 w-5" />
            Clear
          </Button>

          <Button
            onClick={onExport}
            variant="outline"
            size="lg"
            className="border-primary/50 hover:bg-primary/20 hover:border-primary"
          >
            <Download className="mr-2 h-5 w-5" />
            Export OBJ
          </Button>

          {isVRSupported && (
            <>
              <div className="w-px h-8 bg-border" />
              <Button
                onClick={onEnterVR}
                variant="default"
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground neon-glow"
              >
                <Glasses className="mr-2 h-5 w-5" />
                Enter VR
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DrawingToolbar;
