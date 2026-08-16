import { useRef } from "react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  Upload,
  FileType,
  Plus,
} from "lucide-react";

import { useUpload } from "@/hooks/useUpload";

import { UploadProgress } from "./UploadProgress";

import {
  ACCEPTED_EXTENSIONS,
} from "@/utils/fileHelpers";

import { cn } from "@/utils/cn";


interface UploadZoneProps {
  compact?: boolean;
}


export function UploadZone({
  compact = false,
}: UploadZoneProps) {

  const fileInputRef =
    useRef<HTMLInputElement>(null);


  const {
    isDragOver,
    onDrop,
    onDragOver,
    onDragLeave,
    onFileInputChange,
  } = useUpload();


  return (

    <div className="w-full">

      <motion.div

        animate={
          isDragOver
            ? {
                scale: 1.005,
              }
            : {
                scale: 1,
              }
        }

        transition={{
          duration: 0.15,
        }}

        onDrop={onDrop}

        onDragOver={onDragOver}

        onDragLeave={onDragLeave}

        onClick={() =>
          fileInputRef.current?.click()
        }

        className={cn(

          `
            group
            relative
            flex
            w-full
            cursor-pointer
            flex-col
            items-center
            justify-center

            rounded-2xl

            border
            border-dashed

            transition-all
            duration-200
          `,

          compact
            ? `
              min-h-[190px]
              px-6
              py-8
            `
            : `
              gap-5
              p-10
            `,

          isDragOver
            ? `
              border-primary/50
              bg-primary/[0.045]
            `
            : `
              border-white/[0.08]
              bg-white/[0.012]

              hover:border-white/[0.15]
              hover:bg-white/[0.025]
            `,
        )}
      >

        {/* =================================================
            DRAG OVERLAY
        ================================================== */}

        <AnimatePresence>

          {isDragOver && (

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="
                pointer-events-none
                absolute
                inset-0
                rounded-2xl
                bg-primary/[0.035]
              "
            />

          )}

        </AnimatePresence>


        {/* =================================================
            ICON
        ================================================== */}

        <motion.div
          animate={
            isDragOver
              ? {
                  y: -3,
                  scale: 1.04,
                }
              : {
                  y: 0,
                  scale: 1,
                }
          }
          transition={{
            duration: 0.2,
          }}
          className={cn(
            `
              relative
              z-10
              flex
              items-center
              justify-center

              rounded-xl

              border

              transition-colors
            `,

            compact
              ? `
                h-11
                w-11
              `
              : `
                h-16
                w-16
                rounded-2xl
              `,

            isDragOver
              ? `
                border-primary/25
                bg-primary/[0.10]
              `
              : `
                border-white/[0.07]
                bg-white/[0.025]

                group-hover:border-white/[0.12]
              `,
          )}
        >

          {isDragOver ? (

            <Upload
              className={cn(
                "text-primary",
                compact
                  ? "h-5 w-5"
                  : "h-7 w-7",
              )}
            />

          ) : (

            <FileType
              className={cn(
                "text-zinc-500 transition-colors group-hover:text-zinc-400",
                compact
                  ? "h-5 w-5"
                  : "h-7 w-7",
              )}
            />

          )}

        </motion.div>


        {/* =================================================
            TEXT
        ================================================== */}

        <div
          className="
            relative
            z-10
            text-center
          "
        >

          <p
            className={cn(
              `
                font-semibold
                transition-colors
              `,

              compact
                ? "mt-4 text-[14px]"
                : "mb-1.5 text-[15px]",

              isDragOver
                ? "text-white"
                : "text-zinc-300",
            )}
          >

            {isDragOver
              ? "Drop to upload"
              : "Drop your research here"}

          </p>


          <p
            className="
              mt-1
              text-[11px]
              leading-5
              text-zinc-600
            "
          >
            {isDragOver
              ? "Release to add your files"
              : "or browse files from your computer"}
          </p>


          {/* =============================================
              BROWSE BUTTON
          ============================================== */}

          {!isDragOver && (

            <motion.span
              whileHover={{
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.98,
              }}
              className="
                mt-4
                inline-flex
                items-center
                gap-2

                rounded-lg

                border
                border-primary/20

                bg-primary/[0.07]

                px-3.5
                py-2

                text-[11px]
                font-semibold
                text-primary

                transition-colors

                hover:border-primary/30
                hover:bg-primary/[0.11]
              "
            >

              <Plus
                className="
                  h-3.5
                  w-3.5
                "
              />

              Browse files

            </motion.span>

          )}

        </div>


        {/* =================================================
            FORMATS
        ================================================== */}

        <p
          className="
            relative
            z-10
            mt-4

            font-mono
            text-[9px]
            tracking-wide
            text-zinc-700
          "
        >
          {ACCEPTED_EXTENSIONS.join("  ")}
        </p>


        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,application/pdf"
          onChange={onFileInputChange}
          className="hidden"
        />

      </motion.div>


      <UploadProgress />

    </div>
  );
}