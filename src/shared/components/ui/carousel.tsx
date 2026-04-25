"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

type CarouselOptions = {
  align?: "start" | "center" | "end"
  loop?: boolean
}

type CarouselPlugin = unknown

export type CarouselApi = {
  scrollPrev: () => void
  scrollNext: () => void
  scrollTo: (index: number) => void
  canScrollPrev: () => boolean
  canScrollNext: () => boolean
  selectedScrollSnap: () => number
  scrollSnapList: () => number[]
}

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin[]
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  trackRef: React.RefObject<HTMLDivElement | null>
  orientation: "horizontal" | "vertical"
  translateOffset: number
  canScrollPrev: boolean
  canScrollNext: boolean
  scrollPrev: () => void
  scrollNext: () => void
  registerTouchStart: (event: React.TouchEvent<HTMLDivElement>) => void
  registerTouchEnd: (event: React.TouchEvent<HTMLDivElement>) => void
}

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

const SWIPE_THRESHOLD_PX = 40

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = "horizontal",
      opts,
      plugins,
      setApi,
      className,
      children,
      ...props
    },
    ref
  ) => {
    void plugins

    const viewportRef = React.useRef<HTMLDivElement>(null)
    const trackRef = React.useRef<HTMLDivElement>(null)
    const touchStartRef = React.useRef<number | null>(null)
    const [selectedIndex, setSelectedIndex] = React.useState(0)
    const [itemCount, setItemCount] = React.useState(0)
    const [viewportSize, setViewportSize] = React.useState(0)

    const lastIndex = Math.max(itemCount - 1, 0)
    const clampedIndex = Math.min(selectedIndex, lastIndex)
    const isLoopEnabled = Boolean(opts?.loop) && itemCount > 1
    const canScrollPrev = isLoopEnabled || clampedIndex > 0
    const canScrollNext = isLoopEnabled || clampedIndex < lastIndex
    const translateOffset = viewportSize * clampedIndex

    const updateMetrics = React.useCallback(() => {
      const viewport = viewportRef.current
      const track = trackRef.current

      if (!viewport || !track) {
        setViewportSize(0)
        setItemCount(0)
        setSelectedIndex(0)
        return
      }

      const nextViewportSize =
        orientation === "horizontal"
          ? Math.round(viewport.clientWidth)
          : Math.round(viewport.clientHeight)
      const nextItemCount = track.children.length

      setViewportSize(nextViewportSize)
      setItemCount(nextItemCount)
      setSelectedIndex((currentIndex) =>
        nextItemCount > 0 ? Math.min(currentIndex, nextItemCount - 1) : 0
      )
    }, [orientation])

    const scrollTo = React.useCallback(
      (index: number) => {
        if (itemCount <= 0) {
          setSelectedIndex(0)
          return
        }

        const nextIndex = isLoopEnabled
          ? ((index % itemCount) + itemCount) % itemCount
          : Math.min(Math.max(index, 0), itemCount - 1)

        setSelectedIndex(nextIndex)
      },
      [isLoopEnabled, itemCount]
    )

    const scrollPrev = React.useCallback(() => {
      if (itemCount <= 0) {
        return
      }

      if (isLoopEnabled) {
        setSelectedIndex((currentIndex) =>
          currentIndex <= 0 ? lastIndex : currentIndex - 1
        )
        return
      }

      if (canScrollPrev) {
        setSelectedIndex((currentIndex) => Math.max(currentIndex - 1, 0))
      }
    }, [canScrollPrev, isLoopEnabled, itemCount, lastIndex])

    const scrollNext = React.useCallback(() => {
      if (itemCount <= 0) {
        return
      }

      if (isLoopEnabled) {
        setSelectedIndex((currentIndex) =>
          currentIndex >= lastIndex ? 0 : currentIndex + 1
        )
        return
      }

      if (canScrollNext) {
        setSelectedIndex((currentIndex) =>
          Math.min(currentIndex + 1, itemCount - 1)
        )
      }
    }, [canScrollNext, isLoopEnabled, itemCount, lastIndex])

    const registerTouchStart = React.useCallback(
      (event: React.TouchEvent<HTMLDivElement>) => {
        const point =
          orientation === "horizontal"
            ? event.touches[0]?.clientX
            : event.touches[0]?.clientY

        touchStartRef.current = point ?? null
      },
      [orientation]
    )

    const registerTouchEnd = React.useCallback(
      (event: React.TouchEvent<HTMLDivElement>) => {
        const startPoint = touchStartRef.current
        const endPoint =
          orientation === "horizontal"
            ? event.changedTouches[0]?.clientX
            : event.changedTouches[0]?.clientY

        touchStartRef.current = null

        if (startPoint === null || endPoint === undefined) {
          return
        }

        const delta = startPoint - endPoint

        if (Math.abs(delta) < SWIPE_THRESHOLD_PX) {
          return
        }

        if (delta > 0) {
          scrollNext()
          return
        }

        scrollPrev()
      },
      [orientation, scrollNext, scrollPrev]
    )

    const api = React.useMemo<CarouselApi>(
      () => ({
        scrollPrev,
        scrollNext,
        scrollTo,
        canScrollPrev: () => canScrollPrev,
        canScrollNext: () => canScrollNext,
        selectedScrollSnap: () => clampedIndex,
        scrollSnapList: () => Array.from({ length: itemCount }, (_, index) => index),
      }),
      [
        canScrollNext,
        canScrollPrev,
        clampedIndex,
        itemCount,
        scrollNext,
        scrollPrev,
        scrollTo,
      ]
    )

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (orientation === "horizontal" && event.key === "ArrowLeft") {
          event.preventDefault()
          scrollPrev()
        }

        if (orientation === "horizontal" && event.key === "ArrowRight") {
          event.preventDefault()
          scrollNext()
        }

        if (orientation === "vertical" && event.key === "ArrowUp") {
          event.preventDefault()
          scrollPrev()
        }

        if (orientation === "vertical" && event.key === "ArrowDown") {
          event.preventDefault()
          scrollNext()
        }
      },
      [orientation, scrollNext, scrollPrev]
    )

    React.useEffect(() => {
      setApi?.(api)
    }, [api, setApi])

    React.useLayoutEffect(() => {
      updateMetrics()

      const viewport = viewportRef.current
      const track = trackRef.current

      if (!viewport || !track) {
        return
      }

      const resizeObserver = new ResizeObserver(() => {
        updateMetrics()
      })

      resizeObserver.observe(viewport)
      resizeObserver.observe(track)

      return () => {
        resizeObserver.disconnect()
      }
    }, [children, updateMetrics])

    return (
      <CarouselContext.Provider
        value={{
          trackRef,
          orientation,
          translateOffset,
          canScrollPrev,
          canScrollNext,
          scrollPrev,
          scrollNext,
          registerTouchStart,
          registerTouchEnd,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn("relative w-full max-w-full min-w-0 overflow-hidden", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          <div
            ref={viewportRef}
            className={cn(
              "w-full max-w-full min-w-0 overflow-hidden",
              orientation === "horizontal" ? "touch-pan-y" : "touch-pan-x"
            )}
            onTouchStart={registerTouchStart}
            onTouchEnd={registerTouchEnd}
          >
            {children}
          </div>
        </div>
      </CarouselContext.Provider>
    )
  }
)
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => {
  const { trackRef, orientation, translateOffset } = useCarousel()

  return (
    <div
      ref={(node) => {
        trackRef.current = node

        if (typeof ref === "function") {
          ref(node)
          return
        }

        if (ref) {
          ref.current = node
        }
      }}
      className={cn(
        "flex w-full max-w-full min-w-0 transition-transform duration-300 ease-out will-change-transform",
        orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
        className
      )}
      style={{
        ...style,
        transform:
          orientation === "horizontal"
            ? `translate3d(-${translateOffset}px, 0, 0)`
            : `translate3d(0, -${translateOffset}px, 0)`,
      }}
      {...props}
    />
  )
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel()

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "basis-full min-w-0 shrink-0 grow-0 overflow-hidden",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
})
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "ghost", size = "icon", ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute z-10 h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "left-2 top-1/2 -translate-y-1/2"
          : "left-1/2 top-2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "ghost", size = "icon", ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute z-10 h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "right-2 top-1/2 -translate-y-1/2"
          : "bottom-2 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
})
CarouselNext.displayName = "CarouselNext"

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}
