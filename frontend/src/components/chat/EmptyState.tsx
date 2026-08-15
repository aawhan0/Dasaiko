import { motion } from "framer-motion";
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
} from "@/utils/animations";
import { UploadZone } from "@/components/upload/UploadZone";
import {
  Sparkles,
  FileSearch,
  BrainCircuit,
} from "lucide-react";

const FEATURES = [
  {
    icon: FileSearch,
    label: "Document-native AI",
    description:
      "Every answer cites specific pages and passages.",
  },
  {
    icon: BrainCircuit,
    label: "Deep analysis",
    description:
      "Ask complex questions across multiple documents.",
  },
  {
    icon: Sparkles,
    label: "Evidence-first",
    description:
      "See exactly where every claim comes from.",
  },
];

export function EmptyState() {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="
        flex
        h-full
        w-full
        flex-col
        items-center
        justify-center
        overflow-y-auto
        px-6
        py-12
        sm:px-8
        lg:px-10
      "
    >
      <div
        className="
          w-full
          max-w-3xl
        "
      >
        {/* =================================================
            INTRO
        ================================================== */}

        <div className="text-center">
          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border-[1.5px]
              border-primary/20
              bg-primary/[0.06]
              px-3.5
              py-2
            "
          >
            <Sparkles
              className="
                h-3.5
                w-3.5
                text-primary
              "
            />

            <span
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-primary/80
              "
            >
              Research workspace
            </span>
          </div>

          <h2
            className="
              mt-6
              text-3xl
              font-bold
              leading-[1.05]
              tracking-[-0.04em]
              text-white
              sm:text-4xl
              lg:text-5xl
            "
          >
            Upload your sources.
            <br />

            <span className="text-zinc-500">
              Start understanding.
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-5
              max-w-xl
              text-sm
              font-medium
              leading-7
              text-zinc-400
              sm:text-[15px]
            "
          >
            Add PDFs, research papers, or technical
            documents. Dasaiko indexes them into your
            research workspace so you can ask questions
            with evidence you can actually inspect.
          </p>
        </div>

        {/* =================================================
            UPLOAD
        ================================================== */}

        <div
          className="
            mt-9
            rounded-2xl
            border-[1.5px]
            border-white/[0.09]
            bg-white/[0.015]
            p-2
            shadow-[0_12px_40px_rgba(0,0,0,0.16)]
          "
        >
          <UploadZone />
        </div>

        {/* =================================================
            CAPABILITIES
        ================================================== */}

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="
            mt-5
            grid
            grid-cols-1
            gap-2
            sm:grid-cols-3
          "
        >
          {FEATURES.map(
            ({
              icon: Icon,
              label,
              description,
            }) => (
              <motion.div
                key={label}
                variants={staggerItem}
                className="
                  group
                  rounded-xl
                  border-[1.5px]
                  border-white/[0.06]
                  bg-white/[0.015]
                  px-4
                  py-4
                  transition-all
                  duration-200

                  hover:border-white/[0.14]
                  hover:bg-white/[0.04]
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <div
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      border
                      border-primary/20
                      bg-primary/[0.07]
                    "
                  >
                    <Icon
                      className="
                        h-3.5
                        w-3.5
                        text-primary
                      "
                    />
                  </div>

                  <p
                    className="
                      text-[11px]
                      font-bold
                      tracking-tight
                      text-zinc-300
                      transition-colors
                      group-hover:text-white
                    "
                  >
                    {label}
                  </p>
                </div>

                <p
                  className="
                    mt-3
                    text-[10px]
                    font-medium
                    leading-5
                    text-zinc-500
                  "
                >
                  {description}
                </p>
              </motion.div>
            ),
          )}
        </motion.div>

        {/* =================================================
            FOOT SIGNAL
        ================================================== */}

        <div
          className="
            mt-6
            flex
            items-center
            justify-center
            gap-3
          "
        >
          <span
            className="
              h-px
              w-10
              bg-white/[0.07]
            "
          />

          <span
            className="
              text-[9px]
              font-bold
              uppercase
              tracking-[0.18em]
              text-zinc-600
            "
          >
            Documents · Retrieval · Evidence
          </span>

          <span
            className="
              h-px
              w-10
              bg-white/[0.07]
            "
          />
        </div>
      </div>
    </motion.div>
  );
}