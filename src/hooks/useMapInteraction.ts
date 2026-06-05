import { useState, useCallback, useRef, useEffect, useMemo, type RefObject } from 'react'
import { MAP_MIN_SCALE, MAP_MAX_SCALE, DRAG_THRESHOLD_PX } from '../constants'

const MIN_SCALE = MAP_MIN_SCALE
const MAX_SCALE = MAP_MAX_SCALE
const ZOOM_FACTOR = 1.2
const WHEEL_ZOOM_IN = 1.1
const WHEEL_ZOOM_OUT = 0.9

export interface MapTransform {
  x: number
  y: number
  scale: number
}

function getTouchDistance(t: React.TouchList): number {
  if (t.length < 2) return 0
  const dx = t[0].clientX - t[1].clientX
  const dy = t[0].clientY - t[1].clientY
  return Math.sqrt(dx * dx + dy * dy)
}

export function useMapInteraction(
  initialScale = 1,
  containerRef?: RefObject<HTMLDivElement | null>
) {
  const [transform, setTransform] = useState<MapTransform>({
    x: 0,
    y: 0,
    scale: initialScale,
  })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const transformStart = useRef({ x: 0, y: 0 })
  const transformRef = useRef(transform)
  const hasMoved = useRef(false)
  const pinchStartDist = useRef(0)
  const pinchStartScale = useRef(1)
  const pinchMidRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    transformRef.current = transform
  }, [transform])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsDragging(true)
    hasMoved.current = false
    dragStart.current = { x: e.clientX, y: e.clientY }
    transformStart.current = {
      x: transformRef.current.x,
      y: transformRef.current.y,
    }
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return
      const dx = e.clientX - dragStart.current.x
      const dy = e.clientY - dragStart.current.y
      if (Math.abs(dx) > DRAG_THRESHOLD_PX || Math.abs(dy) > DRAG_THRESHOLD_PX) {
        hasMoved.current = true
      }
      setTransform((prev) => ({
        ...prev,
        x: transformStart.current.x + dx,
        y: transformStart.current.y + dy,
      }))
    },
    [isDragging]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // --- Touch handlers ---
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      hasMoved.current = false
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      transformStart.current = {
        x: transformRef.current.x,
        y: transformRef.current.y,
      }
    } else if (e.touches.length === 2) {
      // Start pinch — 记录双指中心点
      pinchStartDist.current = getTouchDistance(e.touches)
      pinchStartScale.current = transformRef.current.scale
      const container = containerRef?.current
      if (container) {
        const rect = container.getBoundingClientRect()
        pinchMidRef.current = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top,
        }
      }
    }
  }, [containerRef])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - dragStart.current.x
      const dy = e.touches[0].clientY - dragStart.current.y
      if (Math.abs(dx) > DRAG_THRESHOLD_PX || Math.abs(dy) > DRAG_THRESHOLD_PX) {
        hasMoved.current = true
      }
      setTransform((prev) => ({
        ...prev,
        x: transformStart.current.x + dx,
        y: transformStart.current.y + dy,
      }))
    } else if (e.touches.length === 2) {
      const newDist = getTouchDistance(e.touches)
      if (pinchStartDist.current > 0) {
        const ratio = newDist / pinchStartDist.current
        const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, pinchStartScale.current * ratio))
        const prev = transformRef.current
        const mx = pinchMidRef.current.x
        const my = pinchMidRef.current.y
        setTransform({
          x: mx - (mx - prev.x) * (newScale / prev.scale),
          y: my - (my - prev.y) * (newScale / prev.scale),
          scale: newScale,
        })
      }
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    pinchStartDist.current = 0
  }, [])

  /** 判断刚才的交互是否为拖拽（而非点击） */
  const wasDrag = useCallback(() => {
    return hasMoved.current
  }, [])

  const resetTransform = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: initialScale })
  }, [initialScale])

  const zoomIn = useCallback(() => {
    const container = containerRef?.current
    setTransform((prev) => {
      const newScale = Math.min(MAX_SCALE, prev.scale * ZOOM_FACTOR)
      if (container) {
        const rect = container.getBoundingClientRect()
        const mx = rect.width / 2
        const my = rect.height / 2
        return {
          x: mx - (mx - prev.x) * (newScale / prev.scale),
          y: my - (my - prev.y) * (newScale / prev.scale),
          scale: newScale,
        }
      }
      return { ...prev, scale: newScale }
    })
  }, [containerRef])

  const zoomOut = useCallback(() => {
    const container = containerRef?.current
    setTransform((prev) => {
      const newScale = Math.max(MIN_SCALE, prev.scale / ZOOM_FACTOR)
      if (container) {
        const rect = container.getBoundingClientRect()
        const mx = rect.width / 2
        const my = rect.height / 2
        return {
          x: mx - (mx - prev.x) * (newScale / prev.scale),
          y: my - (my - prev.y) * (newScale / prev.scale),
          scale: newScale,
        }
      }
      return { ...prev, scale: newScale }
    })
  }, [containerRef])

  useEffect(() => {
    const handleGlobalUp = () => setIsDragging(false)
    window.addEventListener('mouseup', handleGlobalUp)
    window.addEventListener('touchend', handleGlobalUp)
    return () => {
      window.removeEventListener('mouseup', handleGlobalUp)
      window.removeEventListener('touchend', handleGlobalUp)
    }
  }, [])

  // 原生 wheel 事件（passive: false 才能 preventDefault 阻止页面滚动）
  useEffect(() => {
    const container = containerRef?.current
    if (!container) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? WHEEL_ZOOM_OUT : WHEEL_ZOOM_IN
      const prev = transformRef.current
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev.scale * delta))
      const rect = container.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      setTransform({
        x: mx - (mx - prev.x) * (newScale / prev.scale),
        y: my - (my - prev.y) * (newScale / prev.scale),
        scale: newScale,
      })
    }
    container.addEventListener('wheel', onWheel, { passive: false })
    return () => container.removeEventListener('wheel', onWheel)
  }, [containerRef])

  const handlers = useMemo(
    () => ({
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    }),
    [handleMouseDown, handleMouseMove, handleMouseUp, handleTouchStart, handleTouchMove, handleTouchEnd]
  )

  return {
    transform,
    isDragging,
    handlers,
    wasDrag,
    resetTransform,
    zoomIn,
    zoomOut,
  }
}
