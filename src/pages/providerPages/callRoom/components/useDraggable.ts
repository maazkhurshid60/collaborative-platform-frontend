import { useCallback, useEffect, useRef, useState } from "react";

interface Position {
  x: number;
  y: number;
}

function clamp(position: Position, width: number, height: number): Position {
  const maxX = Math.max(0, window.innerWidth - width);
  const maxY = Math.max(0, window.innerHeight - height);
  return {
    x: Math.min(Math.max(position.x, 0), maxX),
    y: Math.min(Math.max(position.y, 0), maxY),
  };
}

/**
 * Makes an element draggable anywhere within the viewport, clamping it back
 * in bounds on every move and on window resize so it can never end up
 * off-screen.
 */
export function useDraggable(initial: Position, size: { width: number; height: number }) {
  const [position, setPosition] = useState<Position>(() => clamp(initial, size.width, size.height));
  const dragOffsetRef = useRef<Position>({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const sizeRef = useRef(size);
  sizeRef.current = size;

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDraggingRef.current) return;
    const next = {
      x: e.clientX - dragOffsetRef.current.x,
      y: e.clientY - dragOffsetRef.current.y,
    };
    setPosition(clamp(next, sizeRef.current.width, sizeRef.current.height));
  }, []);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  }, [handlePointerMove]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDraggingRef.current = true;
      dragOffsetRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    },
    [position, handlePointerMove, handlePointerUp],
  );

  useEffect(() => {
    const onResize = () => {
      setPosition((prev) => clamp(prev, sizeRef.current.width, sizeRef.current.height));
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  return { position, onPointerDown: handlePointerDown };
}
