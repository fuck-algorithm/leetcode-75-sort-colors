import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { AlgorithmStep, Color, AlgorithmType, PointerMeta } from '../types';
import { pointerMetaConfig } from '../algorithms';
import '../styles/Canvas.css';

interface CanvasProps {
  step: AlgorithmStep;
  algorithmType: AlgorithmType;
}

// 颜色映射
const colorMap: Record<Color, string> = {
  0: '#ff6b6b', // 红色
  1: '#f0f0f0', // 白色
  2: '#4ecdc4', // 蓝色（用青色代替，更好看）
};

const colorNames: Record<Color, string> = {
  0: '红',
  1: '白',
  2: '蓝',
};

export function Canvas({ step, algorithmType }: CanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = useCallback(() => {
    setTransform((t) => ({ ...t, scale: Math.min(t.scale * 1.2, 3) }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setTransform((t) => ({ ...t, scale: Math.max(t.scale / 1.2, 0.5) }));
  }, []);

  const handleReset = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: 1 });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  }, [transform]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setTransform((t) => ({
        ...t,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }));
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform((t) => ({
      ...t,
      scale: Math.max(0.5, Math.min(3, t.scale * delta)),
    }));
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // 清除之前的内容
    svg.selectAll('*').remove();

    // 创建主容器
    const g = svg.append('g')
      .attr('transform', `translate(${width / 2 + transform.x}, ${height / 2 + transform.y}) scale(${transform.scale})`);

    const array = step.array;
    const n = array.length;
    
    // 计算布局
    const cellWidth = 60;
    const cellHeight = 60;
    const gap = 8;
    const totalWidth = n * (cellWidth + gap) - gap;
    const startX = -totalWidth / 2;
    const startY = -30;

    // 绘制数组元素
    const cells = g.selectAll('.cell')
      .data(array)
      .enter()
      .append('g')
      .attr('class', 'cell')
      .attr('transform', (_, i) => `translate(${startX + i * (cellWidth + gap)}, ${startY})`);

    // 绘制单元格背景
    cells.append('rect')
      .attr('width', cellWidth)
      .attr('height', cellHeight)
      .attr('rx', 8)
      .attr('fill', (d) => colorMap[d])
      .attr('stroke', (_, i) => {
        if (step.swapIndices && (i === step.swapIndices[0] || i === step.swapIndices[1])) {
          return '#ffd700';
        }
        if (step.compareIndex === i) {
          return '#ff79c6';
        }
        return 'rgba(255,255,255,0.2)';
      })
      .attr('stroke-width', (_, i) => {
        if (step.swapIndices && (i === step.swapIndices[0] || i === step.swapIndices[1])) {
          return 3;
        }
        if (step.compareIndex === i) {
          return 3;
        }
        return 1;
      });

    // 绘制数值
    cells.append('text')
      .attr('x', cellWidth / 2)
      .attr('y', cellHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', (d) => d === 1 ? '#1a1a2e' : '#fff')
      .attr('font-size', '24px')
      .attr('font-weight', 'bold')
      .text((d) => d);

    // 绘制颜色名称
    cells.append('text')
      .attr('x', cellWidth / 2)
      .attr('y', cellHeight + 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6a6a8a')
      .attr('font-size', '12px')
      .text((d) => colorNames[d]);

    // 绘制索引
    cells.append('text')
      .attr('x', cellWidth / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#4a4a6a')
      .attr('font-size', '12px')
      .text((_, i) => `[${i}]`);

    // 绘制指针：每个指针带 label + hint，垂直堆叠防重叠
    const pointerBaseY = startY + cellHeight + 50;
    const pointers = step.pointers;
    const metaDefaults = pointerMetaConfig[algorithmType] || {};

    // 收集要绘制的指针，按索引排序后分配层级（防重叠）
    const pointerList = Object.entries(pointers)
      .filter(([, v]) => v !== undefined && v >= 0 && v < n)
      .map(([key, value]) => ({
        key,
        value: value as number,
        meta: step.pointerMeta?.[key] || metaDefaults[key] || {
          label: key,
          hint: '',
          color: '#4ecdc4',
        } as PointerMeta,
      }))
      .sort((a, b) => a.value - b.value);

    // 按位置分组：同一列的指针垂直堆叠，不同列尽量分行
    const colStacks = new Map<number, number>();
    pointerList.forEach((p) => {
      const stackLevel = colStacks.get(p.value) || 0;
      const pointerY = pointerBaseY + stackLevel * 50;
      colStacks.set(p.value, stackLevel + 1);

      const x = startX + p.value * (cellWidth + gap) + cellWidth / 2;
      const color = p.meta.color;

      // 箭头
      g.append('path')
        .attr('d', `M ${x} ${pointerY - 15} L ${x - 7} ${pointerY} L ${x + 7} ${pointerY} Z`)
        .attr('fill', color);

      // 标签（含语义名称）
      g.append('text')
        .attr('x', x)
        .attr('y', pointerY + 14)
        .attr('text-anchor', 'middle')
        .attr('fill', color)
        .attr('font-size', '13px')
        .attr('font-weight', 'bold')
        .attr('stroke', '#1a1a2e')
        .attr('stroke-width', '3px')
        .attr('paint-order', 'stroke')
        .text(p.meta.label);

      // 作用说明（hint），位于标签下方，较小字号
      if (p.meta.hint) {
        g.append('text')
          .attr('x', x)
          .attr('y', pointerY + 28)
          .attr('text-anchor', 'middle')
          .attr('fill', 'rgba(160, 160, 192, 0.8)')
          .attr('font-size', '10px')
          .attr('stroke', '#1a1a2e')
          .attr('stroke-width', '2px')
          .attr('paint-order', 'stroke')
          .text(p.meta.hint.length > 10 ? p.meta.hint.slice(0, 9) + '…' : p.meta.hint);
      }
    });

    // 绘制交换动画指示
    if (step.swapIndices) {
      const [i1, i2] = step.swapIndices;
      const x1 = startX + i1 * (cellWidth + gap) + cellWidth / 2;
      const x2 = startX + i2 * (cellWidth + gap) + cellWidth / 2;
      const y = startY - 40;

      // 绘制交换弧线
      const midX = (x1 + x2) / 2;
      const controlY = y - Math.abs(x2 - x1) / 4;

      g.append('path')
        .attr('d', `M ${x1} ${y} Q ${midX} ${controlY} ${x2} ${y}`)
        .attr('fill', 'none')
        .attr('stroke', '#ffd700')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');

      // 绘制箭头
      g.append('text')
        .attr('x', midX)
        .attr('y', controlY - 5)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ffd700')
        .attr('font-size', '12px')
        .text('交换');
    }

    // 绘制区域标注：基于 pointerMeta.regionLabel
    const regionKeys: Array<{ key: string; side: 'left' | 'right' }> = [
      { key: 'p0', side: 'left' },
      { key: 'ptr', side: 'left' },
      { key: 'p1', side: 'left' },
      { key: 'p2', side: 'right' },
    ];

    const regionY = startY + cellHeight + 75;
    regionKeys.forEach(({ key, side }) => {
      const idx = pointers[key as keyof typeof pointers];
      const meta = step.pointerMeta?.[key] || metaDefaults[key];
      if (idx === undefined || !meta || !meta.regionLabel) return;

      let regionX: number;
      let regionW: number;
      if (side === 'left') {
        // 左侧分区：从数组起点到 idx
        if (idx <= 0) return;
        regionX = startX - 5;
        regionW = idx * (cellWidth + gap) - gap + 10;
      } else {
        // 右侧分区：从 idx 到数组末尾
        if (idx >= n - 1) return;
        regionX = startX + idx * (cellWidth + gap) - gap / 2;
        regionW = (n - idx) * (cellWidth + gap) - gap + 10;
      }

      g.append('rect')
        .attr('x', regionX)
        .attr('y', startY - 5)
        .attr('width', regionW)
        .attr('height', cellHeight + 10)
        .attr('rx', 10)
        .attr('fill', 'none')
        .attr('stroke', meta.color)
        .attr('stroke-opacity', 0.35)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');

      g.append('text')
        .attr('x', regionX + regionW / 2)
        .attr('y', regionY)
        .attr('text-anchor', 'middle')
        .attr('fill', meta.color)
        .attr('fill-opacity', 0.75)
        .attr('font-size', '11px')
        .text(meta.regionLabel);
    });

  }, [step, transform, algorithmType]);

  return (
    <div className="canvas-container">
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color red"></div>
          <span>0 (红)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color white"></div>
          <span>1 (白)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color blue"></div>
          <span>2 (蓝)</span>
        </div>
      </div>

      <div className="step-description">{step.description}</div>

      <svg
        ref={svgRef}
        className="canvas-svg"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      <div className="canvas-controls">
        <button className="canvas-control-btn" onClick={handleZoomIn} title="放大">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
          </svg>
        </button>
        <button className="canvas-control-btn" onClick={handleZoomOut} title="缩小">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35M8 11h6" />
          </svg>
        </button>
        <button className="canvas-control-btn" onClick={handleReset} title="重置视图">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
