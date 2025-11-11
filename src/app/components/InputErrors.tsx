'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { MdError } from 'react-icons/md';

type Errors = Record<string, { message?: string } | undefined>;

export function Animation({ errors, field }: { errors?: Errors; field: string }) {
  const message = errors?.[field]?.message;
  return (
    <AnimatePresence mode="wait" initial={false}>
      {message && <InputError key={message} message={String(message)} />}
    </AnimatePresence>
  );
}

export function InputError({ message }: { message: string }) {
  return (
    <motion.p
      className="flex items-center gap-1 px-2 font-semibold text-red-500 bg-red-100 rounded-md"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
    >
      <MdError />
      {message}
    </motion.p>
  );
}
