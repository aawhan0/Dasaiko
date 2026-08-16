import {
  motion,
} from "framer-motion";

import {
  MessageInput,
} from "./MessageInput";

import {
  fadeInUp,
} from "@/utils/animations";


export function EmptyState() {

  return (

    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="
        flex
        h-full
        min-h-0
        w-full
        items-center
        justify-center
        overflow-hidden
        px-6
      "
    >

      <div
        className="
          flex
          w-full
          max-w-3xl
          -translate-y-[4vh]
          flex-col
          items-center
        "
      >

        {/* =================================================
            DASAIKO / RESEARCH WORKSPACE IDENTITY
        ================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 10,
            scale: 0.97,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.4,
            ease: [
              0.22,
              1,
              0.36,
              1,
            ],
          }}
          className="
            flex
            items-center
            justify-center
          "
        >

          {/* =================================================
              DASAIKO MARK
          ================================================== */}

          <div
            className="
              flex
              h-16
              w-16
              shrink-0
              items-center
              justify-center
            "
          >

            <img
              src="/assets/brand/dasaiko-mark-white.png"
              alt="Dasaiko"
              className="
                h-14
                w-14
                object-contain
              "
            />

          </div>


          {/* =================================================
              DIAGONAL SLASH
          ================================================== */}

          <span
            aria-hidden="true"
            className="
              mx-6
              block
              h-12
              w-[2px]
              shrink-0
              origin-center
              rotate-[28deg]
              rounded-full
              bg-white/30
              shadow-[0_0_8px_rgba(255,255,255,0.20)]
            "
          />


          {/* =================================================
              RESEARCH WORKSPACE
          ================================================== */}

          <span
            className="
              whitespace-nowrap
              text-[21px]
              font-medium
              tracking-[-0.02em]
              text-zinc-200
            "
          >
            Research Workspace
          </span>

        </motion.div>


        {/* =================================================
            MESSAGE INPUT
        ================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 14,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
            delay: 0.08,
            ease: [
              0.22,
              1,
              0.36,
              1,
            ],
          }}
          className="
            mt-11
            flex
            w-full
            justify-center
          "
        >

          <MessageInput
            centered
          />

        </motion.div>

      </div>

    </motion.div>

  );
}