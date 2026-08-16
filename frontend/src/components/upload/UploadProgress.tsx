import { motion } from "framer-motion";

import {
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  X,
} from "lucide-react";

import { cn } from "@/utils/cn";

import { useUploadStore } from "@/store/useUploadStore";

import type { UploadFile } from "@/types";


function UploadItem({
  item,
}: {
  item: UploadFile;
}) {

  const {
    removeFile,
  } = useUploadStore();


  const isUploading =
    item.status === "uploading";


  const isProcessing =
    item.status === "processing";


  const isReady =
    item.status === "ready";


  const isError =
    item.status === "error";


  return (

    <motion.div
      initial={{
        opacity: 0,
        y: 6,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -4,
      }}
      className="
        flex
        items-center
        gap-3
        rounded-xl
        border
        border-white/[0.06]
        bg-surface
        p-3
      "
    >

      {/* File icon */}

      <div
        className="
          flex
          h-8
          w-8
          flex-shrink-0
          items-center
          justify-center
          rounded-lg
          border
          border-white/[0.06]
          bg-surface
        "
      >

        <FileText
          className="
            h-4
            w-4
            text-zinc-500
          "
        />

      </div>


      {/* File information */}

      <div
        className="
          min-w-0
          flex-1
        "
      >

        <p
          className="
            mb-1
            truncate
            text-[13px]
            font-medium
            text-zinc-300
          "
        >
          {item.file.name}
        </p>


        {/* Upload state */}

        {isError ? (

          <p
            role="alert"
            className="
              text-[11px]
              text-red-400
            "
          >
            {item.errorMessage}
          </p>

        ) : (

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <div
              className="
                h-1
                flex-1
                overflow-hidden
                rounded-full
                bg-white/[0.06]
              "
            >

              <motion.div
                className={cn(
                  "h-full rounded-full",
                  isReady
                    ? "bg-emerald-400"
                    : isProcessing
                      ? "bg-amber-400"
                      : "bg-primary"
                )}
                initial={{
                  width: "0%",
                }}
                animate={{
                  width: isReady
                    ? "100%"
                    : isProcessing
                      ? "100%"
                      : "35%",
                }}
                transition={{
                  duration: 0.35,
                }}
              />

            </div>


            <span
              className="
                w-20
                text-right
                text-[10px]
                font-mono
                text-zinc-600
              "
            >

              {isUploading &&
                "Uploading..."}

              {isProcessing &&
                "Processing..."}

              {isReady &&
                "Ready"}

            </span>

          </div>

        )}

      </div>


      {/* Status icon */}

      <div
        className="
          flex
          items-center
          gap-2
        "
      >

        {isUploading && (

          <Loader2
            className="
              h-4
              w-4
              animate-spin
              text-primary
            "
          />

        )}


        {isProcessing && (

          <Loader2
            className="
              h-4
              w-4
              animate-spin
              text-amber-400
            "
          />

        )}


        {isReady && (

          <CheckCircle2
            className="
              h-4
              w-4
              text-emerald-400
            "
          />

        )}


        {isError && (

          <XCircle
            className="
              h-4
              w-4
              text-red-400
            "
          />

        )}


        {(isReady || isError) && (

          <button
            type="button"
            onClick={() =>
              removeFile(item.id)
            }
            aria-label={`Remove ${item.file.name}`}
            className="
              text-zinc-600
              transition-colors
              hover:text-zinc-400
            "
          >

            <X
              className="
                h-3.5
                w-3.5
              "
            />

          </button>

        )}

      </div>

    </motion.div>

  );

}


export function UploadProgress() {

  const {
    queue,
  } = useUploadStore();


  if (queue.length === 0) {
    return null;
  }


  return (

    <div
      className="
        mt-4
        space-y-2
      "
    >

      {queue.map(
        (item) => (

          <UploadItem
            key={item.id}
            item={item}
          />

        )
      )}

    </div>

  );

}