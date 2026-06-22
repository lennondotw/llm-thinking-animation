import { cn } from '#src/utils/cn.ts';
import { FC, memo } from 'react';

export const Signature: FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('text-sm text-black dark:text-white', className)}>
      <span> Made with </span>
      <span> ❤️ </span>
      <span> by </span>
      <a
        href="https://github.com/lennondotw/llm-thinking-animation"
        target="_blank"
        rel="noopener noreferrer"
        className="text-red-500 dark:text-red-300"
      >
        @lennondotw
      </a>
      <span>.</span>
    </div>
  );
};

export const MemoizedSignature = memo(Signature);
