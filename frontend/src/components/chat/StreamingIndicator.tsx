import { motion } from "framer-motion";

export function StreamingIndicator() {
  return (
    <div
      className="
        flex
        items-center
        gap-1.5
        py-1
      "
      aria-label="Generating response"
      role="status"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="
            h-1.5
            w-1.5
            rounded-full
            bg-primary/70
          "
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.2,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}